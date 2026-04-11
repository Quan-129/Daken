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
            if (this.isKeyboardLocked) return;

            if (e.key === ' ' && e.target === document.body) {
                e.preventDefault();
                EventBus.getInstance().publish('MANUAL_NEXT_WAVE', null);
                EventBus.getInstance().publish('SKIP_DEFEAT_DELAY', null);
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleTargetSkip();
                return;
            }

            if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    this.processInput(e.key);
                }
            } else {
                if (e.key !== 'F5' && e.key !== 'F12' && !e.ctrlKey) {
                    e.preventDefault();
                }
            }
        });
    }

    public processInput(key: string): void {
        const enemies = this.getEnemies();

        if (enemies.some(e => e.isDefeated && e.mode === 'study')) {
            return;
        }

        if (key.length === 1 && /[a-zA-Z0-9]/.test(key)) {
            this.totalKeystrokes++;

            // Wave 4 Logic
            let w4Enemies = enemies.filter(e => e.mode === 'study' && e.studyWave === 4 && !e.isDead && !e.isDefeated);
            if (w4Enemies.length > 0) {
                let numericKey = parseInt(key, 10);
                if (!isNaN(numericKey) && numericKey >= 1 && numericKey <= 4) {
                    let target = w4Enemies.find(e => e.wave4Index === numericKey);
                    if (target) {
                        let trueEnemy = w4Enemies.find(e => e.isTruth);
                        if (target.isTruth) {
                            this.correctKeystrokes++;
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0) {
                                this.perfectComboCount++;
                                EventBus.getInstance().publish('MARK_MASTERED', target);
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

                            let dummy = new Enemy(target.word, 'study', 0, 0, 0, 1);
                            dummy.isDefeated = true;
                            dummy.isDead = false;
                            dummy.x = -1000;
                            enemies.push(dummy);

                            const basePoints = GameConfig.studyMode.wave4.basePoints;
                            let points = Math.floor(basePoints * multiplier);
                            const hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);
                            if (target.isDebt || target.isWeak || hasNewFailure) {
                                points = 0;
                            }

                            EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                            EventBus.getInstance().publish('ENEMY_KILLED', { enemy: target, points: points, combo: this.perfectComboCount });
                            EventBus.getInstance().publish('COMBO_UPDATED', this.perfectComboCount);
                            
                            if (!hasNewFailure) {
                                target.isWeak = false;
                                target.isDebt = false;
                            }
                            this.currentWordTypoCount = 0;
                            this.inputBuffer = "";
                            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });

                            if (target.aliveTime <= GameConfig.timing.perfectRecallThreshold) {
                                EventBus.getInstance().publish('PERFECT_RECALL', target);
                            }
                        } else {
                            this.currentWordTypoCount++;
                            this.perfectComboCount = 0;
                            EventBus.getInstance().publish('POINTS_PENALTY', { enemy: target, points: 5 });
                            EventBus.getInstance().publish('TYPO', String(numericKey));
                            EventBus.getInstance().publish('PLAY_BUZZ', null);
                            EventBus.getInstance().publish('COMBO_UPDATED', 0);

                            if (trueEnemy) {
                                trueEnemy.isWeak = true;
                                EventBus.getInstance().publish('MARK_WEAK', trueEnemy);
                                w4Enemies.forEach(e => {
                                    if (e !== trueEnemy) {
                                        e.isDead = true;
                                        e.isDefeated = false;
                                        e.isLocked = false;
                                    }
                                });
                                trueEnemy.isDefeated = true;
                                trueEnemy.isDead = false;
                                trueEnemy.x = -1000;
                                EventBus.getInstance().publish('ENEMY_DEFEATED', trueEnemy);
                                EventBus.getInstance().publish('ENEMY_KILLED', { enemy: trueEnemy, points: 0, combo: 0 });
                                this.inputBuffer = "";
                                EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                            }
                        }
                    }
                    return;
                }
            }

            // Wave 3/5 Logic
            let w3Target = enemies.find(e => e.mode === 'study' && (e.studyWave === 3 || e.studyWave === 5) && e.isWave3Target && !e.isDead);
            if (!w3Target) {
                const currentWave = enemies.find(e => e.mode === 'study' && e.studyWave && !e.isDead)?.studyWave;
                if (currentWave === 5) {
                    let candidates = enemies.filter(e =>
                        !e.isDead && e.mode === 'study' && e.studyWave === 5 &&
                        e.word.romaji.toLowerCase().startsWith(key.toLowerCase()) &&
                        e.x < 1200 && e.x > 0
                    );
                    if (candidates.length > 0) {
                        candidates.sort((a, b) => a.x - b.x);
                        w3Target = candidates[0];
                        w3Target.isWave3Target = true;
                    } else {
                        return;
                    }
                } else if (currentWave === 3) {
                    return;
                }
            }

            if (w3Target) {
                let suffix = this.inputBuffer + key.toLowerCase();
                if (w3Target.word.romaji.toLowerCase().startsWith(suffix)) {
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
                        let hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);

                        if (this.currentWordTypoCount === 0 && !isDebtOrWeak) {
                            this.perfectComboCount++;
                            if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                            }
                        } else {
                            this.perfectComboCount = 0;
                        }

                        let basePoints = Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                        let earnedPoints = basePoints;

                        if (isDebtOrWeak || hasNewFailure) {
                            if (w3Target.studyWave === 5 && !w3Target.isDebt) {
                                earnedPoints = Math.floor(basePoints * 0.5); 
                            } else {
                                earnedPoints = 0; 
                            }
                            this.perfectComboCount = 0; 

                            if (hasNewFailure) {
                                EventBus.getInstance().publish('SCORE_PENALTY', 5);
                            }
                        }

                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: w3Target, points: earnedPoints, combo: this.perfectComboCount });
                        EventBus.getInstance().publish('COMBO_UPDATED', this.perfectComboCount);
                        
                        // Xóa nợ CHỈ SAU KHI đã tính điểm
                        if (!hasNewFailure) {
                            w3Target.isWeak = false;
                            w3Target.isDebt = false;
                        }

                        if (this.currentWordTypoCount === 0 && !isDebtOrWeak) {
                            EventBus.getInstance().publish('MARK_MASTERED', w3Target);
                        }
                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TARGET_LOCKED', this.inputBuffer);
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    if (this.currentWordTypoCount === (GameConfig.difficulty.maxTyposBeforeWeak || 4)) {
                        w3Target.isWeak = true;
                    }
                    EventBus.getInstance().publish('TYPO', suffix);
                    EventBus.getInstance().publish('PLAY_BUZZ', null);
                    EventBus.getInstance().publish('COMBO_UPDATED', 0);
                    EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                }
                return;
            }

            // Normal typing (Locked/Unlock)
            let lockedEnemies = enemies.filter(e => e.isLocked && !e.isDead && !e.isDefeated);
            let testBuffer = this.inputBuffer + key.toLowerCase();

            if (lockedEnemies.length > 0) {
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
                        let points = 0;
                        let comboToReport = 0;
                        const isDebtOrWeakAtStart = targetKilled.isDebt || targetKilled.isWeak;
                        const hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);

                        if (targetKilled.mode === 'study' && (targetKilled.studyWave === 1 || targetKilled.studyWave === 2)) {
                            if (isDebtOrWeakAtStart || hasNewFailure) {
                                points = 0;
                                if (hasNewFailure) {
                                    EventBus.getInstance().publish('SCORE_PENALTY', 5);
                                    targetKilled.isWeak = true;
                                }
                            } else {
                                points = GameConfig.studyMode.learningPhase.basePoints;
                            }
                            comboToReport = 0;
                        } else {
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0 && !isDebtOrWeakAtStart) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                            }
                            points = Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                            if (isDebtOrWeakAtStart || hasNewFailure || targetKilled.isDebt) {
                                points = 0;
                                if (hasNewFailure) {
                                    EventBus.getInstance().publish('SCORE_PENALTY', 5);
                                    targetKilled.isWeak = true;
                                }
                            }
                            comboToReport = this.perfectComboCount;
                        }

                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: targetKilled, points: points, combo: comboToReport });
                        EventBus.getInstance().publish('COMBO_UPDATED', comboToReport);

                        // Xóa nợ sau khi tính điểm
                        if (!hasNewFailure) {
                            targetKilled.isWeak = false;
                            targetKilled.isDebt = false;
                        }

                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    if (this.currentWordTypoCount === (GameConfig.difficulty.maxTyposBeforeWeak || 4)) {
                        lockedEnemies.forEach(e => e.isWeak = true);
                    }
                    EventBus.getInstance().publish('TYPO', this.inputBuffer);
                    EventBus.getInstance().publish('PLAY_BUZZ', null);
                    EventBus.getInstance().publish('COMBO_UPDATED', 0);
                }
            } else {
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
                        let points = 0;
                        let comboToReport = 0;
                        let isDebtOrWeak = targetKilled.isDebt || targetKilled.isWeak;
                        const hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);

                        if (targetKilled.mode === 'study' && (targetKilled.studyWave === 1 || targetKilled.studyWave === 2)) {
                            if (isDebtOrWeak || hasNewFailure) {
                                points = 0;
                                if (hasNewFailure) {
                                    EventBus.getInstance().publish('SCORE_PENALTY', 5);
                                    targetKilled.isWeak = true;
                                }
                            } else {
                                points = GameConfig.studyMode.learningPhase.basePoints;
                            }
                            comboToReport = 0;
                        } else {
                            let multiplier = 1;
                            if (this.currentWordTypoCount === 0 && !isDebtOrWeak) {
                                this.perfectComboCount++;
                                if (this.perfectComboCount >= GameConfig.difficulty.perfectComboRequirement) {
                                    multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.perfectComboCount - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
                                }
                            } else {
                                this.perfectComboCount = 0;
                            }
                            points = Math.floor(GameConfig.difficulty.basePointsPerKill * multiplier);
                            if (isDebtOrWeak || hasNewFailure || targetKilled.isDebt) {
                                points = 0;
                                if (hasNewFailure) {
                                    EventBus.getInstance().publish('SCORE_PENALTY', 5);
                                    targetKilled.isWeak = true;
                                }
                            }
                            comboToReport = this.perfectComboCount;
                        }
                        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: targetKilled, points: points, combo: comboToReport });
                        EventBus.getInstance().publish('COMBO_UPDATED', comboToReport);
                        
                        // Xóa nợ sau khi tính điểm
                        if (!hasNewFailure) {
                            targetKilled.isWeak = false;
                            targetKilled.isDebt = false;
                        }

                        this.currentWordTypoCount = 0;
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    } else {
                        EventBus.getInstance().publish('TARGET_LOCKED', this.inputBuffer);
                        EventBus.getInstance().publish('TYPING_UPDATED', { buffer: this.inputBuffer, prefix: this.inputBuffer });
                    }
                } else {
                    this.currentWordTypoCount++;
                    this.perfectComboCount = 0;
                    if (this.currentWordTypoCount === (GameConfig.difficulty.maxTyposBeforeWeak || 4)) {
                        matchingEnemies.forEach(e => e.isWeak = true);
                    }
                    EventBus.getInstance().publish('TYPO', testBuffer);
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
                    return b.word.romaji.length - a.word.romaji.length;
                }
                return a.x - b.x;
            });

            let target = matches[0];
            if (target.mode === 'study') {
                if (target.studyWave === 3 || target.studyWave === 5) {
                    target.isDead = true;
                    target.isLocked = false;
                } else if (target.studyWave === 4) {
                    // Handled in processInput
                } else {
                    target.isDefeated = true;
                    target.isLocked = false;
                    let isDebtOrWeak = target.isDebt || target.isWeak;
                    const hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);
                    if (hasNewFailure) {
                        target.isWeak = true;
                        isDebtOrWeak = true;
                    }
                    if (this.currentWordTypoCount === 0 && !isDebtOrWeak) {
                        EventBus.getInstance().publish('MARK_MASTERED', target);
                    }
                    EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                    if (target.studyWave >= 2 && target.aliveTime <= 4000 && this.currentWordTypoCount === 0 && !isDebtOrWeak) {
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
            if (target.mode === 'study' && target.studyWave === 4) {
                const w4Enemies = enemies.filter(e => e.mode === 'study' && e.studyWave === 4 && !e.isDead && !e.isDefeated);
                const trueEnemy = w4Enemies.find(e => e.isTruth);
                this.currentWordTypoCount++;
                this.perfectComboCount = 0;
                EventBus.getInstance().publish('POINTS_PENALTY', { points: 5 });
                EventBus.getInstance().publish('PLAY_BUZZ', null);
                EventBus.getInstance().publish('COMBO_UPDATED', 0);
                EventBus.getInstance().publish('TYPO', 'ENTER');

                if (trueEnemy) {
                    trueEnemy.isWeak = true;
                    EventBus.getInstance().publish('MARK_WEAK', trueEnemy);
                    w4Enemies.forEach(e => {
                        if (e !== trueEnemy) {
                            e.isDead = true;
                            e.isLocked = false;
                        }
                    });
                    trueEnemy.isDefeated = true;
                    trueEnemy.isDead = false;
                    trueEnemy.x = -1000;
                    EventBus.getInstance().publish('ENEMY_DEFEATED', trueEnemy);
                    EventBus.getInstance().publish('ENEMY_KILLED', { enemy: trueEnemy, points: 0, combo: 0 });
                }
            } else {
                target.isWeak = true;
                target.isSkipped = true;
                EventBus.getInstance().publish('POINTS_PENALTY', { points: 5 });
                EventBus.getInstance().publish('MARK_WEAK', target);
                EventBus.getInstance().publish('PLAY_GLITCH', null);

                if (target.mode === 'study') {
                    if (target.studyWave === 5) {
                        target.isDead = true;
                        target.isLocked = false;
                        EventBus.getInstance().publish('SCORE_PENALTY', 10);
                    } else if (target.studyWave === 3) {
                        target.isDead = true;
                        target.isLocked = false;
                    } else {
                        target.isDefeated = true;
                        target.isLocked = false;
                        EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                    }
                } else {
                    target.isDead = true;
                }
            }
            this.inputBuffer = "";
            this.currentWordTypoCount = 0;
            this.perfectComboCount = 0;
            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
        }
    }
}
