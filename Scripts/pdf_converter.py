import os
import torch
from transformers import (
    TrOCRProcessor, 
    VisionEncoderDecoderModel, 
    NougatProcessor
)
from pdf2image import convert_from_path
import pytesseract
from PIL import Image
import logging
import re
from layout_models import LayoutModels

class PDFConverter:
    def __init__(self):
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        # Initialize OCR models
        self.init_models()

    def init_models(self):
        """Initialize all OCR models"""
        try:
            # TrOCR initialization
            self.trocr_processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
            self.trocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
            
            # Nougat initialization
            self.nougat_processor = NougatProcessor.from_pretrained("facebook/nougat-base")
            self.nougat_model = VisionEncoderDecoderModel.from_pretrained("facebook/nougat-base")
            
            # Layout Models initialization
            self.layout_models = LayoutModels()
            
            # Move models to GPU if available
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.trocr_model.to(self.device)
            self.nougat_model.to(self.device)
            
            self.logger.info("All models loaded successfully")
        except Exception as e:
            self.logger.error(f"Error initializing models: {str(e)}")
            raise

    def convert_pdf_to_images(self, pdf_path, dpi=300):
        """Convert PDF to images"""
        try:
            self.logger.info(f"Converting PDF to images: {pdf_path}")
            return convert_from_path(pdf_path, dpi=dpi)
        except Exception as e:
            self.logger.error(f"Error converting PDF to images: {str(e)}")
            raise

    def process_with_trocr(self, image):
        """Process image with TrOCR"""
        try:
            pixel_values = self.trocr_processor(images=image, return_tensors="pt").pixel_values.to(self.device)
            with torch.no_grad():
                generated_ids = self.trocr_model.generate(pixel_values)
            return self.trocr_processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        except Exception as e:
            self.logger.error(f"Error in TrOCR processing: {str(e)}")
            return ""

    def process_with_nougat(self, image):
        """Process image with Nougat"""
        try:
            pixel_values = self.nougat_processor(images=image, return_tensors="pt").pixel_values.to(self.device)
            outputs = self.nougat_model.generate(pixel_values)
            return self.nougat_processor.batch_decode(outputs, skip_special_tokens=True)[0]
        except Exception as e:
            self.logger.error(f"Error in Nougat processing: {str(e)}")
            return ""

    def process_with_tesseract(self, image):
        """Process image with Tesseract"""
        try:
            return pytesseract.image_to_string(image)
        except Exception as e:
            self.logger.error(f"Error in Tesseract processing: {str(e)}")
            return ""

    def convert_latex_to_markdown(self, text):
        """Convert LaTeX content to Markdown format"""
        # Convert document class and packages to markdown metadata
        text = re.sub(r'\\documentclass.*?\n', '---\n', text)
        text = re.sub(r'\\usepackage.*?\n', '', text)
        text = re.sub(r'\\begin{document}', '---\n\n', text)
        text = re.sub(r'\\end{document}', '', text)
        
        # Convert sections and subsections
        text = re.sub(r'\\section{(.*?)}', r'# \1', text)
        text = re.sub(r'\\subsection{(.*?)}', r'## \1', text)
        text = re.sub(r'\\subsubsection{(.*?)}', r'### \1', text)
        
        # Convert basic math environments
        text = re.sub(r'\\begin{equation\*?}(.*?)\\end{equation\*?}', r'$$\1$$', text, flags=re.DOTALL)
        text = re.sub(r'\\begin{align\*?}(.*?)\\end{align\*?}', r'$$\1$$', text, flags=re.DOTALL)
        text = re.sub(r'\$\$(.*?)\$\$', lambda m: m.group(0).replace('\\\\', '\\'), text, flags=re.DOTALL)
        
        # Convert inline math
        text = re.sub(r'\$(.*?)\$', lambda m: m.group(0).replace('\\\\', '\\'), text)
        
        # Clean up extra newlines and spaces
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()

    def combine_results(self, trocr_text, tesseract_text, layout_results):
        """Intelligently combine results from different models"""
        # Use layout information to structure the text
        layout_info = layout_results['layout_info']
        structured_text = layout_results['text']
        
        # Combine text based on confidence and layout understanding
        if layout_info['attention'] is not None:
            # Use attention weights to determine which parts of the text to keep
            attention_weights = layout_info['attention'].mean(dim=(0, 1))
            high_attention_mask = attention_weights > attention_weights.mean()
            
            # Prefer structured text from Donut for high-attention regions
            final_text = structured_text
            
            # Fill in with TrOCR/Tesseract results for other regions
            if not high_attention_mask.all():
                final_text = f"{final_text}\n{trocr_text}"
        else:
            # If no layout attention, use a simple combination
            final_text = f"{structured_text}\n{trocr_text}"
        
        # Convert any LaTeX content to Markdown
        final_text = self.convert_latex_to_markdown(final_text)
            
        return final_text

    def convert_to_markdown(self, pdf_path):
        """Convert PDF to markdown using all available models"""
        try:
            self.logger.info(f"Processing PDF: {pdf_path}")
            images = self.convert_pdf_to_images(pdf_path)
            
            full_text = []
            for i, image in enumerate(images):
                self.logger.info(f"Processing page {i+1}/{len(images)}")
                
                # Process with each model
                trocr_text = self.process_with_trocr(image)
                tesseract_text = self.process_with_tesseract(image)
                layout_results = self.layout_models.extract_structured_text(image)
                
                # Combine results
                page_text = self.combine_results(trocr_text, tesseract_text, layout_results)
                
                # Add page marker
                full_text.append(f"## Page {i+1}\n\n{page_text}\n")
            
            # Join all pages
            return "\n".join(full_text)
            
        except Exception as e:
            self.logger.error(f"Error processing PDF: {str(e)}")
            raise