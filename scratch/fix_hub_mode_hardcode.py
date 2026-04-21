
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the hardcoded study mode when clicking sub-blades (N1-N5)
target = """                if (level) {
                    this.currentStudyLevel = level;
                    this.currentMode = 'study';"""

replacement = """                if (level) {
                    this.currentStudyLevel = level;
                    this.currentMode = (e.currentTarget as HTMLElement).getAttribute('data-parent-mode') || 'study';"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully fixed Hub mode selection logic.")
else:
    print("Target logic not found. Checking for slightly different spacing.")
    # Attempt a more flexible match
    import re
    pattern = r"if\s*\(level\)\s*\{\s*this\.currentStudyLevel\s*=\s*level;\s*this\.currentMode\s*=\s*'study';"
    if re.search(pattern, content):
        content = re.sub(pattern, """if (level) {
                    this.currentStudyLevel = level;
                    this.currentMode = (e.currentTarget as HTMLElement).getAttribute('data-parent-mode') || 'study';""", content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully fixed Hub mode selection logic using Regex.")
    else:
        print("Regex match also failed. Please check the file manually.")
