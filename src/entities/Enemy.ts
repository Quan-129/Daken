import { Word } from './Word';
import { EventBus } from '../utils/EventBus';
import { GameConfig } from '../config';

export class Enemy {
    public word: Word;
    public x: number;
    public y: number;
    public baseSpeed: number;
    public vx: number;
    public vy: number;
    public color: string;
    public isDead: boolean;
    public isLocked: boolean = false;
    public baseY: number;
    private phase: number;
    public mode: string;
    public isWave3Target: boolean = false;
    public isTruth: boolean = true;
    
    // Thuộc tính Study Mode
    public studyWave: number;
    public wave4Index: number = 0; // Trỏ phím 1,2,3,4 cho Wave 4
    public revealType: 'kanji' | 'vi' = 'kanji';
    public aliveTime: number = 0;
    public isWeak: boolean = false;
    public typoCount: number = 0;
    private chatBubble: HTMLElement | null = null;
    public currentHintLength: number = 0;
    public targetTypedLength: number = 0; // Số ký tự đã gõ để biết đang bí
    public dynamicStudyOffset: number = 0; // Thay đổi độ cao theo UI Chat box
    public idleTime: number = 0;
    public isDefeated: boolean = false;
    public isSkipped: boolean = false;
    public isDebt: boolean = false;
    public defeatTimer: number = 0;


    constructor(wordObj: Word, mode: string, speedMod: number, canvasWidth: number, canvasHeight: number, studyWave: number = 0) {
        this.word = wordObj;
        this.mode = mode;
        this.studyWave = studyWave;
        let topMargin = 150;
        if (mode === 'study' && studyWave === 3) {
            const laneHeight = 110;
            const startY = (canvasHeight - (laneHeight * 3)) / 2;
            const laneIndex = Math.floor(Math.random() * 4);
            this.y = startY + (laneIndex * laneHeight);
        } else {
            this.y = Math.random() * (canvasHeight - topMargin - 150) + topMargin;
        }
        
        const speedRange = GameConfig.speeds.baseEnemyMaxSpeed - GameConfig.speeds.baseEnemyMinSpeed;
        this.baseSpeed = (Math.random() * speedRange + GameConfig.speeds.baseEnemyMinSpeed);
        
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.isDead = false;
        
        this.vy = 0; 
        this.baseY = this.y;
        this.phase = Math.random() * Math.PI * 2;

        if (mode === 'easy' || (mode === 'study' && (studyWave === 1 || studyWave === 2 || studyWave === 4))) {
            this.x = canvasWidth / 2;
            this.y = canvasHeight / 2;
            this.baseY = this.y;
            this.vx = 0;
        } else if (mode === 'chill' || (mode === 'study' && studyWave === 3)) {
            this.x = canvasWidth + Math.random() * 200;
            this.vx = -(this.baseSpeed + GameConfig.speeds.wave3SpeedBoost) * speedMod; 
        } else {
            // bao gồm cả study wave 5
            this.x = canvasWidth + 50; 
            this.vx = -this.baseSpeed * speedMod;
            if (mode === 'study' && studyWave === 5) {
                this.vx = -(this.baseSpeed + GameConfig.speeds.wave5SpeedBoost) * speedMod;
            }
        }
    }

    public update(canvasWidth: number, canvasHeight: number, dt: number = 16) {
        if (this.isDefeated) {
            return; // Đứng yên, không cập nhật logic di chuyển hay 4s luật nữa.
        }
        if (this.isDead) return;
        
        this.aliveTime += dt;
        this.x += this.vx;
        
        if (this.mode === 'chill' || (this.mode === 'study' && this.studyWave === 3)) {
            if (this.x < -250) { // dời xa chút vì khung dynamic có thể dài
                this.x = canvasWidth + 150;
                let topMargin = (this.mode === 'study' && this.studyWave === 3) ? 180 : 150;
                this.y = Math.random() * (canvasHeight - topMargin - 150) + topMargin; 
                this.baseY = this.y;
                if (this.isWave3Target) {
                    this.isWave3Target = false;
                    EventBus.getInstance().publish('WAVE3_TARGET_EVADED', null);
                }
            }
        } 
        else if (this.mode === 'easy' || (this.mode === 'study' && (this.studyWave === 1 || this.studyWave === 2 || this.studyWave === 4))) {
            // Không dời tọa độ (giữ im)
            this.y = this.baseY;
        }
        else if (this.x < 150) { 
            this.isDead = true;
            this.removeChatBubble();
            if (this.isWave3Target) {
                this.isWave3Target = false;
                EventBus.getInstance().publish('WAVE3_TARGET_EVADED', null);
            }
            EventBus.getInstance().publish('ENEMY_PASSED_DEADLINE', this);
        }

        // Cập nhật toạ độ Chat Bubble nếu có
        // Đã chuyển phần cập nhật lên draw() để đồng bộ khung hình
        
        // --- Cập nhật Idle Time ---
        if (!this.isLocked) {
            this.idleTime += dt;
        }
    }

    public removeChatBubble() {
        if (this.chatBubble) {
            this.chatBubble.classList.add('fade-out');
            setTimeout(() => {
                this.chatBubble?.remove();
            }, 300); // Đợi animation CSS 0.3s
            this.chatBubble = null;
        }
    }

    public setSpeedModifier(newSpeedMod: number) {
        if (this.mode !== 'easy' && !(this.mode === 'study' && (this.studyWave === 1 || this.studyWave === 2 || this.studyWave === 4))) {
            this.vx = -this.baseSpeed * newSpeedMod;
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        if (this.isDead) return;

        if (this.mode === 'study' && this.studyWave === 2 && this.isDefeated) {
            return; // Ẩn viên thuốc, không vẽ gì lên Canvas nữa
        }
        
        // Ẩn hoàn toàn hình vẽ Enemy trong Wave 1 theo yêu cầu (chỉ dùng thẻ Terminal)
        if (this.mode === 'study' && this.studyWave === 1) return;

        let bgAlpha = 0.9;
        let glowPulse = 1;
        let drawOffsetY = 0;
        
        if (this.mode === 'easy' || (this.mode === 'study' && (this.studyWave === 1 || this.studyWave === 2))) {
            let pulse = (Math.sin(performance.now() / 600 + this.phase) + 1) / 2;
            bgAlpha = 0.3 + pulse * 0.6;
            glowPulse = 0.4 + pulse * 1.6;
            drawOffsetY = -200; // Đẩy viên thuốc lên cao hơn để nhường chỗ cho Chat frame bên dưới
        } else if (this.mode === 'study' && this.studyWave === 4) {
            bgAlpha = 0.8;
            glowPulse = 1.0;
            drawOffsetY = 0; // Giữ nguyên tọa độ grid 2x2 do Spawner phân bổ
        }

        ctx.save();
        ctx.translate(this.x, this.y + drawOffsetY);

        // Màu sắc tổng thể
        let currentColor = this.color;

        if (this.isDefeated) {
            currentColor = this.isSkipped ? '#ff0000' : '#00e676'; // Màu đỏ/xanh báo hiệu fail hay pass
            glowPulse = 1.5;
        } else if (this.mode === 'study') {
            if (this.isDebt) {
                currentColor = '#ff0040'; // Đỏ rực nợ nần
            } else if (this.isWeak) {
                if (this.studyWave !== 2) {
                    currentColor = '#ff0000'; // Glitch red
                    // Filter glitch nhanh
                    if (Math.random() > 0.8) {
                        ctx.transform(1, 0, Math.random() * 0.2, 1, Math.random() * 10 - 5, Math.random() * 10 - 5);
                        currentColor = '#ffbe0b';
                    }
                }
            } else if (this.isLocked) {
                currentColor = '#00e676'; // Safe green
            }
        }

        if (this.isLocked) {
            ctx.shadowBlur = 30 * glowPulse;
            ctx.shadowColor = currentColor;
            ctx.strokeStyle = currentColor;
        } else {
            ctx.shadowBlur = 15 * glowPulse;
            ctx.shadowColor = currentColor;
            ctx.strokeStyle = currentColor;
        }
        

        // --- Calculate Dynamic Pill Width ---
        let baseTextForMeasurement = this.word.visual;
        if (this.mode === 'study' && this.studyWave === 4) {
             let match = this.word.example_jp?.match(/\[(.*?)\]/);
             baseTextForMeasurement = match ? match[1].replace(/<[^>]*>?/gm, '') : this.word.visual;
        }
        
        // Tự giảm size chữ nếu cụm ngữ pháp quá dài giống như lúc vẽ
        let testFontSize = 26;
        if (this.mode === 'study' && this.studyWave === 4) {
            testFontSize = 24;
            if (baseTextForMeasurement.length > 8) testFontSize = 18;
            if (baseTextForMeasurement.length > 15) testFontSize = 14;
        }

        ctx.font = `bold ${testFontSize}px 'Noto Sans JP'`;
        let w1 = ctx.measureText(baseTextForMeasurement).width;
        ctx.font = "bold 20px 'Inter'";
        let w2 = ctx.measureText(this.word.vi).width;
        let w3 = ctx.measureText(this.word.romaji).width;
        
        let bestTextWidth = 0;
        if (this.mode === 'study' && (this.studyWave === 2 || this.studyWave === 3)) {
            bestTextWidth = this.revealType === 'vi' ? w2 : w1;
        } else if (this.mode === 'study' && this.studyWave === 4) {
            bestTextWidth = Math.max(w1, w3); // Bỏ qua w2 (Tiếng Việt)
        } else {
            bestTextWidth = Math.max(w1, w2, w3);
        }
        let pillWidth = Math.max(130, bestTextWidth + 60); // Nới margin 2 bên để không bị cấn
        let pillHeight = 70;
        let pillRadius = 35;
        let bgFill = `rgba(10, 20, 40, ${bgAlpha})`;

        if (this.mode === 'study' && this.studyWave === 4) {
            pillWidth = 360; // Ngang cố định đều nhau
            pillHeight = 60; // Thấp xuống một chút vì không còn dưới bottom romaji
            pillRadius = 12; // Hình chữ nhật bo góc mềm giống Flashcard
            bgFill = `rgba(15, 25, 40, 0.95)`; // Màu nền đặc hơn, đỡ trong suốt mờ mờ
            ctx.shadowBlur = this.isLocked ? 15 : 4; // Giảm độ nhòe viền neon
        }

        // Drone/Fish Body
        ctx.fillStyle = bgFill;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-pillWidth/2, -pillHeight/2, pillWidth, pillHeight, pillRadius);
        ctx.fill();
        ctx.stroke();
        
        if (this.mode === 'study' && this.isDebt && !this.isDefeated) {
            // Hiệu ứng kim tuyến viền xung quanh cá nợ
            let speed = performance.now() / 20;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(-pillWidth/2, -35, pillWidth, 70, 35);
            ctx.setLineDash([15, 30]);
            ctx.lineDashOffset = -speed;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';
            ctx.stroke();
            ctx.restore();
        }
        
        // Engine tail
        if (!(this.mode === 'easy' || (this.mode === 'study' && (this.studyWave === 1 || this.studyWave === 2 || this.studyWave === 4)))) {
            ctx.beginPath();
            ctx.moveTo(pillWidth/2, -20);
            ctx.lineTo(pillWidth/2 + 30, 0);
            ctx.lineTo(pillWidth/2, 20);
            ctx.fillStyle = currentColor;
            ctx.fill();
        }

        // --- Vẽ Crosshair cho mục tiêu Wave 3 ---
        // Đặt ở đây để vẽ đè lên trên thân cá
        if (this.mode === 'study' && (this.studyWave === 3 || this.studyWave === 5) && this.isWave3Target && !this.isDead) {
            ctx.save();
            let crosshairColor = '#00f5ff'; // Xanh Neon
            let crossPulse = (Math.sin(performance.now() / 150) + 1) / 2; // Chớp nhanh
            let scale = 1 + crossPulse * 0.08; // Phóng to thu nhỏ nhẹ (nhịp đập)
            
            ctx.translate(0, 0); // Vẫn đang ở tâm enemy
            ctx.scale(scale, scale);
            ctx.strokeStyle = crosshairColor;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 15 + crossPulse * 10;
            ctx.shadowColor = crosshairColor;
            
            // Camera Viewfinder Box (4 góc)
            let w = (pillWidth / 2) + 15;
            let h = 35 + 15;
            let cornerLen = 20 + crossPulse * 5; // Độ dài nhánh góc thụt thò
            
            ctx.beginPath();
            // Góc trên trái
            ctx.moveTo(-w, -h + cornerLen);
            ctx.lineTo(-w, -h);
            ctx.lineTo(-w + cornerLen, -h);
            // Góc trên phải
            ctx.moveTo(w - cornerLen, -h);
            ctx.lineTo(w, -h);
            ctx.lineTo(w, -h + cornerLen);
            // Góc dưới phải
            ctx.moveTo(w, h - cornerLen);
            ctx.lineTo(w, h);
            ctx.lineTo(w - cornerLen, h);
            // Góc dưới trái
            ctx.moveTo(-w + cornerLen, h);
            ctx.lineTo(-w, h);
            ctx.lineTo(-w, h - cornerLen);
            
            ctx.stroke();
            
            // Canh thêm 1 chấm đỏ/xanh giữa thân hoặc điểm chớp nhoáng (Optionally)
            ctx.fillStyle = "rgba(0, 245, 255, 0.4)";
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

        ctx.shadowBlur = 0;
        
        // --- RENDERING FADING CUES FOR STUDY MODE ---

        if (this.mode === 'study') {
            switch(this.studyWave) {
                case 1:
                    // Wave 1: Hiện chữ nhưng data nằm hoàn toàn trên HUD Terminal.
                    this.drawText(ctx, this.word.visual, 0, "bold 28px 'Noto Sans JP'", "#fff"); // Only Kanji
                    break;
                case 2:
                    // Wave 2: Không còn nhắc tuồng sau 4s. Hiển thị Random thuận lợi Kanji hoặc Việt
                    if (this.revealType === 'vi') {
                        this.drawText(ctx, this.word.vi, 0, "bold 20px 'Inter'", "#fff");
                    } else {
                        this.drawText(ctx, this.word.visual, 0, "bold 26px 'Noto Sans JP'", "#fff");
                    }
                    break;
                case 3:
                case 5:
                    // Wave 3 & 5: Bể cá lộn xộn (Chỉ hiện Kanji HOẶC Việt giống Wave 2)
                    if (this.revealType === 'vi') {
                        this.drawText(ctx, this.word.vi, 0, "bold 20px 'Inter'", "#fff");
                    } else {
                        this.drawText(ctx, this.word.visual, 0, "bold 26px 'Noto Sans JP'", "#fff");
                    }
                    break;
                case 4: {
                    // Extract cụm từ ngữ pháp trong [ ]
                    let match = this.word.example_jp?.match(/\[(.*?)\]/);
                    let grammarPhraseHtml = match ? match[1] : this.word.visual;
                    let plainLength = grammarPhraseHtml.replace(/<[^>]*>?/gm, '').length;
                    
                    // Nâng hẳn font mặc định siêu to để có bị Scale xuống vẫn còn to đùng
                    let fontSize = 34; // Max font size cho các cụm từ ngắn
                    if (plainLength > 12) fontSize = 30; // Nếu dài hơn chút thì hạ max xuống xíu để đỡ lố
                    if (plainLength > 18) fontSize = 28;
                    
                    // Kéo offset Y sâu hơn vì furigana chiếm không gian khá dày ở mặt trên thẻ
                    let offsetBaseY = Math.floor(fontSize * 0.35);
                    
                    // Vẽ text kèm Furigana, với font nét mỏng và lấp trọn bộ chiều rộng 310px (nhường 30px mép trái cho số)
                    this.drawRubyText(ctx, grammarPhraseHtml, 12, offsetBaseY, fontSize, Math.max(12, fontSize * 0.55), "#fff", 310);
                    
                    // KHÔNG VẼ ROMAJI NỮA: Ép người chơi phải nhớ mapping theo ngữ cảnh (Nhìn mặt chữ/furigana tự gõ romaji)
                    
                    // --- MỚI: Hiển thị phím bấm nhanh 1, 2, 3, 4 ở mép trái thẻ ---
                    if (this.wave4Index >= 1 && this.wave4Index <= 4) {
                        ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
                        ctx.font = "bold 18px 'Inter'";
                        ctx.textAlign = "left";
                        ctx.fillText(`[${this.wave4Index}]`, -165, 0); 
                    }
                    
                    break;
                }

            }
        } 
        else {
            // Normal behavior
            this.drawText(ctx, this.word.visual, -10, "bold 26px 'Noto Sans JP'", "#fff");
            this.drawText(ctx, this.word.romaji, 20, "bold 16px 'Inter'", currentColor);
        }

        ctx.restore();
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string, offsetY: number, font: string, fillStyle: string) {
        ctx.fillStyle = fillStyle;
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, offsetY);
    }

    private drawRubyText(ctx: CanvasRenderingContext2D, htmlText: string, offsetX: number, offsetY: number, mainFontSize: number, subFontSize: number, fillStyle: string, maxWidth: number = 340) {
        // Loại bỏ <rp> nếu có để dễ parse
        let cleanHtml = htmlText.replace(/<rp>.*?<\/rp>/g, '');
        
        const segments: { base: string, ruby?: string, width?: number }[] = [];
        const rubyRegex = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
        let lastIndex = 0;
        let match;

        while ((match = rubyRegex.exec(cleanHtml)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ base: cleanHtml.substring(lastIndex, match.index) });
            }
            segments.push({ base: match[1], ruby: match[2] });
            lastIndex = rubyRegex.lastIndex;
        }
        if (lastIndex < cleanHtml.length) {
            segments.push({ base: cleanHtml.substring(lastIndex) });
        }

        ctx.font = `500 ${mainFontSize}px 'Noto Sans JP', sans-serif`;
        
        let totalWidth = 0;
        for (const seg of segments) {
            ctx.font = `500 ${mainFontSize}px 'Noto Sans JP', sans-serif`;
            let baseWidth = ctx.measureText(seg.base).width;
            
            let rubyWidth = 0;
            if (seg.ruby) {
                // Bỏ in đậm ở Furigana để nét chữ nhỏ mỏng hơn, không bị bết thành 1 cục đen mờ
                ctx.font = `500 ${subFontSize}px 'Noto Sans JP', sans-serif`;
                rubyWidth = ctx.measureText(seg.ruby).width;
            }
            
            // Lấy chiều ngang lớn nhất giữa chữ gốc và furigana để không bị đè dính nét
            seg.width = Math.max(baseWidth, rubyWidth) + 1; // nới tí tẹo letter spacing
            totalWidth += seg.width;
        }

        // --- NEW: Tự động co lún font nếu totalWidth vô tình vẫn lớn hơn kích thước khung (max width 340) ---
        let scale = 1;
        if (totalWidth > maxWidth) {
            scale = maxWidth / totalWidth;
        }

        let currentX = offsetX - (totalWidth * scale) / 2;
        ctx.fillStyle = fillStyle;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        // Làm tròn offsetY để Pixel render trên line chuẩn, giảm mờ viền (anti-aliasing mờ)
        const roundY = Math.round(offsetY);

        for (const seg of segments) {
            if (!seg.width) continue;
            let currentSegWidth = seg.width * scale;
            let centerX = Math.round(currentX + currentSegWidth / 2); // Làm tròn X
            
            ctx.font = `500 ${Math.floor(mainFontSize * scale)}px 'Noto Sans JP', sans-serif`;
            ctx.fillText(seg.base, centerX, roundY);

            if (seg.ruby) {
                ctx.font = `500 ${Math.floor(subFontSize * scale)}px 'Noto Sans JP', sans-serif`;
                // Đẩy Furigana lên cao 1 xíu tương xứng với font size
                ctx.fillText(seg.ruby, centerX, Math.round(roundY - (mainFontSize * scale) * 0.85));
            }
            
            currentX += currentSegWidth;
        }
    }

}
