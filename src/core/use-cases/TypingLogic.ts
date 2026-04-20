import { Enemy } from '../entities/Enemy';
import { EventBus } from '../EventBus';
import { GameConfig } from '../../config';
import { IWaveState } from '../../features/combat/waves/IWaveState';
import { Wave1State } from '../../features/combat/waves/Wave1State';
import { Wave3State } from '../../features/combat/waves/Wave3State';
import { Wave4State } from '../../features/combat/waves/Wave4State';

export class TypingLogic {
    private currentState: IWaveState;
    private inputBuffer: string = "";
    private getEnemiesCb: () => Enemy[];
    private currentWordTypoCount: number = 0;
    private perfectComboCount: number = 0;
    public isKeyboardLocked: boolean = false;

    public totalKeystrokes: number = 0;
    public correctKeystrokes: number = 0;

    constructor(getEnemiesCallback: () => Enemy[]) {
        this.getEnemiesCb = getEnemiesCallback;
        
        // Initial state
        this.currentState = new Wave1State(this);

        this.setupListener();
        
        EventBus.getInstance().subscribe('WAVE3_TARGET_EVADED', () => {
            this.clearBuffer();
            EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
        });

        EventBus.getInstance().subscribe('WAVE_STARTED', (data: any) => {
            this.perfectComboCount = 0;
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
            
            if (data && data.waveIndex) {
                this.changeWave(data.waveIndex);
                if (data.waveIndex === 5) {
                    this.resetStats();
                }
            }
        });

        EventBus.getInstance().subscribe('STUDY_SESSION_END', () => {
            EventBus.getInstance().publish('PERFORMANCE_STATS', {
                correct: this.correctKeystrokes,
                total: this.totalKeystrokes
            });
        });
    }

    public changeWave(waveIndex: number) {
        if (waveIndex === 3 || waveIndex === 5) {
            this.currentState = new Wave3State(this);
        } else if (waveIndex === 4) {
            this.currentState = new Wave4State(this);
        } else {
            this.currentState = new Wave1State(this);
        }
        this.currentState.enterWave();
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
                this.currentState.handleTargetSkip();
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

        EventBus.getInstance().subscribe('LOCK_KEYBOARD', (locked: boolean) => {
            this.isKeyboardLocked = locked;
        });
    }

    public processInput(key: string): void {
        this.currentState.processInput(key);
    }

    // --- State Accessors & Mutators ---

    public getInputBuffer(): string { return this.inputBuffer; }
    public setInputBuffer(val: string) { this.inputBuffer = val; }
    
    public getEnemiesCallback(): Enemy[] { return this.getEnemies(); } // Rename to avoid confusion with internal usage
    // Actually consistent with IWaveState name
    public getEnemies(): Enemy[] { return this.getEnemiesCb(); }

    public incrementTotalKeystrokes() { this.totalKeystrokes++; }
    public incrementCorrectKeystrokes() { this.correctKeystrokes++; }
    
    public getTypoCount(): number { return this.currentWordTypoCount; }
    public incrementTypoCount() { this.currentWordTypoCount++; }
    public resetTypoCount() { this.currentWordTypoCount = 0; }

    public getCombo(): number { return this.perfectComboCount; }
    public incrementCombo() { this.perfectComboCount++; }
    public resetCombo() { this.perfectComboCount = 0; }

    public resetStats() {
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
    }

    public clearBuffer() {
        this.inputBuffer = "";
        this.currentWordTypoCount = 0;
        this.perfectComboCount = 0;
        const enemies = this.getEnemies();
        if (enemies) {
            enemies.forEach(e => {
                e.isLocked = false;
                e.study.targetTypedLength = 0;
            });
        }
    }

    /**
     * Common logic to check if input buffer matches any enemy's romaji.
     * Note: This is still complex but we centralize it here for now to avoid duplicating logic in states.
     */
    public checkElimination(enemies: Enemy[]): Enemy | null {
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
            const isStudy = (target.mode === 'study' || target.mode === 'kanji' || target.mode === 'grammar');
            if (isStudy) {
                if (target.study.wave === 3 || target.study.wave === 5) {
                    target.isDead = true;
                    target.isLocked = false;
                } else if (target.study.wave === 4) {
                    // Handled in Wave4State
                } else {
                    target.isDefeated = true;
                    target.isLocked = false;
                    let isDebtOrWeak = target.study.isDebt || target.study.isWeak;
                    const hasNewFailure = this.currentWordTypoCount >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);
                    if (hasNewFailure) {
                        target.study.isWeak = true;
                        isDebtOrWeak = true;
                    }
                    if (this.currentWordTypoCount === 0 && !isDebtOrWeak) {
                        EventBus.getInstance().publish('MARK_MASTERED', target);
                    }
                    EventBus.getInstance().publish('ENEMY_DEFEATED', target);
                    if (target.study.wave >= 2 && target.aliveTime <= 4000 && this.currentWordTypoCount === 0 && !isDebtOrWeak) {
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
}
