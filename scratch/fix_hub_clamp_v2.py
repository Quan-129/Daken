
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the score variable to clamp at 3000
target = "let score = prog && prog.score ? prog.score : 0;"
replacement = "let score = prog && prog.score ? Math.min(prog.score, 3000) : 0;"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully patched UISystem.ts to clamp Hub scores at 3000 for display.")
else:
    print("Target block not found. Checking content...")
    # Try alternate formatting if needed
    target2 = "let score = prog && prog.score ? prog.score : 0 ;"
    if target2 in content:
         content = content.replace(target2, replacement)
         with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
         print("Successfully patched UISystem.ts (alt format)")
