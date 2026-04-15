import { Enemy } from '../../../core/entities/Enemy';
import { EventBus } from '../../../core/EventBus';
import { GameConfig } from '../../../config';
import { BaseWaveState } from './BaseWaveState';

export class Wave1State extends BaseWaveState {
    enterWave(): void {
        console.log("Entering Wave 1/2 State (Learning)");
        this.context.clearBuffer();
    }

    processInput(key: string): void {
        const enemies = this.context.getEnemies();
        
        // Anti-ghosting: if a study enemy is already defeated and showing, ignore input
        if (enemies.some((e: Enemy) => e.isDefeated && e.mode === 'study')) {
            return;
        }

        this.context.incrementTotalKeystrokes();

        let lockedEnemies = enemies.filter((e: Enemy) => e.isLocked && !e.isDead && !e.isDefeated);
        let testBuffer = this.context.getInputBuffer() + key.toLowerCase();

        if (lockedEnemies.length > 0) {
            let validEnemies = lockedEnemies.filter((e: Enemy) => e.word.romaji.toLowerCase().startsWith(testBuffer));
            if (validEnemies.length > 0) {
                this.context.setInputBuffer(testBuffer);
                this.context.incrementCorrectKeystrokes();
                
                lockedEnemies.forEach((e: Enemy) => {
                    if (!validEnemies.includes(e)) {
                        e.isLocked = false;
                        e.study.targetTypedLength = 0;
                    } else {
                        e.study.targetTypedLength = testBuffer.length;
                    }
                });

                let targetKilled = this.context.checkElimination(validEnemies);
                if (targetKilled) {
                    this.handleKill(targetKilled);
                } else {
                    this.publishTypingUpdate(testBuffer);
                }
            } else {
                this.handleTypo(testBuffer);
            }
        } else {
            let matchingEnemies = enemies.filter((e: Enemy) => !e.isDead && !e.isDefeated && e.word.romaji.toLowerCase().startsWith(testBuffer));
            if (matchingEnemies.length > 0) {
                this.context.setInputBuffer(testBuffer);
                this.context.incrementCorrectKeystrokes();
                matchingEnemies.forEach((e: Enemy) => {
                    e.isLocked = true;
                    e.study.targetTypedLength = testBuffer.length;
                });
                if (testBuffer.length === 1) {
                    EventBus.getInstance().publish('FOCUS_ENEMY', matchingEnemies[0]);
                }

                let targetKilled = this.context.checkElimination(matchingEnemies);
                if (targetKilled) {
                    this.handleKill(targetKilled);
                } else {
                    EventBus.getInstance().publish('TARGET_LOCKED', testBuffer);
                    this.publishTypingUpdate(testBuffer);
                }
            } else {
                this.handleTypo(testBuffer);
            }
        }
    }

    private handleKill(targetKilled: Enemy) {
        let points = 0;
        let isDebtOrWeakAtStart = targetKilled.study.isDebt || targetKilled.study.isWeak;
        const hasNewFailure = this.context.getTypoCount() >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);

        if (isDebtOrWeakAtStart || hasNewFailure) {
            points = 0;
            if (hasNewFailure) {
                EventBus.getInstance().publish('SCORE_PENALTY', 5);
                targetKilled.study.isWeak = true;
            }
        } else {
            const waveKey = `wave${targetKilled.study.wave}` as keyof typeof GameConfig.studyMode.wavePoints;
            points = GameConfig.studyMode.wavePoints[waveKey] || 10;
        }

        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: targetKilled, points: points, combo: 0 });
        EventBus.getInstance().publish('COMBO_UPDATED', 0);

        if (!hasNewFailure) {
            targetKilled.study.isWeak = false;
            targetKilled.study.isDebt = false;
        }

        this.context.resetTypoCount();
        this.context.setInputBuffer("");
        this.publishTypingUpdate("");
    }

    private handleTypo(_buffer: string) {
        this.context.incrementTypoCount();
        this.context.resetCombo();
        if (this.context.getTypoCount() === (GameConfig.difficulty.maxTyposBeforeWeak || 4)) {
            const locked = this.context.getEnemies().filter((e: Enemy) => e.isLocked);
            locked.forEach((e: Enemy) => e.study.isWeak = true);
        }
        EventBus.getInstance().publish('TYPO', this.context.getInputBuffer());
        this.playBuzz();
        EventBus.getInstance().publish('COMBO_UPDATED', 0);
    }

    handleTargetSkip(): void {
        const enemies = this.context.getEnemies();
        let target = enemies.find((e: Enemy) => !e.isDead && !e.isDefeated && e.isLocked) || 
                     enemies.find((e: Enemy) => !e.isDead && !e.isDefeated && e.mode === 'study');

        if (target) {
            target.study.isWeak = true;
            target.isSkipped = true;
            EventBus.getInstance().publish('POINTS_PENALTY', { points: 5 });
            EventBus.getInstance().publish('MARK_WEAK', target);
            EventBus.getInstance().publish('PLAY_GLITCH', null);

            target.isDefeated = true;
            target.isLocked = false;
            EventBus.getInstance().publish('ENEMY_DEFEATED', target);

            this.context.setInputBuffer("");
            this.context.resetTypoCount();
            this.context.resetCombo();
            this.publishTypingUpdate("");
            EventBus.getInstance().publish('COMBO_UPDATED', 0);
        }
    }
}
