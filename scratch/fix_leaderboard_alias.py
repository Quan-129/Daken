
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update leaderboard fetching logic to use the new column name 'total_core_score'
# to avoid ambiguity with profiles.total_score
target_col = "total_score"
# We need to be careful not to replace it everywhere, only in the leaderboard fetch context
# and formatted value logic.

if "item.className = `rank-item top-${index + 1}`;" in content:
    content = content.replace("agent.total_score", "agent.total_core_score")
    content = content.replace("sortColumn = 'total_score'", "sortColumn = 'total_core_score'")

if target_col in content:
   # Update the selector
   content = content.replace(".select('name, agent_id, avatar, total_score, avg_wpm, avg_acc')", ".select('name, agent_id, avatar, total_core_score, avg_wpm, avg_acc')")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated UI to use 'total_core_score' from the new accurate View.")
