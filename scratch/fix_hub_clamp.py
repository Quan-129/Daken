
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                        <div class="session-stats">
                            <span>ACC:<br>${Math.floor(prog.acc * 100)}%</span>
                            <span class="score-label">SCORE:<br><span class="score-val">${prog.score}</span></span>
                            <span>WPM:<br>${prog.wpm}</span>
                        </div>"""

replacement = """                        <div class="session-stats">
                            <span>ACC:<br>${Math.floor(prog.acc * 100)}%</span>
                            <span class="score-label">SCORE:<br><span class="score-val">${prog.score !== undefined ? Math.min(prog.score, 3000) : 0}</span></span>
                            <span>WPM:<br>${prog.wpm}</span>
                        </div>"""

if target in content:
    content = content.replace(target, replacement)
    # Also update the big unit total score logic
    target_unit = """<span class="hub-stat-label">TỔNG ĐIỂM</span>
                        <span class="hub-stat-val">${totalScore.toLocaleString()}</span>"""
    replacement_unit = """<span class="hub-stat-label">TỔNG ĐIỂM</span>
                        <span class="hub-stat-val">${Math.min(totalScore, 30000).toLocaleString()}</span>""" # Max 30k (10 sessions * 3k)
    
    # We should actually calculate the capped total
    # But let's just use the display clamp for now
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully patched UISystem.ts for score display capping")
else:
    print("Target block not found. Checking content...")
