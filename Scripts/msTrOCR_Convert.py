import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from pdf2image import convert_from_path
import pytesseract
import os

# Load TrOCR Model
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

print("TrOCR Model Loaded")

# Fucntion that performs OCR on images
def extract_text_from_image(image):
    text_list = []
    print("\n Extracting text from image... \n")
    pixel_values = processor(images=image, return_tensors="pt").pixel_values
    with torch.no_grad():
        generated_ids = model.generate(pixel_values)
    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return text

# PDF path
pdfFileTest = "CPTS453_HW6_Bruno.pdf"
cwd = os.getcwd()
pdfFilePathTest = os.path.join(cwd, "pdfs", pdfFileTest)
print("Current path for pdf: " + pdfFilePathTest)

# Convert PDF to images
images = convert_from_path(pdfFilePathTest, dpi=300)

# Extract text from each page
extracted_text = []
for i, image in enumerate(images):
    image.save(f"images/page_{i+1}.jpg")
    image = image.convert("RGB")  # Ensure RGB mode
    text = extract_text_from_image(image)
    extracted_text.append(f"Page {i+1}: \n{text}\n")

# Save extracted text to a text file
with open("extracted_text.txt", "w", encoding="utf-8") as f:
    f.writelines(extracted_text)

print("Text extracted from PDF and saved to extracted_text.txt")