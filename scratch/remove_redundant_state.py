
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found_first = False
for line in lines:
    if "const state = StateManager.getInstance();" in line:
        if not found_first:
            new_lines.append(line)
            found_first = True
        else:
            # Skip the second occurrence
            continue
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully removed redundant 'state' declaration from UISystem.ts.")
