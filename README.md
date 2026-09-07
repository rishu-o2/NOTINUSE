# AICity frame extraction

Install the dependency and extract frames from every video and image:

```powershell
python -m pip install -r requirements.txt
python extract_frames.py
```

Frames are written to `frames/`, preserving each input file's original folder
structure. To reduce the number of images, for example saving one in every five
video frames, run `python extract_frames.py --every-nth-frame 5`.
# NOTINUSE
