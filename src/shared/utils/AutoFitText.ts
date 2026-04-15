export function initAutoFitText() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                const target = mutation.target as HTMLElement;
                const el = target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
                if (el && (el.classList.contains('autofit-text') || el.closest('.autofit-text'))) {
                    const fitTarget = el.classList.contains('autofit-text') ? el : el.closest('.autofit-text') as HTMLElement;
                    fitText(fitTarget);
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        characterData: true,
        subtree: true
    });

    // Initial pass
    window.addEventListener('resize', () => {
        document.querySelectorAll('.autofit-text').forEach(el => fitText(el as HTMLElement));
    });

    document.querySelectorAll('.autofit-text').forEach(el => fitText(el as HTMLElement));
}

export function fitText(el: HTMLElement) {
    // 1. Tạm thời xóa inline font để lấy giá trị gốc từ CSS
    el.style.fontSize = '';
    const computed = window.getComputedStyle(el);
    const baseFontSize = parseFloat(computed.fontSize) || 35;

    // 2. Xác định khung an toàn (maxW)
    // Nếu chưa render (0) thì sử dụng fallback mặc định của Lõi là 140
    let currentWidth = el.clientWidth || 140; 
    let maxW = currentWidth;
    if (el.dataset.autofitMax) maxW = parseFloat(el.dataset.autofitMax);
    if (el.dataset.autofitCircular === "true") maxW = maxW * 0.707; // 140 * 0.707 = 99px

    // 3. Tạm thời Disable width cố định để ScrollWidth có thể co giãn theo chữ
    const originalWidth = el.style.width;
    const originalDisplay = el.style.display;
    const originalWhiteSpace = el.style.whiteSpace;
    
    el.style.width = 'max-content';
    el.style.display = 'inline-block';
    el.style.whiteSpace = 'nowrap';

    // 4. Tìm nhị phân kích thước
    let l = 10; 
    let r = baseFontSize;
    let best = l;

    while (l <= r) {
        const m = Math.floor((l + r) / 2);
        el.style.fontSize = m + 'px';
        
        // Đo đạc scrollWidth trực tiếp
        if (el.scrollWidth <= maxW) {
            best = m;
            l = m + 1;
        } else {
            r = m - 1;
        }
    }
    
    // 5. Áp dụng font size chuẩn & dọn dẹp
    el.style.fontSize = best + 'px';
    el.style.width = originalWidth;
    el.style.display = originalDisplay;
    el.style.whiteSpace = originalWhiteSpace;
}
    
