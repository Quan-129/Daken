
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\shared\utils\StateManager.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Repair the corrupted block and implement score cap
# Looking for the broken part
broken_start = """  private saveN2Progress() {
      localStorage.setItem(this.n2ProgressKey, JSON.stringify(this.n2Progress));
  }"""

# The script should identify the fragment starting at line 277: 
# "              \n              if (error) console.error('[StateManager] Lỗi lưu Cloud:', error.message);"
broken_middle = "if (error) console.error('[StateManager] Lỗi lưu Cloud:', error.message);"

full_replacement = """  public async saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}, mode?: string) {
      const activeMode = mode || this.currentHubType || 'study';
      const cappedScore = stats.score !== undefined ? Math.min(stats.score, 3000) : undefined;
      const finalStats = { ...stats, score: cappedScore };
      
      const key = `m${activeMode}_u${unitIdx}_s${sessionIdx}`;
      const current = this.n2Progress[key];
      
      let shouldUpdate = !current || this.isBetterStats(finalStats, current as any);
      
      if (shouldUpdate) {
          this.n2Progress[key] = finalStats;
          this.saveN2Progress();

          // Đẩy lên Cloud nếu đã đăng nhập
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              const { error } = await supabase
                  .from('n2_progress')
                  .upsert({
                      user_id: session.user.id,
                      unit_idx: unitIdx,
                      session_idx: sessionIdx,
                      study_mode: activeMode,
                      rank: finalStats.rank,
                      acc: finalStats.acc,
                      wpm: finalStats.wpm,
                      score: finalStats.score || 0,
                      updated_at: new Date().toISOString()
                  }, { onConflict: 'user_id,unit_idx,session_idx,study_mode' });
              
              if (error) console.error('[StateManager] Lỗi lưu Cloud:', error.message);
              
              // [LEADERBOARD SYNC] Cập nhật ngay chỉ số tổng hợp lên Profile khi vừa có điểm mới
              this.eventBus.publish('HUB_DATA_LOADED', null); 
          }
      }
  }"""

# Locating the mess
idx_start = content.find(broken_start)
idx_end = content.find("public getN2SessionProgress")

if idx_start != -1 and idx_end != -1:
    new_content = content[:idx_start + len(broken_start)] + "\n\n" + full_replacement + "\n\n  " + content[idx_end:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully repaired StateManager.ts and applied score cap of 3000.")
else:
    print(f"Failed to locate markers: start={idx_start}, end={idx_end}")
