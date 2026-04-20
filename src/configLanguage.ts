export type Language = 'en' | 'vi';

export const LanguageConfig = {
    current: 'en' as Language, 
    translations: {
        en: {
            auth: {
                initializing: "Setting things up...",
                chooseName: "What should we call you?",
                nicknamePlaceholder: "Enter nickname...",
                assignIdHint: "* You'll get a unique ID after picking a name.",
                syncIdentity: "[ CONFIRM ]",
                agentAuth: "Welcome Back",
                loginGoogle: "Sign in with Google",
                loginHint: "Sign in to save your learning progress",
                statusReady: "Status: Ready"
            },
            profile: {
                edit: "EDIT",
                guest: "Guest",
                rank: "Rank",
                unranked: "Unranked",
                totalScore: "TOTAL SCORE",
                accuracy: "ACCURACY",
                wpm: "WPM",
                disconnect: "LOGOUT"
            },
            hud: {
                score: "SCORE:",
                combo: "COMBO",
                pressEnter: "[ PRESS ENTER IF FORGOTTEN ]",
                pressEnterReveal: "[ PRESS ENTER TO REVEAL ]",
                pressSpaceNext: "[ PRESS SPACE FOR NEXT WORD ]",
                pressSpaceContinue: "[ PRESS SPACE TO CONTINUE ]",
                replayTooltip: "Replay Audio",
                stop: "STOP",
                speedControl: "PROCESSING SPEED",
                energy: "POWER"
            },
            hub: {
                archives: "STUDY LIBRARY",
                vocabulary: "Vocabulary",
                kanji: "Kanji",
                grammar: "Grammar",
                scrolls: "Scrolls",
                initialize: "Start Lesson",
                notFound: "No data found for this level.",
                returnLobby: "RETURN TO LOBBY",
                stats: {
                    overallRank: "OVERALL RANK",
                    avgAccuracy: "AVG ACCURACY",
                    totalScore: "TOTAL SCORE",
                    avgWpm: "AVG WPM",
                    progress: "PROGRESS"
                }
            },
            messages: {
                busted: "OH NO!",
                batteryDepleted: "OUT OF POWER",
                calculating: "Checking results...",
                sessionTerminated: "Session End. Your Score:",
                ninjaTyping: "NINJA TYPING",
                configure: "Pick a level and press START to begin.",
                start: "START",
                waveCleared: "WAVE CLEARED",
                timeBonus: "Time Bonus!",
                preparingNextWave: "Preparing next wave...",
                goldClear: "GOLD CLEAR",
                silverClear: "SILVER CLEAR",
                bronzeClear: "BRONZE CLEAR",
                wordClear: "WORD CLEAR",
                sessionCleared: "SESSION CLEARED",
                fillBlanks: "Q: Fill in the blanks"
            },
            modals: {
                calibration: "Settings",
                tutorialComplete: "Level Complete!",
                continue: "Continue",
                initialize: "Start Lesson",
                synapseMatrix: "Results",
                absorptionStatus: "Your learning progress",
                terminateSession: "Finish Session",
                systemWarning: "Wait a second!",
                stopConfirm: "Do you want to stop now?",
                unsavedWarning: "Warning: Unsaved progress will be lost!",
                confirmStop: "Yes, Stop",
                sessionCompleted: "SESSION COMPLETED"
            },
            feedback: {
                title: "FEEDBACK & BUGS",
                desc: "Send your feedback, bug reports or suggestions to the Admin via a secure line.",
                label: "FEEDBACK CONTENT",
                placeholder: "Type your feedback here...",
                send: "[ SEND FEEDBACK ]",
                sending: "[ SENDING... ]",
                success: "Feedback sent! Thank you.",
                error: "Error: Could not send feedback."
            },
            music: {
                library: "My Music Library",
                newFolderPlace: "Folder Name (e.g. Chill Beats)...",
                create: "CREATE",
                close: "CLOSE",
                newSongPlace: "Paste YouTube link here...",
                add: "ADD",
                fetching: "Fetching...",
                back: "BACK",
                noSong: "No song selected..."
            },
            leaderboard: {
                title: "RANKINGS",
                global: "GLOBAL",
                friends: "FRIENDS",
                score: "SCORE",
                wpm: "WPM",
                acc: "ACC",
                syncing: "Syncing...",
                friendOffline: "Friend system offline",
                comingSoon: "(Coming soon in the next update!)",
                you: "(YOU)",
                topPlayer: "(PRO)",
                rankLabel: "Rank",
                noData: "No data found",
                error: "Connection lost"
            },
            guide: {
                header: "HOW TO PLAY",
                dontShow: "Don't show this again",
                understood: "GOT IT!",
                slides: [
                    {
                        badge: "WAVE 1 & 2",
                        title: "KNOWLEDGE – \"LEARNING THE ROPE\"",
                        vibe: "Vibe: Calm and steady.",
                        content: "Take your time to get familiar with new words. The timer hasn't started yet, so focus on accuracy.",
                        bullet1: "<strong>Scoring:</strong> Each correct word gives you 10 points.",
                        bullet2: "<strong>Tip:</strong> If you make too many typos, you'll have to re-type the word at the end for 0 points.",
                        hint: "💡 <strong>Hint:</strong> Look closely at the Kanji and meanings; you'll need them later!"
                    },
                    {
                        badge: "WAVE 3",
                        title: "REFLEX – \"PICK UP THE PACE\"",
                        vibe: "Vibe: Fast and focused.",
                        content: "Targets are moving faster! You need to type quickly to keep your Combo going.",
                        bullet1: "<strong>Combo:</strong> Type 5 perfect words in a row to start a multiplier up to <strong>x3.0</strong>.",
                        bullet2: "<strong>Danger:</strong> One single typo will reset your Combo to zero.",
                        bullet3: "<strong>Bonus:</strong> Clear the Wave under 30 seconds for an extra 500 points."
                    },
                    {
                        badge: "WAVE 4",
                        title: "DECRYPTION – \"QUICK CHOICE\"",
                        vibe: "Vibe: Memory test, quick fingers.",
                        content: "Instead of typing words, pick the correct meaning using number keys <strong>[1, 2, 3, 4]</strong>.",
                        bullet1: "<strong>Big points:</strong> Each correct answer gives you <strong>20 points</strong>.",
                        bullet2: "<strong>Gold Medal:</strong> Finish under 40 seconds for a massive <strong>800 point</strong> bonus."
                    },
                    {
                        badge: "WAVE 5",
                        title: "SURVIVAL – \"OUTRUN THE CLOCK\"",
                        vibe: "Vibe: High pressure, stay alive.",
                        content: "This is personal best territory. After 1 minute, the speed goes crazy.",
                        bullet1: "<strong>Health:</strong> You have 5 life bars. Don't let targets cross the red line!",
                        bullet2: "<strong>GOAL:</strong> Reach <strong>3000 points</strong> to automatically finish and claim victory."
                    },
                    {
                        badge: "SYSTEM",
                        title: "RANKING – \"HALL OF FAME\"",
                        vibe: "Vibe: Glory and fame.",
                        content: "Your final score determines your rank in the system:",
                        rankS: "[ Rank S ]: 2000+ Score (Legendary)",
                        rankA: "[ Rank A ]: 1500+ Score (Pro)",
                        rankB: "[ Rank B ]: 1000+ Score (Skilled)",
                        rankC: "[ Rank C ]: 500+ Score (Newbie)",
                        hint: "⚡ Aim for <strong>Rank S</strong> to prove you're the best!"
                    }
                ]
            },
            audio: {
                playlist: "My Playlist",
                mixer: "AUDIO MIXER",
                vocals: "Vocals",
                bgm: "BGM",
                sfx: "SFX",
                ttsRate: "TTS Rate",
                slow: "Slow",
                medium: "Medium",
                fast: "Fast"
            }
        },
        vi: {
            auth: {
                initializing: "Đang chuẩn bị mọi thứ...",
                chooseName: "Bạn muốn được gọi là gì?",
                nicknamePlaceholder: "Nhập biệt danh...",
                assignIdHint: "* Bạn sẽ nhận được ID riêng sau khi chọn tên.",
                syncIdentity: "[ XÁC NHẬN ]",
                agentAuth: "Chào mừng trở lại",
                loginGoogle: "Đăng nhập bằng Google",
                loginHint: "Đăng nhập để lưu lại kết quả học tập",
                statusReady: "Trạng thái: Sẵn sàng"
            },
            profile: {
                edit: "ĐỔI",
                guest: "Khách",
                rank: "Hạng",
                unranked: "Chưa xếp hạng",
                totalScore: "TỔNG ĐIỂM",
                accuracy: "ĐỘ CHÍNH XÁC",
                wpm: "TỐC ĐỘ",
                disconnect: "ĐĂNG XUẤT"
            },
            hud: {
                score: "ĐIỂM SỐ:",
                combo: "COMBO",
                pressEnter: "[ NHẤN ENTER NẾU QUÊN TỪ ]",
                pressEnterReveal: "[ NHẤN ENTER ĐỂ XEM ĐÁP ÁN ]",
                pressSpaceNext: "[ BẤM SPACE ĐỂ QUA TỪ ]",
                pressSpaceContinue: "[ BẤM SPACE ĐỂ TIẾP TỤC ]",
                replayTooltip: "Nghe lại",
                stop: "DỪNG CHƠI",
                speedControl: "PHÂN TÁCH TỐC ĐỘ",
                energy: "NĂNG LƯỢNG"
            },
            hub: {
                archives: "THƯ VIỆN HỌC",
                vocabulary: "Từ vựng",
                kanji: "Hán tự",
                grammar: "Ngữ pháp",
                scrolls: "Cuộn",
                initialize: "Bắt đầu học",
                notFound: "Không tìm thấy dữ liệu cho cấp độ này.",
                returnLobby: "TRỞ VỀ SẢNH",
                stats: {
                    overallRank: "HẠNG TỔNG",
                    avgAccuracy: "ĐỘ CHÍNH XÁC TB",
                    totalScore: "TỔNG ĐIỂM",
                    avgWpm: "WPM TRUNG BÌNH",
                    progress: "TIẾN ĐỘ"
                }
            },
            messages: {
                busted: "TIU RỒI!",
                batteryDepleted: "NĂNG LƯỢNG CẠN KIỆT",
                calculating: "Đang tính điểm...",
                sessionTerminated: "Kết thúc. Điểm của bạn là:",
                ninjaTyping: "GÕ NHƯ NINJA",
                configure: "Chọn cấp độ rồi nhấn START để bắt đầu nhé.",
                start: "BẮT ĐẦU",
                waveCleared: "HOÀN THÀNH ĐỢT",
                timeBonus: "ĐIỂM THƯỞNG THỜI GIAN!",
                preparingNextWave: "Chuẩn bị đợt mới...",
                goldClear: "HOÀN THÀNH VÀNG",
                silverClear: "HOÀN THÀNH BẠC",
                bronzeClear: "HOÀN THÀNH ĐỒNG",
                wordClear: "XONG TỪ",
                sessionCleared: "HOÀN THÀNH PHẦN HỌC",
                fillBlanks: "Q: Hãy điền vào chỗ trống"
            },
            modals: {
                calibration: "Cài đặt",
                tutorialComplete: "Hoàn thành!",
                continue: "Tiếp tục",
                initialize: "Bắt đầu học",
                synapseMatrix: "Kết quả",
                absorptionStatus: "Tiến độ học tập của bạn",
                terminateSession: "Kết thúc phiên học",
                systemWarning: "Gượm đã!",
                stopConfirm: "Bạn muốn dừng lại sao?",
                unsavedWarning: "Cảnh báo: Kết quả chưa lưu sẽ bị mất hết đấy!",
                confirmStop: "Đúng, dừng lại",
                sessionCompleted: "HOÀN THÀNH PHIÊN HỌC"
            },
            feedback: {
                title: "GÓP Ý & BÁO LỖI",
                desc: "Gửi phản hồi, báo lỗi hoặc góp ý cho Admin qua đường truyền bảo mật.",
                label: "NỘI DUNG PHẢN HỒI",
                placeholder: "Gõ phản hồi của bạn tại đây...",
                send: "[ GửI GÓP Ý ]",
                sending: "[ ĐANG GỬI... ]",
                success: "Đã gửi góp ý! Cảm ơn bạn.",
                error: "Lỗi: Không thể gửi góp ý."
            },
            music: {
                library: "Thư viện nhạc của tôi",
                newFolderPlace: "Tên thư mục (VD: Nhạc Chill)...",
                create: "TẠO",
                close: "ĐÓNG",
                newSongPlace: "Dán link YouTube vào đây...",
                add: "THÊM",
                fetching: "Đang lấy...",
                back: "QUAY LẠI",
                noSong: "Chưa chọn bài hát..."
            },
            leaderboard: {
                title: "BẢNG XẾP HẠNG",
                global: "TOÀN CẦU",
                friends: "BẠN BÈ",
                score: "ĐIỂM",
                wpm: "TỐC ĐỘ",
                acc: "CHUẨN",
                syncing: "Đang đồng bộ...",
                friendOffline: "Hệ thống bạn bè đang bảo trì",
                comingSoon: "(Sẽ sớm ra mắt trong bản cập nhật tới!)",
                you: "(BẠN)",
                topPlayer: "(CAO THỦ)",
                rankLabel: "Hạng",
                noData: "Chưa có dữ liệu",
                error: "Mất kết nối"
            },
            guide: {
                header: "CÁCH CHƠI",
                dontShow: "Không hiện lại thông báo này",
                understood: "ĐÃ HIỂU!",
                slides: [
                    {
                        badge: "WAVE 1 & 2",
                        title: "NHẬP MÔN – \"LÀM QUEN MẶT CHỮ\"",
                        vibe: "Vibe: Thong thả, bình tĩnh.",
                        content: "Đây là lúc bạn làm quen với từ mới. Cứ thong thả mà gõ, game chưa tính thời gian ở giai đoạn này đâu.",
                        bullet1: "<strong>Điểm số:</strong> Mỗi từ gõ đúng bạn nhận được 10 điểm.",
                        bullet2: "<strong>Lưu ý:</strong> Nếu gõ sai quá nhiều, bạn sẽ phải gõ lại từ đó ở cuối màn và không được điểm.",
                        hint: "💡 <strong>Mẹo:</strong> Nhìn kỹ mặt chữ Kanji và nghĩa, chúng sẽ giúp bạn ở các màn sau!"
                    },
                    {
                        badge: "WAVE 3",
                        title: "PHẢN XẠ – \"TĂNG TỐC\"",
                        vibe: "Vibe: Kịch tính, tập trung.",
                        content: "Mục tiêu bơi nhanh hơn rồi! Bạn cần gõ vừa nhanh vừa chuẩn để giữ Combo.",
                        bullet1: "<strong>Combo:</strong> Gõ đúng liên tiếp 5 từ để bắt đầu nhân điểm lên đến <strong>tối đa x3.0</strong>.",
                        bullet2: "<strong>Cẩn thận:</strong> Chỉ cần gõ sai 1 phím là Combo sẽ về 0 ngay lập tức.",
                        bullet3: "<strong>Thưởng:</strong> Vượt màn dưới 30 giây để nhận thêm 500 điểm thưởng."
                    },
                    {
                        badge: "WAVE 4",
                        title: "GIẢI MÃ – \"CHỌN ĐÁP ÁN NHANH\"",
                        vibe: "Vibe: Thử thách trí nhớ, dứt khoát.",
                        content: "Không cần gõ từ nữa, hãy chọn đáp án đúng bằng các phím số <strong>[1, 2, 3, 4]</strong>.",
                        bullet1: "<strong>Điểm cao:</strong> Mỗi câu đúng bạn ăn trọn <strong>20 điểm</strong>.",
                        bullet2: "<strong>Huy chương Vàng:</strong> Hoàn thành dưới 40 giây để nhận <strong>800 điểm</strong> thưởng."
                    },
                    {
                        badge: "WAVE 5",
                        title: "SINH TỒN – \"VƯỢT QUA GIỚI HẠN\"",
                        vibe: "Vibe: Áp lực, sinh tồn.",
                        content: "Đây là lúc thử thách bản thân. Sau 1 phút, tốc độ sẽ tăng chóng mặt.",
                        bullet1: "<strong>Máu (HP):</strong> Bạn có 5 vạch pin. Đừng để mục tiêu lọt qua vạch đỏ!",
                        bullet2: "<strong>MỤC TIÊU:</strong> Đạt <strong>3000 điểm</strong> để hoàn thành nhiệm vụ và chiến thắng."
                    },
                    {
                        badge: "SYSTEM",
                        title: "THỨ HẠNG – \"BẢNG PHONG THẦN\"",
                        vibe: "Vibe: Vinh quang và đẳng cấp.",
                        content: "Điểm số cuối cùng sẽ quyết định thứ hạng của bạn:",
                        rankS: "[ Rank S ]: 2000+ Điểm (Huyền Thoại)",
                        rankA: "[ Rank A ]: 1500+ Điểm (Cao Thủ)",
                        rankB: "[ Rank B ]: 1000+ Điểm (Thành Thạo)",
                        rankC: "[ Rank C ]: 500+ Điểm (Tân Binh)",
                        hint: "⚡ Hãy cố gắng đạt <strong>Rank S</strong> để khẳng định đẳng cấp nhé!"
                    }
                ]
            },
            audio: {
                playlist: "Thư viện nhạc của tôi",
                mixer: "BỘ TRỘN ÂM THANH",
                vocals: "Giọng đọc",
                bgm: "Nhạc nền",
                sfx: "Hiệu ứng",
                ttsRate: "Tốc độ đọc",
                slow: "Chậm",
                medium: "Vừa",
                fast: "Nhanh"
            }
        }
    }
};

export default LanguageConfig;
