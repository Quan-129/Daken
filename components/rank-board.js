class RankBoard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupDropdown();
    }

    setupDropdown() {
        // Javascript nội bộ Component để đóng mở Menu thả xuống
        const box = this.shadowRoot.querySelector('.dropdown-box');
        const menu = this.shadowRoot.querySelector('.dropdown-menu');
        const textSpan = box.querySelector('span');
        
        // Mở/Đóng khi click vào nút
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('show');
            box.classList.toggle('active');
        });

        // Click vào các mục để chọn
        const items = this.shadowRoot.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // Đổi chữ
                textSpan.innerText = item.innerText;
                // Đóng menu
                menu.classList.remove('show');
                box.classList.remove('active');
                
                // Ở đây sau này có thể fire custom Event để thông báo ra ngoài Web Component
                this.dispatchEvent(new CustomEvent('rank-changed', {
                    detail: { type: item.dataset.type },
                    bubbles: true,
                    composed: true
                }));
            });
        });

        // Click ra ngoài thì đóng
        document.addEventListener('click', () => {
            menu.classList.remove('show');
            box.classList.remove('active');
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 130px;
                    left: 25px;
                    bottom: 270px; /* Bảo vệ khoảng trống an toàn cho Side Banner */
                    z-index: 1500;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    --bg-dark: rgba(20, 25, 45, 0.45);
                    --bg-panel: rgba(30, 35, 55, 0.55);
                    --border-cyan: #8ce8ff;
                    --text-gray: #b8c0d6;
                    --text-pink: #ffa8c0;
                    --grade-s: #ffd700;
                    --grade-a: #00ff41;
                    --grade-b: #00e5ff;
                    
                    /* Box colors for ranks */
                    --p2-bg: #1c3c24;
                    --p3-bg: #2b2b4e;
                    --p4-bg: #4a2118;
                    --p5-bg: #5a3c10;
                    --p6-bg: #1c3d3f;
                }

                .leaderboard-container {
                    width: 320px;
                    height: 100%;
                    background-color: var(--bg-dark);
                    border: 1px solid rgba(140, 232, 255, 0.2);
                    border-left: 3px solid var(--border-cyan);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                    backdrop-filter: blur(12px);
                }

                /* --- HEADER / DROPDOWN --- */
                .header-section {
                    padding: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(140, 232, 255, 0.2);
                    background-color: transparent;
                    position: relative; /* Để cho dropdown menu bám vào */
                }

                .dropdown-container {
                    position: relative;
                }

                .dropdown-box {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(140, 232, 255, 0.3);
                    border-radius: 8px;
                    padding: 6px 12px;
                    color: white;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    width: 150px;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                }

                .dropdown-box:hover, .dropdown-box.active {
                    background: rgba(140, 232, 255, 0.15);
                    border-color: var(--border-cyan);
                    box-shadow: 0 0 15px rgba(140, 232, 255, 0.2);
                }

                .dropdown-box span {
                    letter-spacing: 0.5px;
                }
                
                /* Icon xoay mũi tên khi mở menu */
                .dropdown-box svg {
                    transition: transform 0.3s ease;
                }
                .dropdown-box.active svg {
                    transform: rotate(180deg);
                }

                /* MENU THẢ XUỐNG BÊN DƯỚI */
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 5px);
                    left: 0;
                    width: 170px;
                    background: rgba(30, 35, 55, 0.85);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(140, 232, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                    z-index: 10;
                    overflow: hidden;
                }

                .dropdown-menu.show {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .dropdown-item {
                    padding: 10px 15px;
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    letter-spacing: 0.5px;
                    transition: background 0.2s, color 0.2s;
                }

                .dropdown-item:hover {
                    background: rgba(0, 229, 255, 0.1);
                    color: var(--border-cyan);
                }
                
                .dropdown-item:not(:last-child) {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .chat-icon {
                    width: 18px;
                    height: 18px;
                    background: #fff;
                    border-radius: 50%;
                    border-bottom-right-radius: 2px; /* Dáng bong bóng chat */
                    cursor: pointer;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .chat-icon:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 8px #fff;
                }

                /* --- DANH SÁCH RANK --- */
                .list-container {
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1; /* Chiếm toàn bộ khoảng trống còn lại giữa Header và Footer */
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                /* Thanh cuộn (Scrollbar) Cyberpunk */
                .list-container::-webkit-scrollbar {
                    width: 4px; /* Thanh cuộn mảnh khảnh */
                }
                .list-container::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                .list-container::-webkit-scrollbar-thumb {
                    background: rgba(255, 168, 192, 0.5);
                    border-radius: 4px;
                }
                .list-container::-webkit-scrollbar-thumb:hover {
                    background: var(--border-cyan); /* Rê chuột vào vệt cuộn đổi màu sáng */
                }

                .rank-row {
                    display: flex;
                    align-items: center;
                    padding: 10px 15px;
                    background-color: transparent;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: background-color 0.2s, padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }

                .rank-row:nth-child(even) {
                    background-color: rgba(255,255,255,0.02);
                }

                .rank-row:hover, .personal-row:hover {
                    background-color: rgba(0, 229, 255, 0.08); /* Chuyển nền xanh lấp lánh */
                    padding-left: 20px; /* Hiệu ứng "hút" trượt sang phải */
                }

                /* Box hạng (P2, P3...) */
                .rank-box {
                    width: 35px;
                    height: 35px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 800;
                    color: rgba(255,255,255,0.9);
                    margin-right: 12px;
                    transition: transform 0.3s ease, filter 0.3s ease;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                }
                
                .rank-row:hover .rank-box, .personal-row:hover .pb-icon-box {
                    transform: scale(1.05);
                    filter: brightness(1.2);
                }
                .rb-2 { background-color: var(--p2-bg); }
                .rb-3 { background-color: var(--p3-bg); }
                .rb-4 { background-color: var(--p4-bg); }
                .rb-5 { background-color: var(--p5-bg); }
                .rb-6 { background-color: var(--p6-bg); }

                /* Graphic Xếp loại: S, A, B */
                .grade {
                    font-family: 'Arial Black', sans-serif;
                    font-size: 24px;
                    font-weight: 900;
                    margin-right: 15px;
                    text-shadow: 0 0 10px currentColor; /* Phát sáng theo màu chữ */
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), text-shadow 0.2s;
                }
                .gr-s { color: var(--grade-s); }
                .gr-a { color: var(--grade-a); }
                .gr-b { color: var(--grade-b); }

                .rank-row:hover .grade, .personal-row:hover .grade {
                    transform: scale(1.15) rotate(5deg);
                    text-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
                }

                /* Khối Thông tin Tên & Điểm */
                .info-col {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .player-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                    transition: color 0.2s;
                }

                .rank-row:hover .player-name {
                    color: var(--border-cyan); /* Hover thì tên đổi màu Neon */
                }

                .player-score {
                    font-size: 11px;
                    color: var(--text-gray);
                }
                .player-score span.hl {
                    color: var(--border-cyan);
                    font-weight: bold;
                    transition: text-shadow 0.2s;
                }
                .rank-row:hover .player-score span.hl {
                    text-shadow: 0 0 8px var(--border-cyan);
                }

                /* Khối Cột phải (Mode + Tỉ lệ) */
                .stats-col {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .mode-tag {
                    font-size: 10px;
                    font-weight: 800;
                    color: var(--text-pink);
                    letter-spacing: 1px;
                    margin-bottom: 2px;
                }

                .acc-text {
                    font-size: 16px;
                    font-weight: 700;
                    color: white;
                    font-family: 'Consolas', monospace; /* Kiểu chữ gõ code / số liệu */
                    transition: color 0.2s, transform 0.2s;
                }
                
                .rank-row:hover .acc-text, .personal-row:hover .acc-text {
                    color: var(--grade-a);
                    transform: scale(1.05); /* Phóng to nhẹ % tỉ lệ */
                }

                /* --- VÙNG PERSONAL BEST --- */
                .personal-best-divider {
                    background-color: #3b1b36; /* Màu dải ngang */
                    color: white;
                    text-align: center;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    padding: 8px 0;
                    border-top: 1px solid var(--text-pink);
                }

                .personal-row {
                    background-color: var(--bg-dark);
                    padding: 12px 15px;
                    display: flex;
                    align-items: center;
                    transition: background-color 0.2s, padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }

                .pb-icon-box {
                    width: 35px;
                    height: 35px;
                    background-color: var(--border-cyan);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 4px;
                    margin-right: 12px;
                    transition: transform 0.3s ease, filter 0.3s ease;
                }
                
                .pb-icon-box svg {
                    width: 20px;
                    height: 20px;
                    fill: var(--bg-dark);
                }

                .pb-rank-text {
                    font-size: 13px;
                    color: #d1568c;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

            </style>

            <div class="leaderboard-container">
                
                <!-- HEADER -->
                <div class="header-section">
                    <div class="dropdown-container">
                        <div class="dropdown-box">
                            <span>UNIT RANKING</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                        
                        <!-- List Thả Xuống -->
                        <div class="dropdown-menu">
                            <div class="dropdown-item" data-type="global">GLOBAL RANKING</div>
                            <div class="dropdown-item" data-type="friend">FRIEND RANKING</div>
                            <div class="dropdown-item" data-type="unit">UNIT RANKING</div>
                        </div>
                    </div>

                    <div class="chat-icon"></div>
                </div>

                <!-- LIST -->
                <div class="list-container">
                    
                    <div class="rank-row">
                        <div class="rank-box rb-2">P2</div>
                        <div class="grade gr-a">A</div>
                        <div class="info-col">
                            <div class="player-name">V_Cyber</div>
                            <div class="player-score">Score: <span class="hl">31,210,500</span> (180x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">FAST</div>
                            <div class="acc-text">98.5%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-3">P3</div>
                        <div class="grade gr-b">B</div>
                        <div class="info-col">
                            <div class="player-name">NoobHacker</div>
                            <div class="player-score">Score: <span class="hl">28,100,000</span> (85x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">NORMAL</div>
                            <div class="acc-text">92.1%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-4">P4</div>
                        <div class="grade gr-a">A</div>
                        <div class="info-col">
                            <div class="player-name">SamuraiJack</div>
                            <div class="player-score">Score: <span class="hl">27,550,000</span> (150x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">BLIND</div>
                            <div class="acc-text">96.5%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-5">P5</div>
                        <div class="grade gr-s">S</div>
                        <div class="info-col">
                            <div class="player-name">TokyoDrifter</div>
                            <div class="player-score">Score: <span class="hl">26,900,000</span> (220x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">FAST</div>
                            <div class="acc-text">99.1%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-6">P6</div>
                        <div class="grade gr-b">B</div>
                        <div class="info-col">
                            <div class="player-name">TypingGod99</div>
                            <div class="player-score">Score: <span class="hl">26,100,000</span> (90x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">NONE</div>
                            <div class="acc-text">90.5%</div>
                        </div>
                    </div>

                    <!-- MOCK DATA TO TEST SCROLLING -->
                    <div class="rank-row">
                        <div class="rank-box rb-6">P7</div>
                        <div class="grade gr-b">B</div>
                        <div class="info-col">
                            <div class="player-name">NeonNinja</div>
                            <div class="player-score">Score: <span class="hl">24,500,000</span> (60x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">NONE</div>
                            <div class="acc-text">88.2%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-5">P8</div>
                        <div class="grade gr-a">A</div>
                        <div class="info-col">
                            <div class="player-name">SpeedCoder</div>
                            <div class="player-score">Score: <span class="hl">23,100,000</span> (110x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">FAST</div>
                            <div class="acc-text">95.0%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-4">P9</div>
                        <div class="grade gr-s">S</div>
                        <div class="info-col">
                            <div class="player-name">MatrixKing</div>
                            <div class="player-score">Score: <span class="hl">21,800,000</span> (250x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">BLIND</div>
                            <div class="acc-text">99.9%</div>
                        </div>
                    </div>

                    <div class="rank-row">
                        <div class="rank-box rb-3">P10</div>
                        <div class="grade gr-b">B</div>
                        <div class="info-col">
                            <div class="player-name">SynthRider</div>
                            <div class="player-score">Score: <span class="hl">19,200,000</span> (40x)</div>
                        </div>
                        <div class="stats-col">
                            <div class="mode-tag">NORMAL</div>
                            <div class="acc-text">91.3%</div>
                        </div>
                    </div>

                </div>

                <!-- PERSONAL BEST (Bạn) -->
                <div class="personal-best-divider">PERSONAL BEST</div>
                <div class="personal-row">
                    <div class="pb-icon-box">
                        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5H7z"/></svg>
                    </div>
                    <div class="grade gr-a">A</div>
                    <div class="info-col">
                        <div class="pb-rank-text">#420 of 12,00...</div>
                        <div class="player-score">Score: <span class="hl">25,650,812</span> (120x)</div>
                    </div>
                    <div class="stats-col">
                        <div class="mode-tag">FAST</div>
                        <div class="acc-text">97.4%</div>
                    </div>
                </div>

            </div>
        `;
    }
}

customElements.define('rank-board', RankBoard);
