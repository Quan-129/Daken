const mockVocabulary = [
    {
        visual: "かわいがる",
        romaji: "kawaigaru",
        hanviet: "ÁI",
        vi: "Yêu thương",
        example_jp: "動物を かわいがるのは 良いが、無責任に 飼ってはならない。",
        example_vi: "Yêu thương động vật thì tốt, nhưng không được nuôi một cách vô trách nhiệm.",
        grammar: "~てはならない: Không được phép làm gì đó (cấm đoán)"
    },
    {
        visual: "気付く",
        romaji: "kizuku",
        hanviet: "KHÍ PHÓ",
        vi: "Nhận ra",
        example_jp: "人の 失敗に 気付いたとしても、それを 笑ってはならない。",
        example_vi: "Dẫu có nhận ra thất bại của người khác thì cũng không được cười nhạo.",
        grammar: "~てはならない: Không được phép làm gì đó (cấm đoán)"
    },
    {
        visual: "疑う",
        romaji: "utagau",
        hanviet: "NGHI",
        vi: "Nghi ngờ",
        example_jp: "証拠も ないのに、仲間を 疑ってばかりは いられない。",
        example_vi: "Không có bằng chứng mà cứ mãi nghi ngờ đồng đội thì không được.",
        grammar: "~てはいられない: Không thể cứ tiếp tục làm gì đó"
    },
    {
        visual: "苦しむ",
        romaji: "kurushimu",
        hanviet: "KHỔ",
        vi: "Đau khổ",
        example_jp: "病気で 苦しんでいる人を 見て、黙って 見てはいられない。",
        example_vi: "Thấy người đang đau khổ vì bệnh tật, tôi không thể chỉ đứng nhìn yên lặng được.",
        grammar: "~てはいられない: Không thể cứ tiếp tục làm gì đó"
    },
    {
        visual: "悲しむ",
        romaji: "kanashimu",
        hanviet: "BI",
        vi: "Đau buồn",
        example_jp: "いつまでも 過去を 悲しんでばかりは いられない、前を 向こう。",
        example_vi: "Không thể cứ mãi đau buồn về quá khứ được, hãy hướng về phía trước thôi.",
        grammar: "~てはいられない: Không thể cứ tiếp tục làm gì đó"
    },
    {
        visual: "がっかりする",
        romaji: "gakkarisuru",
        hanviet: "N/A",
        vi: "Thất vọng",
        example_jp: "一度の 失敗で がっかりしてばかりは いられない。",
        example_vi: "Không thể cứ mãi thất vọng chỉ vì một lần thất bại.",
        grammar: "~てはいられない: Không thể cứ tiếp tục làm gì đó"
    },
    {
        visual: "励ます",
        romaji: "hagemasu",
        hanviet: "LỆ",
        vi: "Khích lệ",
        example_jp: "苦労している 友を 見ると、励まさないでは いられない。",
        example_vi: "Cứ hễ thấy người bạn đang gặp gian truân là tôi không thể không khích lệ.",
        grammar: "~ないではいられない: Không thể kìm nén được việc làm gì đó"
    },
    {
        visual: "うなずく",
        romaji: "unazuku",
        hanviet: "N/A",
        vi: "Gật đầu",
        example_jp: "彼女の 切実な 訴えに、思わず うなずかないでは いられない。",
        example_vi: "Trước lời thỉnh cầu khẩn thiết của cô ấy, tôi không thể không gật đầu đồng ý.",
        grammar: "~ないではいられない: Không thể kìm nén được việc làm gì đó"
    },
    {
        visual: "張り切る",
        romaji: "harikiru",
        hanviet: "TRƯƠNG THIẾT",
        vi: "Hăng hái",
        example_jp: "試合を 前に 張り切る 選手を 応援しないでは いられない。",
        example_vi: "Thấy các tuyển thủ hăng hái trước trận đấu, tôi không thể không cổ vũ cho họ.",
        grammar: "~ないではいられない: Không thể kìm nén được việc làm gì đó"
    },
    {
        visual: "威張る",
        romaji: "ibaru",
        hanviet: "UY TRƯƠNG",
        vi: "Kiêu ngạo",
        example_jp: "部下に 威張らずには いられない 上司は、人望を 失う。",
        example_vi: "Người cấp trên mà không thể không ra vẻ kiêu ngạo với cấp dưới sẽ mất đi sự tín nhiệm.",
        grammar: "~ずにはいられない: Không thể không làm (tự nhiên như vậy)"
    },
    {
        visual: "怒鳴る",
        romaji: "donaru",
        hanviet: "NỘ MINH",
        vi: "Quát mắng",
        example_jp: "あまりの 失礼さに、思わず 怒鳴らずには いられない。",
        example_vi: "Vì quá bất lịch sự nên tôi đã không kìm được mà quát lên.",
        grammar: "~ずにはいられない: Không thể không làm (tự nhiên như vậy)"
    },
    {
        visual: "暴れる",
        romaji: "abareru",
        hanviet: "BẠO",
        vi: "Quậy phá",
        example_jp: "酔って 暴れる 客を 見て、警察を 呼ばずには いられない。",
        example_vi: "Thấy khách say rượu quậy phá, tôi không thể không gọi cảnh sát.",
        grammar: "~ずにはいられない: Không thể không làm (tự nhiên như vậy)"
    },
    {
        visual: "しゃがむ",
        romaji: "shagamu",
        hanviet: "N/A",
        vi: "Ngồi xổm",
        example_jp: "足の 痛みに 耐えかねて、その場に しゃがまずには いられない。",
        example_vi: "Không chịu nổi cơn đau chân, tôi không thể không ngồi xổm xuống ngay tại đó.",
        grammar: "~ずにはいられない: Không thể không làm (tự nhiên như vậy)"
    },
    {
        visual: "どく",
        romaji: "doku",
        hanviet: "N/A",
        vi: "Tránh ra",
        example_jp: "道を 塞いでいる 荷物を どかずには いられない。",
        example_vi: "Tôi không thể không tránh khỏi đống hành lý đang chặn đường.",
        grammar: "~ずにはいられない: Không thể không làm (tự nhiên như vậy)"
    },
    {
        visual: "どける",
        romaji: "dokeru",
        hanviet: "N/A",
        vi: "Dời đi",
        example_jp: "重い 岩を どける 努力をした かいがあって、道が 通れるようになった。",
        example_vi: "Nhờ nỗ lực dời tảng đá nặng đi mà con đường đã có thể thông suốt.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "かぶる",
        romaji: "kaburu",
        hanviet: "N/A",
        vi: "Đội, dội",
        example_jp: "毎日 冷水を かぶった かいがあって、風邪を 引かなくなった。",
        example_vi: "Nhờ bõ công dội nước lạnh mỗi ngày mà tôi không còn bị cảm nữa.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "かぶせる",
        romaji: "kabuseru",
        hanviet: "N/A",
        vi: "Che đậy",
        example_jp: "苗に ビニールを かぶせた かいがあって、霜に やられずに 済んだ。",
        example_vi: "Nhờ công che nilon cho cây mầm mà chúng đã không bị sương giá làm hỏng.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "かじる",
        romaji: "kajiru",
        hanviet: "N/A",
        vi: "Gặm, cắn",
        example_jp: "フランス語を 少し かじった かいがあって、旅行が 楽しめた。",
        example_vi: "Nhờ bõ công tìm hiểu sơ qua tiếng Pháp mà chuyến du lịch đã rất vui vẻ.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "撃つ",
        romaji: "utsu",
        hanviet: "KÍCH",
        vi: "Bắn",
        example_jp: "練習して 銃を 撃った かいがあって、標的に 当たった。",
        example_vi: "Nhờ bõ công luyện tập bắn súng mà tôi đã bắn trúng mục tiêu.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "漕ぐ",
        romaji: "kogu",
        hanviet: "TÀO",
        vi: "Chèo, đạp xe",
        example_jp: "一生懸命 自転車を 漕いだ かいがあって、一番に 着いた。",
        example_vi: "Nhờ nỗ lực đạp xe hết sức mà tôi đã đến nơi đầu tiên.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "敷く",
        romaji: "shiku",
        hanviet: "PHU",
        vi: "Trải",
        example_jp: "新しい 絨毯を 敷いた かいがあって、部屋が 明るくなった。",
        example_vi: "Nhờ bõ công trải tấm thảm mới mà căn phòng đã trở nên sáng sủa hẳn lên.",
        grammar: "~かいがあって: Xứng đáng với công sức, nhờ có..."
    },
    {
        visual: "つぐ",
        romaji: "tsugu",
        hanviet: "THỐ",
        vi: "Rót (rượu, trà)",
        example_jp: "お酒を つぎすぎまいと 思ったが、つい 溢れてしまった。",
        example_vi: "Tôi đã định bụng là sẽ không rót quá nhiều rượu, nhưng lỡ làm tràn mất rồi.",
        grammar: "~まい: Quyết tâm không làm gì đó hoặc dự đoán không"
    },
    {
        visual: "配る",
        romaji: "kubaru",
        hanviet: "PHỐI",
        vi: "Phân phát",
        example_jp: "あんなに 丁寧に 資料を 配るまいか。",
        example_vi: "Chẳng phải là nên phân phát tài liệu một cách lịch sự như thế sao?",
        grammar: "~まいか: Chẳng phải là... hay sao (đưa ra ý kiến/suy đoán)"
    },
    {
        visual: "放る",
        romaji: "houru",
        hanviet: "PHÓNG",
        vi: "Ném, bỏ mặc",
        example_jp: "宿題を 放り出すまいと 決めて、最後まで やり遂げた。",
        example_vi: "Tôi đã quyết tâm sẽ không bỏ mặc bài tập về nhà và đã làm xong đến cuối cùng.",
        grammar: "~まい: Quyết tâm không làm gì đó"
    },
    {
        visual: "掘る",
        romaji: "horu",
        hanviet: "QUẬT",
        vi: "Đào (đất)",
        example_jp: "宝を 掘り当てられまいと 誰もが 思っていたが、ついに 見つかった。",
        example_vi: "Mọi người đều đã nghĩ rằng sẽ không thể nào đào trúng kho báu, nhưng cuối cùng nó đã được tìm thấy.",
        grammar: "~まい: Dự đoán phủ định (chắc là không)"
    },
    {
        visual: "まく",
        romaji: "maku",
        hanviet: "PHIÊN",
        vi: "Gieo (hạt), rắc",
        example_jp: "種を まくまいか、それとも 苗を 植えるまいか、迷っている。",
        example_vi: "Tôi đang phân vân không biết có nên gieo hạt hay không, hay là trồng cây non.",
        grammar: "~まいか: Đang phân vân có nên làm hay không"
    },
    {
        visual: "計る",
        romaji: "hakaru",
        hanviet: "KẾ",
        vi: "Đo, cân",
        example_jp: "時間を 計っていると、焦らずには いられない。",
        example_vi: "Cứ hễ đang đo thời gian là tôi không thể không cảm thấy sốt ruột.",
        grammar: "~ずにはいられない: Không thể kìm nén được cảm xúc/hành động"
    },
    {
        visual: "占う",
        romaji: "uranau",
        hanviet: "CHIÊM",
        vi: "Xem bói",
        example_jp: "将来を 占ってもらうと、その 結果を 信じないでは いられない。",
        example_vi: "Khi được xem bói về tương lai, tôi không thể nào không tin vào kết quả đó.",
        grammar: "~ないではいられない: Không thể không (mang tính tự nhiên)"
    },
    {
        visual: "引っ張る",
        romaji: "hipparu",
        hanviet: "DẪN TRƯƠNG",
        vi: "Kéo, lôi kéo",
        example_jp: "チームを 引っ張るリーダーを 見て、応援せずには いられない。",
        example_vi: "Nhìn người đội trưởng dẫn dắt đội bóng, tôi không thể không cổ vũ.",
        grammar: "~ずにはいられない: Không thể kìm nén được"
    },
    {
        visual: "突く",
        romaji: "tsuku",
        hanviet: "ĐỘT",
        vi: "Đâm, chọc, chống",
        example_jp: "杖を ついて 歩く お年寄りを 見て、手を 貸さないでは いられない。",
        example_vi: "Thấy cụ già vừa chống gậy vừa đi, tôi không thể không giúp một tay.",
        grammar: "~ないではいられない: Không thể không làm gì đó"
    },
    {
        visual: "突き当たる",
        romaji: "tsukiataru",
        hanviet: "ĐỘT ĐƯƠNG",
        vi: "Đâm sầm, ngõ cụt",
        example_jp: "困難に 突き当たると、誰かに 相談せずには いられない。",
        example_vi: "Khi đâm sầm vào khó khăn, tôi không thể không thảo luận với ai đó.",
        grammar: "~ずにはいられない: Không thể không (mang tính tự nhiên)"
    },
    {
        visual: "立ち止まる",
        romaji: "tachidomaru",
        hanviet: "LẬP CHỈ",
        vi: "Đứng lại, dừng lại",
        example_jp: "信号が 赤に なれば、立ち止まるより ほかない。",
        example_vi: "Khi đèn tín hiệu chuyển sang màu đỏ thì chỉ còn cách đứng lại thôi.",
        grammar: "~よりほかない: Chẳng còn cách nào khác ngoài..."
    }
];

// Thư viện quản lý các Folder Nhạc
let myLibrary = [
    {
        id: 'folder_default',
        name: 'My Mix',
        songs: [
            { url: "https://www.youtube.com/watch?v=HSOtku1j600", title: "MONO - Waiting For You (Lofi)" },
            { url: "https://www.youtube.com/watch?v=11Xtj_Hoz_o", title: "Lofi Chill" }
        ]
    }
];

// Biến lưu Folder nào đang được CHỌN chạy làm nhạc nền
let activeFolderId = 'folder_default';