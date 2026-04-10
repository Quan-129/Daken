export const GameConfig: any = {
    // ---------------------------------------------------------
    // THÔNG SỐ ĐỘ KHÓ & TÍNH ĐIỂM CHUNG
    // ---------------------------------------------------------
    difficulty: {
        baseSpeed: 1.8,                 // Tốc độ cơ bản của luồng game (ảnh hưởng đến nhịp độ)
        speedIncrement: 0.15,           // Tốc độ tăng thêm sau mỗi cấp độ / mức Rank
        basePointsPerKill: 10,          // Điểm cơ bản nhận được khi gõ đúng 1 từ (Tiêu diệt mục tiêu)
        multiplierStep: 0.2,            // Mức nhân điểm (Multiplier) tăng thêm cho mỗi chuỗi Combo
        maxMultiplier: 3.0,             // Giới hạn hệ số nhân điểm tối đa (Gấp 3 lần)
        perfectComboRequirement: 5,     // Số lượng từ cần gõ hoàn hảo (Perfect) liên tiếp để bắt đầu được nhân điểm
        maxTyposBeforeWeak: 4           // Số lần gõ sai tối đa trước khi từ bị đánh dấu là "Yếu" (Nợ từ)
    },

    // ---------------------------------------------------------
    // ĐỊNH THỜI BẬC THẤP
    // ---------------------------------------------------------
    timing: {
        spawnInterval: 2000,            // Thời gian chờ để sinh ra mục tiêu tiếp theo (Áp dụng cho Chill/Easy mode)
        easyModeRespawnDelay: 2000,     // Thời gian delay chờ hồi sinh riêng trong Easy mode
        perfectRecallThreshold: 4000    // Ngưỡng thời gian (ms) để được tính là "Phản xạ hoàn hảo"
    },

    // ---------------------------------------------------------
    // HỆ THỐNG VẬN TỐC DI CHUYỂN
    // Tọa độ và tốc độ của cá trong chế độ bơi ngang (Free-swimming)
    // ---------------------------------------------------------
    speeds: {
        baseEnemyMinSpeed: 0.1,         // Vận tốc sinh ra ngẫu nhiên tối thiểu. Khuyến nghị > 0.5 để cá luôn tịnh tiến.
        baseEnemyMaxSpeed: 0.2,         // Vận tốc sinh ra ngẫu nhiên tối đa. Chênh lệch Min-Max tạo sự phân tán tự nhiên.
        wave3SpeedBoost: 0.05,          // Lực đẩy gia tốc (cộng thêm) ưu ái riêng cho màn Wave 3 (Khúc dạo đầu)
        wave5SpeedBoost: 0.05           // Lực đẩy gia tốc (cộng thêm) cho phần thi Sinh Tồn Wave 5
    },

    // ---------------------------------------------------------
    // HỆ ÂM THANH KỸ THUẬT SỐ
    // ---------------------------------------------------------
    audio: {
        defaultTtsRate: 0.9,            // Tốc độ đọc tiếng Nhật chuẩn của Text-to-Speech (0.9 là tự nhiên, không bị líu lưỡi)
        bgmVolume: 0.6,                 // Mức âm lượng mặc định của Nhạc nền BGM (60%)
        sfxVolume: 0.5                  // Mức âm lượng mặc định của Hiệu ứng âm thanh (Bắn, Nổ, Kêu lách cách - 50%)
    },

    // ---------------------------------------------------------
    // THANG ĐIỂM XẾP LOẠI RANK CHUNG CUỘC
    // ---------------------------------------------------------
    rankThresholds: {
        S: 2000,                        // Ngưỡng điểm đạt hạng S (Tuyệt đối)
        A: 1500,                        // Ngưỡng điểm đạt hạng A (Ưu)
        B: 1000,                        // Ngưỡng điểm đạt hạng B (Khá)
        C: 500                          // Ngưỡng điểm đạt hạng C (Trang bị cơ bản)
    },

    // ---------------------------------------------------------
    // MODULE: CHẾ ĐỘ HỌC TẬP (CYBER-ZEN STUDY MODE)
    // ---------------------------------------------------------
    studyMode: {
        // --- CẤU HÌNH GIAI ĐOẠN LÀM QUEN (WAVE 1 & 2) ---
        learningPhase: {
            basePoints: 10,
            penaltyPoints: 5
        },

        // --- CẤU HÌNH WAVE 3: ĐỘNG NÃO (THĂM DÒ TỰ DO) ---
        wave3: {
            basePerfectHits: 1,             // Mức máu cơ bản nếu mục tiêu là màu Vàng/Hoàn hảo
            baseImperfectHits: 2,           // Mức máu nếu mục tiêu màu Xanh (Có nợ từ vựng)
            retryPenaltyMultiplier: 1,      // Hệ số phạt áp dụng khi gõ lại thẻ đã sai
            allowPointsOnWeak: false,       // Cho phép kiếm điểm từ thẻ bị yếu (Đã gõ sai 1 lần) hay không?
            pointsOnWeak: 5,                 // Số điểm "vớt vát" được nếu gõ trúng thẻ Yếu (Chỉ hoạt động nếu true)
            timeBonuses: {
                gold:   { timeMs: 30000, points: 500 },
                silver: { timeMs: 45000, points: 300 },
                bronze: { timeMs: 60000, points: 150 }
            }
        },
        
        // --- CẤU HÌNH WAVE 4: HỘI THOẠI TOÀN TẬP (TRUYỀN THUYẾT LỰA CHỌN) ---
        wave4: {
            basePoints: 20,                 // Số điểm lớn thu được do độ khó cao (Gõ 4 sự lựa chọn, yêu cầu nhớ ngữ pháp)
            layout: {
                offsetX: 180,               // Vị trí độ lệch trục X tính từ tâm chia đều 2 bên trái/phải cho 4 lựa chọn
                offsetYStart: 100,          // Độ cao trục Y bắt đầu vẽ mảng đáp án
                offsetYSpacing: 80          // Khoảng cách theo chiều dọc từ lựa chọn 1 đến lựa chọn 2
            },
            timeBonuses: {                  // Khoản tiền thưởng hậu hĩnh nếu anh hoàn thành Wave 4 trước thời hạn
                gold:   { timeMs: 40000, points: 800 },   // Clear trong 40 giây: Huy chương Vàng Xứng Đáng (800Đ)
                silver: { timeMs: 60000, points: 400 },   // Clear trong 60 giây: Dành cho dân cẩn thận (400Đ)
                bronze: { timeMs: 90000, points: 200 }    // Mốc thời gian trung bình (90 Giây - 1.5 Phút) - 200Đ
            }
        },
        
        // --- CẤU HÌNH WAVE 5: SINH TỒN VÔ TẬN (ENDLESS SPRINT) ---
        wave5: {
            spawnIntervalMs: 3000,          // Tốc độ ban đầu nhả quái (Mỗi 3 giây đẻ 1 lứa cá)
            minStackSize: 1,                // Khởi đầu một đợt sinh sản ít nhất bao nhiêu thẻ (1 thẻ)
            maxStackSize: 2,                // Tối đa sinh bao nhiêu thẻ vây song song trong 1 lần (Cao nhất đẻ 2 thẻ bơi dồn)
            verticalSpacing: 110,           // Cự ly giãn cách độ cao (Trục Y) giữa 2 tấm thẻ nếu lỡ đẻ chồng lên nhau
            
            accelerationSettings: {
                rampUpTimeMs: 60000,        // Mức độ leo dốc khốc liệt: Trong bao lâu sẽ đạt Max Speed/Max Đẻ? (60 Giây - 1 Phút)
                minSpawnIntervalMs: 3500,   // Tần suất nhả quái điên rồ nhất khi đạt Max Ramp-up (Đẻ dồn mỗi 3.5 giây)
                maxSpeedBoost: 0.2          // Lực gia tốc kinh hoàng cộng sinh thêm khi kiệt quệ thời gian (Đến đỉnh điểm cộng tốc thêm 20%)
            }
        }
    }
};
