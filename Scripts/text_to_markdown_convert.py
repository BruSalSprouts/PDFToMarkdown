import os
from lineFixingForMarkdown import accept_file_for_fixing_for_markdown, fix_markdown_headers_missing_end_hashes


# Function to convert text to markdown
def convert_text_to_markdown(file_path):
    if not file_path.endswith(".txt"):
        print("The file is not a text file. Please provide a .txt file")
        return

    # Replace .txt with .md in the file path
    md_file_path = file_path.replace(".txt", ".md")

    with open(file_path, "r", encoding="utf-8") as file:
        print("Opening file...")
        accept_file_for_fixing_for_markdown(file_path) # Keep in for now to fix OCR issues
        text = file.read()
        print("File read")
    
    with open(md_file_path, "w", encoding="utf-8") as md_file:
        # Write the text to the markdown file
        md_file.write(text)

    print(f"Converted text from {file_path} to markdown and saved it to {md_file_path}")

convert_text_to_markdown("extracted_text.txt")