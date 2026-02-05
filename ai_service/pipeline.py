import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from manga_ocr import MangaOcr
import easyocr
from deep_translator import GoogleTranslator
import textwrap
import os

print("Loading AI Models... (GPU Enabled)")
reader = easyocr.Reader(['ja', 'en'], gpu=True) 
ocr_model = MangaOcr()
translator = GoogleTranslator(source='auto', target='en')
print("--- AI Ready ---")

def safe_imread(path):
    try:
        stream = open(path, "rb")
        bytes = bytearray(stream.read())
        numpyarray = np.asarray(bytes, dtype=np.uint8)
        return cv2.imdecode(numpyarray, cv2.IMREAD_UNCHANGED)
    except: return None

def draw_precision_bubble(draw, box):
    """
    Draws a tight, rounded white box that barely covers the original text.
    """
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1
    
    # Use a smaller radius for a tighter fit
    radius = int(min(w, h) * 0.2) 
    
    draw.rounded_rectangle(
        (x1, y1, x2, y2), 
        radius=radius, 
        fill="white", 
        outline=None, 
        width=0
    )

def draw_smart_text(draw, text, box):
    x1, y1, x2, y2 = box
    box_w = x2 - x1
    box_h = y2 - y1
    
    # Load Font
    try:
        font_path = "manga_font.ttf"
        base_font = ImageFont.truetype(font_path, 20)
    except:
        try: base_font = ImageFont.truetype("arial.ttf", 20)
        except: base_font = ImageFont.load_default()

    # Dynamic Sizing
    # We allow the text to go closer to the edges (0.95 factor)
    target_width = box_w * 0.95
    
    font_size = int(box_h / 3) 
    font_size = min(font_size, 40)
    font_size = max(font_size, 12)
    
    final_lines = []
    final_font = base_font

    while font_size >= 10:
        try:
            if "manga_font.ttf" in os.listdir("."):
                 current_font = ImageFont.truetype("manga_font.ttf", font_size)
            else:
                 current_font = ImageFont.truetype("arial.ttf", font_size)
        except:
            current_font = ImageFont.load_default()

        # Wrap text
        avg_char_w = font_size * 0.5
        chars_per_line = max(1, int(target_width / avg_char_w))
        lines = textwrap.wrap(text, width=chars_per_line)
        
        # Check height
        line_height = font_size * 1.1
        total_h = len(lines) * line_height
        
        # If text fits vertically
        if total_h <= box_h:
            final_lines = lines
            final_font = current_font
            break
        
        font_size -= 2

    # Render
    line_height = font_size * 1.1
    total_text_h = len(final_lines) * line_height
    current_y = y1 + (box_h - total_text_h) / 2
    
    for line in final_lines:
        left, top, right, bottom = final_font.getbbox(line)
        line_w = right - left
        current_x = x1 + (box_w - line_w) / 2
        draw.text((current_x, current_y), line, fill="black", font=final_font)
        current_y += line_height

def process_manga_image(input_path, output_path):
    img_cv = safe_imread(input_path)
    if img_cv is None: return False

    pil_img = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)
    
    # DETECT (High sensitivity to merge paragraphs)
    try:
        results = reader.readtext(img_cv, paragraph=True, x_ths=1.0, y_ths=0.5)
    except: return False

    for (box, text) in results:
        (tl, tr, br, bl) = box
        x1 = int(min(tl[0], bl[0]))
        y1 = int(min(tl[1], tr[1]))
        x2 = int(max(tr[0], br[0]))
        y2 = int(max(bl[1], br[1]))

        # Only add 2 pixels of padding
        # prevents "eating" the artwork
        pad = 2
        x1 = max(0, x1 - pad)
        y1 = max(0, y1 - pad)
        x2 = min(pil_img.width, x2 + pad)
        y2 = min(pil_img.height, y2 + pad)

        # CONSERVATIVE WIDENING
        w, h = x2 - x1, y2 - y1
        
        # wide if it's extremely thin (Vertical Japanese)
        if h > w * 1.8:
            center_x = x1 + w // 2
            
            new_w = min(int(w * 2.5), int(h * 0.9)) 
            
            x1 = max(0, center_x - new_w // 2)
            x2 = min(pil_img.width, center_x + new_w // 2)

        # OCR & TRANSLATE
        crop = pil_img.crop((x1, y1, x2, y2))
        try: ja_text = ocr_model(crop)
        except: continue
        if len(ja_text) < 1: continue 

        try: en_text = translator.translate(ja_text)
        except: en_text = "..."

        # DRAW
        draw_precision_bubble(draw, (x1, y1, x2, y2))
        draw_smart_text(draw, en_text, (x1, y1, x2, y2))

    pil_img.save(output_path)
    print(f"Saved: {output_path}")
    return True