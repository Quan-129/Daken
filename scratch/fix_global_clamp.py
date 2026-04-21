
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = "totalScoreSum += (prog.score || 0);"
replacement = "totalScoreSum += Math.min(prog.score || 0, 3000);"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully patched StateManager.ts to clamp global score sum.")
else:
    print("Target block not found.")
