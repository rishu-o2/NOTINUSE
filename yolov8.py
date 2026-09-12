from pathlib import Path
import cv2
import pandas as pd
from ultralytics import YOLO


# ==============================
# CONFIGURATION
# ==============================

INPUT_DIR = Path("frames")
OUTPUT_DIR = Path("yolo_output")

MODEL_PATH = "yolov8n.pt"

CONFIDENCE = 0.40

# COCO vehicle classes
VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}


# ==============================
# CREATE OUTPUT DIRECTORIES
# ==============================

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ANNOTATED_DIR = OUTPUT_DIR / "annotated_frames"

ANNOTATED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==============================
# LOAD YOLO MODEL
# ==============================

model = YOLO(MODEL_PATH)


# ==============================
# FIND FRAMES
# ==============================

image_extensions = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp"
}

frames = sorted(
    [
        file for file in INPUT_DIR.iterdir()
        if file.suffix.lower() in image_extensions
    ]
)


if not frames:
    raise FileNotFoundError(
        f"No frames found in: {INPUT_DIR}"
    )


# ==============================
# DETECTION
# ==============================

detections = []


for frame_path in frames:

    frame = cv2.imread(
        str(frame_path)
    )

    if frame is None:
        continue

    results = model.predict(
        source=frame,
        conf=CONFIDENCE,
        verbose=False
    )

    result = results[0]

    boxes = result.boxes

    if boxes is None:
        continue


    for box in boxes:

        class_id = int(
            box.cls[0].item()
        )

        confidence = float(
            box.conf[0].item()
        )


        # Only vehicles
        if class_id not in VEHICLE_CLASSES:
            continue


        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )


        vehicle_type = VEHICLE_CLASSES[
            class_id
        ]


        detections.append(
            {
                "frame": frame_path.name,
                "class_id": class_id,
                "vehicle_type": vehicle_type,
                "confidence": confidence,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            }
        )


    # ==============================
    # SAVE ANNOTATED FRAME
    # ==============================

    annotated_frame = result.plot()

    output_path = (
        ANNOTATED_DIR /
        frame_path.name
    )

    cv2.imwrite(
        str(output_path),
        annotated_frame
    )


# ==============================
# SAVE DETECTIONS
# ==============================

df = pd.DataFrame(
    detections
)


csv_path = (
    OUTPUT_DIR /
    "vehicle_detections.csv"
)


df.to_csv(
    csv_path,
    index=False
)


# ==============================
# SUMMARY
# ==============================

print("YOLOv8 Vehicle Detection Complete")

print(
    f"Frames processed : {len(frames)}"
)

print(
    f"Vehicles detected: {len(df)}"
)

print(
    f"CSV saved        : {csv_path}"
)

print(
    f"Annotated frames : {ANNOTATED_DIR}"
)