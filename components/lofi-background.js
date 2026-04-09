class LofiBackground extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;  /* Cố định dính chặt vào khung màn hình */
                    top: 0; left: 0; right: 0; bottom: 0; /* Ép full 100% màn hình */
                    width: 100vw; height: 100vh;
                    z-index: -999;
                    overflow: hidden;
                    --dark-void: #0a0b16; 
                    --neon-pink: #ff758c; 
                    --neon-blue: #00c6ff; 
                    --neon-purple: #c471ed; 
                    --neon-teal: #00f2fe;
                    background-color: var(--dark-void);
                }

                #koi-pond-bg {
                    position: absolute;
                    top: -10%; left: -10%; width: 120%; height: 120%;
                    background-color: var(--dark-void);
                    background-image: 
                        radial-gradient(circle at 30% 30%, rgba(196, 113, 237, 0.15) 0%, transparent 60%),
                        radial-gradient(circle at 70% 70%, rgba(0, 198, 255, 0.15) 0%, transparent 60%),
                        url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&fit=crop');
                    background-size: cover, cover, cover;
                    background-blend-mode: screen, screen, overlay;
                    z-index: 0;
                    animation: slowDrift 60s ease-in-out infinite alternate;
                    filter: contrast(1.1) brightness(0.85);
                }

                #fish-layer {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 1; 
                    pointer-events: none;
                    overflow: hidden;
                }

                .fish {
                    position: absolute;
                    filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor);
                    opacity: 0.85; 
                    mix-blend-mode: screen;
                    transform-origin: center;
                }

                .fish svg { width: 100px; height: 250px; }
                .fish path { fill: currentColor !important; stroke: none; }
                
                .lotus {
                    position: absolute;
                    filter: drop-shadow(0 0 15px currentColor);
                    mix-blend-mode: screen;
                    opacity: 0.6;
                    animation: driftLotus 40s ease-in-out infinite alternate;
                }
                
                .tail { transform-origin: 50% 150px; animation: tailWiggle 1s ease-in-out infinite alternate; }
                .fin { transform-origin: 50% 80px; animation: finWiggle 1.5s ease-in-out infinite alternate; }

                .f1 { animation: swim1 25s linear infinite; top: -200px; left: 10%; }
                .f2 { animation: swim2 35s linear infinite; top: 110%; left: 80%; transform: rotate(180deg); }
                .f3 { animation: swim3 45s linear infinite; top: 110%; left: 30%; transform: rotate(150deg); }
                .f4 { animation: swim4 40s linear infinite; top: -200px; left: 70%; }

                .neon-water-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: radial-gradient(ellipse at 50% 100%, rgba(255, 0, 85, 0.1) 0%, transparent 50%),
                                radial-gradient(ellipse at 80% 20%, rgba(0, 240, 255, 0.1) 0%, transparent 40%);
                    mix-blend-mode: screen;
                    z-index: 2;
                    pointer-events: none;
                    animation: waterRippleGlobal 8s ease-in-out infinite alternate;
                }

                .ink-overlay {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: url('https://www.transparenttextures.com/patterns/stardust.png');
                    opacity: 0.5;
                    mix-blend-mode: overlay;
                    pointer-events: none;
                    z-index: 3;
                }

                .bamboo-branch {
                    position: absolute;
                    z-index: 25; 
                    pointer-events: none;
                }
                .bamboo-left {
                    top: -5%; left: -5%;
                    width: auto; height: 110vh; /* Cố định chiều cao theo màng hình, thả width để không méo */
                    transform-origin: top left;
                    animation: bambooSway 14s ease-in-out infinite alternate;
                }

                .fishing-boat {
                    position: absolute;
                    top: 6vh; right: 8vw; 
                    z-index: 5;
                    transform-origin: bottom center;
                    animation: boatRock 10s ease-in-out infinite alternate;
                }
                .lantern-glow {
                    position: absolute;
                    top: 25px; right: -20px;
                    width: 150px; height: 150px;
                    background: radial-gradient(circle, rgba(255,117,140,0.3) 0%, transparent 60%);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: lanternFlicker 4s infinite alternate;
                    mix-blend-mode: screen;
                }

                .duckweed {
                    position: absolute;
                    width: 35px; height: 25px;
                    background: radial-gradient(ellipse at center, rgba(16, 40, 50, 0.8) 0%, rgba(10, 20, 30, 0.5) 100%);
                    border: 1px solid rgba(0, 242, 254, 0.15);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                    box-shadow: inset 0 0 5px rgba(0, 242, 254, 0.2);
                    z-index: 3;
                    transform: scale(var(--s));
                    animation: driftLotus 30s ease-in-out infinite alternate;
                }
                .duckweed::after {
                    content:''; position:absolute; top: -5px; left: -8px; width: 18px; height: 14px;
                    background: rgba(16, 40, 50, 0.9); border-radius: 50%; border: 1px solid rgba(0, 242, 254, 0.1);
                }
                .duckweed::before {
                    content:''; position:absolute; bottom: -2px; right: -12px; width: 22px; height: 18px;
                    background: rgba(16, 40, 50, 0.85); border-radius: 50%; border: 1px solid rgba(0, 242, 254, 0.1);
                }

                .frog-character {
                    position: absolute;
                    bottom: 25%; left: 32%;
                    width: 120px; height: 100px;
                    z-index: 6;
                    transform-origin: center;
                    animation: floatLeaf 6s ease-in-out infinite alternate;
                    cursor: pointer;
                    transition: all 0.5s ease;
                    pointer-events: all;
                }
                .giant-leaf {
                    position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
                    transform: rotate(-10deg);
                    filter: drop-shadow(0 15px 20px rgba(0,0,0,0.6));
                }
                .frog {
                    position: absolute; bottom: 35px; left: 35px; width: 50px; height: 50px;
                    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .eye {
                    animation: frogBlink 5s infinite;
                    transform-origin: center;
                }
                .frog-tongue {
                    position: absolute; top: 35px; left: 25px; width: 3px; height: 0;
                    background: var(--neon-pink);
                    transform-origin: top center;
                    transform: rotate(-40deg);
                    z-index: 5;
                    border-radius: 3px;
                    animation: frogCatch 9s infinite;
                }
                .frog-character:hover .frog {
                    transform: translateY(-8px);
                }
                .frog-firefly {
                    position: absolute; top: -15px; right: -25px; width: 5px; height: 5px;
                    background: var(--neon-teal); border-radius: 50%;
                    box-shadow: 0 0 12px var(--neon-teal);
                    animation: flyAround 9s infinite alternate ease-in-out;
                    pointer-events: none;
                }

                .water-ripple {
                    position: absolute;
                    width: 25px; height: 25px;
                    border: 2px solid var(--neon-teal);
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                    pointer-events: none;
                    z-index: 2;
                    animation: rippleExpand 1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }

                @keyframes slowDrift { 0% { transform: scale(1) translate(0, 0); } 100% { transform: scale(1.05) translate(-1.5%, 1.5%); } }
                @keyframes waterRippleGlobal { 0% { opacity: 0.6; filter: hue-rotate(0deg) contrast(1.1); transform: scale(1); } 100% { opacity: 1; filter: hue-rotate(30deg) contrast(1.3); transform: scale(1.02); } }
                @keyframes tailWiggle { 0% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }
                @keyframes finWiggle { 0% { transform: scaleX(0.9); } 100% { transform: scaleX(1.1); } }
                @keyframes swim1 { 0% { transform: translate(0, 0) rotate(150deg); } 100% { transform: translate(120vw, 120vh) rotate(150deg); } }
                @keyframes swim2 { 0% { transform: translate(0, 0) rotate(340deg); } 100% { transform: translate(-120vw, -120vh) rotate(340deg); } }
                @keyframes swim3 { 0% { transform: translate(0, 0) rotate(20deg); } 100% { transform: translate(80vw, -120vh) rotate(20deg); } }
                @keyframes swim4 { 0% { transform: translate(0, 0) rotate(-40deg); } 100% { transform: translate(100vw, -100vh) rotate(-40deg); } }
                @keyframes driftLotus { 0% { transform: scale(var(--s)) rotate(-15deg) translate(0, 0); } 100% { transform: scale(var(--s)) rotate(15deg) translate(20px, -20px); } }
                @keyframes boatRock { 0% { transform: translate(0, 0) rotate(-2deg); } 100% { transform: translate(-10px, 3px) rotate(2deg); } }
                @keyframes lanternFlicker { 0% { opacity: 0.7; transform: scale(0.95); } 100% { opacity: 1.1; transform: scale(1.05); } }
                @keyframes floatLeaf { 0% { transform: translateY(0px) rotate(0deg); } 100% { transform: translateY(12px) rotate(2deg); } }
                @keyframes frogBlink { 0%, 96%, 100% { transform: scaleY(1); } 98% { transform: scaleY(0.1); } }
                @keyframes frogCatch { 0%, 22%, 26%, 100% { height: 0; opacity: 0; } 24% { height: 65px; opacity: 1; box-shadow: 0 0 10px var(--neon-pink); } }
                @keyframes flyAround { 0% { transform: translate(0, 0); } 25% { transform: translate(-30px, -40px); } 50% { transform: translate(-50px, -15px); } 75% { transform: translate(-20px, 20px); } 100% { transform: translate(15px, -25px); } }
                @keyframes rippleExpand { 100% { transform: translate(-50%, -50%) scale(12); opacity: 0; border-width: 0; } }
                @keyframes bambooSway { 0% { transform: rotate(0deg); } 100% { transform: rotate(4deg); } }

            </style>

            <div id="koi-pond-bg"></div>
            
            <div id="fish-layer">
                <div class="lotus" style="top: 15%; left: 20%; color: var(--neon-pink); --s: 0.8;">
                    <svg viewBox="0 0 100 100" width="100" height="100">
                        <path d="M50 80 C20 80, 0 50, 50 10 C100 50, 80 80, 50 80 Z" fill="currentColor" fill-opacity="0.3"/>
                        <path d="M50 80 C30 80, 20 60, 50 20 C80 60, 70 80, 50 80 Z" fill="currentColor" fill-opacity="0.5"/>
                        <path d="M50 80 C40 80, 35 70, 50 30 C65 70, 60 80, 50 80 Z" fill="currentColor" fill-opacity="0.7"/>
                    </svg>
                </div>
                <div class="lotus" style="top: 65%; left: 75%; color: var(--neon-blue); --s: 1.1;">
                    <svg viewBox="0 0 100 100" width="100" height="100">
                        <path d="M50 80 C20 80, 0 50, 50 10 C100 50, 80 80, 50 80 Z" fill="currentColor" fill-opacity="0.3"/><path d="M50 80 C30 80, 20 60, 50 20 C80 60, 70 80, 50 80 Z" fill="currentColor" fill-opacity="0.5"/><path d="M50 80 C40 80, 35 70, 50 30 C65 70, 60 80, 50 80 Z" fill="currentColor" fill-opacity="0.7"/>
                    </svg>
                </div>
                
                <div class="fish f1" style="color: var(--neon-pink);">
                    <svg viewBox="0 0 100 250">
                        <path class="tail" d="M45 150 C45 150, 20 220, 50 240 C80 220, 55 150, 55 150 Z" />
                        <path class="fin fin-l" d="M35 70 C10 90, 0 120, 25 100 Z" />
                        <path class="fin fin-r" d="M65 70 C90 90, 100 120, 75 100 Z" />
                        <path class="body" d="M50 20 C75 25, 80 80, 50 160 C20 80, 25 25, 50 20 Z" />
                    </svg>
                </div>
                <div class="fish f2" style="color: var(--neon-blue); transform: scale(0.8) rotate(180deg);">
                    <svg viewBox="0 0 100 250">
                        <path class="tail" d="M45 150 C45 150, 20 220, 50 240 C80 220, 55 150, 55 150 Z" />
                        <path class="fin fin-l" d="M35 70 C10 90, 0 120, 25 100 Z" />
                        <path class="fin fin-r" d="M65 70 C90 90, 100 120, 75 100 Z" />
                        <path class="body" d="M50 20 C75 25, 80 80, 50 160 C20 80, 25 25, 50 20 Z" />
                    </svg>
                </div>

                <div class="duckweed" style="top: 25%; left: 18%; --s: 1.2;"></div>
                <div class="duckweed" style="top: 65%; left: 12%; --s: 0.8;"></div>
                <div class="duckweed" style="top: 28%; left: 82%; --s: 1.5;"></div>

                <div class="frog-character" id="chillFrog">
                    <svg viewBox="0 0 100 100" class="giant-leaf">
                        <path d="M50 80 C10 80, 0 30, 50 10 C100 30, 90 80, 50 80 Z" fill="#0f2638" stroke="rgba(0,198,255,0.4)"/>
                        <path d="M50 80 L50 45" stroke="rgba(0,198,255,0.2)" stroke-width="1.5"/>
                    </svg>
                    <div class="frog">
                        <svg viewBox="0 0 50 50">
                            <ellipse cx="25" cy="35" rx="16" ry="11" fill="#153648" />
                            <circle cx="18" cy="26" r="4.5" fill="#153648" />
                            <circle cx="32" cy="26" r="4.5" fill="#153648" />
                            <circle cx="18" cy="26" r="1.5" fill="var(--neon-teal)" class="eye" />
                            <circle cx="32" cy="26" r="1.5" fill="var(--neon-teal)" class="eye" />
                        </svg>
                        <div class="frog-tongue"></div>
                    </div>
                    <div class="frog-firefly"></div>
                </div>

                <div class="fishing-boat">
                    <svg viewBox="0 0 200 100" width="160" height="80">
                        <path d="M10,60 Q100,95 190,60 Q150,85 50,85 Z" fill="#1b2a3a" />
                        <path d="M140,55 A16,16 0 0,0 108,55 Z" fill="#101e2b" />
                        <path d="M115,55 Q125,15 135,55 Z" fill="#101e2b" />
                        <path d="M130,35 Q60,5 15,70" stroke="#0a1220" stroke-width="2" fill="none" />
                        <line x1="15" y1="70" x2="15" y2="95" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
                        <circle cx="180" cy="40" r="10" fill="var(--neon-pink)" opacity="0.9" filter="drop-shadow(0 0 15px var(--neon-pink))" />
                        <path d="M180,30 L180,50 M175,34 L185,34 M175,46 L185,46" stroke="#0a1220" stroke-width="2"/>
                        <line x1="175" y1="58" x2="155" y2="15" stroke="#0a1220" stroke-width="4" />
                    </svg>
                    <div class="lantern-glow"></div>
                </div>
            </div>

            <div class="bamboo-branch bamboo-left">
                <!-- Xóa preserveAspectRatio="none" để giữ lại sự mềm mại thanh tú của vector, không bị kéo dãn thô cứng -->
                <svg viewBox="0 0 200 600" style="height: 100%; width: auto;">
                    <!-- Thân trúc: Trong suốt neon -->
                    <path d="M-40,0 Q20,300 -30,650" stroke="rgba(0, 242, 254, 0.05)" stroke-width="40" fill="none"/>
                    <path d="M-40,0 Q20,300 -30,650" stroke="var(--neon-teal)" stroke-width="1.5" fill="none" opacity="0.5" filter="drop-shadow(0 0 8px var(--neon-teal))"/>
                    
                    <!-- Lá trúc: Viền neon sáng, ruột trong suốt kính mờ -->
                    <path d="M-20,80 Q90,100 130,40" fill="rgba(0, 242, 254, 0.03)" stroke="var(--neon-teal)" stroke-width="1" filter="drop-shadow(0 0 5px var(--neon-teal))"/>
                    <path d="M-10,240 Q170,250 190,180" fill="rgba(255, 117, 140, 0.03)" stroke="var(--neon-pink)" stroke-width="1.5" filter="drop-shadow(0 0 8px var(--neon-pink))"/>
                    <path d="M-20,440 Q110,480 140,400" fill="rgba(196, 113, 237, 0.03)" stroke="var(--neon-purple)" stroke-width="1" filter="drop-shadow(0 0 5px var(--neon-purple))"/>
                    <path d="M-30,120 Q70,190 90,190" fill="rgba(0, 198, 255, 0.03)" stroke="var(--neon-blue)" stroke-width="1.5" filter="drop-shadow(0 0 6px var(--neon-blue))"/>
                    <path d="M-25,320 Q60,370 70,410" fill="rgba(0, 242, 254, 0.03)" stroke="var(--neon-teal)" stroke-width="1" filter="drop-shadow(0 0 5px var(--neon-teal))"/>
                </svg>
            </div>


            <div class="neon-water-overlay"></div>
            <div class="ink-overlay"></div>
        `;
    }


}

// Register the custom element
customElements.define('lofi-background', LofiBackground);
