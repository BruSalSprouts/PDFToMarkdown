# from huggingface_hub import hf_hub_download
import re
from PIL import Image
from transformers import NougatProcessor, VisionEncoderDecoderModel
from datasets import load_dataset
import torch
from pdf2image import convert_from_path
from PIL import Image
import os

processor = NougatProcessor.from_pretrained("facebook/nougat-base")
model = VisionEncoderDecoderModel.from_pretrained("facebook/nougat-base")
varl = False
print("Nougat Model Loaded")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print("Device: ", device)

# File preparation
pdfFileTest = "xrayreports4.pdf"
# pdfFileTest = "hw4_submission.pdf"
# pdfFileTest = "TeamDevHour_FinishingProject_Part2.pdf"
cwd = os.getcwd()
pdfFilePathTest = os.path.join(cwd, "pdfs", pdfFileTest)
print("Current path for pdf: " + pdfFilePathTest)

# Convert PDF to Image
images = convert_from_path(pdfFilePathTest)
# images[0].show()

# # filepath = hf_hub_download(repo_id="hf-internal-testing/fixtures_docvqa", filename="nougat_paper.png", repo_type="dataset")
# image = Image.open(pdfFilePathTest)

# Doing OCR on first page

extracted_text = pdfFileTest + " Extracted Text: \n"

# imagees = []
# imagees.append(images[0])
# imagees.append(images[1])
# imagees.append(images[2])

# resized_image = images[0].resize((1280, 1024))

for j, image in enumerate(images):
    # Split image into 2 columns
    width, height = images[j].size
    # left_half = resized_image.crop((0, 0, width // 2, height))
    # right_half = resized_image.crop((width // 2, 0, width, height))

    # Split image into 10 rows
    image_rows = []
    extracted_text_rows = []
    row_count = 20
    for i in range(row_count):
        top = i * height // row_count
        bottom = (i + 1) * height // row_count
        image_rows.append(images[j].crop((0, top, width, bottom)))
        pixel_values = processor(images=image_rows[i], return_tensors="pt").pixel_values
        outputs = model.generate(pixel_values.to(device))
        extracted_text_rows.append(processor.batch_decode(outputs, skip_special_tokens=True)[0])
        print(f"Row {i+1}: \n{extracted_text_rows[i]}\n")
        extracted_text = extracted_text + "\n" + extracted_text_rows[i]
        
    print(f"\n Page {j+1}'s Extracted Text: \n{extracted_text}\n =================================\n \n")

# Write extracted text to extracted_text.txt

print(extracted_text)
with open(f"extracted_text.txt", "w", encoding="utf-8") as f:
    print("Writing extracted text to extracted_text.txt")
    f.write(extracted_text)
        
# sequence = processor.batch_decode(outputs, skip_special_tokens=True)[0]
# sequence = processor.post_process_generation(sequence, fix_markdown=False)
# print(repr(sequence))