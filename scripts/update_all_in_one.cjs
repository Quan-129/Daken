const fs = require('fs');
const path = require('path');

const memoryDir = path.join(__dirname, '..', '.agent', 'memory');

// 1. Update PROGRESS.md
let progressPath = path.join(memoryDir, 'PROGRESS.md');
if (fs.existsSync(progressPath)) {
    let content = fs.readFileSync(progressPath, 'utf8');
    if (!content.includes('31. **Neural Link Agent ID')) {
        content = content.replace('## Core Features', '31. **Neural Link Agent ID (Randomized Identity)**: Triển khai hệ thống định danh đặc vụ sáu số ngẫu nhiên (#XXXXXX). Đơn giản hóa luồng Đăng ký chỉ còn Email/Pass, đẩy việc chọn Biệt danh (Nickname) ra sau khi Auth thành công. Điều này giúp tối ưu hóa UX, giảm ma sát ban đầu và tạo nền móng cho hệ thống Kết Bạn/Xếp Hạng toàn cầu trong tương lai.\n\n## Core Features');
        fs.writeFileSync(progressPath, content);
    }
}

// 2. Update CHANGELOG.md
let changelogPath = path.join(memoryDir, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
    let content = fs.readFileSync(changelogPath, 'utf8');
    if (!content.includes('Simplified Auth & Agent ID')) {
        content = content.replace('### Added & Fixed\n', '### Added & Fixed\n- **Simplified Auth & Agent ID System**: Cơ cấu lại bộ máy Login/Register. Biệt danh nay được chọn tại màn hình "INITIALIZING IDENTITY" hậu đăng nhập. Tự động phát sinh Agent ID 6 số ngẫu nhiên lưu trực tiếp vào metadata Supabase. Cập nhật thẻ Profile UI để hiển thị ID phát sáng phong cách Cyber-Agent.\n');
        fs.writeFileSync(changelogPath, content);
    }
}

// 3. Update GameDesign.md
let gddPath = path.join(memoryDir, 'GameDesign.md');
if (fs.existsSync(gddPath)) {
    let content = fs.readFileSync(gddPath, 'utf8');
    if (!content.includes('### 5.2 Agent Identity')) {
        content += '\n\n### 5.2 Agent Identity (Định danh Đặc vụ)\n- **Hệ thống ID**: Mỗi Agent sau khi chọn Nickname sẽ được gán một #ID ngẫu nhiên. ID này là khóa chính để tra cứu dữ liệu xã hội và Leaderboard.\n- **Luồng UX Tinh Gọn**: Ưu tiên người dùng vào hệ thống nhanh nhất có thể (Login Email), sau đó mới thực hiện Customization (Nickname/ID).\n';
        fs.writeFileSync(gddPath, content);
    }
}

// 4. Update MARKETING_PITCH.md
let pitchPath = path.join(memoryDir, 'MARKETING_PITCH.md');
if (fs.existsSync(pitchPath)) {
    let content = fs.readFileSync(pitchPath, 'utf8');
    if (!content.includes('Mã Số Định Mệnh')) {
        content += '\n\n**Mã Số Định Mệnh (#ID System)**\nĐừng chỉ là một cái tên vô danh giữa hàng triệu Agent. Ngay khi bạn bước qua cánh cổng Void Link, thế giới sẽ cấp cho bạn một dãy số định mệnh. Sáu con số ngẫu nhiên, phát sáng âm bỉ ngay cạnh mật danh của bạn – đó không chỉ là số ID, đó là tấm thẻ bài xác nhận bạn thuộc về hàng ngũ Cyber-Zen thượng đẳng. Hãy chia sẻ nó, ghim nó lên bảng vàng, và để đối thủ phải khiếp sợ trước con số định danh của bạn.\n';
        fs.writeFileSync(pitchPath, content);
    }
}

// 5. Update HANDOFF.md
let handoffPath = path.join(memoryDir, 'HANDOFF.md');
if (fs.existsSync(handoffPath)) {
    let content = fs.readFileSync(handoffPath, 'utf8');
    content = content.replace('## Tình trạng hiện tại (Updated: 2026-04-10)', '## Tình trạng hiện tại (Updated: 2026-04-11)\n- Đã hoàn thiện **Neural Identity System**: Luồng Login tinh gọn -> Setup Nickname -> Cấp Random Agent ID (#XXXXXX).\n- Giao diện Profile đã hiển thị ID.\n- Toàn bộ Documentation đã được đồng bộ hóa.');
    fs.writeFileSync(handoffPath, content);
}

console.log('All-in-One [Identity Update] completed.');
