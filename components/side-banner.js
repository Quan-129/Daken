class SideBanner extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupCarousel();
    }

    setupCarousel() {
        const track = this.shadowRoot.querySelector('.carousel-track');
        const prevBtn = this.shadowRoot.querySelector('.nav-prev');
        const nextBtn = this.shadowRoot.querySelector('.nav-next');
        const slides = this.shadowRoot.querySelectorAll('.slide');
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoPlayInterval;

        const updateSlide = () => {
            // Track độ dài theo số slide. Di chuyển tương đối dựa trên % của chính nó.
            track.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlide();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlide();
        };

        const startAutoPlay = () => {
            autoPlayInterval = setInterval(nextSlide, 4500); // 4.5s tự lướt
        };
        const stopAutoPlay = () => clearInterval(autoPlayInterval);

        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });

        // Tạm dừng chạy hình khi đưa chuột vào xem kỹ
        const wrapper = this.shadowRoot.querySelector('.event-banner-wrapper');
        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);

        startAutoPlay();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    /* Neo chặt về phía dưới cùng màn hình */
                    position: fixed;
                    bottom: 25px;
                    left: 25px;
                    width: 320px; /* Bằng đúng chiều ngang của Rank Board */
                    z-index: 1500;
                    display: flex;
                    flex-direction: column;
                    gap: 15px; /* Khoảng cách giữa Banner và hàng Nút */
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    --bg-dark: rgba(20, 25, 45, 0.65);
                    --bg-panel: rgba(30, 35, 55, 0.65);
                    --border-cyan: #8ce8ff;
                    --text-pink: #ffa8c0;
                    --text-gray: #b8c0d6;
                }

                /* --- KHU VỰC BANNER SỰ KIỆN (CAROUSEL) --- */
                .event-banner-wrapper {
                    width: 100%;
                    height: 120px;
                    border: 1px solid rgba(255, 168, 192, 0.3);
                    border-radius: 16px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                    cursor: pointer;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease, border-color 0.4s ease;
                    backdrop-filter: blur(8px);
                }

                .event-banner-wrapper:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(255, 168, 192, 0.3);
                    border-color: var(--text-pink);
                }

                .carousel-track {
                    display: flex;
                    width: 300%; /* Vì có 3 slide */
                    height: 100%;
                    transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
                }

                .slide {
                    width: 33.3333%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 15px;
                    box-sizing: border-box;
                    background-size: cover;
                    background-position: center;
                }

                /* Các ảnh nền ảo cho 3 sự kiện */
                .slide-1 {
                    background: linear-gradient(135deg, rgba(255, 71, 133, 0.4) 0%, rgba(0, 229, 255, 0.2) 100%),
                                url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop') center/cover;
                }
                .slide-2 {
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%),
                                url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop') center/cover;
                }
                .slide-3 {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(220, 38, 38, 0.4) 100%),
                                url('https://images.unsplash.com/photo-1614729939124-032f0b5609ce?q=80&w=800&auto=format&fit=crop') center/cover;
                }

                /* Hiệu ứng chớp quét quang học trên Slide */
                .slide::after {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transform: skewX(-20deg);
                    animation: scanGlint 4s infinite;
                }
                @keyframes scanGlint {
                    0% { left: -100%; }
                    20%, 100% { left: 200%; }
                }

                .banner-tag {
                    position: absolute;
                    top: 10px; right: 10px;
                    background: var(--text-pink);
                    color: white;
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 6px;
                    border-radius: 3px;
                    letter-spacing: 1px;
                }

                .banner-title {
                    color: white;
                    font-size: 16px;
                    font-weight: 900;
                    text-transform: uppercase;
                    text-shadow: 0 2px 5px rgba(0,0,0,0.8);
                    letter-spacing: 1px;
                    position: relative;
                    z-index: 1;
                }
                
                .banner-subtitle {
                    color: var(--border-cyan);
                    font-size: 11px;
                    font-weight: 700;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                    position: relative;
                    z-index: 1;
                }

                /* Nút Điều Hương Mũi Tên */
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 28px;
                    height: 28px;
                    background: rgba(20, 25, 45, 0.5);
                    backdrop-filter: blur(4px);
                    color: white;
                    border: 1px solid rgba(140, 232, 255, 0.3);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10;
                    opacity: 0;
                    visibility: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.5);
                    transition: all 0.3s ease;
                }

                .event-banner-wrapper:hover .nav-btn {
                    opacity: 1;
                    visibility: visible;
                }

                .nav-btn:hover {
                    background: var(--text-pink);
                    border-color: #fff;
                    transform: translateY(-50%) scale(1.1);
                }

                .nav-prev { left: 8px; }
                .nav-next { right: 8px; }
                
                .nav-btn svg {
                    width: 14px;
                    height: 14px;
                    stroke: white;
                    stroke-width: 2.5;
                    fill: none;
                }

                /* --- KHOANG NÚT BẤM (SHOP, EVENT, TASK) --- */
                .action-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    width: 100%;
                }

                .action-btn {
                    background: rgba(25, 30, 45, 0.55);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(140, 232, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 5px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .action-btn:hover {
                    background: rgba(140, 232, 255, 0.15);
                    border-color: var(--border-cyan);
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(140, 232, 255, 0.15);
                }

                /* Container cho icon để phát sáng */
                .icon-wrapper {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.08);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: all 0.3s ease;
                }

                .action-btn svg {
                    width: 18px;
                    height: 18px;
                    stroke: var(--text-gray, #aab2cd);
                    stroke-width: 2;
                    fill: none;
                    transition: stroke 0.3s ease;
                }

                .action-btn:hover .icon-wrapper {
                    background: var(--border-cyan);
                    box-shadow: 0 0 10px var(--border-cyan);
                }
                
                .action-btn:hover svg {
                    stroke: var(--bg-dark); /* Contrast đổi trắng */
                }

                /* Text nút */
                .btn-label {
                    color: rgba(255,255,255,0.7);
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    transition: color 0.3s ease;
                }

                .action-btn:hover .btn-label {
                    color: white;
                    text-shadow: 0 0 8px var(--border-cyan);
                }

            </style>

            <!-- KHU VỰC THỊ GIÁC BANNER SỰ KIỆN -->
            <div class="event-banner-wrapper">
                
                <!-- Thanh cuộn hình ảnh -->
                <div class="carousel-track">
                    <!-- Event 1 -->
                    <div class="slide slide-1">
                        <div class="banner-tag">HOT EVENT</div>
                        <div class="banner-title">Neon Awakening</div>
                        <div class="banner-subtitle">X2 EXP DROP WEEKEND</div>
                    </div>
                    
                    <!-- Event 2 -->
                    <div class="slide slide-2" style="--text-pink: #10b981; --border-cyan: #8b5cf6;">
                        <div class="banner-tag" style="background: #10b981">RANKED S1</div>
                        <div class="banner-title">Thần Giới Chiến</div>
                        <div class="banner-subtitle">MỞ KHÓA KHUNG AVATAR ĐỘC QUYỀN</div>
                    </div>

                    <!-- Event 3 -->
                    <div class="slide slide-3" style="--text-pink: #f59e0b; --border-cyan: #dc2626;">
                        <div class="banner-tag" style="background: #f59e0b">FLASH SALE</div>
                        <div class="banner-title">Chợ Đen Cơ Khí</div>
                        <div class="banner-subtitle">GIẢM 50% MỌI TÀI NGUYÊN</div>
                    </div>
                </div>

                <!-- Nút điều hướng -->
                <button class="nav-btn nav-prev">
                    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="nav-btn nav-next">
                    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

            </div>

            <!-- MENU ICON BOTTOM -->
            <div class="action-grid">
                
                <!-- Bấm Shop -->
                <div class="action-btn">
                    <div class="icon-wrapper">
                        <!-- Icon Shopping Cart -->
                        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </div>
                    <span class="btn-label">Thương Vụ</span>
                </div>

                <!-- Bấm Sự kiện -->
                <div class="action-btn">
                    <div class="icon-wrapper">
                        <!-- Icon Gift/Event -->
                        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 12 20 22 4 22 4 12"></polyline>
                            <rect x="2" y="7" width="20" height="5"></rect>
                            <line x1="12" y1="22" x2="12" y2="7"></line>
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                        </svg>
                    </div>
                    <span class="btn-label">Sự Kiện</span>
                </div>

                <!-- Bấm Nhiệm Vụ -->
                <div class="action-btn">
                    <div class="icon-wrapper">
                        <!-- Icon Flag/Target -->
                        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                    </div>
                    <span class="btn-label">Chiến Lệnh</span>
                </div>

            </div>

        `;
    }
}

customElements.define('side-banner', SideBanner);
