import fs from 'fs';
import path from 'path';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../src/data/vocabulary.json');

async function main() {
    console.log("🌊 [Abyssal Pipeline] Khởi tạo Kuroshiro Analyzer...");
    
    const kuroshiro = new Kuroshiro();
    // Khởi tạo Kuromoji Analyzer. Dict sẽ dùng module có sẵn.
    await kuroshiro.init(new KuromojiAnalyzer());
    
    console.log("🔮 [Abyssal Pipeline] Bắt đầu quét vocabulary.json...");
    
    let rawData = fs.readFileSync(jsonPath, 'utf8');
    let vocabulary = JSON.parse(rawData);
    
    let updatedCount = 0;

    for (let i = 0; i < vocabulary.length; i++) {
        let entry = vocabulary[i];
        
        // Nếu đã có {} thì bỏ qua (ai đó đã config thủ công hoặc đã chạy script rồi)
        if (entry.example_jp && !entry.example_jp.includes('{')) {
            // Chuyển câu JP sang Romaji HTML ruby pattern
            // Kuroshiro support "furigana" mode which outputs <ruby>Kanji<rt>Kana</rt></ruby>
            // Nhưng để nhẹ database và thống nhất, ta dùng hàm parse ra string {Kanji|Furi}
            
            // Generate ruby template
            const resultWithRuby = await kuroshiro.convert(entry.example_jp, { mode: "furigana", to: "hiragana" });
            
            // Xử lí replace <ruby>X<rt>Y</rt></ruby> thành {X|Y}
            // VD: <ruby>動物<rt>どうぶつ</rt></ruby>
            const customFuriganaSyntax = resultWithRuby
                .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '{$1|$2}');
            
            entry.example_jp = customFuriganaSyntax;
            updatedCount++;
            console.log(`✅ Đã thêm Furigana: ${entry.visual}`);
        }
    }
    
    if (updatedCount > 0) {
        fs.writeFileSync(jsonPath, JSON.stringify(vocabulary, null, 4), 'utf8');
        console.log(`✨ [Abyssal Pipeline] Thành công! Đã tự động gắn Furigana cho ${updatedCount} từ vựng.`);
    } else {
        console.log(`💤 [Abyssal Pipeline] Dữ liệu đã tối ưu, không có câu nào cần xử lý.`);
    }
}

main().catch(err => {
    console.error("🔥 Lỗi Pipeline:", err);
});
