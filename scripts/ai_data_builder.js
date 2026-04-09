import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input là file text thiết kế theo mảng cột (nhẹ & tiết kiệm token)
const inputPath = path.resolve(__dirname, '../src_jlpt.txt');
const outputPath = path.resolve(__dirname, '../src/data/vocabulary_generated.json');

const unitMetadata = {
    "Unit_1": {
        ja: "人・人間関係",
        vi: "Con người & Quan hệ nhân sinh",
        en: "People & Human Relations"
    },
    "Unit_2": {
        ja: "生活・時間",
        vi: "Sinh hoạt & Thời gian",
        en: "Life & Time"
    },
    "Unit_3": {
        ja: "家・食",
        vi: "Nhà cửa & Ăn uống",
        en: "Home & Food"
    },
    "Unit_4": {
        ja: "街・旅・通信",
        vi: "Thành phố, Du lịch & Truyền thông",
        en: "Town, Travel & Communication"
    },
    "Unit_5": {
        ja: "学校・仕事",
        vi: "Trường học & Công việc",
        en: "School & Work"
    },
    "Unit_6": {
        ja: "動詞 ①",
        vi: "Động từ (Nhóm 1)",
        en: "Verbs (Part 1)"
    },
    "Unit_7": {
        ja: "動詞 ②",
        vi: "Động từ (Nhóm 2)",
        en: "Verbs (Part 2)"
    },
    "Unit_8": {
        ja: "副詞",
        vi: "Trạng từ",
        en: "Adverbs"
    },
    "Unit_9": {
        ja: "接続詞",
        vi: "Liên từ",
        en: "Conjunctions"
    },
    "Unit_10": {
        ja: "生活・動作",
        vi: "Hành động đời sống",
        en: "Daily Life Actions"
    },
    "Unit_11": {
        ja: "健康・医療",
        vi: "Sức khỏe & Y tế",
        en: "Health & Medical"
    },
    "Unit_12": {
        ja: "自然・災害",
        vi: "Thiên nhiên & Thiên tai",
        en: "Nature & Disasters"
    },
    "Unit_13": {
        ja: "状態・性質",
        vi: "Trạng thái & Tính chất",
        en: "States & Properties"
    },
    "Unit_14": {
        ja: "社会・政治・経済",
        vi: "Xã hội, Chính trị & Kinh tế",
        en: "Society, Politics & Economy"
    },
    "Unit_15": {
        ja: "形容詞・評価",
        vi: "Tính từ & Đánh giá",
        en: "Adjectives & Evaluation"
    }
};

function getStudyInfo(unitId) {
    const defaultInfo = {
        vi: `Chủ đề ${unitId.replace('Unit_', '')}`,
        ja: `テーマ ${unitId.replace('Unit_', '')}`,
        en: `Theme ${unitId.replace('Unit_', '')}`
    };
    return unitMetadata[unitId] || defaultInfo;
}

async function main() {
    console.log("🌊 [AI Data Architect] Đang khởi động Text-to-JSON Super Pipeline & Kuromoji...");

    if (!fs.existsSync(inputPath)) {
        console.log(`❌ Lỗi: Không tìm thấy file [new_src_n2.txt] tại thư mục root.`);
        console.log(`💡 HƯỚNG DẪN: Hãy đặt file chứa dữ liệu thô cách nhau bằng cột '|' ở file new_src_n2.txt.`);
        return;
    }

    const rawInput = fs.readFileSync(inputPath, 'utf8');
    const lines = rawInput.split('\n').filter(line => line.trim().length > 0);

    console.log(`🚀 Tìm thấy [${lines.length}] dòng dữ liệu văn bản. Bắt đầu chặt chuỗi...`);

    // Khởi tạo Kuromoji để gắn Furigana tự động
    const KuroshiroClass = Kuroshiro.default || Kuroshiro;
    const KuromojiAnalyzerClass = KuromojiAnalyzer.default || KuromojiAnalyzer;
    const kuroshiro = new KuroshiroClass();
    await kuroshiro.init(new KuromojiAnalyzerClass());

    // Merge với file gốc database
    let finalData = [];
    if (fs.existsSync(outputPath)) {
        try { 
            finalData = JSON.parse(fs.readFileSync(outputPath, 'utf8')); 
            // Migration: Chuyển cấu trúc cũ lên cấu trúc bọc Level
            if (finalData.length > 0 && finalData[0].unitId) {
                console.log("🔄 Nâng cấp Database lên chuẩn mới (Level Bọc Ngoài)...");
                finalData = [{ level: "N2", unit_list: finalData }];
            }
        } catch(e) {
            console.log("⚠️ Cảnh báo: File vocabulary_generated.json hỏng định dạng, sẽ tạo lại mảng mới.");
        }
    }

    let injectedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split('|').map(s => s.trim());

        // File cấu trúc 12 cột:
        // 0: visual | 1: romaji | 2: hanviet | 3: vi | 4: en | 5: example_jp | 6: example_vi | 7: example_en | 8: grammar_jp | 9: grammar_vi | 10: grammar_en | 11: unitIdLevel
        if (parts.length < 12) {
            console.log(`⏩ Bỏ qua dòng ${i + 1} vì không đủ 12 cột: ${line.substring(0, 30)}...`);
            continue;
        }

        const v_visual = parts[0];
        const v_romaji = parts[1];
        const v_hanviet = parts[2];
        const v_vi = parts[3];
        const v_en = parts[4];
        let v_example_jp = parts[5];
        const v_example_vi = parts[6];
        const v_example_en = parts[7];
        const v_grammar_jp = parts[8];
        const v_grammar_vi = parts[9];
        const v_grammar_en = parts[10];

        const rawUnitStr = parts[11];
        const splitUnits = rawUnitStr.split('_'); // ['Unit', '1', 'N2']
        const v_unitId = splitUnits.length >= 2 ? `${splitUnits[0]}_${splitUnits[1]}` : "Unit_1";
        const v_level = splitUnits.length >= 3 ? splitUnits[2] : "N2";

        const v_studyInfo = getStudyInfo(v_unitId);

        // Tìm hoặc tạo Level Group
        let levelGroup = finalData.find(l => l.level === v_level);
        if (!levelGroup) {
            levelGroup = { level: v_level, unit_list: [] };
            finalData.push(levelGroup);
        }

        // Tìm hoặc tạo Unit Group bên trong Level
        let group = levelGroup.unit_list.find(g => g.unitId === v_unitId);
        if (!group) {
            group = {
                unitId: v_unitId,
                studyName_ENG: v_studyInfo.en,
                studyName_JA: v_studyInfo.ja,
                studyName_VI: v_studyInfo.vi,
                vocabulary_list: []
            };
            levelGroup.unit_list.push(group);
        }

        // Check trùng lặp từ vựng trong Unit
        const existingWordIndex = group.vocabulary_list.findIndex(v => v.visual === v_visual);
        
        console.log(`⌛ Kuromoji xử lý Furigana: [${v_visual}]...`);
        
        // Nếu câu JP chưa có thẻ ngoặc nhọn {} thì tiêm Furigana vào
        if (v_example_jp && !v_example_jp.includes('{')) {
            const resultWithRuby = await kuroshiro.convert(v_example_jp, { mode: "furigana", to: "hiragana" });
            // Gom <ruby> lại thành định dạng Game Engine
            v_example_jp = resultWithRuby.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '{$1|$2}');
        }

        const cleanObj = {
            visual: v_visual,
            romaji: v_romaji,
            hanviet: v_hanviet,
            vi: v_vi,
            en: v_en,
            example_jp: v_example_jp,
            example_vi: v_example_vi,
            example_en: v_example_en,
            grammar_jp: v_grammar_jp,
            grammar_vi: v_grammar_vi,
            grammar_en: v_grammar_en
        };

        if (existingWordIndex >= 0) {
            group.vocabulary_list[existingWordIndex] = cleanObj;
            console.log(`♻️  Đã CẬP NHẬT: ${v_visual}`);
        } else {
            group.vocabulary_list.push(cleanObj);
            console.log(`✅ Đã TIÊM MỚI: ${v_visual}`);
        }
        
        injectedCount++;
    }

    // Ghi đè Database
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 4), 'utf8');
    
    console.log(`\n======================================================`);
    console.log(`✨ HOÀN TẤT TEXT-TO-JSON PIPELINE!`);
    console.log(`✨ Đã nạp thành công ${injectedCount} Nodes vào Data Cốt Lõi.`);
    console.log(`✨ Định dạng mảng chuẩn: [vocabulary_generated.json]`);
    console.log(`======================================================\n`);
}

main().catch(console.error);
