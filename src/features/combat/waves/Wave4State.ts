import { Enemy } from '../../../core/entities/Enemy';
import { EventBus } from '../../../core/EventBus';
import { GameConfig } from '../../../config';
import { BaseWaveState } from './BaseWaveState';

export class Wave4State extends BaseWaveState {
    enterWave(): void {
        console.log("Entering Wave 4 State (Grammar)");
        this.context.clearBuffer();
    }

    processInput(key: string): void {
        const enemies = this.context.getEnemies();
        const isStudy = (e: Enemy) => (e.mode === 'study' || e.mode === 'kanji' || e.mode === 'grammar');
        this.context.incrementTotalKeystrokes();

        let w4Enemies = enemies.filter((e: Enemy) => isStudy(e) && e.study.wave === 4 && !e.isDead && !e.isDefeated);
        if (w4Enemies.length === 0) return;

        let numericKey = parseInt(key, 10);
        if (isNaN(numericKey) || numericKey < 1 || numericKey > 4) return;

        let target = w4Enemies.find((e: Enemy) => e.study.wave4Index === numericKey);
        if (!target) return;

        let trueEnemy = w4Enemies.find((e: Enemy) => e.isTruth);
        if (target.isTruth) {
            this.handleCorrect(target, w4Enemies, enemies);
        } else {
            this.handleWrong(target, trueEnemy, w4Enemies);
        }
    }

    private handleCorrect(target: Enemy, w4Enemies: Enemy[], allEnemies: Enemy[]) {
        this.context.incrementCorrectKeystrokes();
        let multiplier = 1;

        if (this.context.getTypoCount() === 0) {
            this.context.incrementCombo();
            EventBus.getInstance().publish('MARK_MASTERED', target);
            if (this.context.getCombo() >= GameConfig.difficulty.perfectComboRequirement) {
                multiplier = Math.min(GameConfig.difficulty.maxMultiplier, 1 + (this.context.getCombo() - (GameConfig.difficulty.perfectComboRequirement - 1)) * GameConfig.difficulty.multiplierStep);
            }
        } else {
            this.context.resetCombo();
        }

        // Clean up all wave 4 enemies
        w4Enemies.forEach(e => {
            e.isDead = true;
            e.isDefeated = false;
            e.isLocked = false;
        });

        // Add dummy for revelation
        let dummy = new Enemy(target.word, target.mode, 0, 0, 0, 1);
        dummy.isDefeated = true;
        dummy.isDead = false;
        dummy.x = -1000;
        allEnemies.push(dummy);

        const basePoints = GameConfig.studyMode.wavePoints.wave4;
        let points = Math.floor(basePoints * multiplier);
        const hasNewFailure = this.context.getTypoCount() >= (GameConfig.difficulty.maxTyposBeforeWeak || 4);
        
        if (target.study.isDebt || target.study.isWeak || hasNewFailure) {
            points = 0;
        }

        EventBus.getInstance().publish('ENEMY_DEFEATED', target);
        EventBus.getInstance().publish('ENEMY_KILLED', { enemy: target, points: points, combo: this.context.getCombo() });
        EventBus.getInstance().publish('COMBO_UPDATED', this.context.getCombo());
        
        if (!hasNewFailure) {
            target.study.isWeak = false;
            target.study.isDebt = false;
        }

        this.context.resetTypoCount();
        this.context.setInputBuffer("");
        this.publishTypingUpdate("");

        if (target.aliveTime <= GameConfig.timing.perfectRecallThreshold) {
            EventBus.getInstance().publish('PERFECT_RECALL', target);
        }
    }

    private handleWrong(target: Enemy, trueEnemy: Enemy | undefined, w4Enemies: Enemy[]) {
        this.context.incrementTypoCount();
        this.context.resetCombo();
        EventBus.getInstance().publish('POINTS_PENALTY', { enemy: target, points: 5 });
        EventBus.getInstance().publish('TYPO', target.study.wave4Index.toString());
        this.playBuzz();
        EventBus.getInstance().publish('COMBO_UPDATED', 0);

        if (trueEnemy) {
            trueEnemy.study.isWeak = true;
            EventBus.getInstance().publish('MARK_WEAK', trueEnemy);
            w4Enemies.forEach((e: Enemy) => {
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
            this.context.setInputBuffer("");
            this.publishTypingUpdate("");
        }
    }

    handleTargetSkip(): void {
        const enemies = this.context.getEnemies();
        const isStudy = (e: Enemy) => (e.mode === 'study' || e.mode === 'kanji' || e.mode === 'grammar');
        const w4Enemies = enemies.filter((e: Enemy) => isStudy(e) && e.study.wave === 4 && !e.isDead && !e.isDefeated);
        const trueEnemy = w4Enemies.find((e: Enemy) => e.isTruth);

        if (trueEnemy) {
            this.handleWrong(trueEnemy, trueEnemy, w4Enemies); // Treat skip as a wrong answer for simplicity
        }
    }
}
