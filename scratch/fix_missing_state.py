
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the missing 'state' definition in refreshLeaderboard
target = """        const auth = AuthSystem.getInstance();
        const user = auth.getCurrentUser();"""

replacement = """        const auth = AuthSystem.getInstance();
        const state = StateManager.getInstance();
        const user = auth.getCurrentUser();"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully defined 'state' in refreshLeaderboard function.")
else:
    print("Target block not found. Checking if it's already there or formatted differently...")
