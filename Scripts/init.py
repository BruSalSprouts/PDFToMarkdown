import subprocess
import os
import sys
import platform
from pathlib import Path

def check_tesseract():
    """Check if Tesseract is installed and accessible"""
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        print("✓ Tesseract is installed and accessible")
        return True
    except Exception:
        print("✗ Tesseract is not properly installed")
        if platform.system() == "Windows":
            print("Please install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")
        elif platform.system() == "Darwin":  # macOS
            print("Install Tesseract using: brew install tesseract")
        else:  # Linux
            print("Install Tesseract using: sudo apt-get install tesseract-ocr")
        return False

def check_requirements():
    """Check and install required Python packages"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("✗ Failed to install Python dependencies")
        return False

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = ["pdfs", "output"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✓ Required directories created")

def main():
    print("Initializing PDF to Markdown Converter...")
    
    # Check Python version
    if sys.version_info >= (3, 8):
        print("✓ Python version OK")
    else:
        print("✗ Python 3.8 or higher is required")
        return False
    
    success = all([
        check_tesseract(),
        check_requirements(),
    ])
    
    create_directories()
    
    if success:
        print("\nSetup completed successfully! You can now use the converter.")
        print("\nExample usage:")
        print("python Scripts/convert_pdf.py pdfs/your_file.pdf --output output/result.md")
    else:
        print("\nSetup completed with some issues. Please resolve the above errors before using the converter.")

if __name__ == "__main__":
    main()