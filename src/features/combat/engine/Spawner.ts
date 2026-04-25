import { Enemy } from '../../../core/entities/Enemy';
import { StateManager } from '../../../shared/utils/StateManager';
import { EventBus } from '../../../core/EventBus';
import { Word } from '../../../core/entities/Word';
import { GameConfig } from '../../../config';

export class Spawner {
    private spawnTimer: number = 0;
    private engineAddEnemyCallback: (enemy: Enemy) => void;
    private getActiveEnemiesCallback: () => Enemy[];
    private canvasWidth: number;
    private canvasHeight: number;

    // Thuộc tính riêng cho Study Mode
    private currentStudyDeck: Word[] = [];
    public currentStudyWave: number = 0;
    private currentStudyEntityIndex: number = 0;
    private studyQueue: { word: Word, revealType: 'kanji' | 'vi', isDebt?: boolean }[] = [];
    private retryQueue: { word: Word, revealType: 'kanji' | 'vi', isDebt?: boolean }[] = [];
    private retryTracker: Map<string, number> = new Map();
    private wave5StartTime: number = 0;
    private sessionEnabledWaves: number[] | null = null;

    constructor(
        canvasWidth: number,
        canvasHeight: number,
        engineAddEnemyCallback: (enemy: Enemy) => void,
        getActiveEnemiesCallback: () => Enemy[]
    ) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.engineAddEnemyCallback = engineAddEnemyCallback;
        this.getActiveEnemiesCallback = getActiveEnemiesCallback;
    }

    public updateDimensions(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }

    public update(dt: number, mode: string, speedModifier: number) {
        const isStudyRunning = (mode === 'study' || mode === 'kanji' || mode === 'grammar');
        if (isStudyRunning && this.currentStudyWave !== 5 && this.currentStudyWave !== 3) return;

        const globalFactor = GameConfig.speeds.globalSpeedFactor || 1.0;
        const densityFactor = GameConfig.timing.spawnDensityFactor || 1.0;
        this.spawnTimer += dt;

        if (isStudyRunning && this.currentStudyWave === 5) {
            const w5Config = GameConfig.studyMode.wave5;
            const accel = w5Config.accelerationSettings;

            const elapsed = performance.now() - this.wave5StartTime;
            const intensity = Math.min(1.0, elapsed / accel.rampUpTimeMs);

            const currentBaseInterval = w5Config.spawnIntervalMs - (intensity * (w5Config.spawnIntervalMs - accel.minSpawnIntervalMs));
            // Áp dụng cả tốc độ và mật độ vào tần suất đẻ
            let spawnThreshold = (currentBaseInterval / speedModifier) / (globalFactor * densityFactor);

            if (this.spawnTimer > spawnThreshold) {
                if (this.currentStudyDeck.length > 0) {
                    const stackSize = w5Config.minStackSize + Math.floor(Math.random() * (w5Config.maxStackSize - w5Config.minStackSize + 1));
                    const spacing = w5Config.verticalSpacing;
                    const startY = this.canvasHeight / 2 - ((stackSize - 1) * spacing) / 2;

                    const currentBoost = GameConfig.speeds.wave5SpeedBoost + (intensity * (accel.maxSpeedBoost - GameConfig.speeds.wave5SpeedBoost));

                    for (let i = 0; i < stackSize; i++) {
                        const selectedWord = this.currentStudyDeck[Math.floor(Math.random() * this.currentStudyDeck.length)];
                        const enemy = new Enemy(selectedWord, mode, speedModifier, this.canvasWidth, this.canvasHeight, this.currentStudyWave);

                        enemy.study.revealType = Math.random() > 0.5 ? 'kanji' : 'vi';

                        const finalGlobalFactor = GameConfig.speeds.globalSpeedFactor || 1.0;
                        const vxAtSpeed1 = -(enemy.baseSpeed + currentBoost) * finalGlobalFactor;
                        enemy.syncVelocityWithSpeedMod(vxAtSpeed1, speedModifier);

                        enemy.x = this.canvasWidth + 50 + (Math.random() * 120);
                        enemy.y = startY + i * spacing;
                        enemy.baseY = enemy.y;

                        this.engineAddEnemyCallback(enemy);
                    }
                }
                this.spawnTimer = 0;
            }
        } else if (isStudyRunning && this.currentStudyWave === 3) {
            const active = this.getActiveEnemiesCallback().filter(e => !e.isDead);
            if (active.length === 0 && this.hasMoreStudyEnemies()) {
                this.spawnBatchWave3(mode, speedModifier);
            }
        } else {
            // Trường hợp Chill / Normal mode
            let spawnThreshold = (Math.max(800, 2000 / Math.max(1, speedModifier))) / (globalFactor * densityFactor);
            if (this.spawnTimer > spawnThreshold) {
                this.spawnEnemy(mode, speedModifier);
                this.spawnTimer = 0;
            }
        }
    }

    public startStudySession(words: Word[] = [], startingWave: number = 1, enabledWaves?: number[]) {
        if (words.length > 0) {
            this.currentStudyDeck = words;
        } else {
            // Mặc định nạp 5 từ nếu không truyền vào (Dành cho Study Mode thường)
            this.currentStudyDeck = StateManager.getInstance().getStudySessionDeck(5);
        }
        this.currentStudyWave = startingWave;
        this.sessionEnabledWaves = enabledWaves || null;
        this.retryTracker.clear();
        this.retryQueue = [];
    }

    public resetStudySession() {
        this.currentStudyWave = 0;
        this.currentStudyEntityIndex = 0;
        this.currentStudyDeck = [];
        this.studyQueue = [];
        this.retryQueue = [];
        this.retryTracker.clear();
        this.sessionEnabledWaves = null;
    }

    public spawnWave(mode: string, speedModifier: number) {
        if (mode === 'easy') {
            this.spawnEasyWave(speedModifier);
        } else if (mode === 'study' || mode === 'kanji' || mode === 'grammar') {
            this.spawnStudyWave(mode, speedModifier);
        }
    }

    private spawnEasyWave(speedModifier: number) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            this.spawnEnemy('easy', speedModifier);
        }
        EventBus.getInstance().publish('WAVE_STARTED', { count, waveIndex: 1 });
    }

    private buildStudyQueueForCurrentWave() {
        this.studyQueue = [];
        if (this.currentStudyDeck.length === 10) {
            // N2 Logic (3 waves)
            if (this.currentStudyWave === 1) {
                // Wave 1: Nhận diện 10 từ (Kanji -> Romaji)
                for (let w of this.currentStudyDeck) {
                    this.studyQueue.push({ word: w, revealType: 'kanji' });
                }
            } else if (this.currentStudyWave === 2) {
                // Wave 2: Đảo ngược (20 từ: 10 Kanji + 10 Vi)
                for (let w of this.currentStudyDeck) {
                    this.studyQueue.push({ word: w, revealType: 'kanji' });
                    this.studyQueue.push({ word: w, revealType: 'vi' });
                }
                this.studyQueue.sort(() => Math.random() - 0.5); // Trộn
            } else if (this.currentStudyWave === 3) {
                // Wave 3: Khảo hạch tổng lực (10 từ trôi ngang màn hình) + Điểm yếu
                for (let w of this.currentStudyDeck) {
                    let rType: 'kanji' | 'vi' = Math.random() > 0.5 ? 'kanji' : 'vi';
                    this.studyQueue.push({ word: w, revealType: rType });
                }
                const config = GameConfig.studyMode.wave3;
                for (let w of this.currentStudyDeck) {
                    let retries = this.retryTracker.get(w.romaji) || 0;
                    if (retries > 0) {
                        for (let c = 0; c < config.baseImperfectHits + (retries * config.retryPenaltyMultiplier); c++) {
                            let rType: 'kanji' | 'vi' = Math.random() > 0.5 ? 'kanji' : 'vi';
                            this.studyQueue.push({ word: w, revealType: rType, isDebt: true });
                        }
                    }
                }
                this.studyQueue.sort(() => Math.random() - 0.5);
            } else if (this.currentStudyWave === 4) {
                // Wave 4: Xét lại toàn bộ 10 từ dưới dạng Trắc nghiệm
                for (let w of this.currentStudyDeck) {
                    this.studyQueue.push({ word: w, revealType: 'kanji' });
                }
                this.studyQueue.sort(() => Math.random() - 0.5);
            } else if (this.currentStudyWave === 5) {
                // Wave 5: Khảo hạch sinh tồn cho N2
                for (let w of this.currentStudyDeck) {
                    let rType: 'kanji' | 'vi' = Math.random() > 0.5 ? 'kanji' : 'vi';
                    this.studyQueue.push({ word: w, revealType: rType });
                }
            }
        } else {
            // Study Mode Thường (5 words / 5 waves)
            if (this.currentStudyWave === 2) {
                for (let w of this.currentStudyDeck) {
                    this.studyQueue.push({ word: w, revealType: 'kanji' });
                    this.studyQueue.push({ word: w, revealType: 'vi' });
                }
                this.studyQueue.sort(() => Math.random() - 0.5); // Trộn
            } else if (this.currentStudyWave === 3) {
                const config = GameConfig.studyMode.wave3;
                for (let w of this.currentStudyDeck) {
                    let retries = this.retryTracker.get(w.romaji) || 0;
                    let count = (retries === 0) ? config.basePerfectHits : config.baseImperfectHits + (retries * config.retryPenaltyMultiplier);
                    for (let c = 0; c < count; c++) {
                        let rType: 'kanji' | 'vi' = Math.random() > 0.5 ? 'kanji' : 'vi';
                        this.studyQueue.push({ word: w, revealType: rType, isDebt: retries > 0 });
                    }
                }
                this.studyQueue.sort(() => Math.random() - 0.5);
            } else if (this.currentStudyWave === 5) {
                // Wave 5: Khởi tạo hàng chờ ban đầu (5 hoặc 10 con ngẫu nhiên)
                for (let w of this.currentStudyDeck) {
                    let rType: 'kanji' | 'vi' = Math.random() > 0.5 ? 'kanji' : 'vi';
                    this.studyQueue.push({ word: w, revealType: rType });
                }
            } else {
                for (let w of this.currentStudyDeck) {
                    this.studyQueue.push({ word: w, revealType: 'kanji' });
                }
            }
        }
        this.currentStudyEntityIndex = 0;
    }

    private spawnStudyWave(mode: string, speedModifier: number) {
        let maxWaves = 5;
        if (this.currentStudyWave > maxWaves) {
            if (this.currentStudyDeck.length === 10) {
                // Publish finish early for N2
                EventBus.getInstance().publish('STUDY_SESSION_END', null);
            }
            return;
        }

        this.buildStudyQueueForCurrentWave();
        const count = this.studyQueue.length;

        if (this.currentStudyWave === 5) {
            this.wave5StartTime = performance.now(); // Đảm bảo luôn có StartTime kể cả khi chạy test URL
        }

        let isMassWave = (this.currentStudyWave === 3 || this.currentStudyWave === 5);

        if (!isMassWave) {
            // Spawn từng con 1
            this.spawnNextStudyEnemy(mode, speedModifier);
        } else if (this.currentStudyWave === 5) {
            // Wave 5: Không bắn ra một loạt quái ban đầu (Endless trickle). 
            // Chỉ cần publish signal để HUD cập nhật
            this.spawnTimer = 0; // Reset timer để con đầu tiên xuất hiện sau spawnIntervalMs
        } else if (this.currentStudyWave === 3) {
            // Wave 3: Spawn mẻ đầu tiên (5 con)
            this.spawnBatchWave3(mode, speedModifier);
        }

        EventBus.getInstance().publish('WAVE_STARTED', { count: count, waveIndex: this.currentStudyWave });
    }

    public spawnBatchWave3(mode: string, speedModifier: number) {
        const batchSize = 5;
        const spacing = 110;
        const startY = this.canvasHeight / 2 - ((batchSize - 1) * spacing) / 2;

        for (let i = 0; i < batchSize; i++) {
            if (!this.hasMoreStudyEnemies()) break;
            const q = this.studyQueue[this.currentStudyEntityIndex];
            this.currentStudyEntityIndex++;

            const enemy = new Enemy(q.word, mode, speedModifier, this.canvasWidth, this.canvasHeight, 3);
            enemy.study.revealType = q.revealType;
            if (q.isDebt) enemy.study.isDebt = true;

            // Vị trí cố định ở giữa
            enemy.x = this.canvasWidth / 2;
            enemy.y = startY + i * spacing;
            enemy.baseY = enemy.y;

            // Ép đứng yên (vx = 0)
            enemy.vx = 0;

            this.engineAddEnemyCallback(enemy);
        }
    }

    public hasMoreStudyEnemies(): boolean {
        return this.currentStudyEntityIndex < this.studyQueue.length;
    }

    public spawnNextStudyEnemy(mode: string, speedModifier: number) {
        if (!this.hasMoreStudyEnemies()) return;
        const q = this.studyQueue[this.currentStudyEntityIndex];
        this.currentStudyEntityIndex++;

        // Wave 4: Bắn 4 lựa chọn (1 Đúng, 3 Nhiễu)
        if (this.currentStudyWave === 4) {
            const trueEnemy = new Enemy(q.word, mode, 0, this.canvasWidth, this.canvasHeight, this.currentStudyWave);
            trueEnemy.isTruth = true;
            trueEnemy.study.revealType = q.revealType || 'kanji';
            if (q.isDebt) trueEnemy.study.isDebt = true;

            // Pick 3 random distractors from remaining currentStudyDeck
            let distractors = this.currentStudyDeck.filter(w => w.romaji !== q.word.romaji);
            distractors.sort(() => Math.random() - 0.5);
            let pickedDistractors = distractors.slice(0, 3);

            let d1 = new Enemy(pickedDistractors[0], mode, 0, this.canvasWidth, this.canvasHeight, this.currentStudyWave);
            let d2 = new Enemy(pickedDistractors[1], mode, 0, this.canvasWidth, this.canvasHeight, this.currentStudyWave);
            let d3 = new Enemy(pickedDistractors[2], mode, 0, this.canvasWidth, this.canvasHeight, this.currentStudyWave);
            d1.isTruth = false; d2.isTruth = false; d3.isTruth = false;

            let candidates = [trueEnemy, d1, d2, d3].sort(() => Math.random() - 0.5);

            const layout = GameConfig.studyMode.wave4.layout;
            const gridCoords = [
                { x: this.canvasWidth / 2 - layout.offsetX, y: this.canvasHeight / 2 + layout.offsetYStart },
                { x: this.canvasWidth / 2 + layout.offsetX, y: this.canvasHeight / 2 + layout.offsetYStart },
                { x: this.canvasWidth / 2 - layout.offsetX, y: this.canvasHeight / 2 + layout.offsetYStart + layout.offsetYSpacing },
                { x: this.canvasWidth / 2 + layout.offsetX, y: this.canvasHeight / 2 + layout.offsetYStart + layout.offsetYSpacing },
            ];

            candidates.forEach((e, idx) => {
                e.x = gridCoords[idx].x;
                e.y = gridCoords[idx].y;
                e.baseY = e.y;
                // Wave 4 không di chuyển
                e.study.dynamicStudyOffset = 0;
                e.study.wave4Index = idx + 1; // Gắn số phím 1->4
                this.engineAddEnemyCallback(e);
            });

            // Focus true enemy để hiển thị câu hỏi trên Terminal
            setTimeout(() => { EventBus.getInstance().publish('FOCUS_ENEMY', trueEnemy); }, 50);
            return;
        }

        const enemy = new Enemy(q.word, mode, speedModifier, this.canvasWidth, this.canvasHeight, this.currentStudyWave);
        enemy.study.revealType = q.revealType;
        if (q.isDebt) enemy.study.isDebt = true;

        this.engineAddEnemyCallback(enemy);
        EventBus.getInstance().publish('FOCUS_ENEMY', enemy);
    }

    public nextStudyWave() {
        this.currentStudyWave++;
        
        // Skip disabled waves
        while (this.currentStudyWave <= 5 && !this.isWaveEnabled(this.currentStudyWave)) {
            console.log(`[Spawner] Skipping disabled wave ${this.currentStudyWave}`);
            this.currentStudyWave++;
        }

        this.studyQueue = [];
        this.currentStudyEntityIndex = 0;
        if (this.currentStudyWave === 5) {
            this.wave5StartTime = performance.now();
        }
    }

    private isWaveEnabled(waveIndex: number): boolean {
        if (this.sessionEnabledWaves) {
            return this.sessionEnabledWaves.includes(waveIndex);
        }

        const workflow = GameConfig.studyMode.workflow;
        switch (waveIndex) {
            case 1: return workflow.enableWave1 !== false;
            case 2: return workflow.enableWave2 !== false;
            case 3: return workflow.enableWave3 !== false;
            case 4: return workflow.enableWave4 !== false;
            case 5: return workflow.enableWave5 !== false;
            default: return true;
        }
    }

    public addRetryEnemy(enemy: Enemy) {
        if (this.currentStudyWave >= 1 && this.currentStudyWave <= 2) {
            let current = this.retryTracker.get(enemy.word.romaji) || 0;
            this.retryTracker.set(enemy.word.romaji, current + 1);
        }
        this.retryQueue.push({ word: enemy.word, revealType: enemy.study.revealType || 'kanji', isDebt: true });
    }

    public hasRetryEnemies(): boolean {
        return this.retryQueue.length > 0;
    }

    public startRetryPhase() {
        this.studyQueue = [...this.retryQueue];
        this.studyQueue.sort(() => Math.random() - 0.5); // Shuffle nợ
        this.retryQueue = [];
        this.currentStudyEntityIndex = 0;
        EventBus.getInstance().publish('WAVE_STARTED', { count: this.studyQueue.length, waveIndex: this.currentStudyWave, isRetry: true });
    }

    public spawnStaticWave(mode: string, speedModifier: number) {
        const count = 5;
        const spacing = 100;
        const startY = this.canvasHeight / 2 - ((count - 1) * spacing) / 2;

        for (let i = 0; i < count; i++) {
            const allWords = StateManager.getInstance().getWords();
            if (allWords.length === 0) return;

            const activeEnemies = this.getActiveEnemiesCallback();
            const activeWordsRomaji = activeEnemies.map(e => e.word.romaji);
            const availableWords = allWords.filter(w => !activeWordsRomaji.includes(w.romaji));

            let selectedWord;
            if (availableWords.length > 0) {
                selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            } else {
                selectedWord = allWords[Math.floor(Math.random() * allWords.length)];
            }

            const enemy = new Enemy(selectedWord, mode, speedModifier, this.canvasWidth, this.canvasHeight);

            enemy.x = this.canvasWidth / 2;
            enemy.y = startY + i * spacing;
            enemy.baseY = enemy.y;
            enemy.vx = 0;

            this.engineAddEnemyCallback(enemy);
        }

        EventBus.getInstance().publish('WAVE_STARTED', { count: count, waveIndex: 1 });
    }

    public spawnEnemy(mode: string, speedModifier: number) {
        const activeEnemies = this.getActiveEnemiesCallback();
        if (activeEnemies.length >= 20) return;

        const allWords = StateManager.getInstance().getWords();
        if (allWords.length === 0) return;

        const activeWordsRomaji = activeEnemies.map(e => e.word.romaji);
        const availableWords = allWords.filter(w => !activeWordsRomaji.includes(w.romaji));

        let selectedWord;
        if (availableWords.length > 0) {
            selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        } else {
            selectedWord = allWords[Math.floor(Math.random() * allWords.length)];
        }

        const enemy = new Enemy(selectedWord, mode, speedModifier, this.canvasWidth, this.canvasHeight);
        
        // Quản lý lane để tránh chòng chéo
        const laneCount = 4;
        const topMargin = 150;
        const laneHeight = (this.canvasHeight - topMargin - 150) / laneCount;
        const randomLane = Math.floor(Math.random() * laneCount);
        
        enemy.y = topMargin + (randomLane * laneHeight) + (laneHeight / 2);
        enemy.baseY = enemy.y;

        this.engineAddEnemyCallback(enemy);
    }
}
