import { Enemy } from '../../../core/entities/Enemy';
import { EventBus } from '../../../core/EventBus';
import { GameConfig } from '../../../config';
import { BaseWaveState } from './BaseWaveState';

export class Wave3State extends BaseWaveState {
    enterWave(): void {
        console.log("Entering Wave 3/5 State (Swarm/Combat)");
        this.context.clearBuffer();
    }

    processInput(key: string): void {
        const enemies = this.context.getEnemies();
        const isStudy = (e: Enemy) => (e.mode === 'study' || e.mode === 'kanji' || e.mode === 'grammar');
        this.context.incrementTotalKeystrokes();

        let w3Target = enemies.find((e: Enemy) => isStudy(e) && (e.study.wave === 3 || e.study.wave === 5) && e.study.isWave3Target && !e.isDead);
        
        if (!w3Target) {
            let candidates = enemies.filter((e: Enemy) =>
                !e.isDead && isStudy(e) &&
                e.word.romaji.toLowerCase().startsWith(key.toLowerCase()) &&
                e.x < 1200 && e.x > 0
            );
            if (candidates.length > 0) {
                candidates.sort((a: Enemy, b: Enemy) => a.x - b.x);
                w3Target = candidates[0];
                w3Target.study.isWave3Target = true;
            } else {
                return;
            }
        }

        if (w3Target) {
            let suffix = this.context.getInputBuffer() + key.toLowerCase();
            if (w3Target.word.romaji.toLowerCase().startsWith(suffix)) {
                this.context.incrementCorrectKeystrokes();
                this.context.setInputBuffer(suffix);
                w3Target.isLocked = true;
                w3Target.study.targetTypedLength = suffix.length;

                if (suffix === w3Target.word.romaji.toLowerCase()) {
                    this.handleKill(w3Target);
                } else {
                    EventBus.getInstance().publish('TARGET_LOCKED', suffix);
                    this.publishTypingUpdate(suffix);
                }
            } else {
                this.handleTypo(suffix, w3Target);
            }
        }
    }

    private handleKill(target: Enemy) {
        target.isDead = true;
        target.isLocked = false;
        this.context.setInputBuffer("");
        
        let multiplier = 1;
        let isDebtOrWeak = target.study.isDebt || target.study.isWeak;
        const hasNewFailure = this.context.getTypoCount() >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);

        if (this.context.getTypoCount() === 0 && !isDebtOrWeak) {
            this.context.incrementCombo();
            if (this.context.getCombo() >= GameConfig.difficulty.perfectComboRequirement) {
                multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.context.getCombo() - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
            }
        } else {
            this.context.resetCombo();
        }

        const waveKey = `wave${target.study.wave}` as keyof typeof GameConfig.studyMode.wavePoints;
        const waveBasePoints = GameConfig.studyMode.wavePoints[waveKey] || GameConfig.difficulty.basePointsPerKill;
        let basePoints = Math.floor(waveBasePoints * multiplier);
        let earnedPoints = basePoints;

        if (isDebtOrWeak || hasNewFailure) {
            if (target.study.wave === 5 && !target.study.isDebt) {
                earnedPoints = Math.floor(basePoints * 0.5); 
            } else {
                earnedPoints = 0; 
            }
            this.context.resetCombo(); 

            if (hasNewFailure) {
                EventBus.getInstance().publish('SCORE_PENALTY', 5);
            }
        }

        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: target, points: earnedPoints, combo: this.context.getCombo() });
        EventBus.getInstance().publish('COMBO_UPDATED', this.context.getCombo());
        
        if (!hasNewFailure) {
            target.study.isWeak = false;
            target.study.isDebt = false;
        }

        if (this.context.getTypoCount() === 0 && !isDebtOrWeak) {
            EventBus.getInstance().publish('MARK_MASTERED', target);
        }
        
        this.context.resetTypoCount();
        this.publishTypingUpdate("");
    }

    private handleTypo(buffer: string, target: Enemy) {
        this.context.incrementTypoCount();
        this.context.resetCombo();
        if (this.context.getTypoCount() === (GameConfig.difficulty.maxTyposBeforeWeak || 4)) {
            target.study.isWeak = true;
        }
        EventBus.getInstance().publish('TYPO', buffer);
        this.playBuzz();
        EventBus.getInstance().publish('COMBO_UPDATED', 0);
        this.publishTypingUpdate(this.context.getInputBuffer());
    }

    handleTargetSkip(): void {
        const enemies = this.context.getEnemies();
        let target = enemies.find((e: Enemy) => !e.isDead && !e.isDefeated && e.study.isWave3Target);

        if (target) {
            target.study.isWeak = true;
            target.isSkipped = true;
            EventBus.getInstance().publish('POINTS_PENALTY', { points: 5 });
            EventBus.getInstance().publish('MARK_WEAK', target);
            EventBus.getInstance().publish('PLAY_GLITCH', null);

            target.isDead = true;
            target.isLocked = false;
            if (target.study.wave === 5) {
                EventBus.getInstance().publish('SCORE_PENALTY', 10);
            }

            this.context.setInputBuffer("");
            this.context.resetTypoCount();
            this.context.resetCombo();
            this.publishTypingUpdate("");
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
        }
    }
}
