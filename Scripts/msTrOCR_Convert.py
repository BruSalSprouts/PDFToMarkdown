import torch
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from pdf2image import convert_from_path
import pytesseract
import os

# Load TrOCR Model
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")

print("TrOCR Model Loaded")

def extract_text_from_pdf(pdf_path):
    # Convert PDF pages to images
    images = convert_from_path(pdf_path)
    text_list = []
    print("\n Extracting text from PDF... \n")
    print("Number of pages: " + str(len(images)))
    for img in images:
        # Convert image to tensor
        pixel_values = processor(images=img, return_tensors="pt").pixel_values

        # Generate text
        with torch.no_grad():
            generated_ids = model.generate(pixel_values)
        text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # Append extracted text
        text_list.append(text)
        print(f"Extracted text: {text}")
    return text_list

# Extract text from PDF
pdfFileTest = "CPTS453_HW6_Bruno.pdf"
cwd = os.getcwd()
pdfFilePathTest = os.path.join(cwd, "pdfs", pdfFileTest)
print("Current path for pdf: " + pdfFilePathTest)
extracted_text = extract_text_from_pdf(pdfFilePathTest)

# Print extracted text from pages
for i, page_text in enumerate(extracted_text):
    print(f"Page {i+1}: {page_text}")