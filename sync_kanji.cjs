const fs = require('fs');
const path = require('path');

const txtPath = path.join(__dirname, 'kanji.txt');
const jsonPath = path.join(__dirname, 'public', 'data', 'kanji.json');

try {
    const content = fs.readFileSync(txtPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() && line.includes('|'));

    // Cấu trúc map theo Unit
    const unitMap = {
        'Unit_1': { unitId: 'Unit_1', studyName_ENG: 'Human & Life', studyName_JA: '人間と生活', studyName_VI: 'Con người & Quan hệ nhân sinh', kanji_list: [] },
        'Unit_2': { unitId: 'Unit_2', studyName_ENG: 'Daily Life & Time', studyName_JA: '生活と時間', studyName_VI: 'Sinh hoạt & Thời gian', kanji_list: [] },
        'Unit_3': { unitId: 'Unit_3', studyName_ENG: 'Actions & Movement', studyName_JA: '動作と動き', studyName_VI: 'Hành động & Duy chuyển', kanji_list: [] }
    };

    lines.forEach((line) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 12) return;

        let tag = parts[11];
        // Sửa lỗi tag typo nếu có
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

        if (tag.includes('Tuần_1')) unitMap['Unit_1'].kanji_list.push(kanjiObj);
        else if (tag.includes('Tuần_2')) unitMap['Unit_2'].kanji_list.push(kanjiObj);
        else if (tag.includes('Tuần_3')) unitMap['Unit_3'].kanji_list.push(kanjiObj);
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
