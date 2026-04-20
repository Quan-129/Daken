
import sys

file_path = r'c:\Users\Acer\Documents\Games\appGame2\src\features\combat\systems\UISystem.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)

# Find the start of the mess
start_patt = "        events.subscribe('HUB_DATA_LOADED', () => {"
end_patt = "    private setupAvatarUpload() {"

# Reconstruct everything between start_patt and end_patt
# We know exactly what updateProfileUI should look like.

new_profile_ui = """
    private updateProfileUI() {
        const auth = AuthSystem.getInstance();
        const user = auth.getCurrentUser();
        const isAdmin = user?.email === 'minhquan12092005@gmail.com';

        if (isAdmin && this.profileCard) {
            let adminBtn = byId('admin-view-trigger');
            if (!adminBtn) {
                adminBtn = document.createElement('button');
                adminBtn.id = 'admin-view-trigger';
                adminBtn.className = 'menu-btn';
                adminBtn.style.marginTop = '10px';
                adminBtn.style.width = '100%';
                adminBtn.style.fontSize = '0.7rem';
                adminBtn.style.borderColor = '#00F5FF';
                adminBtn.style.color = '#00F5FF';
                adminBtn.innerText = 'ADMIN';
                adminBtn.addEventListener('click', () => {
                    this.adminFeedbackModal?.classList.remove('hidden');
                    this.fetchAdminFeedbacks();
                });
                this.profileCard.appendChild(adminBtn);
            }
        }

        const state = StateManager.getInstance();
        const t = LanguageConfig.translations[LanguageConfig.current];

        if (this.playerNameEl) {
            this.playerNameEl.innerText = user?.name || t.profile.guest;
        }
        if (this.playerTagEl) {
            this.playerTagEl.innerText = `#${user?.agentId || '000000'}`;
        }

        // Cập nhật Avatar nếu có
        const savedAvt = localStorage.getItem('DAKEN_PLAYER_AVATAR');
        if (savedAvt && this.playerAvtImg) {
            this.playerAvtImg.src = savedAvt;
        } else if (user?.avatar && this.playerAvtImg) {
            this.playerAvtImg.src = user.avatar;
        }

        // Tính toán các chỉ số trung bình từ StateManager (Toàn bộ tiến trình N2)
        const globalStats = state.getGlobalN2Stats();
        const totalStatsCount = globalStats.totalCount;
        const totalScoreSum = globalStats.totalScore;
        const reverseRank = ['D', 'C', 'B', 'A', 'S'];

        if (this.totalScoreEl) this.totalScoreEl.innerText = totalScoreSum.toLocaleString();

        if (totalStatsCount > 0) {
            const avgAcc = Math.floor(globalStats.avgAcc * 100);
            const avgWpm = Math.floor(globalStats.avgWpm);
            const avgRank = reverseRank[Math.round(globalStats.avgRankScore)];

            if (this.avgAccEl) this.avgAccEl.innerText = avgAcc + "%";
            if (this.avgWpmEl) this.avgWpmEl.innerText = avgWpm.toString();
            if (this.playerRankEl) {
                this.playerRankEl.innerText = `CLASS ${avgRank}`;
                this.playerRankEl.className = `rank-value jlpt-rank-${avgRank}`;
            }

            // [LEADERBOARD] Tự động đồng bộ các chỉ số tổng hợp lên Cloud
            if (auth.isLoggedIn()) {
                const totalScore = totalScoreSum;
                const lastSyncedScore = parseInt(localStorage.getItem('LAST_SYNCED_TOTAL_SCORE') || '0');
                if (totalScore > lastSyncedScore) {
                    auth.updateProfile({
                        total_score: totalScore,
                        avg_wpm: avgWpm,
                        avg_acc: avgAcc
                    }).then(() => {
                        localStorage.setItem('LAST_SYNCED_TOTAL_SCORE', totalScore.toString());
                        console.log("[Social] Stats synchronized with Neural Hierarchy.");
                    }).catch(err => console.error("[Social] Link synchronization failed:", err));
                }
            }
        } else {
            if (this.avgAccEl) this.avgAccEl.innerText = "0%";
            if (this.avgWpmEl) this.avgWpmEl.innerText = "0";
            if (this.playerRankEl) {
                this.playerRankEl.innerText = t.profile.unranked;
            }
        }
    }
"""

hub_data_loaded_sub = """        events.subscribe('HUB_DATA_LOADED', () => {
            console.log("[UISystem] HUB_DATA_LOADED received, updating UI...");
            this.updateProfileUI();
            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }
        });
    }
"""

import re
# Find from HUB_DATA_LOADED to setupAvatarUpload
pattern = re.compile(r"        events\.subscribe\('HUB_DATA_LOADED'.*?private setupAvatarUpload\(\) {", re.DOTALL)

new_segment = hub_data_loaded_sub + new_profile_ui + "\n    private setupAvatarUpload() {"

if pattern.search(content):
    new_content = pattern.sub(new_segment, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully repaired UISystem.ts using regex")
else:
    print("Regex match failed. Structural corruption too severe or pattern mismatch.")
