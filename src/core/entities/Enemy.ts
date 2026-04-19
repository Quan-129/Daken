import { Word } from './Word';
import { EventBus } from '../EventBus';
import { GameConfig } from '../../config';
import { LanguageConfig } from '../../configLanguage';

export interface StudyState {
    wave: number;
    wave4Index: number;
    revealType: 'kanji' | 'vi';
    isWeak: boolean;
    typoCount: number;
    isDebt: boolean;
    isWave3Target: boolean;
    currentHintLength: number;
    targetTypedLength: number;
    dynamicStudyOffset: number;
}

export class Enemy {
    // Basic Core Properties
    public word: Word;
    public x!: number;
    public y!: number;
    public baseSpeed!: number;
    public vx!: number;
    private vxAtSpeed1: number = 0;
    public vy: number;
    public color: string;
    public isDead: boolean = false;
    public isLocked: boolean = false;
    public baseY!: number;
    private phase: number;
    public mode: string;
    
    // Identity & Gameplay State
    public aliveTime: number = 0;
    public idleTime: number = 0;
    public isDefeated: boolean = false;
    public isSkipped: boolean = false;
    public isTruth: boolean = true;
    
    // Grouped Study State
    public study: StudyState;

    private chatBubble: HTMLElement | null = null;

    constructor(wordObj: Word, mode: string, speedMod: number, canvasWidth: number, canvasHeight: number, studyWave: number = 0) {
        this.word = wordObj;
        this.mode = mode;
        this.phase = Math.random() * Math.PI * 2;
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.vy = 0;

        // Initialize Study State
        this.study = {
            wave: studyWave,
            wave4Index: 0,
            revealType: 'kanji',
            isWeak: false,
            typoCount: 0,
            isDebt: false,
            isWave3Target: false,
            currentHintLength: 0,
            targetTypedLength: 0,
            dynamicStudyOffset: 0
        };

        this.initPositionAndVelocity(canvasWidth, canvasHeight, speedMod);
        this.baseY = this.y;
    }

    private initPositionAndVelocity(canvasWidth: number, canvasHeight: number, speedMod: number) {
        const topMargin = 150;
        const { wave } = this.study;

        // Y Position Logic
        if (this.mode === 'study' && wave === 3) {
            const laneHeight = 110;
            const startY = (canvasHeight - (laneHeight * 3)) / 2;
            const laneIndex = Math.floor(Math.random() * 4);
            this.y = startY + (laneIndex * laneHeight);
        } else {
            this.y = Math.random() * (canvasHeight - topMargin - 150) + topMargin;
        }

        // Speed Logic: Romaji càng dài di chuyển càng chậm
        const speedRange = GameConfig.speeds.baseEnemyMaxSpeed - GameConfig.speeds.baseEnemyMinSpeed;
        const rawBaseSpeed = (Math.random() * speedRange + GameConfig.speeds.baseEnemyMinSpeed);
        
        // Công thức mới: Tỉ lệ nghịch (Inverse proportional) để thấy rõ sự khác biệt
        const len = this.word.romaji.length;
        const penalty = GameConfig.speeds.romajiLengthSpeedFactor || 0.08;
        const minRatio = GameConfig.speeds.minSpeedRatio || 0.25;
        
        // factor = 1 / (1 + L * P)
        // Ví dụ: len=5, P=0.08 -> 1/1.4 = 0.71
        // len=15, P=0.08 -> 1/2.2 = 0.45
        const lengthFactor = Math.max(minRatio, 1 / (1 + (len * penalty))); 
        
        this.baseSpeed = rawBaseSpeed * lengthFactor;

        // X and VX Logic
        const isStaticMode = this.mode === 'easy' || 
                           ((this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar') && [1, 2, 4].includes(wave));

        // Áp dụng Global Speed Factor từ Config
        const globalFactor = GameConfig.speeds.globalSpeedFactor || 1.0;

        if (isStaticMode) {
            this.x = canvasWidth / 2;
            this.y = canvasHeight / 2;
            this.vx = 0;
            this.vxAtSpeed1 = 0;
        } else if (this.mode === 'chill' || ((this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar') && wave === 3)) {
            this.x = canvasWidth + Math.random() * 200;
            this.vxAtSpeed1 = -(this.baseSpeed + GameConfig.speeds.wave3SpeedBoost) * globalFactor;
            this.vx = this.vxAtSpeed1 * speedMod;
        } else {
            this.x = canvasWidth + 50;
            const isStudy = (this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar');
            const boost = (isStudy && wave === 5) ? GameConfig.speeds.wave5SpeedBoost : 0;
            this.vxAtSpeed1 = -(this.baseSpeed + boost) * globalFactor;
            this.vx = this.vxAtSpeed1 * speedMod;
        }
    }

    public update(canvasWidth: number, canvasHeight: number, dt: number = 16) {
        if (this.isDefeated || this.isDead) return;

        this.aliveTime += dt;
        // Đảm bảo tốc độ đồng nhất trên các màn hình có FPS khác nhau (60Hz, 144Hz, etc.)
        this.x += this.vx * (dt / 16.66);

        const { wave } = this.study;

        // Boundary Logic
        const isWave3 = (this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar') && wave === 3;
        if (this.mode === 'chill' || isWave3) {
            if (this.x < -250) {
                this.resetPosition(canvasWidth, canvasHeight);
            }
        } 
        else if (this.isStaticMode()) {
            this.y = this.baseY;
        }
        else if (this.x < 150) {
            this.handlePassedDeadline();
        }

        if (!this.isLocked) {
            this.idleTime += dt;
        }
    }

    private isStaticMode(): boolean {
        const isStudy = (this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar');
        return this.mode === 'easy' || (isStudy && [1, 2, 4].includes(this.study.wave));
    }

    private resetPosition(canvasWidth: number, canvasHeight: number) {
        this.x = canvasWidth + 150;
        const isWave3 = (this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar') && this.study.wave === 3;
        const topMargin = isWave3 ? 180 : 150;
        this.y = Math.random() * (canvasHeight - topMargin - 150) + topMargin;
        this.baseY = this.y;
        if (this.study.isWave3Target) {
            this.study.isWave3Target = false;
            EventBus.getInstance().publish('WAVE3_TARGET_EVADED', null);
        }
    }

    private handlePassedDeadline() {
        this.isDead = true;
        this.removeChatBubble();
        if (this.study.isWave3Target) {
            this.study.isWave3Target = false;
            EventBus.getInstance().publish('WAVE3_TARGET_EVADED', null);
        }
        EventBus.getInstance().publish('ENEMY_PASSED_DEADLINE', this);
    }

    public removeChatBubble() {
        if (this.chatBubble) {
            this.chatBubble.classList.add('fade-out');
            const target = this.chatBubble;
            setTimeout(() => target.remove(), 300);
            this.chatBubble = null;
        }
    }

    public setSpeedModifier(newSpeedMod: number) {
        if (!this.isStaticMode()) {
            this.vx = this.vxAtSpeed1 * newSpeedMod;
        }
    }

    public syncVelocityWithSpeedMod(customVxAtSpeed1: number, currentSpeedMod: number) {
        this.vxAtSpeed1 = customVxAtSpeed1;
        this.vx = this.vxAtSpeed1 * currentSpeedMod;
    }

    // --- RENDERING ZONE ---

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.isDead || (this.mode === 'study' && this.study.wave === 1)) return;
        if (this.mode === 'study' && this.study.wave === 2 && this.isDefeated) return;

        const renderParams = this.calculateRenderParams();
        
        ctx.save();
        ctx.translate(this.x, this.y + renderParams.drawOffsetY);
        
        if (this.study.isWeak && this.study.wave !== 2 && Math.random() > 0.8) {
            this.applyGlitchEffect(ctx);
        }

        this.drawPillBody(ctx, renderParams);
        this.drawTextContent(ctx, renderParams);
        this.drawOverlays(ctx, renderParams);

        ctx.restore();
    }

    private calculateRenderParams() {
        let bgAlpha = 0.9;
        let glowPulse = 1;
        let drawOffsetY = 0;
        const { wave } = this.study;

        if (this.mode === 'easy' || (this.mode === 'study' && [1, 2].includes(wave))) {
            const pulse = (Math.sin(performance.now() / 600 + this.phase) + 1) / 2;
            bgAlpha = 0.3 + pulse * 0.6;
            glowPulse = 0.4 + pulse * 1.6;
            drawOffsetY = -200;
        } else if (this.mode === 'study' && wave === 4) {
            bgAlpha = 0.8;
            glowPulse = 1.0;
        }

        let currentColor = this.getColorByState();

        const dimensions = this.calculatePillDimensions(wave);

        return { bgAlpha, glowPulse, drawOffsetY, currentColor, ...dimensions };
    }

    private getColorByState(): string {
        if (this.isDefeated) return this.isSkipped ? '#ff0000' : '#00e676';
        if (this.mode === 'study') {
            if (this.study.isDebt) return '#ff0040';
            if (this.study.isWeak && this.study.wave !== 2) return '#ff0000';
            if (this.isLocked) return '#00e676';
        }
        return this.color;
    }

    private calculatePillDimensions(wave: number) {
        if (this.mode === 'study' && wave === 4) {
            return { pillWidth: 360, pillHeight: 60, pillRadius: 12 };
        }

        // Measure text for dynamic width
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        const baseText = (this.mode === 'study' && wave === 4) 
            ? (this.word.example_jp?.match(/\[(.*?)\]/)?.[1] || this.word.visual)
            : this.word.visual;

        ctx.font = "bold 26px 'Noto Sans JP'";
        const w1 = ctx.measureText(baseText).width;
        ctx.font = "bold 20px 'Inter'";
        const w2 = ctx.measureText(this.word.vi).width;
        const w3 = ctx.measureText(this.word.romaji).width;

        let bestTextWidth = Math.max(w1, w2, w3);
        if (this.mode === 'study' && [2, 3].includes(wave)) {
            bestTextWidth = this.study.revealType === 'vi' ? w2 : w1;
        }

        return { 
            pillWidth: Math.max(130, bestTextWidth + 60), 
            pillHeight: 70, 
            pillRadius: 35 
        };
    }

    private drawPillBody(ctx: CanvasRenderingContext2D, p: any) {
        ctx.shadowBlur = (this.isLocked ? 30 : 15) * p.glowPulse;
        ctx.shadowColor = p.currentColor;
        ctx.strokeStyle = p.currentColor;
        ctx.lineWidth = 3;

        const bgFill = (this.mode === 'study' && this.study.wave === 4) 
            ? `rgba(15, 25, 40, 0.95)` 
            : `rgba(10, 20, 40, ${p.bgAlpha})`;

        ctx.fillStyle = bgFill;
        ctx.beginPath();
        ctx.roundRect(-p.pillWidth/2, -p.pillHeight/2, p.pillWidth, p.pillHeight, p.pillRadius);
        ctx.fill();
        ctx.stroke();

        if (this.study.isDebt && !this.isDefeated && this.study.wave !== 4) {
            this.drawDebtSparkle(ctx, p.pillWidth);
        }

        // Engine tail
        if (!this.isStaticMode()) {
            this.drawEngineTail(ctx, p.pillWidth, p.currentColor);
        }
    }

    private drawDebtSparkle(ctx: CanvasRenderingContext2D, width: number) {
        const speed = performance.now() / 20;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(-width/2, -35, width, 70, 35);
        ctx.setLineDash([15, 30]);
        ctx.lineDashOffset = -speed;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#fff';
        ctx.stroke();
        ctx.restore();
    }

    private drawEngineTail(ctx: CanvasRenderingContext2D, width: number, color: string) {
        ctx.beginPath();
        ctx.moveTo(width/2, -20);
        ctx.lineTo(width/2 + 30, 0);
        ctx.lineTo(width/2, 20);
        ctx.fillStyle = color;
        ctx.fill();
    }

    private drawTextContent(ctx: CanvasRenderingContext2D, p: any) {
        ctx.shadowBlur = 0;
        const { wave, revealType } = this.study;

        if (this.mode === 'study' || this.mode === 'kanji' || this.mode === 'grammar') {
            this.drawStudyText(ctx, wave, revealType);
        } else {
            this.drawSimpleText(ctx, this.word.visual, -10, "bold 26px 'Noto Sans JP'", "#fff");
            this.drawSimpleText(ctx, this.word.romaji, 20, "bold 16px 'Inter'", p.currentColor);
        }
    }

    private drawStudyText(ctx: CanvasRenderingContext2D, wave: number, revealType: string) {
        switch(wave) {
            case 1:
                this.drawSimpleText(ctx, this.word.visual, 0, "bold 28px 'Noto Sans JP'", "#fff");
                break;
            case 2:
            case 3:
            case 5:
                const isEn = LanguageConfig.current === 'en';
                const txt = revealType === 'vi' 
                    ? (isEn ? (this.word.en || this.word.vi) : this.word.vi) 
                    : this.word.visual;
                const font = revealType === 'vi' ? "bold 20px 'Inter'" : "bold 26px 'Noto Sans JP'";
                this.drawSimpleText(ctx, txt, 0, font, "#fff");
                break;
            case 4:
                this.drawWave4Grammar(ctx);
                break;
        }
    }

    private drawWave4Grammar(ctx: CanvasRenderingContext2D) {
        const match = this.word.example_jp?.match(/\[(.*?)\]/);
        const phrase = match ? match[1] : this.word.visual;
        const plainLength = phrase.replace(/<[^>]*>?/gm, '').length;
        
        let fontSize = 34;
        if (plainLength > 12) fontSize = 30;
        if (plainLength > 18) fontSize = 28;
        
        const offsetY = Math.floor(fontSize * 0.35);
        this.drawRubyText(ctx, phrase, 12, offsetY, fontSize, Math.max(12, fontSize * 0.55), "#fff", 310);
        
        if (this.study.wave4Index >= 1 && this.study.wave4Index <= 4) {
            ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
            ctx.font = "bold 18px 'Inter'";
            ctx.textAlign = "left";
            ctx.fillText(`[${this.study.wave4Index}]`, -165, 0); 
        }
    }

    private drawOverlays(ctx: CanvasRenderingContext2D, p: any) {
        if (this.mode === 'study' && [3, 5].includes(this.study.wave) && this.study.isWave3Target) {
            this.drawCrosshair(ctx, p.pillWidth);
        }
    }

    private drawCrosshair(ctx: CanvasRenderingContext2D, pillWidth: number) {
        ctx.save();
        const color = '#00f5ff';
        const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
        const scale = 1 + pulse * 0.08;
        
        ctx.scale(scale, scale);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15 + pulse * 10;
        ctx.shadowColor = color;
        
        const w = (pillWidth / 2) + 15;
        const h = 50;
        const len = 20 + pulse * 5;
        
        ctx.beginPath();
        // Corners
        ctx.moveTo(-w, -h + len); ctx.lineTo(-w, -h); ctx.lineTo(-w + len, -h);
        ctx.moveTo(w - len, -h); ctx.lineTo(w, -h); ctx.lineTo(w, -h + len);
        ctx.moveTo(w, h - len); ctx.lineTo(w, h); ctx.lineTo(w - len, h);
        ctx.moveTo(-w + len, h); ctx.lineTo(-w, h); ctx.lineTo(-w, h - len);
        ctx.stroke();
        
        ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    private applyGlitchEffect(ctx: CanvasRenderingContext2D) {
        ctx.transform(1, 0, Math.random() * 0.2, 1, Math.random() * 10 - 5, Math.random() * 10 - 5);
    }

    private drawSimpleText(ctx: CanvasRenderingContext2D, text: string, offsetY: number, font: string, fillStyle: string) {
        ctx.fillStyle = fillStyle;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, offsetY);
    }

    private drawRubyText(ctx: CanvasRenderingContext2D, htmlText: string, offsetX: number, offsetY: number, mainFontSize: number, subFontSize: number, fillStyle: string, maxWidth: number = 340) {
        let cleanHtml = htmlText.replace(/<rp>.*?<\/rp>/g, '');
        const segments: { base: string, ruby?: string, width?: number }[] = [];
        const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
        let lastIndex = 0;
        let match;

        while ((match = rubyRegex.exec(cleanHtml)) !== null) {
            if (match.index > lastIndex) segments.push({ base: cleanHtml.substring(lastIndex, match.index) });
            segments.push({ base: match[1], ruby: match[2] });
            lastIndex = rubyRegex.lastIndex;
        }
        if (lastIndex < cleanHtml.length) segments.push({ base: cleanHtml.substring(lastIndex) });

        ctx.font = `500 ${mainFontSize}px 'Noto Sans JP', sans-serif`;
        let totalWidth = 0;
        for (const seg of segments) {
            ctx.font = `500 ${mainFontSize}px 'Noto Sans JP', sans-serif`;
            const baseW = ctx.measureText(seg.base).width;
            let rubyW = 0;
            if (seg.ruby) {
                ctx.font = `500 ${subFontSize}px 'Noto Sans JP', sans-serif`;
                rubyW = ctx.measureText(seg.ruby).width;
            }
            seg.width = Math.max(baseW, rubyW) + 1;
            totalWidth += seg.width;
        }

        const scale = totalWidth > maxWidth ? maxWidth / totalWidth : 1;
        let currentX = offsetX - (totalWidth * scale) / 2;
        ctx.fillStyle = fillStyle;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        for (const seg of segments) {
            if (!seg.width) continue;
            const segW = seg.width * scale;
            const centerX = Math.round(currentX + segW / 2);
            ctx.font = `500 ${Math.floor(mainFontSize * scale)}px 'Noto Sans JP', sans-serif`;
            ctx.fillText(seg.base, centerX, Math.round(offsetY));
            if (seg.ruby) {
                ctx.font = `500 ${Math.floor(subFontSize * scale)}px 'Noto Sans JP', sans-serif`;
                ctx.fillText(seg.ruby, centerX, Math.round(offsetY - (mainFontSize * scale) * 0.85));
            }
            currentX += segW;
        }
    }
}
