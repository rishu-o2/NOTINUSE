from pathlib import Path
import cv2
import pandas as pd
import re
import easyocr
from ultralytics import YOLO

VEHICLE_CROP_DIR = Path("vehicle_crops")

PLATE_MODEL = "license_plate_detector.pt"

OUTPUT_DIR = Path("anpr_output")
PLATE_DIR = OUTPUT_DIR / "plate_crops"

OUTPUT_DIR.mkdir(exist_ok=True)
PLATE_DIR.mkdir(exist_ok=True)

CONFIDENCE = 0.35

plate_model = YOLO(PLATE_MODEL)

reader = easyocr.Reader(
    ["en"],
    gpu=True
)


def clean_text(text):

    text = text.upper()

    text = re.sub(
        r"[^A-Z0-9]",
        "",
        text
    )

    return text


def read_plate(image):

    if image is None:
        return ""

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    gray = cv2.resize(
        gray,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC
    )

    result = reader.readtext(
        gray
    )

    candidates = []

    for detection in result:

        text = detection[1]
        confidence = detection[2]

        if confidence >= 0.30:

            text = clean_text(text)

            if len(text) >= 4:
                candidates.append(text)

    if not candidates:
        return ""

    return max(
        candidates,
        key=len
    )


results = []

for vehicle_dir in VEHICLE_CROP_DIR.iterdir():

    if not vehicle_dir.is_dir():
        continue

    track_id = vehicle_dir.name.replace(
        "vehicle_",
        ""
    )

    for image_path in vehicle_dir.glob("*"):

        frame = cv2.imread(
            str(image_path)
        )

        if frame is None:
            continue

        detections = plate_model.predict(
            frame,
            conf=CONFIDENCE,
            verbose=False
        )

        result = detections[0]

        if result.boxes is None:
            continue

        for i, box in enumerate(result.boxes):

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )

            h, w = frame.shape[:2]

            x1 = max(0, min(x1, w - 1))
            y1 = max(0, min(y1, h - 1))
            x2 = max(0, min(x2, w))
            y2 = max(0, min(y2, h))

            if x2 <= x1 or y2 <= y1:
                continue

            plate = frame[
                y1:y2,
                x1:x2
            ]

            plate_text = read_plate(
                plate
            )

            plate_name = (
                f"vehicle_{track_id}_"
                f"{image_path.stem}_"
                f"{i}.jpg"
            )

            plate_path = (
                PLATE_DIR /
                plate_name
            )

            cv2.imwrite(
                str(plate_path),
                plate
            )

            results.append({
                "track_id": track_id,
                "frame": image_path.name,
                "plate_text": plate_text,
                "confidence": float(
                    box.conf[0]
                ),
                "plate_image": str(
                    plate_path
                )
            })


df = pd.DataFrame(results)

output_csv = (
    OUTPUT_DIR /
    "anpr_results.csv"
)

df.to_csv(
    output_csv,
    index=False
)

print("ANPR completed.")
print(f"Results: {output_csv}")
print(f"Total detections: {len(df)}")