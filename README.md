# PDF to Markdown Converter

A robust PDF to Markdown converter that uses multiple OCR engines (Microsoft's TrOCR, Facebook's Nougat, and Tesseract) to achieve high-quality text extraction and markdown formatting.

## Features ##

- Multiple OCR engine support for better accuracy
- Intelligent combining of results from different engines
- Special handling for mathematical equations and technical content
- Support for batch processing multiple PDFs
- Proper markdown formatting
- GPU acceleration when available

## Setup ##

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Tesseract OCR:
   - Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `sudo apt-get install tesseract-ocr`
   - Mac: `brew install tesseract`

3. Make sure you have enough disk space for the ML models (approximately 5GB)

## Usage ##

### Single PDF Conversion ###

```bash
python Scripts/convert_pdf.py path/to/your.pdf --output output.md
```

### Batch Processing ###

```bash
python Scripts/convert_pdf.py path/to/pdf/folder --batch --output output/folder
```

### Options ###

- `--output, -o`: Specify output file or directory
- `--batch, -b`: Process all PDFs in the input directory

## Known Limitations ##

- Large PDFs may require significant memory
- Some complex mathematical equations might need manual verification
- Processing time depends on the PDF size and available hardware
