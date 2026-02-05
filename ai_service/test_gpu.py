import torch
import easyocr

print("--- GPU DIAGNOSTIC ---")
print(f"PyTorch Version: {torch.__version__}")
print(f"CUDA Available:  {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"GPU Name:        {torch.cuda.get_device_name(0)}")
    print("----------------------")
    print("Testing EasyOCR with GPU...")
    try:
        reader = easyocr.Reader(['en'], gpu=True)
        print("SUCCESS: EasyOCR loaded on GPU!")
    except Exception as e:
        print(f"ERROR: EasyOCR failed on GPU: {e}")
else:
    print("WARNING: You are still running on CPU.")