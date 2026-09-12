from __future__ import annotations

import argparse
import csv
from pathlib import Path

import cv2
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

try:
    from .lstm_transformer import LSTMTransformer
except ImportError:
    from module.lstm_transformer import LSTMTransformer

VIDEO_EXTENSIONS = {".avi", ".mp4", ".mov", ".mkv", ".webm"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}


def output_folder(source: Path, source_root: Path, destination_root: Path) -> Path:
    return destination_root / source.relative_to(source_root).with_suffix("")


def extract_video(video_path: Path, source_root: Path, destination_root: Path, every_nth: int = 1) -> int:
    destination = output_folder(video_path, source_root, destination_root)
    destination.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"ERROR: could not open {video_path}")
        return 0

    saved = 0
    index = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if index % every_nth == 0:
            frame_path = destination / f"frame_{index:06d}.jpg"
            if not frame_path.exists() and not cv2.imwrite(str(frame_path), frame):
                raise RuntimeError(f"Could not write {frame_path}")
            saved += 1
        index += 1

    cap.release()
    print(f"VIDEO  {video_path.relative_to(source_root)}: {saved} frames saved")
    return saved


def extract_image(image_path: Path, source_root: Path, destination_root: Path) -> int:
    destination = output_folder(image_path, source_root, destination_root)
    destination.mkdir(parents=True, exist_ok=True)
    frame_path = destination / "frame_000000.jpg"

    if not frame_path.exists():
        image = cv2.imread(str(image_path), cv2.IMREAD_COLOR)
        if image is None:
            print(f"ERROR: could not read {image_path}")
            return 0
        if not cv2.imwrite(str(frame_path), image):
            raise RuntimeError(f"Could not write {frame_path}")

    print(f"IMAGE  {image_path.relative_to(source_root)}: 1 frame saved")
    return 1


def extract_dataset_frames(source_dir: Path, output_dir: Path, every_nth: int = 1) -> None:
    source_dir = source_dir.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(path for path in source_dir.rglob("*") if path.is_file())
    video_files = [path for path in files if path.suffix.lower() in VIDEO_EXTENSIONS]
    image_files = [path for path in files if path.suffix.lower() in IMAGE_EXTENSIONS]

    print(f"Found {len(video_files)} videos and {len(image_files)} images.")
    saved = sum(extract_video(path, source_dir, output_dir, every_nth) for path in video_files)
    saved += sum(extract_image(path, source_dir, output_dir) for path in image_files)
    print(f"Completed: {saved} frames are available in {output_dir}")


def frame_to_feature(frame: np.ndarray, target_dim: int = 512) -> np.ndarray:
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image = cv2.resize(image, (32, 32), interpolation=cv2.INTER_AREA)
    image = image.astype(np.float32) / 255.0
    vector = image.reshape(-1)

    if vector.size > target_dim:
        step = max(1, vector.size // target_dim)
        vector = vector[::step][:target_dim]
    if vector.size < target_dim:
        padding = np.zeros(target_dim - vector.size, dtype=np.float32)
        vector = np.concatenate([vector, padding])

    return vector.astype(np.float32)


def load_sequence_from_folder(folder: Path, sequence_length: int, feature_dim: int) -> np.ndarray | None:
    frame_files = sorted(folder.glob("*.jpg")) + sorted(folder.glob("*.png"))
    frame_files = sorted({p.resolve(): p for p in frame_files}.values())

    if not frame_files:
        return None

    sequences: list[np.ndarray] = []
    for frame_file in frame_files[:sequence_length]:
        image = cv2.imread(str(frame_file), cv2.IMREAD_COLOR)
        if image is None:
            continue
        sequences.append(frame_to_feature(image, feature_dim))

    if not sequences:
        return None

    if len(sequences) < sequence_length:
        pad = np.zeros((sequence_length - len(sequences), feature_dim), dtype=np.float32)
        sequences = np.vstack([np.stack(sequences, axis=0), pad])
        return sequences

    return np.stack(sequences[:sequence_length], axis=0).astype(np.float32)


class SequenceDataset(Dataset):
    def __init__(self, root_dir: Path, sequence_length: int = 16, feature_dim: int = 512, label_csv: Path | None = None):
        self.root_dir = root_dir
        self.sequence_length = sequence_length
        self.feature_dim = feature_dim

        self.labels = {}
        if label_csv and label_csv.exists():
            with label_csv.open("r", newline="") as csv_file:
                reader = csv.DictReader(csv_file)
                for row in reader:
                    key = row.get("folder") or row.get("name") or row.get("sequence")
                    if key:
                        self.labels[key] = int(row.get("label", 0))

        self.samples: list[tuple[Path, int]] = []
        for folder in sorted(path for path in root_dir.iterdir() if path.is_dir()):
            label = self.labels.get(folder.name, 1 if (root_dir / "gt").exists() or "gt" in folder.name.lower() else 0)
            if label not in (0, 1):
                label = 0
            self.samples.append((folder, label))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        folder, label = self.samples[index]
        features = load_sequence_from_folder(folder, self.sequence_length, self.feature_dim)
        if features is None:
            features = np.zeros((self.sequence_length, self.feature_dim), dtype=np.float32)
        return torch.tensor(features, dtype=torch.float32), torch.tensor(label, dtype=torch.long)


def collate_batch(batch):
    sequences, labels = zip(*batch)
    return torch.stack(sequences), torch.stack(labels)


def load_label_map(label_csv: Path | None) -> dict[str, int]:
    if label_csv is None or not label_csv.exists():
        return {}

    mapping: dict[str, int] = {}
    with label_csv.open("r", newline="") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            folder = row.get("folder") or row.get("name") or row.get("sequence")
            if folder:
                mapping[folder] = int(row.get("label", 0))
    return mapping


def train_model(
    frame_root: Path,
    sequence_length: int,
    batch_size: int,
    epochs: int,
    learning_rate: float,
    label_csv: Path | None,
    device: torch.device,
) -> tuple[LSTMTransformer, dict]:
    dataset = SequenceDataset(frame_root, sequence_length=sequence_length, feature_dim=512, label_csv=label_csv)
    if len(dataset) == 0:
        raise ValueError(f"No sequence folders found in {frame_root}. Extracted frames may be empty or the folders are not in the expected format.")

    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True, collate_fn=collate_batch)
    model = LSTMTransformer(input_dim=512, num_classes=2).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    criterion = nn.CrossEntropyLoss()

    history = {"train_loss": []}

    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for sequences, labels in loader:
            sequences = sequences.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(sequences)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * sequences.size(0)

        avg_loss = epoch_loss / len(dataset)
        history["train_loss"].append(avg_loss)
        print(f"Epoch {epoch + 1}/{epochs} | loss: {avg_loss:.4f}")

    return model, history


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract and train a combined LSTM + Transformer sequence model.")
    parser.add_argument("--source", type=Path, default=Path("AICity22_Track1_MTMC_Tracking"), help="Source dataset directory")
    parser.add_argument("--output", type=Path, default=Path("frames"), help="Where extracted frame folders are saved")
    parser.add_argument("--every-nth-frame", type=int, default=1, help="Store one frame every N frames")
    parser.add_argument("--sequence-length", type=int, default=16, help="Frame sequence length for training")
    parser.add_argument("--batch-size", type=int, default=8, help="Training batch size")
    parser.add_argument("--epochs", type=int, default=5, help="Training epochs")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--label-csv", type=Path, default=None, help="Optional CSV with columns: folder,label")
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu")
    args = parser.parse_args()

    if args.every_nth_frame < 1:
        parser.error("--every-nth-frame must be at least 1")
    if not args.source.exists():
        parser.error(f"Source folder does not exist: {args.source}")

    extract_dataset_frames(args.source, args.output, args.every_nth_frame)

    frame_root = args.output.resolve()
    device = torch.device(args.device)

    model, history = train_model(
        frame_root=frame_root,
        sequence_length=args.sequence_length,
        batch_size=args.batch_size,
        epochs=args.epochs,
        learning_rate=args.lr,
        label_csv=args.label_csv,
        device=device,
    )

    model_path = frame_root.parent / "lstm_transformer_sequence_model.pt"
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to {model_path}")
    print(f"Final training loss: {history['train_loss'][-1]:.4f}")


if __name__ == "__main__":
    main()