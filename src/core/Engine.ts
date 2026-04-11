import { Enemy } from '../entities/Enemy';
import { TypingLogic } from './TypingLogic';
import { Spawner } from '../systems/Spawner';
import { EventBus } from '../utils/EventBus';
import { GameConfig } from '../config';

export class Engine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isRunning: boolean = false;
    private enemies: Enemy[] = [];
    private typingLogic: TypingLogic;
    private spawner: Spawner;
    private lastTime: number = 0;
    private particles: any[] = [];
    private isWaitingForProceed: boolean = false;
    
    // Variables from game settings
    public mode: string = 'medium';
    private speedModifier: number = 1.0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2D context");
        this.ctx = ctx;

        this.typingLogic = new TypingLogic(() => this.enemies);
        
        this.spawner = new Spawner(
            canvas.width, 
            canvas.height, 
            (enemy: Enemy) => {
                this.enemies.push(enemy);
            }, 
            () => this.enemies
        );

        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        EventBus.getInstance().subscribe('PERFECT_RECALL', (enemy: Enemy) => {
            if (this.mode === 'study') {
                this.createTextParticle(enemy.x, enemy.y - 20, "PERFECT RECALL!", "#FFD700");
            }
        });

        EventBus.getInstance().subscribe('SKIP_DEFEAT_DELAY', () => {
            this.enemies.forEach(e => {
                if (e.isDefeated) {
                    e.isDead = true;
                    if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                }
            });
        });

        this.setupManualProceedListener();
        
        EventBus.getInstance().subscribe('MARK_WEAK', (enemy: Enemy) => {
            if (enemy && enemy.word && enemy.word.romaji) {
                import('../data/StateManager').then(module => {
                    module.StateManager.getInstance().markWordWeak(enemy.word.romaji);
                });
            }
        });
        
        EventBus.getInstance().subscribe('MARK_MASTERED', (enemy: Enemy) => {
            if (enemy && enemy.word && enemy.word.romaji) {
                import('../data/StateManager').then(module => {
                    module.StateManager.getInstance().markWordMastered(enemy.word.romaji);
                });
            }
        });

        EventBus.getInstance().subscribe('AUDIO_TTS_ENDED', (enemy: Enemy) => {
            if (this.enemies.includes(enemy)) {
                enemy.isDead = true;
            }
        });

        EventBus.getInstance().subscribe('ENEMY_KILLED', (data: { enemy: any, points: number }) => {
            if (data && data.enemy && data.points > 0) {
                this.createTextParticle(data.enemy.x, data.enemy.y - 10, `+${data.points}`, "#00e676");
            }
        });

        EventBus.getInstance().subscribe('POINTS_PENALTY', (data: { enemy: any, points: number }) => {
            if (data && data.enemy && data.points > 0) {
                this.createTextParticle(data.enemy.x, data.enemy.y - 10, `-${data.points}`, "#ff5252");
            }
        });
    }

    private resize() {
        let newW = window.innerWidth;
        let newH = window.innerHeight;
        
        if (this.canvas.parentElement && this.canvas.parentElement.clientWidth > 0) {
            newW = this.canvas.parentElement.clientWidth;
            newH = this.canvas.parentElement.clientHeight;
        }

        this.canvas.width = newW;
        this.canvas.height = newH;
        
        if (this.spawner) {
            this.spawner.updateDimensions(newW, newH);
        }
    }

    public start() {
        this.resize(); // Force refresh dimensions in case it was display: none earlier
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    public stop() {
        this.isRunning = false;
        this.typingLogic.isKeyboardLocked = false; // reset lock
    }

    public setSpeedModifier(newSpeedMod: number) {
        this.speedModifier = newSpeedMod;
        for (let enemy of this.enemies) {
            enemy.setSpeedModifier(newSpeedMod);
        }
    }

    public clearEnemiesAndCanvas() {
        // Clean up DOM rác (if needed)
        this.enemies = [];
        this.particles = [];
        this.typingLogic.isKeyboardLocked = false;
        
        if (typeof (this.spawner as any).resetStudySession === 'function') {
            this.spawner.resetStudySession();
        }
        
        this.typingLogic.resetStats();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        

    }

    public getTypingLogic(): TypingLogic {
        return this.typingLogic;
    }

    public spawnEnemy() {
        this.spawner.spawnEnemy(this.mode, this.speedModifier);
    }

    public spawnWave() {
        if (this.mode === 'study' && this.spawner.currentStudyWave === 0) {
            this.spawner.startStudySession();
        }
        this.spawner.spawnWave(this.mode, this.speedModifier);
    }

    private createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                radius: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                life: Math.random() * 30 + 30
            });
        }
    }

    private createTextParticle(x: number, y: number, text: string, color: string) {
        this.particles.push({
            isText: true,
            text: text,
            x: x,
            y: y,
            vx: 0,
            vy: -1.5,
            radius: 0,
            color: color,
            alpha: 1,
            life: 60
        });
    }

    private loop(timestamp: number) {
        if (!this.isRunning) return;

        this.resize(); // Check and smooth resize for CSS transitions

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.spawner.update(dt, this.mode, this.speedModifier);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);



        if (this.mode !== 'chill' && this.mode !== 'easy' && !(this.mode === 'study' && this.spawner.currentStudyWave <= 4)) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(150, 0);
            this.ctx.lineTo(150, this.canvas.height);
            this.ctx.strokeStyle = "rgba(255, 0, 110, 0.6)"; 
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = "#FF006E";
            this.ctx.shadowBlur = 10;
            this.ctx.stroke();
            
            this.ctx.fillStyle = "rgba(255, 0, 110, 0.2)";
            this.ctx.fillRect(145, 0, 10, this.canvas.height); 
            this.ctx.restore();
        }

        // Đảm bảo luôn có 1 mục tiêu trong Wave 3 và Wave 5
        if (this.mode === 'study' && (this.spawner.currentStudyWave === 3 || this.spawner.currentStudyWave === 5)) {
            let activeTarget = this.enemies.find(e => e.isWave3Target && !e.isDead);
            
            if (activeTarget && activeTarget.x > this.canvas.width) {
                activeTarget.isWave3Target = false;
                activeTarget = undefined;
            }

            // Wave 3: Chọn ngẫu nhiên (Random) 1 trong số các mục tiêu đang có trên màn hình
            // Wave 5: Giữ nguyên cơ chế Lock qua bàn phím (TypingLogic xử lý)
            if (!activeTarget && this.spawner.currentStudyWave === 3) {
                let visibleTargets = this.enemies.filter(e => !e.isDead && e.mode === 'study' && e.studyWave === 3 && e.x > 0);
                if (visibleTargets.length > 0) {
                    // Chọn ngẫu nhiên hoàn toàn trong đám đang hiện diện
                    let nextTarget = visibleTargets[Math.floor(Math.random() * visibleTargets.length)];
                    nextTarget.isWave3Target = true;
                    import('../utils/EventBus').then(module => {
                        module.EventBus.getInstance().publish('TYPING_UPDATED', { buffer: "", prefix: "" });
                    });
                }
            }
        }

        // Cập nhật tọa độ di chuyển
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(this.canvas.width, this.canvas.height, dt);
        }

        // Vẽ cá thường (Layer dưới)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            if (!enemy.isWave3Target && !enemy.isLocked) {
                enemy.draw(this.ctx);
            }
        }

        // Vẽ cá mục tiêu hoặc đang khóa gõ (Layer trên cùng)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            if (enemy.isWave3Target || enemy.isLocked) {
                enemy.draw(this.ctx);
            }
        }

        // Xử lý dọn dẹp cá chết
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            
            if (enemy.isDead) {
                if (this.mode === 'easy' || this.mode === 'study') {
                    this.createExplosion(enemy.x, enemy.y, enemy.color);
                }
                
                if (this.mode === 'study' && enemy.isWeak) {
                    this.spawner.addRetryEnemy(enemy);
                }

                EventBus.getInstance().publish('ENEMY_REMOVED', enemy);
                this.enemies.splice(i, 1);
                
                if (this.enemies.length === 0) {
                    if (this.mode === 'easy') {
                        EventBus.getInstance().publish('WAVE_CLEARED', null);
                        setTimeout(() => {
                            if (this.isRunning && this.mode === 'easy') {
                                this.spawnWave();
                            }
                        }, GameConfig.timing.easyModeRespawnDelay);
                    } else if (this.mode === 'study' && this.spawner.currentStudyWave !== 5) {
                        // Nếu đang chờ Space để qua Wave mới thì không làm gì thêm
                        if (this.isWaitingForProceed) return;

                        if ((this.spawner.currentStudyWave === 1 || this.spawner.currentStudyWave === 2 || this.spawner.currentStudyWave === 4) && this.spawner.hasMoreStudyEnemies()) {
                            // Đẻ quái tiếp theo của Wave học hiện tại
                            setTimeout(() => {
                                if (this.isRunning && this.mode === 'study') {
                                    this.spawner.spawnNextStudyEnemy(this.speedModifier);
                                }
                            }, 500);
                        } else if ((this.spawner.currentStudyWave === 1 || this.spawner.currentStudyWave === 2 || this.spawner.currentStudyWave === 4) && this.spawner.hasRetryEnemies()) {
                            // Khởi động vòng lặp đền mạng Retry Phase
                            this.spawner.startRetryPhase();
                            setTimeout(() => {
                                if (this.isRunning && this.mode === 'study') {
                                    this.spawner.spawnNextStudyEnemy(this.speedModifier);
                                }
                            }, 500);
                        } else if (this.spawner.currentStudyWave === 3 && this.spawner.hasMoreStudyEnemies()) {
                            // Để Spawner.update tự xử lý đẻ đợt tiếp theo của Wave 3 (Batch mode)
                            // Không set isWaitingForProceed ở đây để luồng gõ được liên tục
                            return;
                        } else {
                            // Hết quái của Wave hiện tại -> Dừng lại chờ bấm SPACE để qua Wave tiếp theo
                            this.isWaitingForProceed = true;
                            EventBus.getInstance().publish('WAVE_CLEARED', { isWaitingManual: true });
                        }
                    }
                }
            }
        }

        if (this.mode === 'easy' || this.mode === 'study') {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                let p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 1 / p.life;
                
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
                
                this.ctx.save();
                this.ctx.globalAlpha = p.alpha;
                if (p.isText) {
                    this.ctx.font = "bold 24px 'Inter'";
                    this.ctx.fillStyle = p.color;
                    this.ctx.textAlign = "center";
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = p.color;
                    this.ctx.fillText(p.text, p.x, p.y);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    this.ctx.fillStyle = p.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = p.color;
                    this.ctx.fill();
                }
                this.ctx.restore();
            }
        }

        requestAnimationFrame((ts) => this.loop(ts));
    }

    private setupManualProceedListener() {
        EventBus.getInstance().subscribe('MANUAL_NEXT_WAVE', () => {
            if (!this.isRunning || !this.isWaitingForProceed) return;
            
            this.isWaitingForProceed = false;
            if (this.spawner.currentStudyWave < 5) {
                this.spawner.nextStudyWave();
                setTimeout(() => {
                    if (this.isRunning && this.mode === 'study') {
                        this.spawnWave();
                    }
                }, GameConfig.timing.easyModeRespawnDelay);
            }
        });
    }
}
