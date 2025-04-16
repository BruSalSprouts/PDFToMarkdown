import torch
from transformers import (
    LayoutLMv3Processor, 
    LayoutLMv3ForSequenceClassification,
    LayoutLMv3FeatureExtractor,
    LayoutLMv3TokenizerFast,
    DonutProcessor, 
    VisionEncoderDecoderModel
)
from PIL import Image
import numpy as np

class LayoutModels:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Initialize LayoutLMv3
        self.layoutlm_processor = LayoutLMv3Processor.from_pretrained("microsoft/layoutlmv3-base")
        self.layoutlm_model = LayoutLMv3ForSequenceClassification.from_pretrained(
            "microsoft/layoutlmv3-base",
            num_labels=1
        ).to(self.device)
        
        # Initialize Donut
        self.donut_processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base")
        self.donut_model = VisionEncoderDecoderModel.from_pretrained(
            "naver-clova-ix/donut-base"
        ).to(self.device)
        
        print("Layout models loaded successfully")

    def process_with_layoutlm(self, image):
        """Process an image with LayoutLMv3 to understand document layout"""
        encoding = self.layoutlm_processor(
            image,
            return_tensors="pt",
            truncation=True
        )
        
        for k, v in encoding.items():
            encoding[k] = v.to(self.device)
        
        outputs = self.layoutlm_model(**encoding)
        
        # Get attention weights to understand layout importance
        attention = outputs.attentions[-1] if outputs.attentions else None
        
        return {
            'logits': outputs.logits,
            'attention': attention,
            'hidden_states': outputs.hidden_states[-1] if outputs.hidden_states else None
        }

    def process_with_donut(self, image):
        """Process an image with Donut for OCR and structure understanding"""
        pixel_values = self.donut_processor(image, return_tensors="pt").pixel_values.to(self.device)
        
        outputs = self.donut_model.generate(
            pixel_values,
            max_length=512,
            num_beams=4,
            early_stopping=True
        )
        
        sequence = self.donut_processor.batch_decode(outputs, skip_special_tokens=True)[0]
        return sequence

    def extract_structured_text(self, image):
        """Combine LayoutLM and Donut results for better structure understanding"""
        # Get layout understanding from LayoutLM
        layout_results = self.process_with_layoutlm(image)
        
        # Get text with structural understanding from Donut
        donut_text = self.process_with_donut(image)
        
        # Combine the results
        # Use layout attention to improve text structure
        return {
            'text': donut_text,
            'layout_info': layout_results
        }