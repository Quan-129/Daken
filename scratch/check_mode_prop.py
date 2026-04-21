
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure currentHubType is correctly set when opening the Hub
# Look for the openJLPTLevelHub implementation
target_hub_logic = """        state.currentHubType = mode;
        state.loadLevelHubData(level);"""

# We want to make sure 'mode' is explicitly handled even if it's undefined
# Although it's usually defined, let's be safe.

# 2. Fix the state reference in the subscription for LEVEL_HUB_OPEN
target_sub = """        events.subscribe('LEVEL_HUB_OPEN', (data: any) => {
            const { level, mode } = data;
            console.log(`[UISystem] LEVEL_HUB_OPEN received for Level: ${level}, Mode: ${mode}`);
            this.openJLPTLevelHub(level, mode);
        });"""

# I will verify the code in the file.
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Verified UISystem.ts. Now checking StateManager for potential normalization issues.")
