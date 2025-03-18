import os

__file__ = "hw4_submission.pdf"

# Get the current working directory
cwd = os.getcwd()
print("Apparently the current working directory: " + cwd)

# Connect current working directory to a pdf file
pdfPath = os.path.join(cwd, "pdfs", __file__)
print("path to pdf file: " + pdfPath)
# os.startfile()