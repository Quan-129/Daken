const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, 'kanji.txt');
const jsonPath = path.join(__dirname, 'public', 'data', 'kanji.json');

try {
    const content = fs.readFileSync(txtPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && line.includes('|'));

    // Cấu trúc map theo Unit (sẽ được tạo động)
    const unitMap = {};

    lines.forEach((line) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 12) return;

        let tag = parts[11];
        // Sửa lỗi tag typo nếu có (ví dụ Ngày_6_6 -> Ngày_6)
        tag = tag.replace(/_(\d+)_(\d+)_N2$/, '_$1_N2');

        const kanjiObj = {
            visual: parts[0],
            romaji: parts[1],
            hanviet: parts[2],
            meaning: parts[3],
            wordType: parts[4],
            example_JA: parts[5],
            example_VI: parts[6],
            example_ENG: parts[7],
            grammar_JA: parts[8],
            grammar_VI: parts[9],
            grammar_ENG: parts[10],
            tag: tag
        };

        // Trích xuất số Tuần từ tag (ví dụ: Tuần_6_Ngày_1_N2 -> 6)
        const weekMatch = tag.match(/Tuần_(\d+)/);
        const weekNum = weekMatch ? weekMatch[1] : '1';
        const unitId = `Unit_${weekNum}`;

        if (!unitMap[unitId]) {
            unitMap[unitId] = {
                unitId: unitId,
                studyName_ENG: `Week ${weekNum} Focus`,
                studyName_JA: `第${weekNum}週`,
                studyName_VI: `Tuần ${weekNum}`,
                kanji_list: []
            };
        }
        unitMap[unitId].kanji_list.push(kanjiObj);
    });

    // BỌC LẠI TRONG CẤU TRÚC LEVEL "n2" ĐỂ GAME NHẬN DẠNG ĐÚNG
    const finalData = [
        {
            level: "n2",
            unit_list: Object.values(unitMap).filter(u => u.kanji_list.length > 0)
        }
    ];

    fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 2), 'utf8');
    console.log(`Successfully fixed structure! Synced ${lines.length} words into Level N2.`);
} catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
}
