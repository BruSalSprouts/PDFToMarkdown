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

print("Nougat Model Loaded")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print("Device: ", device)

# File preparation
pdfFileTest = "xrayreports4.pdf"
cwd = os.getcwd()
pdfFilePathTest = os.path.join(cwd, "pdfs", pdfFileTest)
print("Current path for pdf: " + pdfFilePathTest)

# Convert PDF to Image
images = convert_from_path(pdfFilePathTest)
# images[0].show()

# # filepath = hf_hub_download(repo_id="hf-internal-testing/fixtures_docvqa", filename="nougat_paper.png", repo_type="dataset")
# image = Image.open(pdfFilePathTest)
for i, image in enumerate(images):
    image.save(f"pdfs/xrayreports_page_{i+1}.png")
    pixel_values = processor(image, return_tensors="pt").pixel_values
    outputs = model.generate(pixel_values.to(device)) # , min_length=1, max_new_tokens=30, bad_words_ids=[[processor.tokenizer.unk_token_id]],
    extracted_text = processor.batch_decode(outputs, skip_special_tokens=True)[0]
    print(f"Page {i+1}: \n{extracted_text}\n")

# sequence = processor.batch_decode(outputs, skip_special_tokens=True)[0]
# sequence = processor.post_process_generation(sequence, fix_markdown=False)
# print(repr(sequence))