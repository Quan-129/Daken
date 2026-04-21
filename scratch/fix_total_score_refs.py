
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the footer logic (line 3617 area)
content = content.replace("myInTop.total_score", "myInTop.total_core_score")

# Fix the formatting logic
content = content.replace("agent.total_score", "agent.total_core_score")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully fixed all remaining references to total_score in the leaderboard logic.")
