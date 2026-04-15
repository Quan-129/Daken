class FriendList extends HTMLElement {
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
                    top: 130px;
                    right: 25px;
                    z-index: 1500;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .squad-panel {
                    width: 280px;
                    background: rgba(20, 25, 45, 0.45);
                    backdrop-filter: blur(12px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: 3px solid #8ce8ff; /* Viền nhấn bên phải để đối xứng với viền trái của Rank Board */
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                /* HEADER SQUAD */
                .sq-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(140, 232, 255, 0.15);
                    background: rgba(255, 255, 255, 0.02);
                }

                .sq-title {
                    font-size: 15px;
                    font-weight: 800;
                    color: #8ce8ff;
                    letter-spacing: 2px;
                    text-shadow: 0 0 8px rgba(140, 232, 255, 0.3);
                }

                .sq-badge {
                    font-size: 10px;
                    font-weight: 800;
                    background: rgba(255, 168, 192, 0.15);
                    color: #ffa8c0;
                    padding: 4px 8px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 168, 192, 0.3);
                    box-shadow: 0 0 10px rgba(255, 168, 192, 0.1);
                }

                /* FRIEND LIST CONTAINER */
                .sq-list {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                /* Custom Scrollbar */
                .sq-list::-webkit-scrollbar {
                    width: 4px;
                }
                .sq-list::-webkit-scrollbar-thumb {
                    background: rgba(140, 232, 255, 0.3);
                    border-radius: 4px;
                }

                /* INDIVIDUAL FRIEND ITEM */
                .friend-item {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid transparent;
                    border-radius: 14px;
                    padding: 10px 15px;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                }

                .friend-item:hover {
                    background: rgba(140, 232, 255, 0.08);
                    border: 1px solid rgba(140, 232, 255, 0.2);
                    transform: translateX(-6px); /* Kéo item sang trái khi hover */
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .f-avatar {
                    width: 38px; 
                    height: 38px;
                    border-radius: 50%;
                    display: flex; 
                    justify-content: center; 
                    align-items: center;
                    font-weight: 800;
                    font-size: 15px;
                    color: #fff;
                    margin-right: 15px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                    flex-shrink: 0;
                }

                .f-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    flex-grow: 1;
                }

                .f-name {
                    font-size: 14px;
                    font-weight: 600; /* Medium weight instead of ultra bold */
                    color: #fff;
                    margin-bottom: 3px;
                    letter-spacing: 0.5px;
                    transition: color 0.2s;
                }
                
                .friend-item:hover .f-name {
                    color: #8ce8ff;
                }

                .f-status {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                /* Status Coloring (Lofi Soft) */
                .st-ingame { color: #ff99b3; } /* Soft Pink */
                .bg-ingame { background: linear-gradient(135deg, #ff99b3, #ff758c); }

                .st-online { color: #a7f3d0; } /* Soft Green */
                .bg-online { background: linear-gradient(135deg, #a7f3d0, #10b981); }

                .st-offline { color: rgba(255,255,255,0.4); font-weight: 500; }
                .bg-offline { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); border: 1px dashed rgba(255,255,255,0.2); box-sizing: border-box; }
                .n-offline { color: rgba(255,255,255,0.6); }

                /* BOTTOM ACTIONS */
                .sq-actions {
                    display: flex;
                    gap: 10px;
                    padding: 5px 15px 15px 15px;
                }

                .sq-btn {
                    flex: 1;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(140, 232, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 0;
                    color: #8ce8ff;
                    font-family: inherit;
                    font-weight: 700;
                    font-size: 12px;
                    letter-spacing: 1px;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                }

                .sq-btn:hover {
                    background: rgba(140, 232, 255, 0.15);
                    box-shadow: 0 0 15px rgba(140, 232, 255, 0.2);
                    transform: translateY(-2px);
                    color: #fff;
                    border-color: #8ce8ff;
                }

            </style>

            <div class="squad-panel">
                
                <!-- HEADER -->
                <div class="sq-header">
                    <div class="sq-title">SQUAD</div>
                    <div class="sq-badge">2/5 ONLINE</div>
                </div>
                
                <!-- LIST -->
                <div class="sq-list">
                    
                    <div class="friend-item">
                        <div class="f-avatar bg-ingame">K</div>
                        <div class="f-info">
                            <div class="f-name">KIRA_99</div>
                            <div class="f-status st-ingame">In Game (Wave 3)</div>
                        </div>
                    </div>
                    
                    <div class="friend-item">
                        <div class="f-avatar bg-online">A</div>
                        <div class="f-info">
                            <div class="f-name">Akira_Sensei</div>
                            <div class="f-status st-online">Online</div>
                        </div>
                    </div>
                    
                    <div class="friend-item">
                        <div class="f-avatar bg-offline">Z</div>
                        <div class="f-info">
                            <div class="f-name n-offline">ZeroCool</div>
                            <div class="f-status st-offline">Offline (2h)</div>
                        </div>
                    </div>

                </div>

                <!-- ACTIONS -->
                <div class="sq-actions">
                    <button class="sq-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        ADD
                    </button>
                    <button class="sq-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l10 10-10 10L2 12z"></path></svg>
                        SQUAD
                    </button>
                </div>

            </div>
        `;
    }
}

customElements.define('friend-list', FriendList);
