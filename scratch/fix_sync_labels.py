
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix sync pull logic: use 'study' as fallback instead of 'vocabulary'
target_pull = "const activeMode = row.study_mode || 'vocabulary';"
replacement_pull = "const activeMode = row.study_mode || 'study';"

# 2. Fix getN2SessionProgress fallback
target_get = "const activeMode = mode || this.currentHubType || 'vocabulary';"
replacement_get = "const activeMode = mode || this.currentHubType || 'study';"

if target_pull in content:
    content = content.replace(target_pull, replacement_pull)
    content = content.replace(target_get, replacement_get)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully normalized study_mode labels in StateManager.ts to 'study'.")
else:
    print("Target block not found. Checking content...")
