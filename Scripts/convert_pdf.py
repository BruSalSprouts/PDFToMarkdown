import argparse
import os
from pdf_converter import PDFConverter
import logging

def main():
    parser = argparse.ArgumentParser(description='Convert PDF files to Markdown format')
    parser.add_argument('pdf_path', help='Path to the PDF file or directory containing PDFs')
    parser.add_argument('--output', '-o', help='Output directory for markdown files')
    parser.add_argument('--batch', '-b', action='store_true', help='Process all PDFs in the input directory')
    args = parser.parse_args()

    try:
        converter = PDFConverter()
        
        if args.batch:
            if not os.path.isdir(args.pdf_path):
                raise ValueError("For batch processing, pdf_path must be a directory")
            
            # Process all PDFs in directory
            for file in os.listdir(args.pdf_path):
                if file.lower().endswith('.pdf'):
                    pdf_file = os.path.join(args.pdf_path, file)
                    output_path = None
                    if args.output:
                        output_name = os.path.splitext(file)[0] + '.md'
                        output_path = os.path.join(args.output, output_name)
                    converter.process_pdf(pdf_file, output_path)
        else:
            # Process single PDF
            if not os.path.isfile(args.pdf_path):
                raise ValueError("PDF file not found")
            
            output_path = None
            if args.output:
                if os.path.isdir(args.output):
                    output_name = os.path.splitext(os.path.basename(args.pdf_path))[0] + '.md'
                    output_path = os.path.join(args.output, output_name)
                else:
                    output_path = args.output
                    
            converter.process_pdf(args.pdf_path, output_path)
            
    except Exception as e:
        logging.error(f"Error during conversion: {str(e)}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())