
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the mode detection logic
target_save = """  public async saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}, mode?: string) {
      const activeMode = mode || this.currentHubType || 'study';"""

replacement_save = """  public async saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}, mode?: string) {
      let activeMode = mode || 'study';
      // Nếu đang trong Hub Kanji, bắt buộc dùng mode kanji
      if (this.currentHubType && this.currentHubType !== 'study') {
          activeMode = this.currentHubType;
      }"""

if target_save in content:
    content = content.replace(target_save, replacement_save)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully fixed Kanji mode detection in StateManager.")
else:
    print("Target save logic still not found. Please verify indentation.")
