class AvatarSeal extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['name', 'level', 'lvl', 'exp', 'image'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const name = this.getAttribute('name') || 'Tiểu Sư Muội';
        const level = this.getAttribute('level') || 'N3';
        const numLvl = this.getAttribute('lvl') || '1'; // Cấp số nguyên
        const expRaw = this.getAttribute('exp') || '0/100'; 
        const image = this.getAttribute('image') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Lucy';

        // Xử lý chuỗi EXP: "300/1000"
        let currentExp = 0;
        let maxExp = 100;
        let percentage = 0;

        try {
            const parts = expRaw.split('/');
            if (parts.length === 2) {
                currentExp = parseFloat(parts[0].trim());
                maxExp = parseFloat(parts[1].trim());
                percentage = Math.min((currentExp / maxExp) * 100, 100);
            } else {
                // Rơi vào TH fallback truyền số % thẳng
                percentage = parseFloat(expRaw);
                currentExp = percentage;
                maxExp = 100;
            }
        } catch(e) {
            percentage = 0;
            currentExp = 0;
            maxExp = 100;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    /* Khóa chết vị trí góc trên cùng bên trái màn hình */
                    position: fixed;
                    top: 25px;
                    left: 25px;
                    z-index: 2000;
                    display: inline-flex;
                    align-items: stretch;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    --pink: #ff99b3;
                    --pink-glow: rgba(255, 153, 179, 0.5);
                }

                .scroll-container {
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                /* Đường cuộn trục ngang */
                .scroll-track {
                    position: absolute;
                    left: 40px; 
                    height: 55px;
                    width: 280px; /* Nới viền thêm để chứa chữ số dài EXP */
                    background: linear-gradient(90deg, rgba(20, 25, 45, 0.65) 0%, rgba(20, 25, 45, 0.1) 100%);
                    backdrop-filter: blur(8px);
                    border-top: 1px solid rgba(255, 153, 179, 0.2);
                    border-bottom: 1px solid rgba(255, 153, 179, 0.2);
                    z-index: 1;
                    padding-left: 55px; /* Nhường chỗ cho avatar tròn */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    clip-path: polygon(0 0, 100% 10%, 100% 90%, 0 100%);
                }

                .seal-avatar {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #111;
                    border: 3px solid var(--pink);
                    box-shadow: 0 0 20px var(--pink-glow);
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .seal-avatar:hover {
                    transform: scale(1.1) rotate(5deg);
                }

                /* Lớp nền chữ bùa thư pháp chìm trong ảnh */
                .seal-avatar::after {
                    content: '封';
                    position: absolute;
                    font-size: 60px;
                    color: rgba(255, 153, 179, 0.25);
                    z-index: 1;
                    font-family: "MingLiU", serif;
                }

                .seal-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    z-index: 3;
                    mix-blend-mode: luminosity; 
                }
                
                .seal-avatar:hover img {
                    mix-blend-mode: normal;
                }

                .scroll-content {
                    transform: translateY(-2px);
                    display: flex;
                    flex-direction: column;
                }

                .title-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }

                .level {
                    font-size: 11px;
                    font-weight: bold;
                    color: #fff;
                    background: var(--pink);
                    padding: 1px 6px;
                    border-radius: 3px;
                    letter-spacing: 1px;
                    box-shadow: 0 0 5px var(--pink-glow);
                }
                
                .num-lvl {
                    font-size: 11px;
                    font-weight: bold;
                    color: rgba(255, 255, 255, 0.8);
                    background: transparent;
                    border: 1px solid rgba(255, 153, 179, 0.4);
                    padding: 0px 5px;
                    border-radius: 4px;
                    margin-left: -4px;
                }

                .name {
                    font-size: 17px;
                    font-weight: 900;
                    color: #fff;
                    letter-spacing: 1.5px;
                    text-shadow: 2px 2px 4px rgba(255, 153, 179, 0.3);
                }

                .exp-bar-wrapper {
                    margin-top: 5px;
                    width: 180px;
                    position: relative;
                }

                .exp-text {
                    position: absolute;
                    right: -35px;
                    top: -6px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.7);
                    font-family: 'Consolas', monospace;
                }

                .exp-line-bg {
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .exp-line-fill {
                    width: ${percentage}%;
                    height: 100%;
                    background: var(--pink);
                    box-shadow: 0 0 8px var(--pink);
                    position: relative;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .exp-line-fill::after {
                    content: '';
                    position: absolute;
                    right: 0; top: -1px;
                    width: 6px; height: 6px;
                    background: #fff;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #fff;
                }

            </style>

            <div class="scroll-container">
                <div class="seal-avatar">
                    <img src="${image}" alt="seal">
                </div>
                <div class="scroll-track">
                    <div class="scroll-content">
                        <div class="title-row">
                            <span class="level">${level}</span>
                            <span class="num-lvl">Lv.${numLvl}</span>
                            <span class="name">${name}</span>
                        </div>
                        <div class="exp-bar-wrapper">
                            <div class="exp-text">${currentExp}/${maxExp}</div>
                            <div class="exp-line-bg">
                                <div class="exp-line-fill"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('avatar-seal', AvatarSeal);
