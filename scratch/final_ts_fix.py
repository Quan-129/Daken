
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix missing 'state' in renderJLPTUnits
if 'private renderJLPTUnits() {' in content:
    content = content.replace(
        'private renderJLPTUnits() {',
        'private renderJLPTUnits() {\n        const state = StateManager.getInstance();'
    )

# 2. Fix implicit 'any' types in the forEach loop
# Find: data.forEach((unit, uIdx) => {
# Replace with: data.forEach((unit: any, uIdx: number) => {
target_foreach = 'data.forEach((unit, uIdx) => {'
replacement_foreach = 'data.forEach((unit: any, uIdx: number) => {'
if target_foreach in content:
    content = content.replace(target_foreach, replacement_foreach)

# 3. Double check refreshLeaderboard has state
if 'private async refreshLeaderboard() {' in content:
    # Check if StateManager.getInstance() call is present, if not add it
    func_start = content.find('private async refreshLeaderboard() {')
    func_end = content.find('}', func_start)
    func_content = content[func_start:func_end]
    
    if 'const state = StateManager.getInstance();' not in func_content:
        content = content.replace(
            'private async refreshLeaderboard() {',
            'private async refreshLeaderboard() {\n        const state = StateManager.getInstance();'
        )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied comprehensive fix for 'state' missing and implicit types.")
