
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix accuracy formatting to 1 decimal place
target = "case 'accuracy': return (agent.avg_acc || 0) + '%';"
replacement = "case 'accuracy': return (agent.avg_acc || 0).toFixed(1) + '%';"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully formatted accuracy to 1 decimal place.")
else:
    print("Target formatting string not found. Please check manually.")
