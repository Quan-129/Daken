
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Ensure we use the most accurate aggregate score for 'You' in the list and footer
target_logic = """                        const localData = {
                            total_score: user.total_score || 0,
                            avg_wpm: user.avg_wpm || 0,
                            avg_acc: user.avg_acc || 0
                        };"""

replacement_logic = """                        const localStats = state.getGlobalN2Stats();
                        const localData = {
                            total_score: localStats.totalScore || 0,
                            avg_wpm: localStats.avgWpm || 0,
                            avg_acc: localStats.avgAcc || 0
                        };"""

if target_logic in content:
    content = content.replace(target_logic, replacement_logic)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated leaderboard display to use live calculated global stats for the current user.")
else:
    print("Target logic for local stats placeholder not found.")
