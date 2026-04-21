import './style.css'; // Import the CSS file
import { StateManager } from './shared/utils/StateManager';
import { Engine } from './features/combat/engine/Engine';
import { EventBus } from './core/EventBus';
import { UISystem } from './features/combat/systems/UISystem';
import { AudioSystem } from './features/combat/systems/AudioSystem';
import { initAutoFitText } from './shared/utils/AutoFitText';
import { byId } from './shared/utils/uiHelpers';

// Register/mount moved Web Components so Vite bundles them
import './shared/ui/AvatarSeal.js';
import './features/social/FriendList.js';
import './shared/ui/GameMenu.js';
import './shared/ui/LofiBackground.js';
import './features/ranking/RankingBoard.js';

console.log('--- NEON TYPING ARCADE: PHASE 4 ---');

import { GameConfig } from './config';

// 0. Khởi động Auto-fit Text Toàn Dự Án
initAutoFitText();

const eventBus = EventBus.getInstance();
const stateManager = StateManager.getInstance();

// 1. Nạp MockData
stateManager.loadData();
stateManager.loadLevelHubData('N2');

// 2. Lấy HTML Elements UI
const canvas = byId('gameCanvas') as HTMLCanvasElement;

// 3. Khởi tạo các Systems
const engine = new Engine(canvas);
new UISystem();
new AudioSystem();

// Expose globals for console debugging
(window as any).EventBus = eventBus;
(window as any).StateManager = stateManager;

// 4. Lắng nghe Event GAME_START từ UI khi người dùng nhấn nút START
eventBus.subscribe('GAME_START', async (config: { mode: string, studyLevel?: string }) => {
    console.log(`[main.ts] Starting game with mode: ${config.mode}, studyLevel: ${config.studyLevel}`);
    
    if (config.mode === 'study' && config.studyLevel) {
        await stateManager.loadStudyData(config.studyLevel);
    } else {
        // Có thể bổ sung Nạp lại mockData nếu thoát khỏi StudyMode
        // Nhưng tạm thời StateManager.loadData()
        stateManager.loadData();
    }

    // Cài đặt mode cho engine
    engine.mode = config.mode;
    engine.setSpeedModifier(1.0);
    
    // Reset và bắt đầu engine
    engine.stop();
    engine.clearEnemiesAndCanvas();
    
    // Xóa quái cũ nếu có bằng cách truy xuất và reset (tạm thời để Engine lo việc khởi tạo)
    // Đối với Wave của mode chill/easy, gọi spawnWave
    if (config.mode === 'chill' || config.mode === 'easy' || config.mode === 'study') {
        engine.spawnWave();
    }
    
    engine.start();
});

eventBus.subscribe('GAME_START_N2', (config: { mode: string, studyLevel: string, words: any[], unitIdx: number, sessionIdx: number }) => {
    console.log(`[main.ts] Starting N2 Session: Unit ${config.unitIdx}, Session ${config.sessionIdx}`);
    engine.mode = config.mode;
    engine.setSpeedModifier(1.0);
    
    engine.stop();
    engine.clearEnemiesAndCanvas();
    
    // Inject words directly into Spawner!
    const spawner = (engine as any).spawner; // Hack để lấy spawner ra hoặc dùng public method
    if (spawner && typeof spawner.startStudySession === 'function') {
        spawner.startStudySession(config.words);
    }
    
    // Lưu N2 context để Game Over / Win report biết đường mà cập nhật UI nếu cần
    (engine as any).currentN2Context = {
        unitIdx: config.unitIdx,
        sessionIdx: config.sessionIdx,
        mode: config.mode
    };
    (engine as any).lastStartTime = performance.now();
    
    engine.spawnWave();
    engine.start();
});

eventBus.subscribe('STUDY_SESSION_END', () => {
    console.log(`[main.ts] Study Session End!`);
    const elapsedMs = performance.now() - ((engine as any).lastStartTime || performance.now());
    const elapsedMins = elapsedMs / 60000;
    
    const typing = engine.getTypingLogic();
    const acc = typing.totalKeystrokes > 0 ? typing.correctKeystrokes / typing.totalKeystrokes : 0;
    const wpm = elapsedMins > 0 ? Math.round((typing.correctKeystrokes / 5) / elapsedMins) : 0;
    
    const scoreEl = byId('scoreVal');
    const score = scoreEl ? parseInt(scoreEl.innerText) || 0 : 0;

    // Calculate Rank based on Score thresholds in GameConfig
    const thresholds = GameConfig.rankThresholds;
    let rank = 'D';
    if (score >= thresholds.S) rank = 'S';
    else if (score >= thresholds.A) rank = 'A';
    else if (score >= thresholds.B) rank = 'B';
    else if (score >= thresholds.C) rank = 'C';

    const ctx = (engine as any).currentN2Context;
    if (ctx) {
        stateManager.saveN2SessionProgress(ctx.unitIdx, ctx.sessionIdx, {rank, acc, wpm, score}, ctx.mode);
        eventBus.publish('N2_SESSION_CLEARED', { rank, acc, wpm, score, unitIdx: ctx.unitIdx, sessionIdx: ctx.sessionIdx });
        (engine as any).currentN2Context = null; // Clear
    }
    
    engine.stop();
    engine.clearEnemiesAndCanvas();
});

// 5. Bắt event GAME_OVER để stop engine
eventBus.subscribe('GAME_OVER', () => {
    console.log(`[main.ts] GAME OVER!`);
    engine.stop();
});

eventBus.subscribe('GAME_PAUSED', () => {
    engine.stop();
});

eventBus.subscribe('GAME_RESUMED', () => {
    engine.start();
});

eventBus.subscribe('TUTORIAL_COMPLETE', () => {
    console.log(`[main.ts] TUTORIAL COMPLETE!`);
    engine.stop();
    engine.clearEnemiesAndCanvas();
});

eventBus.subscribe('GAME_STOPPED', () => {
    engine.clearEnemiesAndCanvas();
});

// 6. Tính năng "Jump To Test": Tự động bắt đầu Game nếu URL có tham số test=waveX
const urlParams = new URLSearchParams(window.location.search);
const testWave = urlParams.get('test');
if (testWave && testWave.startsWith('wave')) {
    const waveNum = parseInt(testWave.replace('wave', ''));
    console.log(`[main.ts] Auto-starting Study Mode for Wave ${waveNum} testing...`);
    
    setTimeout(() => {
        // Set wave before starting
        const spawner = engine['spawner'];
        if (spawner && !isNaN(waveNum)) {
            spawner.currentStudyWave = waveNum;
            // Nếu là wave 5 thì set luôn StartTime
            if (waveNum === 5) {
                (spawner as any).wave5StartTime = performance.now();
            }
        }
        eventBus.publish('GAME_START', { mode: 'study', studyLevel: 'N5' });
    }, 1500);
}


