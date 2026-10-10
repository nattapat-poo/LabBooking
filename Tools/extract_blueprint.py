import os
import re

def extract_functions_from_file(file_path):
    """
    Scans a file line by line to extract standard JavaScript/GAS function names.
    Ignores commented-out functions.
    """
    functions = []
    # Regex to find: function functionName(
    # Avoids catching functions inside comments if they start at the beginning of a line
    pattern = re.compile(r'^\s*function\s+([a-zA-Z0-9_]+)\s*\(', re.MULTILINE)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find all matching standard functions
            matches = pattern.findall(content)
            for match in matches:
                functions.append(match)
    except Exception as e:
        print(f"⚠️ Error reading {file_path}: {e}")
    
    return functions

def generate_blueprint():
    # Ask the user for the current cycle number to name the file perfectly
    cycle_num = input("Enter the current Audit Cycle number (e.g., 14): ").strip()
    if not cycle_num:
        cycle_num = "XX"
        
    output_filename = f"AllFunctions[{cycle_num}].md"
    
    # Target directory is the current folder where the script is running
    current_directory = "." 
    valid_extensions = ('.gs', '.js', '.html')
    
    # Get and sort files alphabetically
    files = [f for f in os.listdir(current_directory) if f.endswith(valid_extensions) and f != 'extract_blueprint.py']
    files.sort()

    markdown_content = f"# Codebase Function Blueprint (Cycle: {cycle_num})\n\n"
    markdown_content += "> *Note: This file is auto-generated. Do not manually edit function lists.*\n\n"

    total_functions = 0
    
    for file_name in files:
        file_path = os.path.join(current_directory, file_name)
        display_name = os.path.splitext(file_name)[0]
        
        # Keep .html extension visible for UI files like Test_Runner.html
        if file_name.endswith('.html'):
            display_name = file_name
            
        functions = extract_functions_from_file(file_path)
        total_functions += len(functions)
        
        markdown_content += f"### {display_name}\n"
        if functions:
            for func in functions:
                markdown_content += f"- `{func}`\n"
        else:
            # Matches your specific use case for files like Utils_DataMapper
            markdown_content += "- *(No functions found in this module)*\n"
        markdown_content += "\n"

    # Write out the finalized markdown file
    with open(output_filename, 'w', encoding='utf-8') as out_file:
        out_file.write(markdown_content)
        
    print(f"✅ Success! Generated '{output_filename}'")
    print(f"📊 Processed {len(files)} files and indexed {total_functions} functions.")

if __name__ == "__main__":
    generate_blueprint()