from pathlib import Path
import cv2
import pandas as pd

TRACKING_CSV = "bytetrack_output/vehicle_tracking.csv"
FRAMES_DIR = Path("frames")
OUTPUT_DIR = Path("vehicle_crops")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(TRACKING_CSV)

count = 0

for _, row in df.iterrows():

    frame_name = str(row["frame"])
    track_id = int(row["track_id"])

    frame_path = FRAMES_DIR / frame_name

    frame = cv2.imread(str(frame_path))

    if frame is None:
        continue

    h, w = frame.shape[:2]

    x1 = max(0, min(int(row["x1"]), w - 1))
    y1 = max(0, min(int(row["y1"]), h - 1))
    x2 = max(0, min(int(row["x2"]), w))
    y2 = max(0, min(int(row["y2"]), h))

    if x2 <= x1 or y2 <= y1:
        continue

    crop = frame[y1:y2, x1:x2]

    if crop.size == 0:
        continue

    track_dir = OUTPUT_DIR / f"vehicle_{track_id}"
    track_dir.mkdir(exist_ok=True)

    output_path = track_dir / frame_name

    cv2.imwrite(str(output_path), crop)

    count += 1

print(f"Vehicle crops created: {count}")
print(f"Saved in: {OUTPUT_DIR}")