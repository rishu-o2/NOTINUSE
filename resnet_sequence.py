from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


CROP_DIR = Path("vehicle_crops")

OUTPUT_DIR = Path("features")

OUTPUT_DIR.mkdir(exist_ok=True)

SEQUENCE_LENGTH = 16

DEVICE = (
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ==========================================
# RESNET
# ==========================================

weights = models.ResNet18_Weights.DEFAULT

resnet = models.resnet18(
    weights=weights
)

resnet.fc = nn.Identity()

resnet = resnet.to(DEVICE)

resnet.eval()


# ==========================================
# TRANSFORM
# ==========================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


all_sequences = []
vehicle_ids = []


# ==========================================
# VEHICLE SEQUENCES
# ==========================================

for vehicle_dir in sorted(
    CROP_DIR.iterdir()
):

    if not vehicle_dir.is_dir():
        continue

    image_paths = sorted(
        [
            p for p in
            vehicle_dir.iterdir()
            if p.suffix.lower()
            in [".jpg", ".jpeg", ".png"]
        ]
    )

    if len(image_paths) < SEQUENCE_LENGTH:
        continue


    # Take consecutive 16 frames
    for start in range(
        0,
        len(image_paths) -
        SEQUENCE_LENGTH + 1,
        SEQUENCE_LENGTH
    ):

        sequence_paths = image_paths[
            start:
            start + SEQUENCE_LENGTH
        ]

        features = []


        for image_path in sequence_paths:

            image = Image.open(
                image_path
            ).convert("RGB")

            tensor = transform(
                image
            ).unsqueeze(0)

            tensor = tensor.to(
                DEVICE
            )

            with torch.no_grad():

                feature = resnet(
                    tensor
                )

            feature = (
                feature
                .squeeze(0)
                .cpu()
                .numpy()
            )

            features.append(
                feature
            )


        features = np.stack(
            features
        )

        all_sequences.append(
            features
        )

        vehicle_ids.append(
            vehicle_dir.name
        )


# ==========================================
# SAVE
# ==========================================

if len(all_sequences) == 0:

    print(
        "No valid 16-frame sequences found."
    )

else:

    X = np.stack(
        all_sequences
    )

    np.save(
        OUTPUT_DIR / "features.npy",
        X
    )

    np.save(
        OUTPUT_DIR / "vehicle_ids.npy",
        np.array(vehicle_ids)
    )

    print(
        "Feature extraction completed."
    )

    print(
        f"Feature shape: {X.shape}"
    )

    print(
        "Expected: [N, 16, 512]"
    )