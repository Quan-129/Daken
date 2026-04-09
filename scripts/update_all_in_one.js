const fs = require('fs');
const path = require('path');

const memoryDir = path.join(__dirname, '.agent', 'memory');
const rootDir = __dirname;

// 1. Update PROGRESS.md
let progressPath = path.join(memoryDir, 'PROGRESS.md');
if (fs.existsSync(progressPath)) {
    let content = fs.readFileSync(progressPath, 'utf8');
    if (!content.includes('27. **N2 Hub UI Polishing')) {
        content = content.replace('## Core Features', '27. **N2 Hub UI Polishing (Micro-interactions & Bug Fixes)**: Sửa triệt để bug rụng layout khi Hover nan tre N2 (bỏ chỉnh width, dùng scale 1.01). Khai sinh tính năng hiển thị Tooltip Native tinh tế cho các tựa đề bài học quá dài để bảo vệ kiến trúc hộp flexbox. Dọn sạch tàn dư bóng quang học (active states) bám dính trên các nan quạt khi người dùng bấm Lùi (Back) về sảnh chính, đảm bảo cỗ máy thiết kế quay về trạng thái Lofi nguyên thủy sạch tì vết.\n\n## Core Features');
        fs.writeFileSync(progressPath, content);
        console.log('PROGRESS.md updated.');
    }
}

// 2. Update CHANGELOG.md
let changelogPath = path.join(memoryDir, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
    let content = fs.readFileSync(changelogPath, 'utf8');
    if (!content.includes('N2 Hub UI Micro-Interactions')) {
        content = content.replace('### Added & Fixed\n', '### Added & Fixed\n- **N2 Hub UI Micro-Interactions & State Clearance**: Vá lỗ hổng Layout Shift bằng ma thuật `transform: scale` thay thế bù đắp viền; áp dụng luồng Tooltip thông minh (Native Text Ellipsis + Title Attribute) cho các trường tựa đề Nhật/Anh, đảm bảo không phá vỡ UI flexbox. Ngoài ra triệt tiêu tận gốc hiện tượng "kẹt bóng dạ quang" (Ghost Active State) ở cụm Nan Quạt Daken mỗi khi lùi về Sảnh chính từ Lõi.\n');
        fs.writeFileSync(changelogPath, content);
        console.log('CHANGELOG.md updated.');
    }
}

// 3. Update GameDesign.md
let gddPath = path.join(memoryDir, 'GameDesign.md');
if (fs.existsSync(gddPath)) {
    let content = fs.readFileSync(gddPath, 'utf8');
    if (!content.includes('Micro-Interactions (Tooltip & State)')) {
        content += '\n\n### 6. Micro-Interactions (Tooltip & State Clearance)\n- **Tàng Kinh Các (N2 Hub) Tooltip**: Để đối phó với lượng Text khổng lồ, Game Design chọn giải pháp dùng Font tỉ lệ vàng với `text-overflow: ellipsis`, kết hợp tooltip native. Điều này giữ vững vẻ đẹp Lofi gọt dũa mà không hi sinh tính dễ nhìn.\n- **State Clearance**: Một triết lý trong Game Design là người dùng phải luôn cảm thấy thế giới sống động nhưng dứt khoát. Cảm giác nút bị kẹt trạng thái Hover khiến não bộ thấy ngứa ngáy (Bug). Sạch bóng "active" khi về lại Sảnh (Hub) là bắt buộc.\n';
        fs.writeFileSync(gddPath, content);
        console.log('GameDesign.md updated.');
    }
}

// 4. Update MARKETING_PITCH.md
let pitchPath = path.join(memoryDir, 'MARKETING_PITCH.md');
if (fs.existsSync(pitchPath)) {
    let content = fs.readFileSync(pitchPath, 'utf8');
    if (!content.includes('Bạn ghét sự kẹt cứng')) {
        content += '\n\n**Bạn ghét sự cấn cá của một dòng text nhảy cóc?**\nChúng tôi cũng vậy. Từng điểm chạm (micro-interaction) trong DAKEN đều được uốn nắn một cách ám ảnh. Khi bạn lướt ngang qua những thanh Trúc cổ trong Tàng Kinh Các, nó phập phồng rung nhẹ chứ không hề làm vỡ nát cấu trúc. Khi một dòng tựa đề Tiếng Anh dài dằng dặc, nó cuộn lại e lệ dưới dấu ba chấm `...`, và chỉ bộc bạch toàn bộ tâm can khi bạn kiên nhẫn nán lại lướt qua. Cuộc chia ly nào cũng phải dứt khoát: rời Lõi quay về Sảnh, bóng đèn dạ quang trên cánh quạt N2 sẽ phụt tắt, trả lại cho bạn một khoảng không tĩnh tại mượt mà. Đó không phải là UI, đó là Sự Lãng Mạn.\n';
        fs.writeFileSync(pitchPath, content);
        console.log('MARKETING_PITCH.md updated.');
    }
}

// 5. Dump Bối Cảnh vào HANDOFF.md
let handoffPath = path.join(memoryDir, 'HANDOFF.md');
if (fs.existsSync(handoffPath)) {
    let content = `# Handoff Document\n\n## Cập nhật mới nhất\n- Đã sửa triệt để 3 bug UI của N2 Hub (Tàng Kinh Các): Text vỡ line (do border dày lên - đổi qua scale 1.01), text dài tiếng Anh/Nhật không thấy trọn vẹn (áp dụng white-space ellipsis + Tooltip Title native), và lỗi kẹt bóng dạ quang Nan Quạt khi lùi về (querySelectorAll xóa class active).\n\n## Định hướng hiện tại\n- Game đang ổn định ở độ sắc nét UI Lofi Cyber-Oriental. Code đã refactor an toàn.\n- Có thể chuyển hướng sang phát triển Game Design Wave 4 (Ma Trận Ngữ Pháp) ở giai đoạn tiếp theo.\n`;
    fs.writeFileSync(handoffPath, content);
    console.log('HANDOFF.md updated.');
}

console.log('All-in-One process completed.');
