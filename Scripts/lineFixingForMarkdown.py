import os
import re

# Function to add hashes to the end of the headers that need them
# This is a fix for the headers that are missing the hashes at the end
def fix_markdown_headers_missing_end_hashes(text):
    fixed_lines = []
    for line in text.splitlines():
        match = re.match(r'^(#+) (.*)', line)
        if match:
            hashes, content = match.groups()
            line = f"{hashes} {content} {hashes}"
        fixed_lines.append(line)
    return "\n".join(fixed_lines)

def accept_file_for_fixing_for_markdown(file_path):
    with open(file_path, "r") as file:
        text = file.read()

    
    fixed_text = fix_markdown_headers_missing_end_hashes(text)

    with open(file_path, "w") as file:
        file.write(fixed_text)

    print(f"Fixed the headers in the text file {file_path} and saved it")

