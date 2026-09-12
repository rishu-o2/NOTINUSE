from pathlib import Path
import cv2
import pandas as pd
from ultralytics import YOLO


# ==============================
# CONFIGURATION
# ==============================

INPUT_DIR = Path("frames")
OUTPUT_DIR = Path("bytetrack_output")

MODEL_PATH = "yolov8n.pt"

CONFIDENCE = 0.40

VEHICLE_CLASSES = {
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}


# ==============================
# OUTPUT DIRECTORIES
# ==============================

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ANNOTATED_DIR = OUTPUT_DIR / "tracked_frames"

ANNOTATED_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==============================
# LOAD MODEL
# ==============================

model = YOLO(MODEL_PATH)


# ==============================
# GET FRAMES
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
        f"No frames found in {INPUT_DIR}"
    )


# ==============================
# TRACKING
# ==============================

tracking_data = []


for frame_path in frames:

    frame = cv2.imread(
        str(frame_path)
    )

    if frame is None:
        continue


    results = model.track(
        source=frame,
        persist=True,
        tracker="bytetrack.yaml",
        conf=CONFIDENCE,
        classes=list(VEHICLE_CLASSES.keys()),
        verbose=False
    )


    result = results[0]


    # ==============================
    # CHECK TRACK IDs
    # ==============================

    if result.boxes is not None:

        boxes = result.boxes

        if boxes.id is not None:

            track_ids = (
                boxes.id
                .int()
                .cpu()
                .tolist()
            )

            class_ids = (
                boxes.cls
                .int()
                .cpu()
                .tolist()
            )

            confidences = (
                boxes.conf
                .cpu()
                .tolist()
            )

            coordinates = (
                boxes.xyxy
                .int()
                .cpu()
                .tolist()
            )


            for track_id, class_id, confidence, bbox in zip(
                track_ids,
                class_ids,
                confidences,
                coordinates
            ):

                x1, y1, x2, y2 = bbox

                tracking_data.append(
                    {
                        "frame": frame_path.name,
                        "track_id": track_id,
                        "vehicle_type": VEHICLE_CLASSES[class_id],
                        "confidence": confidence,
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2
                    }
                )


    # ==============================
    # SAVE TRACKED FRAME
    # ==============================

    annotated_frame = result.plot(
        labels=True,
        boxes=True
    )

    output_path = (
        ANNOTATED_DIR /
        frame_path.name
    )

    cv2.imwrite(
        str(output_path),
        annotated_frame
    )


# ==============================
# SAVE TRACKING CSV
# ==============================

df = pd.DataFrame(
    tracking_data
)


csv_path = (
    OUTPUT_DIR /
    "vehicle_tracking.csv"
)


df.to_csv(
    csv_path,
    index=False
)


# ==============================
# SUMMARY
# ==============================

unique_ids = (
    df["track_id"].nunique()
    if not df.empty
    else 0
)


print(
    "ByteTrack Vehicle Tracking Complete"
)

print(
    f"Frames processed : {len(frames)}"
)

print(
    f"Total detections : {len(df)}"
)

print(
    f"Unique vehicles  : {unique_ids}"
)

print(
    f"Tracking CSV     : {csv_path}"
)

print(
    f"Tracked frames   : {ANNOTATED_DIR}"
)