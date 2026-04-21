
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Force detection of currentHubType if mode is generic or missing
target_save = """    public saveN2SessionProgress(unitIdx: number, sessionIdx: number, metrics: any, mode?: string) {
        const { rank, acc, wpm, score } = metrics;
        const activeMode = mode || this.currentHubType || 'study';"""

replacement_save = """    public saveN2SessionProgress(unitIdx: number, sessionIdx: number, metrics: any, mode?: string) {
        const { rank, acc, wpm, score } = metrics;
        // Prioritize currentHubType if it's specialized (kanji/grammar)
        let activeMode = mode || 'study';
        if (this.currentHubType && this.currentHubType !== 'study') {
            activeMode = this.currentHubType;
        }"""

if target_save in content:
    content = content.replace(target_save, replacement_save)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully improved mode detection in saveN2SessionProgress.")
else:
    print("Target save logic not found.")
