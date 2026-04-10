import { Enemy } from '../entities/Enemy';
import { EventBus } from '../utils/EventBus';

import { GameConfig } from '../config';

export class TypingLogic {
    private inputBuffer: string = "";
    private getEnemies: () => Enemy[];
    private currentWordTypoCount: number = 0;
    private perfectComboCount: number = 0;
    public isKeyboardLocked: boolean = false;
    
    public totalKeystrokes: number = 0;
    public correctKeystrokes: number = 0;

    public resetStats() {
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
    }

    constructor(getEnemiesCallback: () => Enemy[]) {
        this.getEnemies = getEnemiesCallback;
        this.setupListener();
        EventBus.getInstance().subscribe('WAVE3_TARGET_EVADED', () => {
            this.clearBuffer();
            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
        });

        EventBus.getInstance().subscribe('WAVE_STARTED', (data: any) => {
            this.perfectComboCount = 0;
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
            if (data && data.waveIndex === 5) {
                this.resetStats();
            }
        });

        EventBus.getInstance().subscribe('STUDY_SESSION_END', () => {
            EventBus.getInstance().publish('PERFORMANCE_STATS', { 
                correct: this.correctKeystrokes, 
                total: this.totalKeystrokes 
            });
        });
    }

    private setupListener() {
        window.addEventListener('keydown', (e) => {
            if (this.isKeyboardLocked) return; // Khoá phím trong Study Wave 1

            // Ngăn chặn cuộn trang nếu nhấn Space (để an toàn, tùy game)
            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                // Ưu tiên Proceed Next Wave nếu đang chờ, nếu không thì Skip Defeat Delay cho Card đang hiện
                EventBus.getInstance().publish('MANUAL_NEXT_WAVE', null);
                EventBus.getInstance().publish('SKIP_DEFEAT_DELAY', null);
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleTargetSkip();
                return;
            }
            
            // Xử lý phím rác: Chỉ nhận các phím chữ cái (a-z) và số (0-9)
            if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    this.processInput(e.key);
                }
            } else {
                // Tự động chặn và bỏ qua các phím chức năng để không làm vỡ luồng gõ (Flow state)
                if (e.key !== 'F5' && e.key !== 'F12' && !e.ctrlKey) {
                    e.preventDefault();
                }
            }
        });
    }

    public processInput(key: string): void {
        const enemies = this.getEnemies();

        // Không cho phép gõ thêm chữ nếu đang có một từ ở Study Mode chờ nhấn Space
        if (enemies.some(e => e.isDefeated && e.mode === 'study')) {
            return;
        }

        // Loại bỏ các phím điều khiển, chỉ nhận kí tự Alphabet hoặc phím SỐ (dành cho Wave 4)
        if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
            this.totalKeystrokes++;
            
            // --- TÍNH NĂNG MỚI CHỈ DÀNH CHO WAVE 4: CHỌN ĐÁP ÁN BẰNG SỐ ---
            let w4Enemies = enemies.filter(e => e.mode === 'study' && e.studyWave === 4 && !e.isDead && !e.isDefeated);
            if (w4Enemies.length > 0) {
                let numericKey = parseInt(key, 10);
                if (!isNaN(numericKey) && numericKey >= 1 && numericKey <= 4) {
                    let target = w4Enemies.find(e => e.wave4Index === numericKey);
                    if (target) {
                        let trueEnemy = w4Enemies.find(e => e.isTruth);
                        if (target.isTruth) {
                            // Chọn đúng
                            this.correctKeystrokes++;
                            
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                            }
                            
                            w4Enemies.forEach(e => {
                                e.isDead = true; 
                                e.isDefeated = false;
                                e.isLocked = false;
                            });
                            
                            // Tạo fake enemy để giữ loop chờ Space
                            let dummy = new Enemy(target.word, 'study', 0, 0, 0, 1);
                            dummy.isDefeated = true;
                            dummy.isDead = false;
                            dummy.x = -1000; 
                            enemies.push(dummy);
                            
                            const basePoints = GameConfig.studyMode.wave4.basePoints;
                            EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                            EventBus.getInstance().publish('ENEMY_KILLED', { enemy: target, points: Math.floor(basePoints * multiplier), combo: this.perfectComboCount });
                            EventBus.getInstance().publish('COMBO_UPDATED', this.perfectComboCount);
                            this.currentWordTypoCount = 0;
                            this.inputBuffer = "";
                            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                            
                            if (target.aliveTime <= GameConfig.timing.perfectRecallThreshold) {
                                EventBus.getInstance().publish('PERFECT_RECALL', target);
                            }
                        } else {
                            // Chọn sai
                            this.currentWordTypoCount++;
                            this.perfectComboCount = 0;
                            
                            const penalty = 5; // Hardcode hoặc dùng fallback do learningPhase bị xoá
                            EventBus.getInstance().publish('POINTS_PENALTY', { enemy: target, points: penalty });
                            
                            EventBus.getInstance().publish('TYPO', String(numericKey)); // Hiện hiệu ứng Typo
                            EventBus.getInstance().publish('PLAY_BUZZ', null);
                            EventBus.getInstance().publish('COMBO_UPDATED', 0);
                            
                            if (trueEnemy) {
                                trueEnemy.isWeak = true; // Thẻ nợ
                                EventBus.getInstance().publish('MARK_WEAK', trueEnemy);
                                
                                w4Enemies.forEach(e => {
                                    if (e !== trueEnemy) {
                                        e.isDead = true; 
                                        e.isDefeated = false; // Ngăn chặn trigger hide HTML Terminal 
                                        e.isLocked = false;
                                    }
                                });
                                
                                // Biến trueEnemy thành dummy luôn thay vì tạo object mới
                                trueEnemy.isDefeated = true; // Bật chờ bấm Space
                                trueEnemy.isDead = false;    // Sống vất vưởng
                                trueEnemy.x = -1000;         // Giấu khỏi màn hình
                                
                                EventBus.getInstance().publish('ENEMY_DEFEATED', trueEnemy);
                                EventBus.getInstance().publish('ENEMY_KILLED', { enemy: trueEnemy, points: 0, combo: 0 }); 
                                this.inputBuffer = "";
                                EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                            }
                        }
                    }
                    return; // Đã xử lý phím số trong Wave 4 thì thoát, không xử lý typo nữa
                }
            }
            // --- KẾT THÚC LOGIC WAVE 4 PHÍM TẮT ---

            
            // Nhánh xử lý cực gắt cho Wave 3 và Wave 5: Chỉ được gõ mục tiêu đang Lock
            let w3Target = enemies.find(e => e.mode === 'study' && (e.studyWave === 3 || e.studyWave === 5) && e.isWave3Target && !e.isDead);
            
            if (!w3Target) {
                // WAVE 5: Tìm mục tiêu khớp với phím đầu tiên từ trái sang phải
                const currentWave = enemies.find(e => e.mode === 'study' && e.studyWave && !e.isDead)?.studyWave;
                if (currentWave === 5) {
                    let candidates = enemies.filter(e => 
                        !e.isDead && 
                        e.mode === 'study' && 
                        e.studyWave === 5 && 
                        e.word.romaji.toLowerCase().startsWith(key.toLowerCase()) &&
                        e.x < 1200 && e.x > 0 // Đảm bảo cá đã bơi vào màn hình
                    );

                    if (candidates.length > 0) {
                        candidates.sort((a, b) => a.x - b.x); // Ưu tiên từ trái sang phải
                        w3Target = candidates[0];
                        w3Target.isWave3Target = true;
                        // Đồng bộ buffer luôn để tránh mất phím đầu
                    } else {
                        return; // Không tìm thấy con nào thì thoát luôn
                    }
                } else if (currentWave === 3) {
                     // Wave 3 hiện tại đã được Engine auto-target từ trái sang, 
                     // nhưng nếu lỡ mất target thì TypingLogic không tự dò ở đây để giữ tính kỷ luật của W3
                     return;
                }
            }

            if (w3Target) {
                let suffix = this.inputBuffer + key.toLowerCase();
                if (w3Target.word.romaji.toLowerCase().startsWith(suffix)) {
                    // Success
                    this.correctKeystrokes++;
                    this.inputBuffer = suffix;
                    w3Target.isLocked = true;
                    w3Target.targetTypedLength = suffix.length;
                    
                    if (this.inputBuffer === w3Target.word.romaji.toLowerCase()) {
                        w3Target.isDead = true;
                        w3Target.isLocked = false;
                        this.inputBuffer = "";
                        
                        let multiplier = 1;
                        let isDebtOrWeak = w3Target.isDebt || w3Target.isWeak;
                        
                        // Nếu là từ nợ (Weak) và config không cho phép ăn điểm
                        if (isDebtOrWeak && !GameConfig.studyMode.wave3.allowPointsOnWeak) {
                            multiplier = 0;
                            this.perfectComboCount = 0; // Gõ từ nợ không tăng combo
                        } else {
                            if (this.currentWordTypoCount === 0) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                                w3Target.isWeak = true;
                            }
                        }

                        let earnedPoints = isDebtOrWeak && !GameConfig.studyMode.wave3.allowPointsOnWeak 
                            ? GameConfig.studyMode.wave3.pointsOnWeak 
                            : Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                        
                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: w3Target, points: earnedPoints, combo: this.perfectComboCount });
                        EventBus.getInstance().publish('COMBO_UPDATED', this.perfectComboCount);
                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TARGET_LOCKED', this.inputBuffer);
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    // Typo (Phạt cực gắt, không greedy match sang cá khác)
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    w3Target.isWeak = true;
                    EventBus.getInstance().publish('TYPO', suffix);
                    EventBus.getInstance().publish('PLAY_BUZZ', null);
                    EventBus.getInstance().publish('COMBO_UPDATED', 0);
                    EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                }
                return;
            }

            let lockedEnemies = enemies.filter(e => e.isLocked && !e.isDead && !e.isDefeated);
            let testBuffer = this.inputBuffer + key.toLowerCase();
            
            if (lockedEnemies.length > 0) {
                // Đã khoá mục tiêu, GIỮ cứng mục tiêu này
                let validEnemies = lockedEnemies.filter(e => e.word.romaji.toLowerCase().startsWith(testBuffer));
                
                if (validEnemies.length > 0) {
                    this.inputBuffer = testBuffer;
                    this.correctKeystrokes++;
                    
                    lockedEnemies.forEach(e => {
                        if (!validEnemies.includes(e)) {
                            e.isLocked = false;
                            e.targetTypedLength = 0;
                        } else {
                            e.targetTypedLength = this.inputBuffer.length;
                        }
                    });

                    let targetKilled = this.checkElimination(validEnemies);
                    if (targetKilled !== null) {
                        this.correctKeystrokes++;
                        let points = 0;
                        let comboToReport = 0;

                        if (targetKilled.mode === 'study' && (targetKilled.studyWave === 1 || targetKilled.studyWave === 2)) {
                            points = GameConfig.studyMode.learningPhase.basePoints;
                            comboToReport = 0;
                        } else {
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                            }
                            points = Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                            comboToReport = this.perfectComboCount;
                        }
                        
                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: targetKilled, points: points, combo: comboToReport });
                        EventBus.getInstance().publish('COMBO_UPDATED', comboToReport);
                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    // Typo chặn phím
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    EventBus.getInstance().publish('TYPO', this.inputBuffer);
                    EventBus.getInstance().publish('PLAY_BUZZ', null);
                    EventBus.getInstance().publish('COMBO_UPDATED', 0);
                    // Không đẩy phím sai vào buffer
                }
            } else {
                // Chưa khoá mục tiêu nào
                let matchingEnemies = enemies.filter(e => !e.isDead && !e.isDefeated && e.word.romaji.toLowerCase().startsWith(testBuffer));
                if (matchingEnemies.length > 0) {
                    this.inputBuffer = testBuffer;
                    this.correctKeystrokes++;
                    
                    matchingEnemies.forEach(e => {
                        e.isLocked = true;
                        e.targetTypedLength = this.inputBuffer.length;
                    });

                    if (this.inputBuffer.length === 1) {
                        EventBus.getInstance().publish('FOCUS_ENEMY', matchingEnemies[0]);
                    }
                    
                    let targetKilled = this.checkElimination(matchingEnemies);
                    if (targetKilled !== null) {
                        this.correctKeystrokes++;
                        let points = 0;
                        let comboToReport = 0;

                        if (targetKilled.mode === 'study' && (targetKilled.studyWave === 1 || targetKilled.studyWave === 2)) {
                            points = GameConfig.studyMode.learningPhase.basePoints;
                            comboToReport = 0;
                        } else {
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                            }
                            points = Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                            comboToReport = this.perfectComboCount;
                        }

                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: targetKilled, points: points, combo: comboToReport });
                        EventBus.getInstance().publish('COMBO_UPDATED', comboToReport);
                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TARGET_LOCKED', this.inputBuffer);
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    // Typo kí tự đầu tiên bét nhè
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    EventBus.getInstance().publish('TYPO', testBuffer); // Truyền testBuffer để UI có thể hiện flash đỏ chữ sai nếu muốn, mặc dù inputBuffer ko đổi
                    EventBus.getInstance().publish('PLAY_BUZZ', null);
                    EventBus.getInstance().publish('COMBO_UPDATED', 0);
                }
            }
        }
    }

    private checkElimination(enemies: Enemy[]): Enemy | null {
        let matches = [];
        for (let enemy of enemies) {
            if (!enemy.isDead && !enemy.isDefeated && this.inputBuffer.endsWith(enemy.word.romaji.toLowerCase())) {
                matches.push(enemy);
            }
        }
        
        if (matches.length > 0) {
            matches.sort((a, b) => {
                if (a.word.romaji.length !== b.word.romaji.length) {
                    // Greedy Match: Ưu tiên từ DÀI NHẤT
                    return b.word.romaji.length - a.word.romaji.length;
                }
                return a.x - b.x;
            });
            
            let target = matches[0];
            
            if (target.mode === 'study') {
                if (target.studyWave === 3) {
                    target.isDead = true;
                    target.isLocked = false;
                } else if (target.studyWave === 4) {
                    let allW4Enemies = enemies.filter(e => e.studyWave === 4 && !e.isDead && !e.isDefeated);
                    let trueEnemy = allW4Enemies.find(e => e.isTruth);
                    
                    if (target.isTruth) {
                        target.isDefeated = true;
                        target.isLocked = false;
                        
                        // Chi tieu diet 3 the distractors (lam no tung)
                        allW4Enemies.forEach(e => {
                            if (e !== trueEnemy) {
                                e.isDead = true; 
                                e.isLocked = false;
                            }
                        });
                    } else {
                        // Sai, phạt gốc
                        if (trueEnemy) {
                            trueEnemy.isWeak = true;
                            EventBus.getInstance().publish('MARK_WEAK', trueEnemy);
                        }
                        
                        // Cho no tung ca 4 the gom ca the dung
                        allW4Enemies.forEach(e => {
                            e.isDead = true; 
                            e.isDefeated = false; // Ngăn chặn báo hide Terminal
                            e.isLocked = false;
                        });
                        
                        if (trueEnemy) {
                            // Tạo fake enemy để giữ loop chờ Space trên màn hình sai
                            let dummy = new Enemy(trueEnemy.word, 'study', 0, 0, 0, 1);
                            dummy.isDefeated = true;
                            dummy.isDead = false;
                            dummy.x = -1000;
                            enemies.push(dummy);
                        }
                    }
                    
                    if (trueEnemy) {
                        trueEnemy.isDefeated = true;
                        trueEnemy.isLocked = false;
                        EventBus.getInstance().publish('ENEMY_DEFEATED', trueEnemy);
                        if (trueEnemy.aliveTime <= GameConfig.timing.perfectRecallThreshold) {
                            EventBus.getInstance().publish('PERFECT_RECALL', trueEnemy);
                        }
                    }
                } else {
                    target.isDefeated = true;
                    target.isLocked = false;
                    if (this.currentWordTypoCount >= GameConfig.difficulty.maxTyposBeforeWeak) {
                        target.isWeak = true;
                        EventBus.getInstance().publish('SCORE_PENALTY', GameConfig.studyMode.learningPhase.penaltyPoints);
                    }
                    EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                    
                    // Thưởng "Perfect Recall" nếu diệt xong trước 4 giây Sóng 2 (khi timer chưa kịp chạy nhắc tuồng)
                    if (target.studyWave >= 2 && target.aliveTime <= 4000) {
                        EventBus.getInstance().publish('PERFECT_RECALL', target);
                    }
                }
            } else {
                target.isDead = true; 
            }
            
            this.inputBuffer = "";
            
            return target;
        }
        return null;
    }
    
    public clearBuffer() {
        this.inputBuffer = "";
        this.currentWordTypoCount = 0;
        this.perfectComboCount = 0;
        
        const enemies = this.getEnemies();
        if (enemies) {
            enemies.forEach(e => {
                e.isLocked = false;
                e.targetTypedLength = 0;
            });
        }
    }

    private handleTargetSkip() {
        const enemies = this.getEnemies();
        let target = enemies.find(e => !e.isDead && !e.isDefeated && e.isWave3Target) 
            || enemies.find(e => !e.isDead && !e.isDefeated && e.isLocked);
            
        if (!target) {
            target = enemies.find(e => !e.isDead && !e.isDefeated && e.mode === 'study');
        }
        
        if (target) {
            target.isWeak = true;
            target.isSkipped = true;
            EventBus.getInstance().publish('SCORE_PENALTY', GameConfig.studyMode.learningPhase.penaltyPoints);
            EventBus.getInstance().publish('MARK_WEAK', target);
            EventBus.getInstance().publish('PLAY_GLITCH', null);
            
            if (target.mode === 'study') {
                if (target.studyWave === 3 || target.studyWave === 5) {
                    target.isDead = true;
                    target.isLocked = false;
                } else {
                    target.isDefeated = true; // Wait for TTS to complete
                    target.isLocked = false;
                    EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                }
            } else {
                target.isDead = true; 
            }
            
            this.inputBuffer = "";
            this.currentWordTypoCount = 0;
            this.perfectComboCount = 0;
            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
        }
    }
}
