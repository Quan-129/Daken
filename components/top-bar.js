class TopBar extends HTMLElement {
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
                    top: 25px;
                    right: 25px;
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                /* GLASSMORPHISM BASE */
                .glass-panel {
                    background: rgba(20, 25, 45, 0.45);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                }

                /* --- RESOURCES GROUP --- */
                .resource-group {
                    height: 40px;
                    border-radius: 20px;
                    padding: 0 5px 0 15px;
                }

                .res-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 12px;
                    position: relative;
                }

                /* Đường vạch chia các item */
                .res-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 20%;
                    height: 60%;
                    width: 1px;
                    background: rgba(255, 255, 255, 0.15);
                }

                .res-icon {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 0 10px currentColor; /* Phát sáng theo màu icon */
                }
                
                /* SVG styling */
                .res-icon svg {
                    width: 12px;
                    height: 12px;
                    fill: #fff;
                }

                .res-value {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    font-family: 'Consolas', monospace;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }

                /* Specfic Resource Colors */
                .res-ticket { color: #8ce8ff; } /* Soft Cyan */
                .res-coin { color: #ffe680; }   /* Soft Gold */
                .res-diamond { color: #ff99b3; } /* Soft Pink */

                .add-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    margin-left: 5px;
                    transition: all 0.2s ease;
                }
                .add-btn svg {
                    stroke: #fff;
                    stroke-width: 3;
                    width: 12px;
                    height: 12px;
                }
                .add-btn:hover {
                    background: rgba(255,255,255,0.25);
                    transform: scale(1.1);
                    box-shadow: 0 0 10px rgba(255,255,255,0.2);
                }

                /* --- ACTION BUTTONS --- */
                .action-group {
                    gap: 10px;
                }
                
                .action-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    cursor: pointer;
                    justify-content: center;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .action-btn svg {
                    width: 18px;
                    height: 18px;
                    stroke: rgba(255, 255, 255, 0.85);
                    stroke-width: 2;
                    fill: none;
                    transition: stroke 0.3s;
                }

                .action-btn:hover {
                    transform: translateY(-2px);
                    background: rgba(140, 232, 255, 0.15);
                    border-color: #8ce8ff;
                    box-shadow: 0 5px 15px rgba(140, 232, 255, 0.2);
                }
                .action-btn:hover svg {
                    stroke: #8ce8ff;
                }

                /* Red notification dot */
                .noti-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 10px;
                    height: 10px;
                    background: #ff758c;
                    border-radius: 50%;
                    border: 2px solid #1a2035; /* match rough background */
                    box-shadow: 0 0 8px #ff758c;
                }

                /* Khối kết nối (Mạng/Pin) */
                .status-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-left: 5px;
                    align-items: flex-end;
                }

                .ping-bars {
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                    height: 12px;
                }
                .ping-bar {
                    width: 3px;
                    background: #a7f3d0; /* Soft Green */
                    border-radius: 1px;
                    box-shadow: 0 0 5px #a7f3d0;
                }
                .ping-bar:nth-child(1) { height: 4px; }
                .ping-bar:nth-child(2) { height: 6px; }
                .ping-bar:nth-child(3) { height: 9px; }
                .ping-bar:nth-child(4) { height: 12px; }

                .battery {
                    width: 16px;
                    height: 8px;
                    border: 1px solid rgba(255,255,255,0.5);
                    border-radius: 2px;
                    position: relative;
                    padding: 1px;
                    box-sizing: border-box;
                }
                .battery::after {
                    content: '';
                    position: absolute;
                    right: -3px;
                    top: 2px;
                    width: 2px;
                    height: 4px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 0 1px 1px 0;
                }
                .battery-fill {
                    width: 80%;
                    height: 100%;
                    background: #a7f3d0;
                    border-radius: 1px;
                }
            </style>

            <!-- Khối Tài Nguyên -->
            <div class="glass-panel resource-group">
                
                <!-- Ticket M xanh lơ -->
                <div class="res-item res-ticket">
                    <div class="res-icon" style="background: currentColor;">
                        <!-- Ticket SVG -->
                        <svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"></path><path d="M4 10c1.1 0 2 .9 2 2s-.9 2-2 2"></path><path d="M20 10c-1.1 0-2 .9-2 2s.9 2 2 2"></path></svg>
                    </div>
                    <span class="res-value">9922</span>
                </div>

                <!-- Coin vàng nhạt -->
                <div class="res-item res-coin">
                    <div class="res-icon" style="background: currentColor;">
                        <!-- Coin SVG -->
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v8"></path><path d="M10 10h4"></path><path d="M10 14h4"></path></svg>
                    </div>
                    <span class="res-value">13775</span>
                </div>

                <!-- Kim cương kim loại hồng -->
                <div class="res-item res-diamond">
                    <div class="res-icon" style="background: currentColor;">
                        <!-- Diamond SVG -->
                        <svg viewBox="0 0 24 24"><path d="M6 5h12l4 7-10 10L2 12z"></path></svg>
                    </div>
                    <span class="res-value">253</span>
                </div>

                <div class="add-btn">
                    <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
            </div>

            <!-- Khối Nút Chức Năng (Mail, Setting, v.v...) -->
            <div class="action-group" style="display: flex;">
                
                <!-- Cup/Rank -->
                <div class="glass-panel action-btn">
                    <div class="noti-dot"></div>
                    <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                </div>

                <!-- Thống kê -->
                <div class="glass-panel action-btn">
                    <svg viewBox="0 0 24 24"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
                </div>

                <!-- Mail -->
                <div class="glass-panel action-btn">
                    <div class="noti-dot" style="background: #a7f3d0; box-shadow: 0 0 8px #a7f3d0;"></div>
                    <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>

                <!-- Settings -->
                <div class="glass-panel action-btn">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </div>
            </div>

            <!-- Khối Trạng thái hệ thống Ping/Pin -->
            <div class="status-group">
                <div class="ping-bars">
                    <div class="ping-bar"></div>
                    <div class="ping-bar"></div>
                    <div class="ping-bar"></div>
                    <div class="ping-bar"></div>
                </div>
                <div class="battery">
                    <div class="battery-fill"></div>
                </div>
            </div>

        `;
    }
}

customElements.define('top-bar', TopBar);
