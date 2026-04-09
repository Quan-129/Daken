class GameMenu extends HTMLElement {
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
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1000;
                    display: block;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .menu-container {
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    position: relative;
                    width: 380px; 
                    height: 380px;
                    border-radius: 190px;
                    background: transparent;
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden; /* Hide menu while collapsed */
                    margin: 0 auto;
                }

                .menu-container:hover {
                    width: 850px;
                }

                /* --- LEFT: LOGO CIRCLE --- */
                .logo-wrapper {
                    position: absolute;
                    left: 40px;
                    width: 300px;
                    height: 300px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-shrink: 0;
                }

                .logo-circle {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #ff99b3, #ff758c);
                    box-shadow: 
                        0 0 40px rgba(255, 117, 140, 0.4),
                        inset 0 0 20px rgba(255, 255, 255, 0.5);
                    opacity: 0.9;
                    animation: pulseGlow 4s ease-in-out infinite alternate;
                }

                /* Soft dashed rings around the circle */
                .logo-ring-1, .logo-ring-2 {
                    position: absolute;
                    top: 50%; left: 50%;
                    border-radius: 50%;
                    border: 2px dashed rgba(255, 255, 255, 0.2);
                }
                .logo-ring-1 {
                    width: 110%;
                    height: 110%;
                    animation: spin 30s linear infinite;
                }
                .logo-ring-2 {
                    width: 125%;
                    height: 125%;
                    border: 1px dashed rgba(140, 232, 255, 0.3);
                    animation: spin-reverse 40s linear infinite;
                }

                .logo-text {
                    position: relative;
                    font-family: 'Arial Black', sans-serif;
                    font-size: 50px;
                    font-weight: 900;
                    color: white;
                    letter-spacing: 4px;
                    text-shadow: 0 4px 15px rgba(255, 117, 140, 0.6);
                    z-index: 10;
                }

                @keyframes pulseGlow {
                    0% { transform: scale(0.95); box-shadow: 0 0 40px rgba(255, 117, 140, 0.4); }
                    100% { transform: scale(1.02); box-shadow: 0 0 60px rgba(255, 117, 140, 0.7); }
                }
                @keyframes spin { 
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(360deg); } 
                }
                @keyframes spin-reverse { 
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    100% { transform: translate(-50%, -50%) rotate(-360deg); } 
                }


                /* --- RIGHT: MENU BUTTONS --- */
                .menu-list {
                    position: absolute;
                    left: 390px;
                    width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    
                    /* Hidden state */
                    opacity: 0;
                    transform: translateX(-50px);
                    pointer-events: none;
                    transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .menu-container:hover .menu-list {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                    transition-delay: 0.15s;
                }

                .menu-item {
                    position: relative;
                    padding: 20px 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                /* Lofi glass styling */
                .menu-item::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: inherit;
                    backdrop-filter: blur(10px);
                    z-index: -1;
                }

                /* The mode variants */
                .mode-1 { --theme-color: #8ce8ff; } /* Soft Cyan */
                .mode-2 { --theme-color: #d8b4e2; } /* Soft Purple */
                .mode-3 { --theme-color: #a7f3d0; } /* Soft Green */

                .menu-item:hover {
                    transform: translateX(-15px) scale(1.02);
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--theme-color);
                    box-shadow: -10px 10px 25px rgba(0,0,0,0.2), 
                                0 0 15px rgba(255, 255, 255, 0.05) inset;
                }

                /* Subtle glowing accent line on the left */
                .menu-item::after {
                    content: '';
                    position: absolute;
                    top: 15%; left: 0;
                    width: 4px;
                    height: 70%;
                    background: var(--theme-color);
                    border-radius: 0 4px 4px 0;
                    opacity: 0.5;
                    transition: opacity 0.3s, height 0.3s, top 0.3s;
                }
                .menu-item:hover::after {
                    opacity: 1;
                    top: 0;
                    height: 100%;
                    box-shadow: 0 0 15px var(--theme-color);
                }

                .item-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--theme-color);
                    letter-spacing: 1.5px;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: text-shadow 0.3s;
                }

                .item-number {
                    background: rgba(255,255,255,0.1);
                    padding: 2px 10px;
                    border-radius: 8px;
                    font-size: 16px;
                    color: white;
                }

                .menu-item:hover .item-title {
                    text-shadow: 0 0 10px var(--theme-color);
                }
                
                .menu-item:hover .item-number {
                    background: var(--theme-color);
                    color: rgba(20, 25, 45, 1);
                    box-shadow: 0 0 10px var(--theme-color);
                }

                .item-desc {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .menu-container {
                        flex-direction: column;
                        padding: 30px 20px;
                    }
                    .logo-wrapper {
                        width: 200px;
                        height: 200px;
                    }
                    .logo-text {
                        font-size: 36px;
                    }
                }
            </style>

            <div class="menu-container">
                <!-- Vùng Logo Tròn -->
                <div class="logo-wrapper">
                    <div class="logo-ring-2"></div>
                    <div class="logo-ring-1"></div>
                    <div class="logo-circle"></div>
                    <div class="logo-text">DAKEN!</div>
                </div>

                <!-- Danh sách Menu -->
                <div class="menu-list">
                    
                    <div class="menu-item mode-1">
                        <div class="item-title">
                            <span class="item-number">1</span>
                            STUDY MODE
                        </div>
                        <div class="item-desc">STRUCTURED NEURAL UPLOAD & DATA PARSING</div>
                    </div>

                    <div class="menu-item mode-2">
                        <div class="item-title">
                            <span class="item-number">2</span>
                            PRACTICE
                        </div>
                        <div class="item-desc">COMBAT SIMULATOR & RETRY QUEUE</div>
                    </div>

                    <div class="menu-item mode-3">
                        <div class="item-title">
                            <span class="item-number">3</span>
                            FREE MODE
                        </div>
                        <div class="item-desc">ENDLESS ARCADE SURVIVAL PROTOCOL</div>
                    </div>

                </div>
            </div>
        `;
    }
}

customElements.define('game-menu', GameMenu);
