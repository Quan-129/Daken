
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'if (this.jlptHubPage && !this.jlptHubPage.classList.contains(\'hidden\')) {' in line:
        found_if = True
    if 'this.renderJLPTUnits();' in line:
        # Check if following lines are missing the closure
        pass

# Actually, let's just do a string replace on the whole content
content = "".join(lines)
target = """            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }

    private updateProfileUI() {"""

replacement = """            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }
        });
    }

    private updateProfileUI() {"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully patched UISystem.ts")
else:
    # Try finding with different spacing
    print("Target not found exactly. Checking for variants...")
    # Add a more flexible search if needed, but the view_file was quite clear.
