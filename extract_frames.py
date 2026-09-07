"""Extract the AICity dataset videos and images into JPEG frames.

Examples
--------
python extract_frames.py
python extract_frames.py --every-nth-frame 5
python extract_frames.py --source AICity22_Track1_MTMC_Tracking --output frames
"""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2


VIDEO_EXTENSIONS = {".avi", ".mp4", ".mov", ".mkv", ".webm"}
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".webp"}


def output_folder(source: Path, source_root: Path, destination_root: Path) -> Path:
    """Create a collision-free directory mirroring the source file location."""
    return destination_root / source.relative_to(source_root).with_suffix("")


def extract_video(video_path: Path, source_root: Path, destination_root: Path, every_nth: int) -> int:
    destination = output_folder(video_path, source_root, destination_root)
    destination.mkdir(parents=True, exist_ok=True)

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        print(f"ERROR: could not open {video_path}")
        return 0

    saved = 0
    index = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            break

        if index % every_nth == 0:
            frame_path = destination / f"frame_{index:06d}.jpg"
            # Existing output is retained, so re-running safely resumes work.
            if not frame_path.exists() and not cv2.imwrite(str(frame_path), frame):
                raise RuntimeError(f"Could not write {frame_path}")
            saved += 1
        index += 1

    capture.release()
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


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert videos and images to JPEG frames.")
    parser.add_argument("--source", type=Path, default=Path("AICity22_Track1_MTMC_Tracking"))
    parser.add_argument("--output", type=Path, default=Path("frames"))
    parser.add_argument(
        "--every-nth-frame", type=int, default=1,
        help="Save one frame every N video frames (default: 1).",
    )
    args = parser.parse_args()

    if args.every_nth_frame < 1:
        parser.error("--every-nth-frame must be at least 1")
    if not args.source.is_dir():
        parser.error(f"Source folder does not exist: {args.source}")

    source_root = args.source.resolve()
    destination_root = args.output.resolve()
    destination_root.mkdir(parents=True, exist_ok=True)

    files = sorted(path for path in source_root.rglob("*") if path.is_file())
    video_files = [path for path in files if path.suffix.lower() in VIDEO_EXTENSIONS]
    image_files = [path for path in files if path.suffix.lower() in IMAGE_EXTENSIONS]

    print(f"Found {len(video_files)} videos and {len(image_files)} images.")
    saved = sum(extract_video(path, source_root, destination_root, args.every_nth_frame) for path in video_files)
    saved += sum(extract_image(path, source_root, destination_root) for path in image_files)
    print(f"Completed: {saved} frames are available in {destination_root}")


if __name__ == "__main__":
    main()
