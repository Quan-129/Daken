
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update leaderboard fetching logic to use the new view
target = ".from('profiles')"
replacement = ".from('global_leaderboard')"

if target in content:
    content = content.replace(target, replacement)
    
    # Also ensure we are getting the right columns from the view
    # Usually it's .select('*') or specific columns.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated leaderboard source to global_leaderboard view.")
else:
    print("Target '.from('profiles')' not found in UISystem.ts. Checking content...")
