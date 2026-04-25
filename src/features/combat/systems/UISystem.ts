import { EventBus } from '../../../core/EventBus';
import { StateManager } from '../../../shared/utils/StateManager';
import { GameConfig } from '../../../config';
import { byId } from '../../../shared/utils/uiHelpers';
import { AuthSystem } from '../../../shared/utils/AuthSystem';
import { supabase } from '../../../shared/utils/supabase';
import { LanguageConfig } from '../../../configLanguage'; // Verified path: src/configLanguage.ts
import emailjs from '@emailjs/browser';

export class UISystem {
    private scoreEl = byId('scoreVal');
    private hpEl = byId('hpVal');
    private bufferTrash = byId('bufferTrash');
    private bufferTyped = byId('bufferTyped');

    // UI Panels
    private messageCenter = byId('messageCenter');
    private msgTitle = byId('msgTitle');
    private msgSub = byId('msgSub');
    private scoreFeedContainer = byId('score-feed-container');

    // Profile Card UI
    private profileCard = byId('player-profile-card');
    private playerNameEl = byId('playerName');
    private playerTagEl = byId('playerTag');
    private playerRankEl = byId('playerRank');
    private totalScoreEl = byId('totalScoreVal');
    private avgAccEl = byId('avgAccVal');
    private avgWpmEl = byId('avgWpmVal');
    private playerAvtImg = byId('playerAvt') as HTMLImageElement;
    private avatarTrigger = byId('avatarTrigger');
    private avtFileInput = byId('avtFileInput') as HTMLInputElement;
    private currentScoreBox = byId('current-score-box');
    // Login Elements
    private loginScreen = byId('login-screen');
    private loginStatus = byId('loginStatus');

    // Auth Views
    private setupView = byId('setup-view');
    private socialLoginArea = byId('social-login-area');

    // Auth Inputs & Buttons
    private setupNameInput = byId('setupName') as HTMLInputElement;
    private finishSetupBtn = byId('finishSetupBtn');
    private googleLoginBtn = byId('googleLoginBtn');

    // Controls
    private startBtn = byId('startBtn');

    private gameContainer = byId('game-container');

    // N2 Hub
    // JLPT Hub
    private jlptHubPage = byId('jlpt-hub-page');
    private hubBackBtn = byId('hubBackBtn');
    private jlptUnitsContainer = byId('jlptUnitsContainer');
    private jlptCalibrationModal = byId('jlpt-calibration-modal');
    private closeCalibrationBtn = byId('closeCalibrationBtn');
    private startJLPTSessionBtn = byId('startJLPTSessionBtn');
    private calibSessionTitle = byId('calibration-session-title');
    private hubLevelName = byId('hubLevelName');
    private hubTargetType = byId('hubTargetType');
    private hubMainTitle = byId('hubMainTitle');
    private hubSealName = byId('hubSealName');
    private jlptTotalProgress = byId('jlpt-total-progress');
    private calibBgmSlider = byId('calibBgmSlider') as HTMLInputElement;
    private calibSfxSlider = byId('calibSfxSlider') as HTMLInputElement;
    private calibTtsSlider = byId('calibTtsSlider') as HTMLInputElement;
    private currentN2Context: { unitIdx: number, sessionIdx: number } | null = null;

    private currentHp: number = 5;
    private currentScore: number = 0;

    // Wave Progress State
    private waveProgressContainer = byId('waveProgressContainer');
    private waveLabel = byId('waveLabel');
    private currentWaveNumber = 1;
    private currentMode = 'medium';
    private currentHubMode: string = 'study'; // 'study', 'kanji', 'grammar'
    private currentHubLevel: string = 'n2';
    private currentStudyLevel = 'n2';
    private enemiesSpawnedThisWave = 0;
    private isRetryPhase = false;

    // Leaderboard UI
    private leaderboardTrigger = byId('leaderboard-trigger');
    private leaderboardTerminal = byId('leaderboard-terminal');
    private closeLeaderboardBtn = byId('closeLeaderboardBtn');
    private leaderboardList = byId('leaderboard-list');
    private myRankingFooter = byId('my-ranking');
    private rankScopeBtns: NodeListOf<Element> | null = null;
    private rankMetricBtns: NodeListOf<Element> | null = null;

    private currentRankScope: 'global' | 'friends' = 'global';
    private currentRankMetric: 'score' | 'wpm' | 'accuracy' = 'score';
    private isGameActive = false;
    private waveSegmentStates: ('empty' | 'filled' | 'failed')[] = [];
    private enemiesKilledThisWave = 0;
    private isSessionEnding = false;
    private currentSessionWordsCount = 20;

    // Timer and Summary state
    private waveTimerEl = byId('waveTimer');
    private comboLabel = byId('comboLabel');
    private summaryModal = byId('summaryModal');
    private synapseMatrixModal = byId('synapseMatrixModal');
    private generalGuideModal = byId('general-guide-modal');
    private closeGuideBtn = byId('closeGuideBtn');
    private guideTrigger = byId('guideTrigger');
    private dontShowGuideCheckbox = byId('dontShowGuide') as HTMLInputElement;
    private sumBaseScore = byId('sumBaseScore');
    private sumMaxCombo = byId('sumMaxCombo');
    private sumTime = byId('sumTime');
    private sumTimeBonus = byId('sumTimeBonus');
    private sumFinalScore = byId('sumFinalScore');
    private sumRank = byId('sumRank');
    private summaryCloseBtn = byId('summaryCloseBtn');

    private startTime: number = 0;
    private timerInterval: number | null = null;
    private isTimerPaused: boolean = false;
    private timeElapsedBeforePause: number = 0;
    private maxComboAchieved: number = 0;
    private savedBaseScore: number = 0;
    private waveStartTime: number = 0;

    // Wave results for summary
    private waveResults: Record<number, { baseScore: number, bonusScore: number }> = {};
    private currentWaveBaseScore: number = 0;
    private currentWaveBonusScore: number = 0;
    private wave5Performance = { correct: 0, total: 0, startTime: 0, durationMs: 0 };

    // Music Player Controls
    private miniPlayer = byId('mini-player');
    private miniTitle = byId('mini-title');
    private miniProgressFill = byId('mini-progress-fill');
    private miniPlayBtn = byId('mini-play');
    private miniPrevBtn = byId('mini-prev');
    private miniNextBtn = byId('mini-next');
    private miniVolSlider = byId('mini-vol') as HTMLInputElement;
    private miniDisc = byId('mini-disc');

    // Playlist Modal Controls
    private playlistBtn = byId('playlistBtn');
    private playlistModal = byId('playlist-modal');
    private folderView = byId('folder-view');
    private songView = byId('song-view');
    private folderList = byId('folderList');
    private newFolderName = byId('newFolderName') as HTMLInputElement;
    private addFolderBtn = byId('addFolderBtn');
    private closeFolderBtn = byId('closeFolderBtn');

    private currentFolderName = byId('currentFolderName');
    private playlistList = byId('playlistList');
    private newSongUrl = byId('newSongUrl') as HTMLInputElement;
    private addSongBtn = byId('addSongBtn');
    private backToFoldersBtn = byId('backToFoldersBtn');

    private mainPlaylistHud = byId('main-playlist-hud');
    private hudPlaylistName = byId('hudPlaylistName');
    private hudPlaylistSongs = byId('hudPlaylistSongs');

    private miniSettingsBtn = byId('mini-settings-btn');
    private audioMixerDropdown = byId('audioMixerDropdown');
    private ttsVolSlider = byId('ttsVolSlider') as HTMLInputElement;
    private bgmVolSlider = byId('bgmVolSlider') as HTMLInputElement;
    private sfxVolSlider = byId('sfxVolSlider') as HTMLInputElement;
    private ttsRateSelect = byId('ttsRateSelect') as HTMLSelectElement;

    private menuControls = byId('menuControls');
    private stopBtn = byId('stopBtn');
    private hudTerminal = byId('hud-terminal');

    // Wave 5 Speed Control
    private wave5SpeedControl = byId('wave5-speed-control');
    private wave5SpeedSlider = byId('wave5SpeedSlider') as HTMLInputElement;
    private speedValDisplay = byId('speedValDisplay');
    private batteryLabel = byId('hpBatteryContainer')?.querySelector('.battery-label');

    // Màn hình xác nhận STOP
    private stopConfirmModal = byId('stopConfirmModal');
    private confirmStopBtn = byId('confirmStopBtn');
    private cancelStopBtn = byId('cancelStopBtn');

    // Feedback UI
    private feedbackTrigger = byId('feedback-trigger');
    private feedbackModal = byId('feedback-modal');
    private closeFeedbackBtn = byId('closeFeedbackBtn');
    private sendFeedbackBtn = byId('sendFeedbackBtn') as HTMLButtonElement;
    private feedbackText = byId('feedbackText') as HTMLTextAreaElement;
    private feedbackStatus = byId('feedback-status');

    // Admin Feedback View
    private adminFeedbackModal = byId('admin-feedback-modal');
    private closeAdminFeedbackBtn = byId('closeAdminFeedbackBtn');
    private adminFeedbackList = byId('admin-feedback-list');
    private refreshFeedbackBtn = byId('refreshFeedbackBtn');
    private feedbackCountEl = byId('feedback-count');

    private calibWaveRow = byId('calibWaveRow');
    private getCalibWaveChecks(): HTMLInputElement[] {
        return Array.from(document.querySelectorAll('.calib-wave-chk')) as HTMLInputElement[];
    }

    private isReviewMode = false;

    // State Thư Viện
    private myLibrary: { id: string, name: string, songs: { url: string, title: string }[] }[] = [];
    private activeFolderId: string | null = null;
    private viewingFolderId: string | null = null;
    private stateManager = StateManager.getInstance();

    public alignEnemyToTerminal(enemy: any) {
        if (!this.hudTerminal || !this.gameContainer || !enemy) return;

        const hudRect = this.hudTerminal.getBoundingClientRect();
        const canvasRect = this.gameContainer.getBoundingClientRect();
        const terminalTop = hudRect.top - canvasRect.top;

        // Terminal top tính từ mép trên canvas
        // Cạnh dưới của hình render Enemy là: enemy.y + drawOffsetY + 35
        // Chúng ta cần: Cạnh dưới đó = terminalTop - 15px
        // => enemy.y = terminalTop - 50 - drawOffsetY

        let drawOffsetY = 0;
        const isStudy = (enemy: any) => (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar');
        if (enemy.mode === 'easy' || (isStudy(enemy) && (enemy.study.wave === 1 || enemy.study.wave === 2 || enemy.study.wave === 4))) {
            drawOffsetY = -200;
        }

        enemy.y = terminalTop - 50 - drawOffsetY;
        enemy.baseY = enemy.y;
    }

    constructor() {
        this.applyConfigToSliders();
        this.loadLibrary();
        this.renderSVGRadialMenu();
        this.setupEventListeners();
        this.subscribeToEventBus();
        this.checkExistingSession();
        this.setupAvatarUpload();
        this.updateProfileUI(); // Cập nhật Profile ngay khi khởi tạo
        this.setupLeaderboardLogic();
        this.setupWave5SpeedLogic();

        // Đảm bảo HP và Wave UI ẩn khi ở Lobby
        const batteryContainer = byId('hpBatteryContainer');
        if (batteryContainer) batteryContainer.style.display = 'none';
        if (this.waveProgressContainer) this.waveProgressContainer.classList.add('hidden');

        this.setupGuideLogic();
        this.setupFeedbackLogic();
        this.setupAdminLogic();
        this.updateFlagUI();
        this.applyLanguage();
    }

    private updateFlagUI() {
        const flagEl = byId('langFlag');
        if (!flagEl) return;
        
        const FLAG_VN = `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg"><rect width="30" height="20" fill="#da251d"/><polygon points="15,4 16.12,8.47 20.75,8.47 17,11.24 18.12,15.71 15,12.94 11.88,15.71 13,11.24 9.25,8.47 13.88,8.47" fill="#ffff00"/></svg>`;
        const FLAG_US = `<svg viewBox="0 0 1235 650" xmlns="http://www.w3.org/2000/svg"><rect width="1235" height="650" fill="#3c3b6e"/><path d="M0 50h1235M0 150h1235M0 250h1235M0 350h1235M0 450h1235M0 550h1235" stroke="#fff" stroke-width="50"/><rect width="494" height="350" fill="#3c3b6e"/><g fill="#fff"><circle cx="50" cy="50" r="10"/><circle cx="150" cy="50" r="10"/><circle cx="250" cy="50" r="10"/><circle cx="350" cy="50" r="10"/><circle cx="450" cy="50" r="10"/></g></svg>`;
        
        const lang = this.stateManager.studyLanguage || 'en';
        flagEl.innerHTML = (lang === 'vi') ? FLAG_VN : FLAG_US;
        
        // Cập nhật trạng thái cấu hình ngôn ngữ
        LanguageConfig.current = (lang === 'vi' ? 'vi' : 'en');
    }

    private applyLanguage() {
        const lang = LanguageConfig.current;
        const t = LanguageConfig.translations[lang];

        // 1. LOGIN SCREEN
        const setupPrompt = byId('setup-view')?.querySelector('.login-prompt');
        if (setupPrompt) setupPrompt.textContent = t.auth.initializing;
        const setupLabel = byId('setup-view')?.querySelector('label');
        if (setupLabel) setupLabel.textContent = t.auth.chooseName;
        if (this.setupNameInput) this.setupNameInput.placeholder = t.auth.nicknamePlaceholder;
        const setupHint = byId('setup-view')?.querySelector('p');
        if (setupHint) setupHint.textContent = t.auth.assignIdHint;
        if (this.finishSetupBtn) this.finishSetupBtn.textContent = t.auth.syncIdentity;

        const authPrompt = byId('social-login-area')?.querySelector('.login-prompt');
        if (authPrompt) authPrompt.textContent = t.auth.agentAuth;
        if (this.googleLoginBtn) {
            const btn = this.googleLoginBtn;
            // Xóa tất cả các node văn bản hiện có (nếu có)
            btn.childNodes.forEach(node => {
                if (node.nodeType === 3) node.textContent = '';
            });
            // Tìm hoặc tạo node văn bản để gán giá trị mới
            const textNode = Array.from(btn.childNodes).find(n => n.nodeType === 3);
            if (textNode) {
                textNode.textContent = ' ' + t.auth.loginGoogle;
            } else {
                btn.appendChild(document.createTextNode(' ' + t.auth.loginGoogle));
            }
        }
        const authHint = byId('social-login-area')?.querySelector('p');
        if (authHint) authHint.textContent = t.auth.loginHint;
        if (this.loginStatus) {
            this.loginStatus.textContent = t.auth.statusReady;
        }

        // 2. PROFILE
        const overlay = byId('avatarTrigger')?.querySelector('.avatar-overlay');
        if (overlay) overlay.textContent = t.profile.edit;
        const rankLabel = byId('profileRankLabel');
        if (rankLabel) rankLabel.textContent = t.profile.rank + ":";
        const scoreLabel = byId('profileScoreLabel');
        if (scoreLabel) scoreLabel.textContent = t.profile.totalScore;
        const accLabel = byId('profileAccLabel');
        if (accLabel) accLabel.textContent = t.profile.accuracy;
        const wpmLabel = byId('profileWpmLabel');
        if (wpmLabel) wpmLabel.textContent = t.profile.wpm;
        
        if (this.playerNameEl && (this.playerNameEl.innerText === 'Guest' || this.playerNameEl.innerText === 'Khách')) {
            this.playerNameEl.innerText = t.profile.guest;
        }
        if (this.playerRankEl && (this.playerRankEl.innerText === 'Unranked' || this.playerRankEl.innerText === 'Chưa xếp hạng')) {
            this.playerRankEl.innerText = t.profile.unranked;
        }
        const logoutBtn = byId('logoutBtn');
        if (logoutBtn) logoutBtn.textContent = t.profile.disconnect;

        // 3. HUD
        const scoreBoxLabel = this.currentScoreBox?.querySelector('.label');
        if (scoreBoxLabel) scoreBoxLabel.textContent = t.hud.score;
        if (this.stopBtn) this.stopBtn.textContent = t.hud.stop;
        const speedLabel = this.wave5SpeedControl?.querySelector('.speed-label');
        if (speedLabel) speedLabel.innerHTML = `${t.hud.speedControl}: <span id="speedValDisplay">x${parseFloat(this.wave5SpeedSlider?.value || '1.0').toFixed(1)}</span>`;
        // Re-assign display element because we just overwrote its parent's innerHTML
        this.speedValDisplay = byId('speedValDisplay');
        if (this.batteryLabel) this.batteryLabel.textContent = t.hud.energy;

        // 4. MODALS
        if (this.jlptCalibrationModal) {
            const calibTitle = this.jlptCalibrationModal.querySelector('.summary-title');
            if (calibTitle) calibTitle.textContent = t.modals.calibration;
        }
        if (this.startJLPTSessionBtn) this.startJLPTSessionBtn.textContent = t.modals.initialize;

        if (this.summaryModal) {
            const sumTitle = this.summaryModal.querySelector('.summary-title');
            if (sumTitle) sumTitle.textContent = t.modals.tutorialComplete;
            if (this.summaryCloseBtn) this.summaryCloseBtn.textContent = t.modals.continue;
        }

        if (this.synapseMatrixModal) {
            const synTitle = this.synapseMatrixModal.querySelector('.summary-title');
            if (synTitle) synTitle.textContent = t.modals.synapseMatrix;
            const synHint = this.synapseMatrixModal.querySelector('p');
            if (synHint) synHint.textContent = t.modals.absorptionStatus;
            const synClose = byId('synapseCloseBtn');
            if (synClose) synClose.textContent = t.modals.terminateSession;
        }

        if (this.stopConfirmModal) {
            const stopTitle = this.stopConfirmModal.querySelector('.summary-title');
            if (stopTitle) stopTitle.textContent = t.modals.systemWarning;
            const stopText = this.stopConfirmModal.querySelector('p');
            if (stopText) {
                stopText.innerHTML = `${t.modals.stopConfirm}<br><span style="color: #ff4757; font-weight: bold;">${t.modals.unsavedWarning}</span>`;
            }
            if (this.confirmStopBtn) this.confirmStopBtn.textContent = t.modals.confirmStop;
        }

        // 5. FEEDBACK
        if (this.feedbackModal) {
            const fbTitle = this.feedbackModal.querySelector('.summary-title');
            if (fbTitle) fbTitle.textContent = t.feedback.title;
            const fbDesc = this.feedbackModal.querySelector('p');
            if (fbDesc) fbDesc.innerHTML = `${t.feedback.desc}<br><span style="color: #ff00c1; font-size: 0.8rem;">[ TARGET: minhquan12092005@gmail.com ]</span>`;
            const fbLabel = this.feedbackModal.querySelector('label');
            if (fbLabel) fbLabel.textContent = t.feedback.label;
            if (this.feedbackText) this.feedbackText.placeholder = t.feedback.placeholder;
            if (this.sendFeedbackBtn) this.sendFeedbackBtn.textContent = t.feedback.send;
        }

        // 5. MUSIC
        if (this.folderView) {
            const libTitle = this.folderView.querySelector('h2');
            if (libTitle) libTitle.textContent = t.music.library;
            if (this.newFolderName) this.newFolderName.placeholder = t.music.newFolderPlace;
            if (this.addFolderBtn) this.addFolderBtn.textContent = t.music.create;
            const xClose = this.folderView.querySelector('.folder-x-close'); // Check if exists
            if (xClose) xClose.textContent = '×'; // Keep icon
        }
        if (this.songView) {
            if (this.newSongUrl) this.newSongUrl.placeholder = t.music.newSongPlace;
            if (this.addSongBtn) this.addSongBtn.textContent = t.music.add;
            if (this.backToFoldersBtn) this.backToFoldersBtn.textContent = "⬅ " + t.music.back;
        }

        // 6. GUIDE
        if (this.generalGuideModal) {
            const guideTitle = this.generalGuideModal.querySelector('h2');
            if (guideTitle) guideTitle.textContent = t.guide.header;
            const dontShowSpan = this.generalGuideModal.querySelector('.dont-show-again span');
            if (dontShowSpan) dontShowSpan.textContent = t.guide.dontShow;
            if (this.closeGuideBtn) this.closeGuideBtn.textContent = t.guide.understood;

            const slides = this.generalGuideModal.querySelectorAll('.guide-slide');
            slides.forEach((slide, index) => {
                const sData = t.guide.slides[index];
                if (!sData) return;
                const badge = slide.querySelector('.badge');
                if (badge) badge.textContent = sData.badge;
                const h3 = slide.querySelector('h3');
                if (h3) h3.textContent = sData.title;
                const contentBody = slide.querySelector('.guide-slide-content');
                if (contentBody) {
                    let bodyHtml = `<p class="vibe-text">${sData.vibe}</p>`;
                    if (sData.content) bodyHtml += `<p>${sData.content}</p>`;
                    if (index < 4) {
                        bodyHtml += `<ul>`;
                        if (sData.bullet1) bodyHtml += `<li>${sData.bullet1}</li>`;
                        if (sData.bullet2) bodyHtml += `<li>${sData.bullet2}</li>`;
                        if (sData.bullet3) bodyHtml += `<li>${sData.bullet3}</li>`;
                        bodyHtml += `</ul>`;
                        if (sData.hint) bodyHtml += `<p class="hint">${sData.hint}</p>`;
                    } else {
                        bodyHtml += `<ul class="rank-list" style="list-style: none; padding-left: 0;">`;
                        bodyHtml += `<li><strong style="color: #ffd700; text-shadow: 0 0 10px #ffd700;">${sData.rankS}</strong></li>`;
                        bodyHtml += `<li><strong style="color: #00e676; text-shadow: 0 0 10px #00e676;">${sData.rankA}</strong></li>`;
                        bodyHtml += `<li><strong style="color: #00f5ff; text-shadow: 0 0 10px #00f5ff;">${sData.rankB}</strong></li>`;
                        bodyHtml += `<li><strong style="color: #ff9800; text-shadow: 0 0 10px #ff9800;">${sData.rankC}</strong></li>`;
                        bodyHtml += `</ul>`;
                        if (sData.hint) bodyHtml += `<p class="hint" style="text-align: center;">${sData.hint}</p>`;
                    }
                    contentBody.innerHTML = bodyHtml;
                }
            });
        }

        // 7. LEADERBOARD
        if (this.leaderboardTerminal) {
            const lbTitle = this.leaderboardTerminal.querySelector('.glitch-text');
            if (lbTitle) {
                lbTitle.textContent = t.leaderboard.title;
                lbTitle.setAttribute('data-text', t.leaderboard.title);
            }
            if (this.leaderboardList && this.leaderboardList.querySelector('.loading-spinner')) {
                this.leaderboardList.querySelector('.loading-spinner')!.textContent = t.leaderboard.syncing;
            }
            
            const scopeBtns = this.leaderboardTerminal.querySelectorAll('.scope-btn');
            if (scopeBtns.length >= 2) {
                scopeBtns[0].textContent = t.leaderboard.global;
                scopeBtns[1].textContent = t.leaderboard.friends;
            }
            
            const metricBtns = this.leaderboardTerminal.querySelectorAll('.metric-btn');
            if (metricBtns.length >= 3) {
                metricBtns[0].textContent = t.leaderboard.score;
                metricBtns[1].textContent = t.leaderboard.wpm;
                metricBtns[2].textContent = t.leaderboard.acc;
            }
        }

        // 8. JLPT HUB (If visible)
        if (this.hubBackBtn) {
            this.hubBackBtn.innerHTML = `<span class="back-icon">◄</span> ${t.hub.returnLobby}`;
        }

        if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
            const modeType = this.currentHubMode;
            if (this.hubTargetType) {
                if (modeType === 'study') this.hubTargetType.innerText = t.hub.vocabulary;
                else if (modeType === 'kanji') this.hubTargetType.innerText = t.hub.kanji;
                else if (modeType === 'grammar') this.hubTargetType.innerText = t.hub.grammar;
            }
            if (this.hubMainTitle) this.hubMainTitle.innerText = t.hub.archives;
            this.renderJLPTUnits();
        }

        const hubStatsList = document.querySelectorAll('.zen-stat .zen-label');
        if (hubStatsList.length >= 5) {
            hubStatsList[0].textContent = t.hub.stats.overallRank;
            hubStatsList[1].textContent = t.hub.stats.avgAccuracy;
            hubStatsList[2].textContent = t.hub.stats.totalScore;
            hubStatsList[3].textContent = t.hub.stats.avgWpm;
            hubStatsList[4].textContent = t.hub.stats.progress;
        }

        // 9. START BUTTON & FEEDBACK
        if (this.startBtn && !this.isGameActive) {
            this.startBtn.textContent = t.messages.start;
        }

        // 10. AUDIO MIXER & MINI PLAYER
        if (this.audioMixerDropdown) {
            const playlistBtn = this.audioMixerDropdown.querySelector('#playlistBtn');
            if (playlistBtn) playlistBtn.textContent = `⚙️ ${t.audio.playlist}`;
            const mixerTitle = this.audioMixerDropdown.querySelector('h3');
            if (mixerTitle) mixerTitle.textContent = t.audio.mixer;
            
            const labels = this.audioMixerDropdown.querySelectorAll('.mixer-row label');
            if (labels.length >= 4) {
                labels[0].textContent = t.audio.vocals;
                labels[1].textContent = t.audio.bgm;
                labels[2].textContent = t.audio.sfx;
                labels[3].textContent = t.audio.ttsRate;
            }
            
            const rateSelect = byId('ttsRateSelect') as HTMLSelectElement;
            if (rateSelect) {
                rateSelect.options[0].text = `0.7x (${t.audio.slow})`;
                rateSelect.options[1].text = `0.9x (${t.audio.medium})`;
                rateSelect.options[2].text = `1.2x (${t.audio.fast})`;
            }
        }

        if (this.jlptCalibrationModal) {
            const labels = this.jlptCalibrationModal.querySelectorAll('.mixer-row label');
            if (labels.length >= 3) {
                labels[0].textContent = t.audio.bgm;
                labels[1].textContent = t.audio.sfx;
                labels[2].textContent = t.audio.vocals;
            }
        }

        const miniTitle = byId('mini-title');
        if (miniTitle && (miniTitle.innerText === 'Chưa có bài hát...' || miniTitle.innerText === 'No song selected...')) {
            miniTitle.innerText = t.music.noSong;
        }
    }

    private setupGuideLogic() {
        if (!this.generalGuideModal || !this.closeGuideBtn || !this.guideTrigger) return;

        const slides = this.generalGuideModal.querySelectorAll('.guide-slide');
        const dots = this.generalGuideModal.querySelectorAll('.dot');
        const prevBtn = byId('prevSlideBtn');
        const nextBtn = byId('nextSlideBtn');
        let currentSlide = 0;

        const updateSlides = () => {
            slides.forEach((s, i) => {
                s.classList.toggle('active', i === currentSlide);
            });
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
            // Cập nhật trạng thái nút
            if (prevBtn) (prevBtn as HTMLButtonElement).disabled = (currentSlide === 0);
            if (nextBtn) (nextBtn as HTMLButtonElement).disabled = (currentSlide === slides.length - 1);
        };

        // Khởi tạo trang thái đầu
        updateSlides();

        prevBtn?.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlides();
                EventBus.getInstance().publish('AUDIO_BEEP', null);
            }
        });

        nextBtn?.addEventListener('click', () => {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                updateSlides();
                EventBus.getInstance().publish('AUDIO_BEEP', null);
            }
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlides();
                EventBus.getInstance().publish('AUDIO_BEEP', null);
            });
        });

        // Xử lý nút ? (Help Icon)
        this.guideTrigger.addEventListener('click', () => {
            currentSlide = 0; // Luôn mở lại ở slide đầu
            updateSlides();
            this.generalGuideModal?.classList.remove('hidden');
        });

        // Xử lý nút Đóng
        this.closeGuideBtn.addEventListener('click', () => {
            if (this.dontShowGuideCheckbox?.checked) {
                localStorage.setItem('DAKEN_GUIDE_SHOWN', 'true');
            }
            this.generalGuideModal?.classList.add('hidden');
            EventBus.getInstance().publish('AUDIO_BEEP', null);
        });
    }

    private setupFeedbackLogic() {
        if (!this.feedbackTrigger || !this.feedbackModal || !this.closeFeedbackBtn || !this.sendFeedbackBtn || !this.feedbackText) return;

        // Mở modal
        this.feedbackTrigger.addEventListener('click', () => {
            if (this.isGameActive) {
                EventBus.getInstance().publish('GAME_PAUSED', null);
            }
            this.feedbackModal?.classList.remove('hidden');
            this.feedbackText.value = '';
            if (this.feedbackStatus) this.feedbackStatus.innerText = '';
            EventBus.getInstance().publish('LOCK_KEYBOARD', true);
            EventBus.getInstance().publish('AUDIO_BEEP', null);
            
            // Auto focus vào textarea
            setTimeout(() => this.feedbackText.focus(), 100);
        });

        // Đóng modal
        const closeModal = () => {
            this.feedbackModal?.classList.add('hidden');
            EventBus.getInstance().publish('LOCK_KEYBOARD', false);
            EventBus.getInstance().publish('AUDIO_BEEP', null);
            if (this.isGameActive) {
                this.triggerResumeCountdown();
            }
        };

        this.closeFeedbackBtn.addEventListener('click', closeModal);

        // Gửi feedback
        this.sendFeedbackBtn.addEventListener('click', async () => {
            const content = this.feedbackText.value.trim();
            if (!content) {
                if (this.feedbackStatus) {
                    this.feedbackStatus.innerText = '[ ERROR: CONTENT_EMPTY ]';
                    this.feedbackStatus.style.color = '#ff3860';
                }
                return;
            }

            if (content.length < 5) {
                if (this.feedbackStatus) {
                    this.feedbackStatus.innerText = '[ ERROR: CONTENT_TOO_SHORT ]';
                }
                return;
            }

            // Trạng thái đang gửi
                    const t = LanguageConfig.translations[LanguageConfig.current];
                    this.sendFeedbackBtn!.innerText = t.feedback.sending;
                    this.sendFeedbackBtn!.disabled = true;

            try {
                // Lấy thông tin user hiện tại nếu có
                const { data: { user } } = await supabase.auth.getUser();
                const userEmail = user?.email || 'guest@cyber-zen.io';
                const auth = AuthSystem.getInstance();
                const userProfile = auth.getCurrentUser();
                const displayName = userProfile?.name || localStorage.getItem('DAKEN_NAME') || 'Unknown Ronin';

                // Lưu vào database (Yêu cầu bảng 'feedbacks' đã tồn tại)
                const { error } = await supabase
                    .from('feedbacks')
                    .insert([
                        { 
                            content: content, 
                            user_id: user?.id || null,
                            user_email: userEmail,
                            display_name: displayName,
                            created_at: new Date().toISOString()
                        }
                    ]);

                if (error) throw error;

                // --- Gửi về Email (Opt-in via EmailJS) ---
                // Admin cần điền ServiceID/TemplateID/PublicKey vào đây sau khi đăng ký EmailJS
                // Tôi đã cài đặt sẵn thư viện, chỉ cần cấu hình khóa
                const SERVICE_ID = "YOUR_SERVICE_ID"; 
                const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
                const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

                if (SERVICE_ID !== "YOUR_SERVICE_ID") {
                    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
                        from_name: displayName,
                        from_email: userEmail,
                        message: content,
                        to_email: 'minhquan12092005@gmail.com'
                    }, PUBLIC_KEY);
                }

                const t = LanguageConfig.translations[LanguageConfig.current];
                if (this.feedbackStatus) {
                    this.feedbackStatus.innerText = t.feedback.success;
                    this.feedbackStatus.style.color = '#00e676';
                }

                // Đóng sau 1.5s
                setTimeout(closeModal, 1500);

            } catch (err: any) {
                console.error('Feedback transmission failed:', err);
                const t = LanguageConfig.translations[LanguageConfig.current];
                if (this.feedbackStatus) {
                    this.feedbackStatus.innerText = t.feedback.error;
                    this.feedbackStatus.style.color = '#ff3860';
                }
            } finally {
                const t = LanguageConfig.translations[LanguageConfig.current];
                this.sendFeedbackBtn!.innerText = t.feedback.send;
                this.sendFeedbackBtn!.disabled = false;
            }
        });
    }

    private triggerResumeCountdown() {
        let countdownEl = byId('resumeCountdown');
        if (countdownEl) {
            countdownEl.style.display = 'flex';
            let count = 3;
            countdownEl.innerText = count.toString();
            EventBus.getInstance().publish('AUDIO_BEEP', null);

            let interval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownEl!.innerText = count.toString();
                    EventBus.getInstance().publish('AUDIO_BEEP', null);
                } else {
                    clearInterval(interval);
                    countdownEl!.style.display = 'none';
                    EventBus.getInstance().publish('GAME_RESUMED', null);
                }
            }, 1000);
        } else {
            EventBus.getInstance().publish('GAME_RESUMED', null);
        }
    }

    private setupAdminLogic() {
        if (!this.adminFeedbackModal || !this.closeAdminFeedbackBtn || !this.refreshFeedbackBtn) return;

        this.closeAdminFeedbackBtn.addEventListener('click', () => {
            this.adminFeedbackModal?.classList.add('hidden');
            EventBus.getInstance().publish('AUDIO_BEEP', null);
        });

        this.refreshFeedbackBtn.addEventListener('click', () => {
            this.fetchAdminFeedbacks();
            EventBus.getInstance().publish('AUDIO_BEEP', null);
        });
    }

    private async fetchAdminFeedbacks() {
        if (!this.adminFeedbackList) return;
        
        this.adminFeedbackList.innerHTML = '<div style="text-align: center; color: #00F5FF; padding: 20px;">LINKING_TO_DATABASE...</div>';

        try {
            const { data, error } = await supabase
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.adminFeedbackList.innerHTML = '';
            if (this.feedbackCountEl) this.feedbackCountEl.innerText = `TOTAL_LOGS: ${data?.length || 0}`;

            if (data && data.length > 0) {
                data.forEach(fb => {
                    const item = document.createElement('div');
                    item.style.background = 'rgba(0, 245, 255, 0.05)';
                    item.style.border = '1px solid rgba(0, 245, 255, 0.2)';
                    item.style.padding = '15px';
                    item.style.borderRadius = '8px';
                    
                    const date = new Date(fb.created_at).toLocaleString();
                    
                    item.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.8rem; border-bottom: 1px dashed rgba(0, 245, 255, 0.1); padding-bottom: 5px;">
                            <span style="color: #00F5FF; font-weight: bold;">[ SOURCE: ${fb.display_name} ]</span>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="color: rgba(255,255,255,0.4);">${date}</span>
                                <button class="delete-fb-btn" data-id="${fb.id}" style="background: none; border: none; color: #ff3860; cursor: pointer; padding: 0 5px; font-weight: bold; font-family: 'Orbitron';">[ X ]</button>
                            </div>
                        </div>
                        <div style="color: #fff; font-size: 0.95rem; white-space: pre-wrap; line-height: 1.5;">${fb.content}</div>
                        <div style="margin-top: 10px; font-size: 0.75rem; color: rgba(255,255,255,0.3);">EMAIL: ${fb.user_email}</div>
                    `;

                    // Gán sự kiện xóa
                    item.querySelector('.delete-fb-btn')?.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc chắn muốn xóa phản hồi từ ${fb.display_name}? Thao tác này không thể hoàn tác.`)) {
                            try {
                                const { error } = await supabase
                                    .from('feedbacks')
                                    .delete()
                                    .match({ id: fb.id });

                                if (error) throw error;
                                
                                EventBus.getInstance().publish('AUDIO_BEEP', null);
                                // Refresh list
                                this.fetchAdminFeedbacks();
                            } catch (err) {
                                console.error('Delete failed:', err);
                                alert('[ ERROR: DELETE_FAILED ]');
                            }
                        }
                    });

                    this.adminFeedbackList?.appendChild(item);
                });
            } else {
                this.adminFeedbackList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.3); padding: 50px;">NO_FEEDBACK_DATA_IN_NEURAL_LOGS</div>';
            }
        } catch (err) {
            console.error('Failed to fetch feedbacks:', err);
            this.adminFeedbackList.innerHTML = '<div style="text-align: center; color: #ff3860; padding: 20px;">[ ERROR: UPLINK_FAILURE ]</div>';
        }
    }

    private applyConfigToSliders() {
        let prefsStr = localStorage.getItem('ninja_typing_audio_prefs');
        let prefs = {
            tts: 1.0,
            bgm: 1.0,
            sfx: 1.0,
            rate: GameConfig.audio.defaultTtsRate,
        };
        if (prefsStr) {
            try {
                prefs = { ...prefs, ...JSON.parse(prefsStr) };
            } catch (e) { }
        }

        if (this.ttsVolSlider) this.ttsVolSlider.value = prefs.tts.toString();
        if (this.bgmVolSlider) this.bgmVolSlider.value = prefs.bgm.toString();
        if (this.sfxVolSlider) this.sfxVolSlider.value = prefs.sfx.toString();
        if (this.ttsRateSelect) this.ttsRateSelect.value = prefs.rate.toString();
        if (this.miniVolSlider) this.miniVolSlider.value = prefs.bgm.toString();

        // Push initial config to AudioSystem after short delay
        setTimeout(() => {
            EventBus.getInstance().publish('TTS_VOL_CHANGED', prefs.tts);
            EventBus.getInstance().publish('MUSIC_VOL', prefs.bgm);
            EventBus.getInstance().publish('SFX_VOL_CHANGED', prefs.sfx);
            EventBus.getInstance().publish('TTS_RATE_CHANGED', prefs.rate);
        }, 100);
    }

    private saveAudioPrefs() {
        let prefs = {
            tts: parseFloat(this.ttsVolSlider ? this.ttsVolSlider.value : "1.0"),
            bgm: parseFloat(this.bgmVolSlider ? this.bgmVolSlider.value : "1.0"),
            sfx: parseFloat(this.sfxVolSlider ? this.sfxVolSlider.value : "1.0"),
            rate: parseFloat(this.ttsRateSelect ? this.ttsRateSelect.value : GameConfig.audio.defaultTtsRate.toString())
        };
        localStorage.setItem('ninja_typing_audio_prefs', JSON.stringify(prefs));
    }

    private loadLibrary() {
        let saved = localStorage.getItem('ninja_typing_library');
        if (saved) {
            this.myLibrary = JSON.parse(saved);
        } else {
            this.myLibrary = [
                { id: 'f_default', name: 'Nhạc Lofi Mặc Định', songs: [{ url: 'HSOtku1j600', title: 'MONO - Waiting For You (Lofi)' }] }
            ];
        }
        if (this.myLibrary.length > 0) {
            this.activeFolderId = this.myLibrary[0].id;
        }
        this.updatePlaylistBtnName();

        // Cập nhật danh sách nhạc cho AudioSystem ngay khi mở web
        setTimeout(() => {
            let activeFolder = this.myLibrary.find(f => f.id === this.activeFolderId);
            if (activeFolder && activeFolder.songs.length > 0) {
                EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', activeFolder.songs);
                requestAnimationFrame(() => EventBus.getInstance().publish('MUSIC_PLAY_INDEX', 0));
            } else {
                EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', [{ url: 'HSOtku1j600', title: 'MONO (Lofi)' }]);
                requestAnimationFrame(() => EventBus.getInstance().publish('MUSIC_PLAY_INDEX', 0));
            }
        }, 300);
    }

    private saveLibrary() {
        localStorage.setItem('ninja_typing_library', JSON.stringify(this.myLibrary));
    }

    private setupEventListeners() {
        // --- HOVER PREVIEW TEXT ---
        if (this.menuControls && this.startBtn) {
            let collapseTimeout: any = null;

            const handleMouseLeave = () => {
                collapseTimeout = setTimeout(() => {
                    const isHoveringMenu = document.querySelector('#svgTier1:hover, #svgTier2:hover, .daken-core:hover');
                    if (!isHoveringMenu && this.startBtn) {
                        if (this.menuControls) this.menuControls.classList.remove('bloomed');
                        const selectedMode = this.startBtn.getAttribute('data-mode');
                        const selectedLevel = this.startBtn.getAttribute('data-level');
                        if (selectedMode && selectedMode !== '') {
                            let mainText = selectedMode.toUpperCase();
                            if (selectedMode === 'study') mainText = '言葉';
                            else if (selectedMode === 'kanji') mainText = '漢字';
                            else if (selectedMode === 'grammar') mainText = '文法';
                            
                            this.startBtn.innerText = (selectedMode === 'study' || selectedMode === 'kanji' || selectedMode === 'grammar') && selectedLevel ? selectedLevel.toUpperCase() : mainText;
                            this.startBtn.style.fontSize = '2.6rem';
                            if (this.menuControls) this.menuControls.classList.add('collapsed');
                        } else {
                            this.startBtn.innerText = "打検";
                            this.startBtn.style.fontSize = '';
                        }
                    }
                }, 50); // 50ms delay eliminates sluggishness while still bridging gaps
            };

            const handleMouseEnter = () => {
                if (collapseTimeout) clearTimeout(collapseTimeout);
                if (this.menuControls) {
                    this.menuControls.classList.add('bloomed');
                    this.menuControls.classList.remove('collapsed');
                }
                if (this.startBtn) {
                    const selectedMode = this.startBtn.getAttribute('data-mode');
                    const selectedLevel = this.startBtn.getAttribute('data-level');
                    if (selectedMode && selectedMode !== '') {
                        let mainText = selectedMode.toUpperCase();
                        if (selectedMode === 'study') mainText = '言葉';
                        else if (selectedMode === 'kanji') mainText = '漢字';
                        else if (selectedMode === 'grammar') mainText = '文法';

                        this.startBtn.innerText = (selectedMode === 'study' || selectedMode === 'kanji' || selectedMode === 'grammar') && selectedLevel ? selectedLevel.toUpperCase() : mainText;
                        this.startBtn.style.fontSize = '2.6rem';
                    } else {
                        this.startBtn.innerText = "打検";
                        this.startBtn.style.fontSize = '';
                    }
                }
            };

            byId('svgTier1')?.addEventListener('mouseleave', handleMouseLeave);
            byId('svgTier2')?.addEventListener('mouseleave', handleMouseLeave);
            this.startBtn.addEventListener('mouseleave', handleMouseLeave);

            // Khôi phục Menu và Reset Text khi đưa chuột vào
            byId('svgTier1')?.addEventListener('mouseenter', handleMouseEnter);
            byId('svgTier2')?.addEventListener('mouseenter', handleMouseEnter);
            this.startBtn.addEventListener('mouseenter', handleMouseEnter);
        }

        // Daken Radial Osu Setup (Nested Fan Blades)
        let textHoverTimeout: any = null;

        document.querySelectorAll('.fan-blade[data-mode]').forEach(opt => {
            opt.addEventListener('mouseenter', (e) => {
                if (this.menuControls?.classList.contains('collapsed')) return;
                let mode = (e.currentTarget as HTMLElement).getAttribute('data-mode');

                if (textHoverTimeout) clearTimeout(textHoverTimeout);
                textHoverTimeout = setTimeout(() => {
                    if (mode && this.startBtn) {
                        let label = mode.toUpperCase();
                        if (mode === 'study') label = '言葉';
                        else if (mode === 'kanji') label = '漢字';
                        else if (mode === 'grammar') label = '文法';
                        this.startBtn.innerText = label;
                        this.startBtn.style.fontSize = '2.6rem';
                        // Đánh dấu để Tier 2 chỉ hiện sub của mode này
                        byId('svgTier2')?.setAttribute('data-active-mode', mode);
                    }
                }, 30);

                EventBus.getInstance().publish('PLAY_HOVER');
            });

            opt.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                // Nếu click dính vào sub-blade thì nhường cho sub-blade xử lý
                if (target.closest('.sub-blade')) return;

                let mode = (e.currentTarget as HTMLElement).getAttribute('data-mode');
                if (mode && mode !== 'study' && mode !== 'kanji' && mode !== 'grammar') {
                    this.currentMode = mode;
                    document.querySelectorAll('.fan-blade').forEach(p => p.classList.remove('active'));
                    (e.currentTarget as HTMLElement).classList.add('active');

                    // Mutate The Core Text & Collapse
                    if (this.startBtn) {
                        let label = mode.toUpperCase();
                        if (mode === 'study') label = '言葉';
                        else if (mode === 'kanji') label = '漢字';
                        else if (mode === 'grammar') label = '文法';
                        this.startBtn.innerText = label;
                        this.startBtn.style.fontSize = '2.6rem';
                        this.startBtn.setAttribute('data-mode', mode); // Save for later retrieval
                        this.startBtn.setAttribute('data-level', '');
                    }
                    if (this.menuControls) {
                        this.menuControls.classList.add('collapsed');
                    }
                    if (this.startBtn) {
                        this.startBtn.click();
                    }
                }
            });
        });

        document.querySelectorAll('.sub-blade[data-level]').forEach(opt => {
            opt.addEventListener('mouseenter', (e) => {
                if (this.menuControls?.classList.contains('collapsed')) return;
                let level = (e.currentTarget as HTMLElement).getAttribute('data-level');

                if (textHoverTimeout) clearTimeout(textHoverTimeout);
                textHoverTimeout = setTimeout(() => {
                    if (level && this.startBtn) {
                        this.startBtn.innerText = level.toUpperCase();
                    }
                }, 10);

                EventBus.getInstance().publish('PLAY_HOVER');
            });

            opt.addEventListener('click', (e) => {
                e.stopPropagation(); // Không trào lên cha
                let level = (e.currentTarget as HTMLElement).getAttribute('data-level');
                if (level) {
                    this.currentStudyLevel = level;
                    this.currentMode = (e.currentTarget as HTMLElement).getAttribute('data-parent-mode') || 'study';

                    document.querySelectorAll('.fan-blade, .sub-blade').forEach(p => p.classList.remove('active'));
                    const pOpt = byId('studyBlade');
                    if (pOpt) pOpt.classList.add('active');
                    (e.currentTarget as HTMLElement).classList.add('active');

                    // Mutate The Core Text to N1-N5 & Collapse
                    if (this.startBtn) {
                        this.startBtn.innerText = level.toUpperCase();
                        this.startBtn.setAttribute('data-mode', 'study');
                        this.startBtn.setAttribute('data-level', level);
                    }
                    if (this.menuControls) {
                        this.menuControls.classList.add('collapsed');
                    }

                    (document.activeElement as HTMLElement)?.blur();

                    if (level.startsWith('n')) {
                        const parentMode = (e.currentTarget as HTMLElement).getAttribute('data-parent-mode') || 'study';
                        setTimeout(() => this.openJLPTHub(level, parentMode), 300); // Đợi menu gập lại mượt mà
                    } else {
                        if (this.startBtn) {
                            this.startBtn.click();
                        }
                    }
                }
            });
        });

        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                const selectedMode = this.startBtn?.getAttribute('data-mode');
                if (!selectedMode || selectedMode === '') {
                    // Chưa chọn mode thì không làm gì cả, vờ như Lõi chỉ là nút trang trí!
                    return;
                }

                // Hide message center
                if (this.messageCenter) this.messageCenter.classList.add('hidden');

                const mode = this.currentMode || 'medium';
                const studyLevel = this.currentStudyLevel || 'n5';

                // Reset states
                this.updateHp(5);
                this.updateScore(0);
                
                // Reset Wave 5 speed control
                if (this.wave5SpeedSlider) {
                    this.wave5SpeedSlider.value = "1.0";
                    if (this.speedValDisplay) this.speedValDisplay.innerText = "x1.0";
                    EventBus.getInstance().publish('GAME_SPEED_CHANGE', 1.0);
                }

                // Nạp playlist xuống AudioSystem - ALWAYS ENABLED FOR ALL MODES
                let useYoutube = true;
                if (useYoutube) {
                    let activeFolder = this.myLibrary.find(f => f.id === this.activeFolderId);
                    if (activeFolder && activeFolder.songs.length > 0) {
                        EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', activeFolder.songs);
                    } else {
                        // Reset về mặc định nếu folder rỗng
                        EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', [{ url: 'HSOtku1j600', title: 'MONO (Lofi)' }]);
                    }
                }

                // Hiển thị/Ẩn Mini Player và Playlist
                if (useYoutube) {
                    if (this.miniPlayer) {
                        this.miniPlayer.classList.remove('hidden');
                    }
                    this.renderMainHUDPlaylist();
                } else {
                    if (this.miniPlayer) this.miniPlayer.classList.add('hidden');
                    if (this.mainPlaylistHud) this.mainPlaylistHud.classList.add('hidden');
                }

                // Hide menu, show Stop
                if (this.menuControls) this.menuControls.classList.add('hidden');
                if (this.stopBtn) this.stopBtn.classList.remove('hidden');
                // Fire Start Event so Engine can listen
                EventBus.getInstance().publish('GAME_START', {
                    mode,
                    studyLevel,
                    useYoutube: useYoutube
                });
                if (this.startBtn) this.startBtn.blur(); // Tránh dính phím Space
            });
        }

        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => {
                if (this.stopConfirmModal) {
                    this.stopConfirmModal.classList.remove('hidden');
                    this.stopConfirmModal.classList.add('show');
                    EventBus.getInstance().publish('GAME_PAUSED', null);
                } else {
                    if (confirm("Bạn có chắc muốn kết thúc màn chơi? Dữ liệu chưa lưu sẽ bị mất!")) {
                        EventBus.getInstance().publish('GAME_OVER', null);
                        EventBus.getInstance().publish('GAME_STOPPED', null);
                        if (this.hudTerminal) this.hudTerminal.classList.remove('show');
                    }
                }
            });
        }

        if (this.confirmStopBtn) {
            this.confirmStopBtn.addEventListener('click', () => {
                if (this.stopConfirmModal) {
                    this.stopConfirmModal.classList.add('hidden');
                    this.stopConfirmModal.classList.remove('show');
                }
                
                // Gửi sự kiện để Engine và các hệ thống khác dọn dẹp
                EventBus.getInstance().publish('GAME_OVER', null);
                EventBus.getInstance().publish('GAME_STOPPED', null);
                
                // Ẩn HUD Terminal ngay lập tức
                if (this.hudTerminal) this.hudTerminal.classList.remove('show');
            });
        }

        if (this.cancelStopBtn) {
            this.cancelStopBtn.addEventListener('click', () => {
                if (this.stopConfirmModal) {
                    this.stopConfirmModal.classList.add('hidden');
                    this.stopConfirmModal.classList.remove('show');
                }

                this.triggerResumeCountdown();
            });
        }

        // Music Controls Bindings
        if (this.miniPlayBtn) {
            this.miniPlayBtn.addEventListener('click', () => EventBus.getInstance().publish('MUSIC_TOGGLE', null));
        }
        if (this.miniNextBtn) {
            this.miniNextBtn.addEventListener('click', () => EventBus.getInstance().publish('MUSIC_NEXT', null));
        }
        if (this.miniPrevBtn) {
            this.miniPrevBtn.addEventListener('click', () => EventBus.getInstance().publish('MUSIC_PREV', null));
        }
        if (this.miniVolSlider) {
            this.miniVolSlider.addEventListener('input', (e: Event) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                EventBus.getInstance().publish('MUSIC_VOL', val);
                if (this.bgmVolSlider) this.bgmVolSlider.value = val.toString();
                this.saveAudioPrefs();
            });
        }

        // Summary Events
        if (this.summaryCloseBtn) {
            this.summaryCloseBtn.addEventListener('click', () => {
                if (this.summaryModal) {
                    this.summaryModal.classList.add('hidden');
                    this.summaryModal.classList.remove('show');
                }
                EventBus.getInstance().publish('GAME_OVER', null);
            });
        }

        // Playlist Modal Events
        if (this.playlistBtn) {
            this.playlistBtn.addEventListener('click', () => {
                if (this.playlistModal) this.playlistModal.classList.remove('hidden');
                this.showFolderView();
            });
        }
        if (this.closeFolderBtn) {
            this.closeFolderBtn.addEventListener('click', () => {
                if (this.playlistModal) this.playlistModal.classList.add('hidden');
            });
        }
        if (this.backToFoldersBtn) {
            this.backToFoldersBtn.addEventListener('click', () => this.showFolderView());
        }

        // Tạo Folder mới
        if (this.addFolderBtn && this.newFolderName) {
            this.addFolderBtn.addEventListener('click', () => {
                let n = this.newFolderName.value.trim();
                if (n) {
                    this.myLibrary.push({ id: 'f_' + Date.now(), name: n, songs: [] });
                    this.newFolderName.value = "";
                    this.saveLibrary();
                    this.renderLibrary();
                }
            });
        }

        // Thêm bài hát
        if (this.addSongBtn && this.newSongUrl) {
            this.addSongBtn.addEventListener('click', async () => {
                let u = this.newSongUrl.value.trim();
                let folder = this.myLibrary.find(f => f.id === this.viewingFolderId);
                if (u && folder) {
                    const t = LanguageConfig.translations[LanguageConfig.current];
                    this.addSongBtn!.innerText = t.music.fetching;
                    (this.addSongBtn as HTMLButtonElement).disabled = true;
                    let songTitle = u;
                    try {
                        let res = await fetch(`https://noembed.com/embed?url=${u}`);
                        let data = await res.json();
                        if (data && data.title) songTitle = data.title;
                    } catch (e) { }

                    folder.songs.push({ url: u, title: songTitle });
                    this.saveLibrary();

                    this.addSongBtn!.innerText = t.music.add;
                    (this.addSongBtn as HTMLButtonElement).disabled = false;
                    this.newSongUrl.value = "";
                    this.renderSongList();
                }
            });
        }

        // Audio Mixer Events
        if (this.miniSettingsBtn && this.audioMixerDropdown) {
            this.miniSettingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.audioMixerDropdown!.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!this.audioMixerDropdown!.classList.contains('hidden')) {
                    const target = e.target as HTMLElement;
                    if (!this.audioMixerDropdown!.contains(target) && target !== this.miniSettingsBtn && target !== this.playlistBtn) {
                        this.audioMixerDropdown!.classList.add('hidden');
                    }
                }
            });
        }

        if (this.ttsVolSlider) {
            this.ttsVolSlider.addEventListener('input', (e) => {
                EventBus.getInstance().publish('TTS_VOL_CHANGED', parseFloat((e.target as HTMLInputElement).value));
                this.saveAudioPrefs();
            });
        }
        if (this.bgmVolSlider) {
            this.bgmVolSlider.addEventListener('input', (e) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                EventBus.getInstance().publish('MUSIC_VOL', val);
                if (this.miniVolSlider) this.miniVolSlider.value = val.toString();
                this.saveAudioPrefs();
            });
        }
        if (this.sfxVolSlider) {
            this.sfxVolSlider.addEventListener('input', (e) => {
                EventBus.getInstance().publish('SFX_VOL_CHANGED', parseFloat((e.target as HTMLInputElement).value));
                this.saveAudioPrefs();
            });
        }
        if (this.ttsRateSelect) {
            this.ttsRateSelect.addEventListener('change', (e) => {
                EventBus.getInstance().publish('TTS_RATE_CHANGED', parseFloat((e.target as HTMLSelectElement).value));
                this.saveAudioPrefs();
            });
        }



        [this.calibBgmSlider, this.calibSfxSlider, this.calibTtsSlider].forEach(slider => {
            if (slider) {
                slider.addEventListener('input', () => {
                    const evt = new Event('input', { bubbles: true });
                    const targetMap: any = {
                        'calibBgmSlider': this.bgmVolSlider,
                        'calibSfxSlider': this.sfxVolSlider,
                        'calibTtsSlider': this.ttsVolSlider
                    };
                    const originalSlider = targetMap[slider.id];
                    if (originalSlider) {
                        originalSlider.value = slider.value;
                        originalSlider.dispatchEvent(evt);
                    }
                });
            }
        });

        if (this.closeCalibrationBtn) {
            this.closeCalibrationBtn.addEventListener('click', () => {
                if (this.jlptCalibrationModal) this.jlptCalibrationModal.classList.add('hidden');
            });
        }

        if (this.hubBackBtn) {
            this.hubBackBtn.addEventListener('click', () => {
                EventBus.getInstance().publish('PLAY_DING', null);
                if (this.jlptHubPage) this.jlptHubPage.classList.add('hidden');

                if (this.messageCenter) this.messageCenter.classList.add('hidden');

                if (this.menuControls) {
                    this.menuControls.classList.remove('hidden');
                    this.menuControls.classList.remove('collapsed');
                }
                if (this.profileCard) this.profileCard.classList.remove('hidden');

                // Show Lobby Tools
                if (this.leaderboardTrigger) this.leaderboardTrigger.classList.remove('hidden');
                if (this.guideTrigger) this.guideTrigger.classList.remove('hidden');

                // Clear active states of radial menu
                document.querySelectorAll('.fan-blade, .sub-blade').forEach(p => p.classList.remove('active'));

                if (this.startBtn) {
                    this.startBtn.innerText = "打検";
                    this.startBtn.setAttribute('data-mode', '');
                    this.startBtn.setAttribute('data-level', '');
                    this.startBtn.style.fontSize = '';
                }
            });
        }

        if (this.startJLPTSessionBtn) {
            this.startJLPTSessionBtn.addEventListener('click', () => {
                if (this.jlptCalibrationModal) this.jlptCalibrationModal.classList.add('hidden');
                if (this.jlptHubPage) this.jlptHubPage.classList.add('hidden');

                this.currentMode = this.isReviewMode ? 'review' : this.currentHubMode;
                this.currentStudyLevel = this.currentHubLevel;

                const data = StateManager.getInstance().getN2HubData();
                if (this.currentN2Context && data) {
                    let sessionWords: any[] = [];
                    if (this.currentN2Context.sessionIdx === -1) {
                        // Review mode: Aggregate all session words
                        const unit = data[this.currentN2Context.unitIdx];
                        unit.sessions.forEach((s: any[]) => sessionWords.push(...s));
                        // Limit to 50 items for stability
                        sessionWords = sessionWords.slice(0, 50);
                    } else {
                        sessionWords = data[this.currentN2Context.unitIdx].sessions[this.currentN2Context.sessionIdx];
                    }

                    this.updateHp(5);
                    this.updateScore(0);

                    if (this.menuControls) this.menuControls.classList.add('hidden');
                    if (this.stopBtn) this.stopBtn.classList.remove('hidden');

                    const workflow = GameConfig.studyMode.workflow;
                    const defaultEnabledWaves = [1, 2, 3, 4, 5].filter(w => {
                        const key = `enableWave${w}` as keyof typeof workflow;
                        return workflow[key] !== false;
                    });

                    const enabledWaves = this.isReviewMode ? 
                        this.getCalibWaveChecks().filter(chk => chk.checked).map(chk => parseInt(chk.value)) : 
                        defaultEnabledWaves;

                    const startWave = enabledWaves.length > 0 ? enabledWaves[0] : 1;

                    EventBus.getInstance().publish('GAME_START_N2', {
                        mode: this.currentHubMode,
                        studyLevel: this.currentHubLevel,
                        words: sessionWords,
                        unitIdx: this.currentN2Context.unitIdx,
                        sessionIdx: this.currentN2Context.sessionIdx,
                        startingWave: this.isReviewMode ? startWave : (defaultEnabledWaves.length > 0 ? defaultEnabledWaves[0] : 1),
                        enabledWaves: enabledWaves
                    });
                }
            });
        }

        // Lang Toggle setup
        byId('lang-toggle')?.addEventListener('click', () => {
            const sm = this.stateManager;
            sm.studyLanguage = sm.studyLanguage === 'vi' ? 'en' : 'vi';
            
            this.updateFlagUI();
            this.applyLanguage();
            
            EventBus.getInstance().publish('LANGUAGE_CHANGED', sm.studyLanguage);
            EventBus.getInstance().publish('PLAY_SUBMIT');
        });
    }

    private subscribeToEventBus() {
        const events = EventBus.getInstance();

        events.subscribe('GAME_OVER', () => {
            const isStudy = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
            if (isStudy) {
                if (this.menuControls) {
                    this.menuControls.classList.add('hidden');
                }
            } else {
                if (this.menuControls) {
                    this.menuControls.classList.remove('hidden');
                    this.menuControls.classList.remove('collapsed');
                }
            }
            if (this.stopBtn) this.stopBtn.classList.add('hidden');
            if (this.currentScoreBox) this.currentScoreBox.classList.add('hidden');
            if (this.wave5SpeedControl) this.wave5SpeedControl.classList.add('hidden');

            // Xoá trạng thái lưu của mode, trả Lõi về form gốc để các nan quạt bung ra
            if (this.startBtn) {
                this.startBtn.innerText = LanguageConfig.translations[LanguageConfig.current].messages.start;
            }
        });

        events.subscribe('GAME_START', (config: { mode: string }) => {
            this.isSessionEnding = false;
            this.updateHp(5);
            this.updateScore(0);
            this.currentWaveNumber = 1;
            this.maxComboAchieved = 0;
            this.savedBaseScore = 0;
            this.waveResults = [];
            this.currentWaveBaseScore = 0;
            this.currentWaveBonusScore = 0;
            this.wave5Performance = { correct: 0, total: 0, startTime: 0, durationMs: 0 };
            if (this.comboLabel) this.comboLabel.classList.add('hidden');
            if (this.summaryModal) {
                this.summaryModal.classList.add('hidden');
                this.summaryModal.classList.remove('show');
            }

            this.stopTimer();
            this.currentMode = config.mode;
            if (config.mode === 'easy' || config.mode === 'study') {
                if (this.waveProgressContainer) this.waveProgressContainer.classList.remove('hidden');
                if (this.waveTimerEl) this.waveTimerEl.classList.remove('hidden');
                if (this.currentScoreBox) this.currentScoreBox.classList.remove('hidden');
                this.startTimer();
            } else {
                if (this.waveProgressContainer) this.waveProgressContainer.classList.add('hidden');
                if (this.waveTimerEl) this.waveTimerEl.classList.add('hidden');
                if (this.currentScoreBox) this.currentScoreBox.classList.add('hidden');
            }
        });

        events.subscribe('GAME_START_N2', (config: any) => {
            this.isSessionEnding = false;
            this.updateHp(5);
            this.updateScore(0);
            this.currentWaveNumber = 1;
            this.maxComboAchieved = 0;
            this.savedBaseScore = 0;
            this.waveResults = [];
            this.currentWaveBaseScore = 0;
            this.currentWaveBonusScore = 0;
            this.wave5Performance = { correct: 0, total: 0, startTime: 0, durationMs: 0 };
            if (this.comboLabel) this.comboLabel.classList.add('hidden');
            if (this.summaryModal) {
                this.summaryModal.classList.add('hidden');
                this.summaryModal.classList.remove('show');
            }

            this.stopTimer();
            this.currentMode = config.mode;
            // Lưu số lượng từ để điều tiết điểm số (Workflow cân bằng)
            this.currentSessionWordsCount = config.words && config.words.length ? config.words.length : 20;

            if (this.waveProgressContainer) this.waveProgressContainer.classList.remove('hidden');
            if (this.waveTimerEl) this.waveTimerEl.classList.remove('hidden');
            if (this.currentScoreBox) this.currentScoreBox.classList.remove('hidden');
            this.startTimer();
        });

        events.subscribe('GAME_PAUSED', () => {
            this.pauseTimer();
        });

        events.subscribe('GAME_RESUMED', () => {
            this.resumeTimer();
        });

        events.subscribe('COMBO_UPDATED', (count: number) => {
            if (count > this.maxComboAchieved) this.maxComboAchieved = count;
            if (this.comboLabel) {
                if (count >= 2) {
                    this.comboLabel.innerText = `COMBO x${count}`;
                    this.comboLabel.classList.remove('hidden');
                } else {
                    this.comboLabel.classList.add('hidden');
                }
            }
        });

        events.subscribe('TUTORIAL_COMPLETE', () => {
            this.stopTimer();
            if (this.summaryModal) {
                this.summaryModal.classList.remove('hidden');
                this.summaryModal.classList.add('show');
            }

            // Xóa rỗng các thông số UI tức thì
            if (this.sumBaseScore) this.sumBaseScore.innerText = "0";
            if (this.sumMaxCombo) this.sumMaxCombo.innerText = "0";
            if (this.sumTime) this.sumTime.innerText = "00:00.0";
            if (this.sumTimeBonus) this.sumTimeBonus.innerText = "+0";
            if (this.sumFinalScore) this.sumFinalScore.innerText = "0";
            if (this.sumRank) {
                this.sumRank.innerText = "?";
                this.sumRank.classList.remove('stamp');
                this.sumRank.style.opacity = '0';
            }

            let elapsedSec = (performance.now() - this.startTime) / 1000;
            let mins = Math.floor(elapsedSec / 60);
            let secs = Math.floor(elapsedSec % 60);
            let ms = Math.floor((elapsedSec * 10) % 10);
            let timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;

            let timeBonus = 0;
            if (elapsedSec < 60) {
                timeBonus = Math.floor((60 - elapsedSec) * 30);
            }

            let finalScore = this.savedBaseScore + timeBonus;

            let rank = 'D';
            let rankColor = '#ff4757'; // Red
            if (finalScore >= 2000) { rank = 'S'; rankColor = '#ffd700'; } // Gold
            else if (finalScore >= 1500) { rank = 'A'; rankColor = '#00e676'; } // Green
            else if (finalScore >= 1000) { rank = 'B'; rankColor = '#00f5ff'; } // Cyan
            else if (finalScore >= 500) { rank = 'C'; rankColor = '#ff9800'; } // Orange

            // Lần lượt hiển thị các thông số (Kéo dài gấp đôi để tạo hồi hộp)
            setTimeout(() => { this.animateValue(this.sumBaseScore, 0, this.savedBaseScore, 800); }, 1500);

            setTimeout(() => {
                EventBus.getInstance().publish('AUDIO_BEEP', null);
                if (this.sumMaxCombo) this.sumMaxCombo.innerText = this.maxComboAchieved.toString();
            }, 3000);

            setTimeout(() => {
                EventBus.getInstance().publish('AUDIO_BEEP', null);
                if (this.sumTime) this.sumTime.innerText = timeStr;
            }, 4000);

            setTimeout(() => {
                EventBus.getInstance().publish('AUDIO_BEEP', null);
                if (this.sumTimeBonus) this.sumTimeBonus.innerText = '+' + timeBonus.toString();
            }, 5000);

            setTimeout(() => { this.animateValue(this.sumFinalScore, 0, finalScore, 1200); }, 6500);

            setTimeout(() => {
                if (this.sumRank) {
                    EventBus.getInstance().publish('AUDIO_SLAM', null);
                    this.sumRank.innerText = rank;
                    this.sumRank.style.color = rankColor;
                    this.sumRank.style.textShadow = `0 0 15px ${rankColor}`;
                    this.sumRank.style.opacity = '1';
                    this.sumRank.classList.add('stamp');

                    this.shakeScreen();
                    this.triggerParticles(rankColor);
                }
            }, 8500);
        });

        events.subscribe('FOCUS_ENEMY', (enemy: any) => {
            if (!this.hudTerminal) return;
            const isStudy = (enemy && (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar'));

            // Reset các màu viền và nền đã bị ám từ lúc Defeat/Skip
            this.hudTerminal.style.border = '';
            this.hudTerminal.style.boxShadow = '';
            this.hudTerminal.style.backgroundColor = '';

            if (isStudy && (enemy.study.wave === 3 || enemy.study.wave === 5)) return;

            const word = enemy.word;

            // Xử lý riêng cho diện mạo câu hỏi Wave 4
            if (isStudy && enemy.study.wave === 4) {
                let exampleJpRaw = word.example_jp || word.visual;
                // Tô khoảng trống
                exampleJpRaw = exampleJpRaw.replace(/\[(.*?)\]/g, '<span style="color: var(--neon-cyan); letter-spacing: 2px;">[ _ _ _ _ ]</span>');
                let exampleJp = exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

                const t = LanguageConfig.translations[LanguageConfig.current];
                const promptText = t.messages.fillBlanks;
                
                let html = `
                    <div class="bubble-header" style="align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 1.2rem; font-weight: 700; color: #fff; opacity: 0.7;">${promptText}</span>
                    </div>
                    <div class="bubble-example-jp" style="font-size: 1.5rem; line-height: 1.8; text-align: center; margin-bottom: 15px;">
                        ${exampleJp}
                    </div>
                `;
                this.hudTerminal.innerHTML = html;
                this.hudTerminal.classList.add('center-screen');
                this.hudTerminal.classList.remove('hidden');
                this.hudTerminal.classList.add('show');

                requestAnimationFrame(() => {
                    if (this.hudTerminal) {
                        this.hudTerminal.style.top = '40%';
                        this.hudTerminal.style.transform = 'translate(-50%, -50%)';
                    }
                });
                return;
            }

            // Xóa inline style thừa từ Wave 4 nếu có
            if (this.hudTerminal) {
                this.hudTerminal.style.top = '';
                this.hudTerminal.style.transform = '';
            }

            // Mặc định giấu thông tin
            let isHidden = false;

            if (isStudy && enemy.study.wave >= 2) {
                if (enemy.study.wave === 2) {
                    isHidden = !enemy.isDefeated; // Wave 2: Sài sai vẫn giấu, chỉ hiện khi đã Defeat/Skip
                } else {
                    isHidden = !enemy.isDefeated && !enemy.study.isWeak;
                }
            }

            // Ở wave 2, nếu đang ẩn thông tin thì giấu luôn cả bảng card (bóp lại thành viên thuốc)
            if (isStudy && enemy.study.wave === 2 && isHidden) {
                this.hudTerminal.classList.remove('show');
                return;
            }

            const t = LanguageConfig.translations[LanguageConfig.current];
            const lang = this.stateManager.studyLanguage;
            const isEn = lang === 'en';
            let meaningText = isEn ? (word.en || word.vi || '') : (word.vi || '');
            if (isHidden) {
                meaningText = (enemy.study.revealType === 'vi') ? meaningText : "???";
            }

            let exampleJpRaw = word.example_jp || word.visual;
            // Tô sáng phần trong ngoặc bằng màu vàng
            exampleJpRaw = exampleJpRaw.replace(/\[(.*?)\]/g, '<span style="color: #ffd700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">$1</span>');
            let exampleJp = isHidden
                ? (enemy.study.revealType === 'vi' ? "???" : exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '$1')) // Nếu là chiều Vi->Romaji thì giấu sạch câu Nhật
                : exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

            let romajiText = isHidden ? "???" : word.romaji;
            let exampleMeaningText = isHidden ? "???" : (isEn ? (word.example_en || '') : (word.example_vi || ''));
            const hanvietHtml = !isEn && word.hanviet ? `<span class="bubble-hanviet" style="margin-right: 12px;">[${isHidden && enemy.study.revealType === 'vi' ? '???' : word.hanviet}]</span>` : '';

            let html = `
                <div class="bubble-header" style="align-items: baseline;">
                    <div>
                        ${hanvietHtml}
                        <span style="font-size: 1.6rem; font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); font-family: 'Noto Sans JP', sans-serif;">${isHidden && enemy.study.revealType === 'vi' ? '???' : word.visual}</span>
                    </div>
                    <span class="bubble-vi" style="text-align: right;">${meaningText}</span>
                </div>
                <div class="bubble-romaji">${romajiText}</div>
                <div class="bubble-example-jp" style="position: relative; padding-right: 30px;">
                    ${exampleJp}
                    ${!isHidden ? `<button id="ttsReplayBtn" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--neon-cyan); opacity: 0.8; transition: transform 0.1s; padding: 5px;" onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.2)'" onmouseout="this.style.opacity='0.8'; this.style.transform='translateY(-50%) scale(1)'" title="${t.hud.replayTooltip}">🔊</button>` : ''}
                </div>
                <div class="bubble-example-vi">${exampleMeaningText}</div>
                ${(lang === 'en' ? (word.grammar_en || word.grammar) : (word.grammar_vi || word.grammar)) ? `<div class="bubble-grammar"><span class="grammar-icon">💡</span> ${lang === 'en' ? (word.grammar_en || word.grammar) : (word.grammar_vi || word.grammar)}</div>` : ''}
            `;
            this.hudTerminal.innerHTML = html;

            const replayBtn = byId('ttsReplayBtn');
            if (replayBtn) {
                replayBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Để tránh bị mất focus bàn phím
                    this.startBtn?.focus();
                    (<HTMLElement>document.activeElement)?.blur();
                    EventBus.getInstance().publish('REPLAY_TTS', word);
                });
            }

            if (this.bufferTrash && (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar') && enemy.study.wave >= 2) {
                const t = LanguageConfig.translations[LanguageConfig.current];
                this.bufferTrash.innerHTML = `<span style="color: rgba(255,255,255,0.2); font-size: 0.65em;">${t.hud.pressEnterReveal}</span>`;
            }

            if (isStudy && enemy.study.wave === 1) {
                this.hudTerminal.classList.add('center-screen');
            } else {
                this.hudTerminal.classList.remove('center-screen');
            }

            this.hudTerminal.classList.remove('hidden');
            this.hudTerminal.classList.add('show');

            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--shift-up', `0px`);
                if (enemy) {
                    enemy.study.dynamicStudyOffset = 0;
                    this.alignEnemyToTerminal(enemy);
                }
            });
        });

        events.subscribe('WAVE_STARTED', (data: any) => {
            this.isRetryPhase = false;
            if (typeof data === 'number') {
                this.enemiesSpawnedThisWave = data;
            } else if (data && data.count !== undefined) {
                this.enemiesSpawnedThisWave = data.count;
                if (data.waveIndex !== undefined) {
                    this.currentWaveNumber = data.waveIndex;
                }
                if (data.isRetry) {
                    this.isRetryPhase = true;
                }
            }

            // Reset điểm wave hiện tại CHỈ khi không phải là phase Retry
            if (!data || !data.isRetry) {
                this.currentWaveBaseScore = 0;
            }
            this.currentWaveBonusScore = 0;
            // Hack để tránh lỗi "never read" của TS
            if (this.currentWaveBonusScore < 0) console.log(this.currentWaveBonusScore);

            // Nếu vào Wave 5 (Endless Sprint), nạp đầy pin (5 HP) để sinh tồn
            if (this.currentWaveNumber === 5) {
                this.updateHp(5);
                const batteryContainer = byId('hpBatteryContainer');
                if (batteryContainer) {
                    batteryContainer.style.display = 'flex'; // Ép hiển thị
                    batteryContainer.classList.remove('hidden');
                }
            } else {
                // Tắt pin ở các wave tutorial (1-4)
                const batteryContainer = byId('hpBatteryContainer');
                if (batteryContainer) batteryContainer.classList.add('hidden');
            }

            this.waveSegmentStates = new Array(this.enemiesSpawnedThisWave).fill('empty');
            this.enemiesKilledThisWave = 0;
            this.renderWaveSegments();
            this.waveStartTime = performance.now();
        });

        events.subscribe('PERFORMANCE_STATS', (data: { correct: number, total: number }) => {
            if (this.currentWaveNumber === 5) {
                this.wave5Performance.correct = data.correct;
                this.wave5Performance.total = data.total;
            }
        });

        events.subscribe('STUDY_SESSION_END', () => {
            if (this.isSessionEnding && this.synapseMatrixModal && !this.synapseMatrixModal.classList.contains('hidden')) return;
            this.isSessionEnding = true;
            
            // Lưu kết quả của Wave hiện tại (bất kể wave nào) trước khi hiện bảng tổng kết
            this.waveResults[this.currentWaveNumber] = {
                baseScore: this.currentWaveBaseScore,
                bonusScore: this.currentWaveBonusScore || 0
            };
            if (this.currentWaveNumber === 5) {
                this.wave5Performance.durationMs = performance.now() - this.waveStartTime;
            }
            this.showSynapseMatrix();
        });

        events.subscribe('ENEMY_DEFEATED', (enemy: any) => {
            const isStudy = (enemy && (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar'));
            if (this.enemiesSpawnedThisWave > 0 && enemy && isStudy) {
                const idx = this.waveSegmentStates.indexOf('empty');
                if (idx !== -1) {
                    this.waveSegmentStates[idx] = enemy.study.isWeak ? 'failed' : 'filled';
                }
                this.renderWaveSegments();
            }

            if (!this.hudTerminal) return;

            // Ở Wave 4, sau khi trả lời, thẻ chuyển từ "Câu hỏi" (top 40%) sang "Giải thích"
            // Xóa inline style và class canh giữa để thẻ Giải thích rớt xuống sát ô nhập text
            if (isStudy && enemy.study.wave === 4) {
                requestAnimationFrame(() => {
                    if (this.hudTerminal) {
                        this.hudTerminal.classList.remove('center-screen');
                        this.hudTerminal.style.top = '';
                        this.hudTerminal.style.transform = '';
                        this.hudTerminal.style.height = 'auto'; // Ép trình duyệt dãn height tự do bọc hết cả furigana và tiếng việt
                        this.hudTerminal.style.maxHeight = 'none'; // Gỡ bỏ mọi giới hạn chiều cao nếu có
                    }
                });
            }

            if (isStudy && (enemy.study.wave === 3 || enemy.study.wave === 5)) return;
            EventBus.getInstance().publish('PLAY_DING', null); // Âm báo thành công ah-ha
            const word = enemy.word;
            let exampleJp = word.example_jp || word.visual;
            // Tô sáng phần trong ngoặc bằng màu vàng
            exampleJp = exampleJp.replace(/\[(.*?)\]/g, '<span style="color: #ffd700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">$1</span>');
            exampleJp = exampleJp.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

            // If enemy is skipped/weak, show red text instead of green
            let resultColor = enemy.study.isWeak ? '#ff4757' : '#00e676';
            if (this.hudTerminal) {
                if (enemy.study.isWeak) {
                    this.hudTerminal.style.border = '2px solid rgba(255, 71, 87, 0.8)';
                    this.hudTerminal.style.boxShadow = '0 0 30px rgba(255, 71, 87, 0.3), inset 0 0 20px rgba(255, 71, 87, 0.15)';
                    this.hudTerminal.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
                } else {
                    this.hudTerminal.style.border = '2px solid rgba(0, 230, 118, 0.8)';
                    this.hudTerminal.style.boxShadow = '0 0 30px rgba(0, 230, 118, 0.3), inset 0 0 20px rgba(0, 230, 118, 0.1)';
                    this.hudTerminal.style.backgroundColor = 'rgba(0, 230, 118, 0.1)';
                }
            }

            const lang = LanguageConfig.current;
            const isEn = lang === 'en';
            const translation = isEn ? (word.en || word.vi) : word.vi;
            const exampleTranslation = isEn ? (word.example_en || word.example_vi) : word.example_vi;
            const grammarTranslation = isEn ? (word.grammar_en || word.grammar_vi || word.grammar) : (word.grammar_vi || word.grammar);
            const hanvietHtml = !isEn && word.hanviet ? `<span class="bubble-hanviet" style="color:${resultColor}; margin-right: 12px;">[${word.hanviet}]</span>` : '';

            let html = `
                <div class="bubble-header" style="align-items: baseline;">
                    <div>
                        ${hanvietHtml}
                        <span style="font-size: 1.6rem; font-weight: 700; color: ${resultColor}; text-shadow: 0 0 10px ${resultColor}80; font-family: 'Noto Sans JP', sans-serif;">${word.visual}</span>
                    </div>
                    <span class="bubble-vi" style="color:${resultColor}; text-align: right;">${translation || ''}</span>
                </div>
                <div class="bubble-romaji" style="color:${resultColor};">${word.romaji}</div>
                <div class="bubble-example-jp" style="position: relative; padding-right: 30px;">
                    ${exampleJp}
                    <button id="ttsReplayBtnDefeated" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--neon-cyan); opacity: 0.8; transition: transform 0.1s; padding: 5px;" onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.2)'" onmouseout="this.style.opacity='0.8'; this.style.transform='translateY(-50%) scale(1)'" title="Replay">🔊</button>
                </div>
                <div class="bubble-example-vi" style="color:${resultColor};">${exampleTranslation || ''}</div>
                ${grammarTranslation ? `<div class="bubble-grammar"><span class="grammar-icon">💡</span> ${grammarTranslation}</div>` : ''}
            `;
            this.hudTerminal.innerHTML = html;
            if (enemy && isStudy) {
                requestAnimationFrame(() => {
                    this.alignEnemyToTerminal(enemy);
                });
            }

            const replayBtnDefeated = byId('ttsReplayBtnDefeated');
            if (replayBtnDefeated) {
                replayBtnDefeated.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.startBtn?.focus();
                    (<HTMLElement>document.activeElement)?.blur();
                    EventBus.getInstance().publish('REPLAY_TTS', word);
                });
            }
        });

        events.subscribe('TYPING_UPDATED', (data: { buffer: string, prefix: string }) => {
            if (!this.bufferTrash || !this.bufferTyped) return;
            let trashPart = data.buffer;
            let typedPart = data.prefix;

            if (typedPart) {
                trashPart = data.buffer.substring(0, data.buffer.length - typedPart.length);
                this.bufferTyped.innerText = typedPart;
            } else {
                this.bufferTyped.innerText = "";
            }

            if (!trashPart && !typedPart && this.currentWaveNumber >= 2) {
                const t = LanguageConfig.translations[LanguageConfig.current];
                this.bufferTrash.innerHTML = `<span style="color: rgba(255,255,255,0.2); font-size: 0.65em;">${t.hud.pressEnter}</span>`;
            } else {
                this.bufferTrash.innerText = trashPart;
            }
        });

        events.subscribe('ENEMY_KILLED', (data: any) => {
            if (this.enemiesSpawnedThisWave > 0) {
                this.enemiesKilledThisWave++;
                this.renderWaveSegments();
            }

            let points = data && typeof data.points === 'number' ? data.points : 10;
            
            // Điều tiết điểm số dựa trên số lượng từ (Baseline: 20 từ)
            const scalingFactor = 20 / Math.max(this.currentSessionWordsCount, 1);
            const scaledPoints = Math.round(points * scalingFactor);

            this.updateScore(this.currentScore + scaledPoints);
            this.savedBaseScore += scaledPoints;
            this.currentWaveBaseScore += scaledPoints;


            // Add to combat log
            const t = LanguageConfig.translations[LanguageConfig.current];
            const label = data.combo > 1 ? `COMBO x${data.combo}` : t.messages.wordClear;
            this.addScoreFeedItem(scaledPoints, label);

            // Xóa buffer UI
            if (this.bufferTyped) this.bufferTyped.innerText = "";
            if (this.bufferTrash) this.bufferTrash.innerText = "";
        });

        events.subscribe('SCORE_PENALTY', (penalty: number) => {
            this.currentScore -= penalty;
            if (this.currentScore < 0) this.currentScore = 0;
            this.updateScore(this.currentScore);

            this.addScoreFeedItem(-penalty, 'PENALTY');

            // Re-sync base score
            if (this.savedBaseScore > 0) {
                this.savedBaseScore -= penalty;
                if (this.savedBaseScore < 0) this.savedBaseScore = 0;
            }

            // Visual feedback đỏ chớp màn hình nhẹ
            if (this.gameContainer) {
                this.gameContainer.classList.add('penalty-flash');
                setTimeout(() => this.gameContainer?.classList.remove('penalty-flash'), 300);
            }
        });

        events.subscribe('ENEMY_REMOVED', (enemy: any) => {
            if (this.hudTerminal && enemy && enemy.isDefeated) {
                this.hudTerminal.classList.remove('show');
            }
            if (this.bufferTyped) this.bufferTyped.innerText = "";
            if (this.bufferTrash) this.bufferTrash.innerHTML = "";
        });

        events.subscribe('ENEMY_DEFEATED', (enemy: any) => {
            const isStudy = (enemy && (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar'));
            if (isStudy) {
                if (this.hudTerminal) {
                    this.hudTerminal.classList.remove('hidden');
                    this.hudTerminal.classList.add('show');
                }
                setTimeout(() => {
                    if (this.bufferTrash) {
                        const t = LanguageConfig.translations[LanguageConfig.current];
                        this.bufferTrash.innerHTML = `<span class="blink" style="color: var(--neon-cyan); font-size: 0.65em; letter-spacing: 1px;">${t.hud.pressSpaceNext}</span>`;
                    }
                    if (this.bufferTyped) {
                        this.bufferTyped.innerText = "";
                    }
                }, 10);
            }
        });

        events.subscribe('MARK_WEAK', (enemy: any) => {
            if (this.hudTerminal && this.hudTerminal.classList.contains('show')) {
                events.publish('FOCUS_ENEMY', enemy);
            }
        });

        events.subscribe('ENEMY_PASSED_DEADLINE', () => {
            // Từ Wave 1-4 không mất máu trong Study Mode
            const isStudy = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
            if (isStudy && this.currentWaveNumber < 5) return;

            this.updateHp(this.currentHp - 1);
            this.shakeScreen();
        });

        events.subscribe('POINTS_PENALTY', (data: { points: number }) => {
            if (data && data.points > 0) {
                this.updateScore(Math.max(0, this.currentScore - data.points));
                this.addScoreFeedItem(-data.points, 'TYPO PENALTY');
            }
        });

        events.subscribe('WAVE_CLEARED', (data: any) => {
            const isWaitingManual = data && data.isWaitingManual;

            // Tính toán thưởng thời gian (Time Bonus) chỉ cho Study Mode Wave 3
            let bonusPoints = 0;
            let bonusLabel = "";

            if (this.currentWaveNumber === 3 || this.currentWaveNumber === 4) {
                const elapsedMs = performance.now() - this.waveStartTime;
                const waveKey = this.currentWaveNumber === 3 ? 'wave3' : 'wave4';
                const config = (GameConfig.studyMode as any)[waveKey].timeBonuses;

                if (config) {
                    if (elapsedMs < config.gold.timeMs) {
                        bonusPoints = config.gold.points;
                        bonusLabel = "GOLD CLEAR";
                    } else if (elapsedMs < config.silver.timeMs) {
                        bonusPoints = config.silver.points;
                        bonusLabel = "SILVER CLEAR";
                    } else if (elapsedMs < config.bronze.timeMs) {
                        bonusPoints = config.bronze.points;
                        bonusLabel = "BRONZE CLEAR";
                    }

                    if (bonusPoints > 0) {
                        this.updateScore(this.currentScore + bonusPoints);
                        this.currentWaveBonusScore = bonusPoints;
                        this.addScoreFeedItem(bonusPoints, bonusLabel);
                    }
                }
            }

            // Lưu kết quả của Wave vừa hoàn thành
            this.waveResults[this.currentWaveNumber] = {
                baseScore: this.currentWaveBaseScore,
                bonusScore: bonusPoints
            };

            if (this.messageCenter && this.msgTitle && this.msgSub) {
                this.messageCenter.classList.remove('hidden');

                const t = LanguageConfig.translations[LanguageConfig.current];
                if (bonusPoints > 0) {
                    const localizedLabel = bonusLabel === "GOLD CLEAR" ? t.messages.goldClear : (bonusLabel === "SILVER CLEAR" ? t.messages.silverClear : t.messages.bronzeClear);
                    this.msgTitle.innerText = localizedLabel;
                    this.msgTitle.style.color = bonusLabel === "GOLD CLEAR" ? "#ffd700" : (bonusLabel === "SILVER CLEAR" ? "#c0c0c0" : "#cd7f32");
                    this.msgSub.innerText = `+${bonusPoints} ${t.messages.timeBonus}\n${t.hud.pressSpaceContinue}`;
                } else {
                    this.msgTitle.innerText = t.messages.waveCleared;
                    this.msgTitle.style.color = "#00e676";
                    this.msgSub.innerText = isWaitingManual ? t.hud.pressSpaceContinue : t.messages.preparingNextWave;
                }

                this.msgSub.style.color = "#fff";

                if (!isWaitingManual) {
                    setTimeout(() => {
                        this.messageCenter!.classList.add('hidden');
                    }, 2000);
                }
            }
        });

        events.subscribe('MANUAL_NEXT_WAVE', () => {
            if (this.messageCenter) this.messageCenter.classList.add('hidden');
        });

        events.subscribe('GAME_OVER', () => {
            this.stopTimer();
            if (this.comboLabel) this.comboLabel.classList.add('hidden');
            if (this.waveProgressContainer) this.waveProgressContainer.classList.add('hidden');
            if (this.waveTimerEl) this.waveTimerEl.classList.add('hidden');

            // Ẩn Confirm popup nếu còn đang mở
            if (this.stopConfirmModal) {
                this.stopConfirmModal.classList.add('hidden');
                this.stopConfirmModal.classList.remove('show');
            }

            // Restore UI (Show Menu, Hide Stop)
            const isStudyMode = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
            if (isStudyMode && (this.currentStudyLevel === 'n2' || (this.currentStudyLevel && this.currentStudyLevel.length > 0))) {
                this.openJLPTHub(this.currentStudyLevel, this.currentMode);
                if (this.menuControls) {
                    this.menuControls.classList.add('hidden'); // Ensure menu is hidden
                }
            } else {
                if (this.menuControls) {
                    this.menuControls.classList.remove('hidden');
                    this.menuControls.classList.remove('collapsed');
                }
            }

            if (this.stopBtn) this.stopBtn.classList.add('hidden');
            if (this.audioMixerDropdown) this.audioMixerDropdown.classList.add('hidden');
            if (this.wave5SpeedControl) this.wave5SpeedControl.classList.add('hidden');
            if (this.miniPlayer) this.miniPlayer.classList.remove('hidden');
            if (this.mainPlaylistHud) this.mainPlaylistHud.classList.add('hidden');



            const t = LanguageConfig.translations[LanguageConfig.current];
            // Hiển thị thông báo nếu do chết (HP <= 0), không hiển thị nếu bấm STOP khi HP > 0
            if (this.currentHp <= 0) {
                if (this.messageCenter && this.msgTitle && this.msgSub) {
                    this.messageCenter.classList.remove('hidden');
                    const isStudy = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
                    if (isStudy && this.currentWaveNumber >= 5) {
                        this.msgTitle.innerText = t.messages.batteryDepleted;
                        this.msgTitle.style.color = "var(--neon-cyan)";
                        this.msgSub.innerText = t.messages.calculating;
                    } else {
                        this.msgTitle.innerText = t.messages.busted;
                        this.msgTitle.style.color = "var(--danger)";
                        this.msgSub.innerText = `${t.messages.sessionTerminated} ${this.currentScore}`;
                    }
                }
            }
            if (this.bufferTyped) this.bufferTyped.innerText = "";
            if (this.bufferTrash) this.bufferTrash.innerText = "";
        });

        events.subscribe('TARGET_LOCKED', () => {
            if (this.bufferTyped) {
                this.bufferTyped.style.textShadow = "0 0 20px #00e676";
                setTimeout(() => {
                    if (this.bufferTyped) this.bufferTyped.style.textShadow = "";
                }, 100);
            }
        });

        events.subscribe('N2_SESSION_CLEARED', (data: { rank: string, acc: number, wpm: number, unitIdx: number, sessionIdx: number }) => {
            // Hiển thị lại N2 Hub
            this.openJLPTHub();

            // Hiện thông báo popup siêu cool về Rank
            if (this.messageCenter && this.msgTitle && this.msgSub) {
                const t = LanguageConfig.translations[LanguageConfig.current];
                this.messageCenter.classList.remove('hidden');
                this.msgTitle.innerText = `${t.messages.sessionCleared} - RANK ${data.rank}`;
                let color = "var(--primary-glow)";
                if (data.rank === 'S') color = "#FFD700";
                if (data.rank === 'A') color = "#00e676";
                if (data.rank === 'B') color = "var(--neon-cyan)";
                if (data.rank === 'C') color = "orange";
                if (data.rank === 'D') color = "var(--danger)";

                this.msgTitle.style.color = color;
                this.msgSub.innerText = `Accuracy: ${(data.acc * 100).toFixed(0)}%  |  WPM: ${data.wpm}`;

                setTimeout(() => {
                    this.messageCenter?.classList.add('hidden');
                }, 4000); // 4 seconds to view
            }
        });

        // Bắt event update Music Info từ AudioSystem
        events.subscribe('MUSIC_INFO_UPDATED', (data: { title: string, progress: number, playing: boolean }) => {
            const t = LanguageConfig.translations[LanguageConfig.current];
            if (this.miniTitle) {
                let displayTitle = data.title;
                if (displayTitle === "Ready to play...") {
                    displayTitle = t.music.noSong;
                }
                this.miniTitle.innerText = displayTitle;
            }
            if (this.miniProgressFill) this.miniProgressFill.style.width = `${data.progress}%`;

            if (this.miniPlayBtn) {
                this.miniPlayBtn.innerText = data.playing ? '⏸' : '▶';
            }
            if (this.miniDisc) {
                if (data.playing) {
                    this.miniDisc.classList.add('spin');
                } else {
                    this.miniDisc.classList.remove('spin');
                }
            }
        });

        const onMatchStart = () => {
            this.isGameActive = true;
            if (this.currentScoreBox) {
                this.currentScoreBox.classList.remove('hidden');
                this.currentScoreBox.style.display = 'flex';
            }
            if (this.messageCenter) this.messageCenter.classList.add('hidden');
            if (this.jlptHubPage) this.jlptHubPage.classList.add('hidden');
            if (this.summaryModal) this.summaryModal.classList.add('hidden');
            if (this.synapseMatrixModal) this.synapseMatrixModal.classList.add('hidden');
            if (this.stopConfirmModal) this.stopConfirmModal.classList.add('hidden');
            if (this.waveProgressContainer) this.waveProgressContainer.classList.remove('hidden');
            if (this.waveLabel) this.waveLabel.classList.remove('hidden');
            if (this.waveTimerEl) this.waveTimerEl.classList.remove('hidden');
            if (this.profileCard) this.profileCard.classList.add('hidden');
            if (this.menuControls) this.menuControls.classList.add('hidden');

            // Reset dữ liệu điểm từng Wave cho phiên mới
            this.waveResults = {};
            this.currentScore = 0;
            this.savedBaseScore = 0;
            this.currentWaveBaseScore = 0;
            this.currentWaveBonusScore = 0;
            this.enemiesKilledThisWave = 0;
            this.updateScore(0);

            // Hide Lobby Tools
            if (this.leaderboardTrigger) this.leaderboardTrigger.classList.add('hidden');
            if (this.guideTrigger) this.guideTrigger.classList.add('hidden');
        };

        const onMatchEnd = () => {
            // Guard: Chỉ thực hiện dọn dẹp nếu game đang thực sự active
            if (!this.isGameActive) return;
            this.isGameActive = false;

            console.log("[UISystem] onMatchEnd - Cleaning up UI...");

            // Ẩn tất cả các modal có thể gây nhiễu ngay lập tức
            [this.summaryModal, this.synapseMatrixModal, this.stopConfirmModal, this.messageCenter, this.jlptCalibrationModal].forEach(m => {
                if (m) {
                    m.classList.add('hidden');
                    m.classList.remove('show');
                }
            });

            if (this.currentScoreBox) {
                this.currentScoreBox.classList.add('hidden');
                this.currentScoreBox.style.display = 'none';
            }
            if (this.waveProgressContainer) this.waveProgressContainer.classList.add('hidden');
            if (this.waveLabel) this.waveLabel.classList.add('hidden');
            if (this.waveTimerEl) this.waveTimerEl.classList.add('hidden');
            const batteryContainer = byId('hpBatteryContainer');
            if (batteryContainer) batteryContainer.style.display = 'none';

            this.updateProfileUI(); // Refresh stats after match

            // Show Lobby Tools
            if (this.leaderboardTrigger) this.leaderboardTrigger.classList.remove('hidden');
            if (this.guideTrigger) this.guideTrigger.classList.remove('hidden');

            // Hiện lại profile card nếu đang ở Lobby
            if (this.profileCard && AuthSystem.getInstance().isLoggedIn()) {
                this.profileCard.classList.remove('hidden');
            }

            // Nếu đang trong mode học và chuyển ra hub, đảm bảo hub được hiện đúng cách
            if (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar') {
                // Chúng ta không gọi showJLPTHub ở đây vì GAME_OVER subscriber khác (ở dòng 3215) đã xử lý
                // Tuy nhiên cần đảm bảo các HUD kịch vây cá (menuControls) được xử lý
                if (this.menuControls) {
                    this.menuControls.classList.add('hidden');
                }
            }
        };

        events.subscribe('GAME_START', onMatchStart);
        events.subscribe('GAME_START_N2', onMatchStart);
        events.subscribe('GAME_OVER', onMatchEnd);
        events.subscribe('STUDY_SESSION_END', onMatchEnd);
        events.subscribe('GAME_STOPPED', onMatchEnd);

        events.subscribe('AUTH_SUCCESS', (user: any) => {
            // Kiểm tra: Nếu chưa có tên thực sự HOẶC chưa có mã Agent ID (#000000)
            const isNewAgent = user.name === 'Khách' || !user.agentId || user.agentId === '000000';

            if (isNewAgent) {
                if (this.socialLoginArea) this.socialLoginArea.classList.add('hidden');
                if (this.setupView) this.setupView.classList.remove('hidden');
            } else {
                if (this.profileCard && !this.isGameActive) this.profileCard.classList.remove('hidden');
                if (this.loginScreen) {
                    this.loginScreen.classList.add('disappearing');
                    setTimeout(() => {
                        this.loginScreen?.classList.add('hidden');
                        document.body.classList.remove('login-pending');
                    }, 800);
                }
                this.updateProfileUI(); // Cập nhật ngay các thông tin nhãn tên/avatar
                
                const guideShown = localStorage.getItem('DAKEN_GUIDE_SHOWN');
                if (!guideShown && this.generalGuideModal) {
                    setTimeout(() => {
                        this.generalGuideModal?.classList.remove('hidden');
                    }, 2000);
                }
            }
        });

        events.subscribe('USER_STATE_READY', () => {
            console.log("[UISystem] USER_STATE_READY received, refreshing stats...");
            this.updateProfileUI();
        });

        events.subscribe('AUTH_LOGOUT', () => {
            console.log("[UISystem] AUTH_LOGOUT event received. Resetting UI...");
            if (this.loginScreen) {
                this.loginScreen.classList.remove('hidden', 'disappearing');
                document.body.classList.add('login-pending');
            }
            if (this.socialLoginArea) this.socialLoginArea.classList.remove('hidden');

            this.updateProfileUI();
        });

        // Gán sự kiện Click cho nút Logout với cơ chế kiểm tra element trực tiếp
        document.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            if (target && (target.id === 'logoutBtn' || target.classList.contains('logout-btn'))) {
                console.log("[UISystem] Logout process started...");
                const auth = AuthSystem.getInstance();
                try {
                    await auth.logout();
                    console.log("[UISystem] Logout successful!");
                } catch (err) {
                    console.error("[UISystem] Logout failed:", err);
                }
            }
        });

        // --- AUTH SYSTEM EVENTS ---
        const auth = AuthSystem.getInstance();

        // 1. Logic Setup Name (Dành cho Google/First-time)
        this.finishSetupBtn?.addEventListener('click', async () => {
            const name = this.setupNameInput.value.trim();
            if (!name || name.length < 3) {
                if (this.loginStatus) this.loginStatus.innerText = 'STATUS: NAME_TOO_SHORT';
                return;
            }

            // Tạo mã Agent ID ngẫu nhiên sáu số
            const randomID = Math.floor(100000 + Math.random() * 900000).toString();

            if (this.loginStatus) this.loginStatus.innerText = 'Trạng thái: Đang đồng bộ...';
            try {
                await auth.updateProfile({ name: name, agentId: randomID });
                if (this.loginStatus) this.loginStatus.innerText = 'Trạng thái: Thành công';

                // Sau khi thành công, UISystem sẽ tự nhận event AUTH_SUCCESS và ẩn setup-view
            } catch (err: any) {
                if (this.loginStatus) this.loginStatus.innerText = `STATUS: ${err.message.toUpperCase()}`;
            }
        });

        // Loop cũ của nút Google (vẫn giữ logic loginWithGoogle)
        this.googleLoginBtn?.addEventListener('click', async () => {
            if (this.loginStatus) this.loginStatus.innerText = 'Trạng thái: Đang chuyển hướng...';
            await auth.loginWithGoogle();
        });

        events.subscribe('N2_PROGRESS_SYNCED', () => {
            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }
            this.updateProfileUI(); // Cập nhật cả bảng Profile (Total Score)
        });

        events.subscribe('HUB_DATA_LOADED', () => {
            console.log("[UISystem] HUB_DATA_LOADED received, updating UI...");
            this.updateProfileUI();
            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }
        });
    }

    private updateProfileUI() {
        const auth = AuthSystem.getInstance();
        const state = StateManager.getInstance();
        const user = auth.getCurrentUser();
        const isAdmin = user?.email === 'minhquan12092005@gmail.com';

        if (isAdmin && this.profileCard) {
            let adminBtn = byId('admin-view-trigger');
            if (!adminBtn) {
                adminBtn = document.createElement('button');
                adminBtn.id = 'admin-view-trigger';
                adminBtn.className = 'menu-btn';
                adminBtn.style.marginTop = '10px';
                adminBtn.style.width = '100%';
                adminBtn.style.fontSize = '0.7rem';
                adminBtn.style.borderColor = '#00F5FF';
                adminBtn.style.color = '#00F5FF';
                adminBtn.innerText = 'ADMIN';
                adminBtn.addEventListener('click', () => {
                    this.adminFeedbackModal?.classList.remove('hidden');
                    this.fetchAdminFeedbacks();
                });
                this.profileCard.appendChild(adminBtn);
            }
        }

        const t = LanguageConfig.translations[LanguageConfig.current];

        if (this.playerNameEl) {
            this.playerNameEl.innerText = user?.name || t.profile.guest;
            this.playerNameEl.title = user?.name || t.profile.guest; // Hiện tên đầy đủ khi di chuột vào
        }
        if (this.playerTagEl) {
            this.playerTagEl.innerText = `#${user?.agentId || '000000'}`;
        }

        // Cập nhật Avatar nếu có
        const savedAvt = localStorage.getItem('DAKEN_PLAYER_AVATAR');
        if (savedAvt && this.playerAvtImg) {
            this.playerAvtImg.src = savedAvt;
        } else if (user?.avatar && this.playerAvtImg) {
            this.playerAvtImg.src = user.avatar;
        }

        // Tính toán các chỉ số trung bình từ StateManager (Toàn bộ tiến trình N2)
        const globalStats = state.getGlobalN2Stats();
        const totalStatsCount = globalStats.totalCount;
        const totalScoreSum = globalStats.totalScore;
        const reverseRank = ['D', 'C', 'B', 'A', 'S'];

        if (this.totalScoreEl) this.totalScoreEl.innerText = totalScoreSum.toLocaleString();

        if (totalStatsCount > 0) {
            const avgWpm = Math.floor(globalStats.avgWpm);
            const avgRank = reverseRank[Math.round(globalStats.avgRankScore)];

            const rawAcc = globalStats.avgAcc || 0;
            const displayAcc = (rawAcc <= 1.1 && rawAcc > 0) ? rawAcc * 100 : rawAcc;
            if (this.avgAccEl) this.avgAccEl.innerText = displayAcc.toFixed(1) + '%';
            if (this.avgWpmEl) this.avgWpmEl.innerText = avgWpm.toString();
            if (this.playerRankEl) {
                this.playerRankEl.innerText = `CLASS ${avgRank}`;
                this.playerRankEl.className = `rank-value jlpt-rank-${avgRank}`;
            }

            // --- REDUNDANT SYNC REMOVED ---
            // Leaderboard and stats are derived from n2_progress table.
            // Avoid calling auth.updateProfile here to prevent 429 errors.
        } else {
            if (this.avgAccEl) this.avgAccEl.innerText = "0%";
            if (this.avgWpmEl) this.avgWpmEl.innerText = "0";
            if (this.playerRankEl) {
                this.playerRankEl.innerText = t.profile.unranked;
            }
        }

        // Cập nhật REVIEW SCORE (Lưu trữ độc lập)
        const reviewStats = state.getReviewStats();
        const reviewScoreEl = byId('reviewScoreVal');
        if (reviewScoreEl) {
            reviewScoreEl.innerText = reviewStats.totalScore.toLocaleString();
        }
    }

    private setupAvatarUpload() {
        if (this.avatarTrigger && this.avtFileInput) {
            this.avatarTrigger.addEventListener('click', () => {
                const auth = AuthSystem.getInstance();
                if (!auth.isLoggedIn()) {
                    alert("Cần đăng nhập để lưu Avatar vĩnh viễn trên Cloud!");
                }
                this.avtFileInput.click();
            });

            this.avtFileInput.addEventListener('change', async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    // Giới hạn 2MB
                    if (file.size > 2 * 1024 * 1024) { 
                        alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
                        return;
                    }

                    const auth = AuthSystem.getInstance();
                    const user = auth.getCurrentUser();
                    
                    if (!auth.isLoggedIn() || !user) {
                        alert("Cần đăng nhập để upload ảnh lên Cloud!");
                        return;
                    }

                    try {
                        if (this.avatarTrigger) this.avatarTrigger.style.opacity = "0.5";
                        
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

                        // 1. Upload lên Supabase Storage (Bucket 'avatars')
                        const { error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(fileName, file, { upsert: true });

                        if (uploadError) throw uploadError;

                        // 2. Lấy Public URL
                        const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(fileName);

                        // 3. Hiển thị UI và Lưu Local
                        if (this.playerAvtImg) this.playerAvtImg.src = publicUrl;
                        localStorage.setItem('DAKEN_PLAYER_AVATAR', publicUrl);

                        // 4. Đồng bộ Profile
                        await auth.updateProfile({ avatar: publicUrl });
                        
                        EventBus.getInstance().publish('AUDIO_BEEP', null);
                        console.log("[Avatar] Uploaded & Synced:", publicUrl);

                    } catch (err: any) {
                        console.error("Avatar upload failed:", err);
                        alert(`Lỗi upload: ${err.message}`);
                    } finally {
                        if (this.avatarTrigger) this.avatarTrigger.style.opacity = "1";
                    }
                }
            });
        }

        // TÍNH NĂNG ĐỔI TÊN KHI CLICK VÀO TÊN
        if (this.playerNameEl) {
            this.playerNameEl.style.cursor = 'pointer';
            this.playerNameEl.title = 'Click để đổi mật danh';
            this.playerNameEl.addEventListener('click', async () => {
                const auth = AuthSystem.getInstance();
                const currentName = this.playerNameEl?.innerText || "";
                const newName = prompt("Nhập mật danh mới của bạn (Agent Name):", currentName);

                if (newName && newName.trim() !== "" && newName !== currentName) {
                    const finalName = newName.trim();
                    if (this.playerNameEl) this.playerNameEl.innerText = finalName;
                    localStorage.setItem('DAKEN_NAME', finalName);

                    if (auth.isLoggedIn()) {
                        try {
                            await auth.updateProfile({ name: finalName });
                            alert("Mật danh đã được đồng bộ lên Cloud!");
                        } catch (err) {
                            alert("Lỗi đồng bộ Cloud. Đã lưu tạm tại máy.");
                        }
                    }
                    EventBus.getInstance().publish('AUDIO_BEEP', null);
                }
            });
        }
    }

    private updateHp(hp: number) {
        this.currentHp = hp;
        if (this.hpEl) this.hpEl.innerText = this.currentHp.toString();

        const batteryContainer = byId('hpBatteryContainer');
        if (batteryContainer) {
            const cells = batteryContainer.querySelectorAll('.battery-cell');
            for (let i = 0; i < cells.length; i++) {
                if (i < this.currentHp) {
                    cells[i].classList.add('on');
                    cells[i].classList.remove('off');
                } else {
                    if (cells[i].classList.contains('on')) {
                        cells[i].classList.remove('on');
                        cells[i].classList.add('off'); // Trigger css animation
                    }
                }
            }
        }

        if (this.currentHp <= 0) {
            // Kết thúc phiên học nếu hết pin ở Wave 5
            const isStudy = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
            if (isStudy && this.currentWaveNumber >= 5 && !this.isSessionEnding) {
                this.isSessionEnding = true;
                EventBus.getInstance().publish('STUDY_SESSION_END', null);
            } else if (!isStudy) {
                EventBus.getInstance().publish('GAME_OVER', null);
            }
        }
    }

    private updateScore(score: number) {
        this.currentScore = score;
        if (this.scoreEl) this.scoreEl.innerText = this.currentScore.toString();

        // Wave 5 Victory condition: 3000 points
        const isStudy = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
        if (isStudy && this.currentWaveNumber >= 5 && this.currentScore >= 3000 && !this.isSessionEnding) {
            this.isSessionEnding = true;
            if (this.messageCenter && this.msgTitle && this.msgSub) {
                this.messageCenter.classList.remove('hidden');
                this.msgTitle.innerText = "GOAL REACHED";
                this.msgTitle.style.color = "#FFD700";
                this.msgSub.innerText = "SIÊU CẤP ĐẠI CA ĐÃ ĐẠT 3000 ĐIỂM!";
            }
            setTimeout(() => {
                EventBus.getInstance().publish('STUDY_SESSION_END', null);
            }, 1000);
        }
    }

    private addScoreFeedItem(points: number, label: string) {
        if (!this.scoreFeedContainer) return;

        const item = document.createElement('div');
        const isPositive = points >= 0;
        item.className = `score-feed-item ${isPositive ? 'positive' : 'negative'}`;

        const sign = isPositive ? '+' : '';
        item.innerHTML = `
            <span class="feed-label">${label}</span>
            <span class="feed-value">${sign}${points}</span>
        `;

        this.scoreFeedContainer.prepend(item); // Thêm vào đầu (dưới cùng do Column-reverse)

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            item.classList.add('fade-out');
            setTimeout(() => {
                item.remove();
            }, 500);
        }, 3000);

        // Giới hạn tối đa 5 dòng log để không tràn UI
        while (this.scoreFeedContainer.children.length > 5) {
            this.scoreFeedContainer.lastChild?.remove();
        }
    }

    private shakeScreen() {
        if (this.gameContainer) {
            this.gameContainer.classList.remove('shake');
            void this.gameContainer.offsetWidth; // trigger reflow
            this.gameContainer.classList.add('shake');
        }
    }

    private checkExistingSession() {
        const auth = AuthSystem.getInstance();
        const savedId = localStorage.getItem('DAKEN_ID');

        if (savedId || auth.isLoggedIn()) {
            document.body.classList.remove('login-pending');
            if (this.loginScreen) this.loginScreen.classList.add('hidden');
        }
    }

    // --- PLAYLIST RENDERERS ---
    private showFolderView() {
        if (this.folderView) this.folderView.classList.remove('hidden');
        if (this.songView) this.songView.classList.add('hidden');
        this.renderLibrary();
    }

    private renderLibrary() {
        if (!this.folderList) return;
        this.folderList.innerHTML = "";

        this.myLibrary.forEach(folder => {
            let li = document.createElement('li');
            let isPlaying = folder.id === this.activeFolderId;
            li.className = "folder-item" + (isPlaying ? " active" : "");

            let header = document.createElement('div');
            header.className = "folder-item-header";

            let txt = document.createElement('span');
            txt.innerText = `📁 ${folder.name} (${folder.songs.length})`;

            let acts = document.createElement('div');
            acts.className = "song-actions";

            let btnPlay = document.createElement('button');
            btnPlay.innerText = isPlaying ? "Playing" : "▶ Play";
            btnPlay.className = "play-btn";
            btnPlay.onclick = () => {
                this.activeFolderId = folder.id;
                this.saveLibrary();
                this.renderLibrary();
                if (this.playlistModal) this.playlistModal.classList.add('hidden');
                this.renderMainHUDPlaylist();
                // Push active folder list to audio system if game running
                EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', folder.songs);
                EventBus.getInstance().publish('MUSIC_PLAY_INDEX', 0);
                this.updatePlaylistBtnName();
            };

            let btnOpen = document.createElement('button');
            btnOpen.innerText = "Mở";
            btnOpen.className = "open-btn";
            btnOpen.onclick = () => this.openFolder(folder.id);

            let btnEdit = document.createElement('button');
            btnEdit.innerText = "✎";
            btnEdit.title = "Đổi tên Folder";
            btnEdit.onclick = () => {
                let newName = prompt("Nhập tên mới cho Folder:", folder.name);
                if (newName && newName.trim() !== "") {
                    folder.name = newName.trim();
                    this.saveLibrary();
                    this.renderLibrary();
                    this.renderMainHUDPlaylist();
                }
            };

            let btnRm = document.createElement('button');
            btnRm.innerText = "✖";
            btnRm.onclick = () => {
                if (this.myLibrary.length > 1) {
                    this.myLibrary = this.myLibrary.filter(f => f.id !== folder.id);
                    if (this.activeFolderId === folder.id) this.activeFolderId = this.myLibrary[0].id;
                    this.saveLibrary();
                    this.renderLibrary();
                    this.renderMainHUDPlaylist();
                } else {
                    alert("Phải giữ lại ít nhất 1 Folder!");
                }
            };

            acts.appendChild(btnPlay); acts.appendChild(btnOpen); acts.appendChild(btnEdit); acts.appendChild(btnRm);
            header.appendChild(txt); header.appendChild(acts);
            li.appendChild(header);

            this.folderList!.appendChild(li);
        });
    }

    private openFolder(folderId: string) {
        this.viewingFolderId = folderId;
        let folder = this.myLibrary.find(f => f.id === folderId);
        if (!folder) return;

        if (this.currentFolderName) this.currentFolderName.innerText = folder.name;
        if (this.folderView) this.folderView.classList.add('hidden');
        if (this.songView) this.songView.classList.remove('hidden');
        this.renderSongList();
    }

    private renderSongList() {
        if (!this.playlistList) return;
        this.playlistList.innerHTML = "";
        let folder = this.myLibrary.find(f => f.id === this.viewingFolderId);
        if (!folder) return;

        folder.songs.forEach((item, i) => {
            let li = document.createElement('li');
            let txt = document.createElement('span');
            txt.innerText = `${i + 1}. ${item.title || item.url}`;
            txt.title = item.url;

            let acts = document.createElement('div');
            acts.className = "song-actions";

            let btnUp = document.createElement('button'); btnUp.innerText = "▲"; btnUp.onclick = () => this.moveSong(i, -1);
            let btnDn = document.createElement('button'); btnDn.innerText = "▼"; btnDn.onclick = () => this.moveSong(i, 1);
            let btnRm = document.createElement('button'); btnRm.innerText = "✖";
            btnRm.onclick = () => {
                folder!.songs.splice(i, 1);
                this.saveLibrary();
                this.renderSongList();
                this.renderLibrary();
            };

            acts.appendChild(btnUp); acts.appendChild(btnDn); acts.appendChild(btnRm);
            li.appendChild(txt); li.appendChild(acts);
            this.playlistList!.appendChild(li);
        });
    }

    private moveSong(idx: number, dir: number) {
        let folder = this.myLibrary.find(f => f.id === this.viewingFolderId);
        if (!folder) return;
        if (idx + dir < 0 || idx + dir >= folder.songs.length) return;

        let temp = folder.songs[idx];
        folder.songs[idx] = folder.songs[idx + dir];
        folder.songs[idx + dir] = temp;
        this.saveLibrary();
        this.renderSongList();
    }

    private renderMainHUDPlaylist() {
        if (!this.mainPlaylistHud) return;
        let folder = this.myLibrary.find(f => f.id === this.activeFolderId);
        if (!folder) return;

        this.mainPlaylistHud.classList.remove('hidden');
        if (this.hudPlaylistName) this.hudPlaylistName.innerText = `📁 ${folder.name}`;

        if (!this.hudPlaylistSongs) return;
        this.hudPlaylistSongs.innerHTML = "";

        if (folder.songs.length === 0) {
            let emptyDiv = document.createElement('div');
            emptyDiv.className = "dropdown-song-item";
            emptyDiv.style.color = "#ff4757";
            emptyDiv.innerText = "Chưa có bài hát nào (Mở ⚙️ để thêm nhạc)";
            this.hudPlaylistSongs.appendChild(emptyDiv);
            return;
        }

        folder.songs.forEach((song, i) => {
            let songDiv = document.createElement('div');
            songDiv.id = `hud-song-${this.activeFolderId}-${i}`;
            songDiv.className = "dropdown-song-item";
            songDiv.innerText = `${i + 1}. ${song.title || song.url}`;

            songDiv.addEventListener('click', () => {
                EventBus.getInstance().publish('MUSIC_PLAYLIST_UPDATE', folder!.songs);
                EventBus.getInstance().publish('MUSIC_PLAY_INDEX', i);
            });

            this.hudPlaylistSongs!.appendChild(songDiv);
        });
    }

    private updatePlaylistBtnName() {
        if (!this.playlistBtn) return;
        let folder = this.myLibrary.find(f => f.id === this.activeFolderId);
        if (folder) {
            this.playlistBtn.innerText = `⚙️ ${folder.name}`;
        } else {
            this.playlistBtn.innerText = `⚙️ My Playlist`;
        }
    }

    private renderWaveSegments() {
        if (!this.waveLabel || !this.waveProgressContainer) return;
        if (this.waveProgressContainer.classList.contains('hidden')) return;

        const batteryContainer = byId('hpBatteryContainer');
        const barFill = byId('waveProgressBarFill');
        const pctText = byId('wavePercentText');

        if (this.currentWaveNumber === 5) {
            this.waveLabel.innerText = `WAVE 05 (ENDLESS)`;
            // Hides the segments and progress bar in Endless Sprint
            if (barFill) barFill.parentElement!.style.display = 'none';
            if (pctText) pctText.parentElement!.style.display = 'none';

            // Di chuyển thanh pin vào giữa thay thế thanh tiến trình
            if (batteryContainer && this.waveProgressContainer && !this.waveProgressContainer.contains(batteryContainer)) {
                this.waveProgressContainer.appendChild(batteryContainer);
                batteryContainer.style.marginTop = '0';
                batteryContainer.style.display = 'flex';
                // Ẩn nhãn khi đưa vào giữa cho gọn
                const label = batteryContainer.querySelector('.battery-label') as HTMLElement;
                if (label) label.style.display = 'none';
            }

            // Show speed control
            if (this.wave5SpeedControl) this.wave5SpeedControl.classList.remove('hidden');
        } else {
            this.waveLabel.innerText = `WAVE ${this.currentWaveNumber.toString().padStart(2, '0')}`;
            if (this.wave5SpeedControl) this.wave5SpeedControl.classList.add('hidden');

            if (barFill) barFill.parentElement!.style.display = 'block';
            if (pctText) pctText.parentElement!.style.display = 'flex';

            // Trả thanh pin về vị trí cũ ở góc trái
            const topLeftWrapper = document.querySelector('.top-left-wrapper');
            if (batteryContainer && topLeftWrapper && !topLeftWrapper.contains(batteryContainer)) {
                topLeftWrapper.appendChild(batteryContainer);
                batteryContainer.style.marginTop = '15px';
                // Hiện lại nhãn khi ở góc trái
                const label = batteryContainer.querySelector('.battery-label') as HTMLElement;
                if (label) label.style.display = 'block';
            }

            let processedCount = 0;
            for (let i = 0; i < this.enemiesSpawnedThisWave; i++) {
                let state = this.waveSegmentStates && this.waveSegmentStates[i] ? this.waveSegmentStates[i] : 'empty';
                // Tự động gán trạng thái 'filled' cho các ô đã vượt qua số lượng quái bị giết
                if (state === 'empty' && i < this.enemiesKilledThisWave) {
                    state = 'filled';
                }
                if (state === 'filled' || state === 'failed') {
                    processedCount++;
                }
            }

            let pct = this.enemiesSpawnedThisWave > 0 ? Math.floor((processedCount / this.enemiesSpawnedThisWave) * 100) : 0;
            if (barFill) barFill.style.width = `${pct}%`;
            if (pctText) pctText.innerText = `${pct}%`;
        }

        const retryLbl = byId('waveRetryLabel');
        if (retryLbl) {
            if (this.isRetryPhase) {
                retryLbl.classList.remove('hidden');
            } else {
                retryLbl.classList.add('hidden');
            }
        }
    }

    private startTimer() {
        this.startTime = performance.now();
        this.isTimerPaused = false;
        this.timeElapsedBeforePause = 0;

        const update = () => {
            if (!this.waveTimerEl) return;
            if (!this.isTimerPaused) {
                let elapsed = (performance.now() - this.startTime) + this.timeElapsedBeforePause;
                let totalSeconds = Math.floor(elapsed / 1000);
                let ms = Math.floor((elapsed % 1000) / 100);
                let mins = Math.floor(totalSeconds / 60);
                let secs = totalSeconds % 60;
                this.waveTimerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
            }
            this.timerInterval = requestAnimationFrame(update);
        };
        this.timerInterval = requestAnimationFrame(update);
    }

    private pauseTimer() {
        this.isTimerPaused = true;
        this.timeElapsedBeforePause += (performance.now() - this.startTime);
    }

    private resumeTimer() {
        this.isTimerPaused = false;
        this.startTime = performance.now();
    }

    private stopTimer() {
        if (this.timerInterval !== null) {
            cancelAnimationFrame(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private animateValue(elem: HTMLElement | null, start: number, end: number, duration: number) {
        if (!elem) return;
        let startTime: number | null = null;
        let lastBeepTime = 0;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            elem.innerText = Math.floor(progress * (end - start) + start).toString();

            // Beep liên hoàn khi chạy số
            if (timestamp - lastBeepTime > 60 && progress < 1) {
                EventBus.getInstance().publish('AUDIO_BEEP', null);
                lastBeepTime = timestamp;
            }

            if (progress < 1) requestAnimationFrame(step);
            else if (progress === 1 && timestamp - lastBeepTime > 30) {
                EventBus.getInstance().publish('AUDIO_BEEP', null); // chốt số cuối
            }
        };
        requestAnimationFrame(step);
    }

    private triggerParticles(color: string) {
        if (!this.sumRank) return;
        let rect = this.sumRank.getBoundingClientRect();
        let cx = rect.left + rect.width / 2;
        let cy = rect.top + rect.height / 2;

        for (let i = 0; i < 60; i++) {
            let p = document.createElement('div');
            p.className = 'rank-particle';
            p.style.backgroundColor = color;
            p.style.boxShadow = `0 0 10px ${color}`;

            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * 200 + 50;
            let tx = Math.cos(angle) * distance;
            let ty = Math.sin(angle) * distance;
            p.style.setProperty('--tx', `${tx}px`);
            p.style.setProperty('--ty', `${ty}px`);

            p.style.left = `${cx}px`;
            p.style.top = `${cy}px`;
            document.body.appendChild(p);

            setTimeout(() => p.remove(), 1000);
        }
    }

    private showSynapseMatrix() {
        if (!this.synapseMatrixModal) return;

        EventBus.getInstance().publish('GAME_OVER', null);

        // 1. Tính toán Rank dựa trên điểm số
        const thresholds = GameConfig.rankThresholds;
        let rank = 'D';
        let rankColor = 'var(--danger)';
        if (thresholds && this.currentScore >= thresholds.S) { rank = 'S'; rankColor = '#FFD700'; }
        else if (thresholds && this.currentScore >= thresholds.A) { rank = 'A'; rankColor = '#00e676'; }
        else if (thresholds && this.currentScore >= thresholds.B) { rank = 'B'; rankColor = 'var(--neon-cyan)'; }
        else if (thresholds && this.currentScore >= thresholds.C) { rank = 'C'; rankColor = 'orange'; }

        // 2. Tạo HTML cho Point Breakdown theo từng Wave
        let breakdownHtml = '<div class="wave-breakdown" style="width: 100%; margin: 15px 0; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">';
        for (let i = 1; i <= 5; i++) {
            const data = this.waveResults[i];
            if (data) {
                const bonusText = data.bonusScore > 0 ? ` <span style="color: #00e676; font-size: 0.9em;">(+${data.bonusScore})</span>` : '';
                breakdownHtml += `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-family: 'Orbitron', sans-serif; font-size: 0.95rem;">
                        <span style="color: #aaa;">WAVE ${i}:</span>
                        <span style="color: #fff;">${data.baseScore}${bonusText} <span style="font-size: 0.8em; color: #666;">pts</span></span>
                    </div>
                `;
            }
        }
        breakdownHtml += '</div>';

        // 3. Performance Wave 5
        let perfHtml = '';
        if (this.wave5Performance.total > 0) {
            const acc = (this.wave5Performance.correct / this.wave5Performance.total * 100).toFixed(0);
            const wpm = Math.round((this.wave5Performance.correct / 5) / (this.wave5Performance.durationMs / 60000));
            perfHtml = `
                <div style="display: flex; gap: 20px; justify-content: center; margin: 15px 0; padding: 10px; background: rgba(0, 230, 118, 0.1); border: 1px dashed #00e676; border-radius: 8px;">
                    <div style="text-align: center;"><div style="font-size: 0.7rem; color: #888;">W5 ACCURACY</div><div style="color: #00e676; font-weight: bold; font-size: 1.2rem;">${acc}%</div></div>
                    <div style="text-align: center;"><div style="font-size: 0.7rem; color: #888;">W5 SPEED</div><div style="color: #00e676; font-weight: bold; font-size: 1.2rem;">${wpm} WPM</div></div>
                </div>
            `;
        }

        const t = LanguageConfig.translations[LanguageConfig.current];
        let html = `
            <div class="summary-content" style="width: 600px; max-width: 90vw; max-height: 80vh; overflow-y: auto; overflow-x: hidden; position: relative; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: var(--primary-glow); text-shadow: 0 0 10px var(--primary); margin-bottom: 5px; font-family: 'Orbitron';">${t.modals.sessionCompleted || 'SESSION COMPLETED'}</h2>
                    <div style="font-size: 3.5rem; font-weight: 900; color: ${rankColor}; text-shadow: 0 0 30px ${rankColor}80; font-family: 'Arial Black', sans-serif; font-style: italic;">RANK ${rank}</div>
                </div>

                <div style="text-align: center; margin-bottom: 15px; font-size: 1.8rem; font-weight: bold;">
                    <span style="color: #aaa; font-size: 0.75rem; display: block; margin-bottom: 5px; letter-spacing: 2px;">${t.profile.totalScore}</span>
                    <span style="color: var(--primary); text-shadow: 0 0 15px var(--primary);">${this.currentScore}</span>
                </div>

                ${breakdownHtml}
                ${perfHtml}

                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
                    <button id="closeSynapseBtn" class="neon-button danger-btn" style="width: 100%; height: 50px; font-size: 1.1rem; border-radius: 8px; margin: 0;">${t.modals.terminateSession}</button>
                </div>
            </div>
        `;
        this.synapseMatrixModal.innerHTML = html;
        this.synapseMatrixModal.classList.remove('hidden');
        this.synapseMatrixModal.classList.add('show');

        this.synapseMatrixModal.querySelector('#closeSynapseBtn')?.addEventListener('click', () => {
            this.synapseMatrixModal?.classList.add('hidden');
            this.synapseMatrixModal?.classList.remove('show');
            
            const isStudyMode = (this.currentMode === 'study' || this.currentMode === 'kanji' || this.currentMode === 'grammar');
            if (isStudyMode) {
                if (this.menuControls) this.menuControls.classList.add('hidden');
                this.openJLPTHub(this.currentStudyLevel, this.currentMode);
            } else {
                if (this.menuControls) {
                    this.menuControls.classList.remove('hidden');
                    this.menuControls.classList.remove('collapsed');
                }
            }
            if (this.stopBtn) this.stopBtn.classList.add('hidden');
        });
    }

    private polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    private describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, noGap: boolean = false) {
        // Gap trick (Tạo khe hở giữa các mảnh ghép)
        if (!noGap) {
            startAngle += 2.0;
            endAngle -= 2.0;
        }

        const startOuter = this.polarToCartesian(x, y, outerRadius, endAngle);
        const endOuter = this.polarToCartesian(x, y, outerRadius, startAngle);
        const startInner = this.polarToCartesian(x, y, innerRadius, endAngle);
        const endInner = this.polarToCartesian(x, y, innerRadius, startAngle);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            "M", startOuter.x, startOuter.y,
            "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
            "L", endInner.x, endInner.y,
            "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
            "Z"
        ].join(" ");
    }

    private describeTextArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, sweep: number) {
        const start = this.polarToCartesian(x, y, radius, sweep === 1 ? startAngle : endAngle);
        const end = this.polarToCartesian(x, y, radius, sweep === 1 ? endAngle : startAngle);
        const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, sweep, end.x, end.y
        ].join(" ");
    }

    private renderSVGRadialMenu() {
        const tier1 = byId('svgTier1') as unknown as SVGElement | null;
        const tier2 = byId('svgTier2') as unknown as SVGElement | null;
        if (!tier1 || !tier2) return;

        const cx = 250, cy = 250;

        // --- CẦU NỐI KẾT KEO TỪ LÕI BỌC KÍN TIER 1 ---
        // Vòng Donut tàng hình chặn mọi khe hở
        let tier1Cushion = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        tier1Cushion.setAttribute("cx", cx.toString());
        tier1Cushion.setAttribute("cy", cy.toString());
        tier1Cushion.setAttribute("r", "180");
        tier1Cushion.setAttribute("stroke", "rgba(0,0,0,0)");
        tier1Cushion.setAttribute("stroke-width", "50");
        tier1Cushion.setAttribute("fill", "none");
        tier1.appendChild(tier1Cushion);

        // --- TIER 1 --- (4 Chế độ = 90 độ mỗi Mode)
        const modes: any[] = [
            { id: "custom", text: "CUSTOM (SOON)", start: -45, end: 45, mode: 'custom', disabled: true },  // TOP 
            { id: "studyBlade", text: "言葉", start: 45, end: 135, mode: 'study', disabled: !GameConfig.features.enableStudy, hasSub: true }, // RIGHT (WORDS)
            { id: "kanjiBlade", text: "漢字", start: 135, end: 225, mode: 'kanji', disabled: !GameConfig.features.enableKanji, hasSub: true }, // BOTTOM
            { id: "grammarBlade", text: "文法", start: 225, end: 315, mode: 'grammar', disabled: !GameConfig.features.enableGrammar, hasSub: true }  // LEFT (GRAMMAR)
        ];

        let defs = document.querySelector('#radialSvg defs');

        modes.forEach(m => {
            // Nếu bị tắt, thêm hậu tố SOON và buộc dùng màu xanh (bằng cách bỏ hasSub giả)
            const displayDisabled = m.disabled;
            const displayText = displayDisabled && m.mode !== 'custom' ? `${m.text} (SOON)` : m.text;

            let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "fan-blade");
            g.setAttribute("data-mode", m.mode);
            if (displayDisabled) {
                g.classList.add("disabled-blade");
                g.style.opacity = "0.3";
                g.style.pointerEvents = "none";
            }
            
            // Chỉ thêm has-sub và ID hiệu ứng nếu mode đang được kích hoạt
            if (m.hasSub && !displayDisabled) {
                g.classList.add("has-sub");
                g.setAttribute("id", m.id);

                // Cầu nối tàng hình giúp duy trì hover từ Tier 1 qua Tier 2, chống bug "né chuột"
                let bridgeRadius = 200;
                let studyBridge = document.createElementNS("http://www.w3.org/2000/svg", "path");
                studyBridge.setAttribute("d", this.describeArc(cx, cy, bridgeRadius, 255, m.start - 5, m.end + 5, true));
                studyBridge.setAttribute("fill", "rgba(0,0,0,0)");
                studyBridge.setAttribute("stroke", "none");
                g.appendChild(studyBridge);
            }

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", this.describeArc(cx, cy, 150, 205, m.start, m.end));
            path.setAttribute("class", "svg-blade-path");

            // Text Path
            let isBottom = m.start > 90 && m.start < 270;
            let tpId = `text-path-${m.id}`;
            let tPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tPath.setAttribute("id", tpId);
            tPath.setAttribute("d", this.describeTextArc(cx, cy, 178, m.start + 15, m.end - 15, isBottom ? 0 : 1));
            tPath.setAttribute("fill", "transparent");
            tPath.setAttribute("stroke", "transparent");
            defs?.appendChild(tPath);

            let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("class", "svg-blade-text");
            txt.setAttribute("dy", "5");

            let tp = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
            tp.setAttribute("href", `#${tpId}`);
            tp.setAttribute("startOffset", "50%");
            tp.setAttribute("text-anchor", "middle");
            tp.textContent = displayText;

            txt.appendChild(tp);
            g.appendChild(path);
            g.appendChild(txt);
            tier1.appendChild(g);
        });

        // --- TIER 2 --- (N1 - N5) 
        const nLevels = [
            { level: 'n1', text: 'N1' },
            { level: 'n2', text: 'N2' },
            { level: 'n3', text: 'N3' },
            { level: 'n4', text: 'N4' },
            { level: 'n5', text: 'N5' }
        ];

        // Render sub-blades and sticky-bridges for each mode that has them
        modes.filter(m => (m as any).hasSub && !m.disabled).forEach(parentMode => {
            const parentSegment = 90;
            const subSegment = parentSegment / 5;
            const isBottom = parentMode.mode === 'kanji';

            // Tạo cầu nối tàng hình riêng cho từng cụm (Words riêng, Kanji riêng)
            let modeBridge = document.createElementNS("http://www.w3.org/2000/svg", "path");
            modeBridge.setAttribute("class", "tier2-bridge");
            modeBridge.setAttribute("data-parent-mode", parentMode.mode);
            modeBridge.setAttribute("d", this.describeArc(cx, cy, 205, 255, parentMode.start - 5, parentMode.end + 5, true));
            modeBridge.setAttribute("fill", "rgba(0,0,0,0)");
            modeBridge.setAttribute("stroke", "none");
            tier2.appendChild(modeBridge);

            nLevels.forEach((nl, i) => {
                let start = parentMode.start + i * subSegment;
                let end = start + subSegment;

                let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
                g.setAttribute("class", "sub-blade");
                g.setAttribute("data-level", nl.level);
                g.setAttribute("data-parent-mode", parentMode.mode);

                let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", this.describeArc(cx, cy, 215, 245, start, end));
                path.setAttribute("class", "svg-sub-path");

                // Đảo ngược hướng quét (sweep) cho các mode ở nửa dưới vòng tròn (như Kanji) để chữ ko bị lộn ngược
                const sweep = isBottom ? 0 : 1;
                const textRadius = isBottom ? 238 : 230; // Nâng radius lên 1 chút khi đảo chiều để chữ ko bị dính vào mép trong

                let tpId = `text-path-${parentMode.id}-${nl.level}`;
                let tPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                tPath.setAttribute("id", tpId);
                tPath.setAttribute("d", this.describeTextArc(cx, cy, textRadius, start + 2, end - 2, sweep));
                tPath.setAttribute("fill", "transparent");
                tPath.setAttribute("stroke", "transparent");
                defs?.appendChild(tPath);

                let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
                txt.setAttribute("class", "svg-sub-text");
                txt.setAttribute("dy", isBottom ? "-2" : "5"); // Tinh chỉnh độ cao chữ dựa trên hướng sweep

                let tp = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
                tp.setAttribute("href", `#${tpId}`);
                tp.setAttribute("startOffset", "50%");
                tp.setAttribute("text-anchor", "middle");
                tp.textContent = nl.text;

                txt.appendChild(tp);
                g.appendChild(path);
                g.appendChild(txt);
                tier2.appendChild(g);
            });
        });
    }

    public openJLPTHub(level: string = 'n2', modeType: string = 'study') {
        this.currentHubMode = modeType;
        this.currentHubLevel = level;
        const mLevel = level.toUpperCase();
        if (this.menuControls) this.menuControls.classList.add('hidden');
        if (this.messageCenter) this.messageCenter.classList.add('hidden');
        if (this.profileCard) this.profileCard.classList.add('hidden');

        // Hide Lobby Tools
        if (this.leaderboardTrigger) this.leaderboardTrigger.classList.add('hidden');
        if (this.guideTrigger) this.guideTrigger.classList.add('hidden');

        // Cập nhật nhãn Level, Loại dữ liệu (Words/Kanji) và Con dấu
        const sealNames: Record<string, string> = {
            'N1': '一級', 'N2': '二級', 'N3': '三級', 'N4': '四級', 'N5': '五級'
        };

        if (this.hubLevelName) this.hubLevelName.innerText = mLevel;
        const t = LanguageConfig.translations[LanguageConfig.current];
        if (this.hubTargetType) {
            if (modeType === 'study') this.hubTargetType.innerText = t.hub.vocabulary;
            else if (modeType === 'kanji') this.hubTargetType.innerText = t.hub.kanji;
            else if (modeType === 'grammar') this.hubTargetType.innerText = t.hub.grammar;

            if (this.hubMainTitle) this.hubMainTitle.innerText = t.hub.archives;
        }
        if (this.hubSealName) this.hubSealName.innerText = sealNames[mLevel] || '---';

        // Load dữ liệu cho level này
        StateManager.getInstance().loadLevelHubData(mLevel, modeType).then(() => {
            if (this.jlptHubPage) {
                this.jlptHubPage.classList.remove('hidden');
                this.renderJLPTUnits();
            }
        });

        // Hiện thanh âm nhạc
        if (this.miniPlayer) this.miniPlayer.classList.remove('hidden');
    }

    private renderJLPTUnits() {
        const state = StateManager.getInstance();
        const data = state.getN2HubData();
        console.log(`[UISystem] Bắt đầu render Hub. Số lượng Units nhận được: ${data.length}`);

        if (!this.jlptUnitsContainer) {
            console.error('[UISystem] jlptUnitsContainer not found in DOM!');
            return;
        }
        this.jlptUnitsContainer.innerHTML = '';

        const t = LanguageConfig.translations[LanguageConfig.current];
        if (data.length === 0) {
            this.jlptUnitsContainer.innerHTML = `<div style="color: var(--danger); text-align: center; width: 100%; padding: 40px; font-family: monospace; font-size: 1.2rem; letter-spacing: 2px;">${t.hub.notFound}</div>`;
            console.warn('[UISystem] Hub data empty.');
        }

        let completedCount = 0;
        let totalCount = 0;

        let globalAccSum = 0;
        let globalWpmSum = 0;
        let globalRankScoreSum = 0;
        let globalScoreSum = 0;

        data.forEach((unit: any, uIdx: number) => {
            let unitAccSum = 0;
            let unitWpmSum = 0;
            let unitSessCompleted = 0;
            let unitScoreSum = 0;
            let rankScoreSum = 0; // S=4, A=3, B=2, C=1, D=0

            // Render Sessions trước để lấy Data tổng
            let sessionsContainer = document.createElement('div');
            sessionsContainer.className = 'jlpt-unit-sessions';

            let rankMap: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
            let reverseRank = ['D', 'C', 'B', 'A', 'S'];

            unit.sessions.forEach((_sess: any[], sIdx: number) => {
                totalCount++;
                let prog = state.getN2SessionProgress(uIdx, sIdx);
                let rank = prog ? prog.rank : '---';
                let acc = prog ? Math.floor(prog.acc * 100) : 0;
                let wpm = prog ? prog.wpm : 0;
                let score = prog && prog.score ? Math.min(prog.score, 3000) : 0;

                if (prog && prog.rank !== '---') {
                    completedCount++;
                    unitSessCompleted++;
                    unitAccSum += acc;
                    unitWpmSum += wpm;
                    unitScoreSum += score;
                    rankScoreSum += (rankMap[rank] || 0);

                    // Global stats
                    globalAccSum += acc;
                    globalWpmSum += wpm;
                    globalScoreSum += score;
                    globalRankScoreSum += (rankMap[rank] || 0);
                }

                let sessCard = document.createElement('div');
                sessCard.className = 'jlpt-session-card';
                sessCard.innerHTML = `
                    <div class="jlpt-session-title">Session ${sIdx + 1}</div>
                    <div class="jlpt-session-rank jlpt-rank-${rank}">${rank}</div>
                    <div class="jlpt-session-stats">
                        <span>ACC: ${acc}%</span>
                        <span style="color: var(--primary); font-family: 'Orbitron', sans-serif;">SCORE: ${score}</span>
                        <span>WPM: ${wpm}</span>
                    </div>
                `;

                sessCard.addEventListener('click', (e) => {
                    e.stopPropagation(); // Ngăn nện click lan lên header
                    this.currentN2Context = { unitIdx: uIdx, sessionIdx: sIdx };
                    this.openjlptCalibrationModal(unit.unitName, sIdx + 1);
                });
                sessionsContainer.appendChild(sessCard);
            });

            // Tính trung bình
            let avgAcc = unitSessCompleted > 0 ? Math.floor(unitAccSum / unitSessCompleted) : 0;
            let avgWpm = unitSessCompleted > 0 ? Math.floor(unitWpmSum / unitSessCompleted) : 0;
            let avgRank = unitSessCompleted > 0 ? reverseRank[Math.round(rankScoreSum / unitSessCompleted)] : '-';

            let unitCard = document.createElement('div');
            unitCard.className = 'jlpt-unit-card';

            let header = document.createElement('div');
            header.className = 'jlpt-unit-header';

            // Xây dựng Bố cục Cyber-Bamboo (Hollow Engraving)
            const t = LanguageConfig.translations[LanguageConfig.current];
            header.innerHTML = `
                <div class="jlpt-unit-rope left-rope"></div>
                
                <div class="jlpt-unit-title-box">
                    <div class="jlpt-ja-title" title="${unit.studyName_JA}">${unit.studyName_JA}</div>
                    <div class="jlpt-en-title" title="[ ${unit.unitName.replace('_', ' ')}: ${state.studyLanguage === 'en' ? unit.studyName_ENG.toUpperCase() : unit.studyName_VI.toUpperCase()} ]">[ ${unit.unitName.replace('_', ' ')}: ${state.studyLanguage === 'en' ? unit.studyName_ENG.toUpperCase() : unit.studyName_VI.toUpperCase()} ]</div>
                </div>

                <div class="jlpt-unit-hud">
                    <div class="hud-stat-box">
                        <span class="hud-label">${t.profile.rank.toUpperCase()}</span>
                        <span class="hud-val jlpt-rank-${avgRank}">${avgRank}</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">${t.profile.accuracy.toUpperCase()}</span>
                        <span class="hud-val">${avgAcc}%</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">AVG ${t.profile.wpm.toUpperCase()}</span>
                        <span class="hud-val">${avgWpm}</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">${t.profile.totalScore.toUpperCase()}</span>
                        <span class="hud-val" style="color: var(--primary); text-shadow: 0 0 10px rgba(0,245,255,0.6);">${unitScoreSum.toLocaleString()}</span>
                    </div>
                    <div class="hud-sess-count">✦ ${unit.sessions.length} ${t.hub.scrolls} ✦</div>
                    <button class="jlpt-review-trigger" data-unit-idx="${uIdx}" title="Ôn tập toàn bộ Unit này">TỔNG ÔN</button>
                </div>
                
                <div class="jlpt-unit-rope right-rope"></div>
            `;

            const reviewBtn = header.querySelector('.jlpt-review-trigger');
            reviewBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                // Combine all sessions words for review
                const allWords: any[] = [];
                unit.sessions.forEach((s: any[]) => allWords.push(...s));

                this.currentN2Context = { unitIdx: uIdx, sessionIdx: -1 }; // -1 indicates review
                this.openjlptCalibrationModal(unit.studyName_JA, 'ALL SESSION', true);
            });



            header.addEventListener('mouseenter', () => {
                EventBus.getInstance().publish('PLAY_HOVER');
            });
            header.addEventListener('click', () => {
                EventBus.getInstance().publish('PLAY_DING');
                unitCard.classList.toggle('expanded');
            });

            unitCard.appendChild(header);
            unitCard.appendChild(sessionsContainer);
            this.jlptUnitsContainer!.appendChild(unitCard);
        });

        // --- UPDATE GLOBAL HUD ---
        let gAcc = completedCount > 0 ? Math.floor(globalAccSum / completedCount) : 0;
        let gWpm = completedCount > 0 ? Math.floor(globalWpmSum / completedCount) : 0;
        let reverseRank = ['D', 'C', 'B', 'A', 'S'];
        let gRank = completedCount > 0 ? reverseRank[Math.round(globalRankScoreSum / completedCount)] : '-';

        const gRankEl = byId('jlptGlobalRank');
        const gAccEl = byId('jlptGlobalAcc');
        const gWpmEl = byId('jlptGlobalWpm');
        const gScoreEl = byId('jlptGlobalScore');

        if (gRankEl) {
            gRankEl.innerText = gRank;
            gRankEl.className = `hud-val jlpt-rank-${gRank}`;
        }
        if (gAccEl) gAccEl.innerText = `${gAcc}%`;
        if (gWpmEl) gWpmEl.innerText = `${gWpm}`;
        if (gScoreEl) gScoreEl.innerText = globalScoreSum.toLocaleString();

        if (this.jlptTotalProgress) {
            const perc = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
            this.jlptTotalProgress.innerText = `${perc}% (${completedCount}/${totalCount})`;
        }

        // --- FORCE SYNC REMOVED ---
        // This was causing Rate Limit (429) errors because it used supabase.auth.updateUser too frequently.
        // Aggregate stats are already handled by the global_leaderboard view and n2_progress table.
    }

    private openjlptCalibrationModal(unitName: string, sessionNum: number | string, isReview: boolean = false) {
        if (!this.jlptCalibrationModal) return;

        this.isReviewMode = isReview;
        if (this.calibWaveRow) {
            this.calibWaveRow.style.display = isReview ? 'flex' : 'none';
            
            // Đồng bộ trạng thái checkbox với GameConfig
            const workflow = GameConfig.studyMode.workflow;
            const checks = this.getCalibWaveChecks();
            checks.forEach(chk => {
                const w = parseInt(chk.value);
                const key = `enableWave${w}` as keyof typeof workflow;
                const isEnabled = workflow[key] !== false;
                
                chk.checked = isEnabled;
                // Nếu wave bị disable cứng trong config, làm mờ checkbox đó đi để user biết
                const box = chk.closest('.wave-chk-box') as HTMLElement;
                if (box) {
                    box.style.opacity = isEnabled ? '1' : '0.3';
                    box.style.pointerEvents = isEnabled ? 'auto' : 'none';
                }
            });
        }

        // Cập nhật giá trị UI theo cache Audio hiện tại
        if (this.bgmVolSlider && this.calibBgmSlider) this.calibBgmSlider.value = this.bgmVolSlider.value;
        if (this.sfxVolSlider && this.calibSfxSlider) this.calibSfxSlider.value = this.sfxVolSlider.value;
        if (this.ttsVolSlider && this.calibTtsSlider) this.calibTtsSlider.value = this.ttsVolSlider.value;

        if (this.calibSessionTitle) {
            this.calibSessionTitle.innerText = isReview ? `${unitName} - REVISION` : `${unitName} - Session ${sessionNum}`;
        }

        this.jlptCalibrationModal.classList.remove('hidden');
    }

    // ============================================================
    // NEURAL HIERARCHY (LEADERBOARD) LOGIC
    // ============================================================

    private setupLeaderboardLogic() {
        // Dự phòng: Lấy lại element nếu bị null lúc khởi tạo class
        if (!this.leaderboardTrigger) this.leaderboardTrigger = byId('leaderboard-trigger');
        if (!this.leaderboardTerminal) this.leaderboardTerminal = byId('leaderboard-terminal');
        if (!this.closeLeaderboardBtn) this.closeLeaderboardBtn = byId('closeLeaderboardBtn');
        if (!this.leaderboardList) this.leaderboardList = byId('leaderboard-list');

        console.log("[Leaderboard] Setting up logic...", {
            trigger: !!this.leaderboardTrigger,
            terminal: !!this.leaderboardTerminal
        });

        if (!this.leaderboardTrigger || !this.leaderboardTerminal || !this.closeLeaderboardBtn) {
            console.warn("[Leaderboard] Essential UI elements missing!");
            return;
        }

        this.leaderboardTrigger.addEventListener('click', () => {
            console.log("[Leaderboard] Click detected.");
            if (this.leaderboardTerminal) {
                this.leaderboardTerminal.classList.remove('hidden');
                console.log("[Leaderboard] Terminal visibility updated.");
                this.refreshLeaderboard().catch(e => console.error("Refresh failed:", e));
            } else {
                console.error("[Leaderboard] Terminal is null!");
            }
            EventBus.getInstance().publish('AUDIO_BEEP', null);
        });

        this.closeLeaderboardBtn.addEventListener('click', () => {
            this.leaderboardTerminal!.classList.add('hidden');
            EventBus.getInstance().publish('AUDIO_BEEP', null);
        });

        // Initialize NodeLists
        this.rankScopeBtns = document.querySelectorAll('.scope-btn');
        this.rankMetricBtns = document.querySelectorAll('.metric-btn');

        // Scope Switch (Global / Friends)
        this.rankScopeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rankScopeBtns!.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetScope = (btn as HTMLElement).dataset.scope;
                if (targetScope === 'global' || targetScope === 'friends') {
                    this.currentRankScope = targetScope;
                }
                this.refreshLeaderboard();
            });
        });

        // Metric Switch (Score / WPM / Accuracy)
        this.rankMetricBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.rankMetricBtns!.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetMetric = (btn as HTMLElement).dataset.metric;
                if (targetMetric === 'score' || targetMetric === 'wpm' || targetMetric === 'accuracy') {
                    this.currentRankMetric = targetMetric;
                }
                this.refreshLeaderboard();
            });
        });
    }

    private async refreshLeaderboard() {
        const state = StateManager.getInstance();
        if (!this.leaderboardList) return;
        this.leaderboardList.innerHTML = '<div class="loading-spinner">SYNCING_DATA...</div>';

        const auth = AuthSystem.getInstance();
        const user = auth.getCurrentUser();

        const t = LanguageConfig.translations[LanguageConfig.current];
        if (this.currentRankScope === 'friends') {
            this.leaderboardList.innerHTML = `<div style="padding:40px; text-align:center; color:rgba(255,255,255,0.3); font-size:0.8rem;">${t.leaderboard.friendOffline}<br>${t.leaderboard.comingSoon}</div>`;
            return;
        }

        try {
            // Xác định cột để sort
            let sortColumn = 'total_score';
            if (this.currentRankMetric === 'wpm') sortColumn = 'avg_wpm';
            if (this.currentRankMetric === 'accuracy') sortColumn = 'avg_acc';

            // Query từ bảng global_leaderboard
            const { data, error } = await supabase
                .from('global_leaderboard')
                .select('name, agent_id, avatar, total_score, avg_wpm, avg_acc')
                .order(sortColumn, { ascending: false })
                .limit(10);

            if (error) throw error;

            this.leaderboardList.innerHTML = '';

            if (data && data.length > 0) {
                data.forEach((agent, index) => {
                    const item = document.createElement('div');
                    item.className = `rank-item top-${index + 1}`;

                    const isSelf = user && agent.agent_id === user.agentId;
                    const serverValueStr = this.getFormattedMetricValue(agent);
                    
                    // Local-favoring logic: Nếu điểm local cao hơn server (do trễ sync), hiện điểm local cho bản thân
                    let displayValue = serverValueStr;
                    if (isSelf && user) {
                        const localStats = state.getGlobalN2Stats();
                        const localData = {
                            total_score: localStats.totalScore || 0,
                            avg_wpm: localStats.avgWpm || 0,
                            avg_acc: localStats.avgAcc || 0
                        };
                        const localValueStr = this.getFormattedMetricValue(localData);
                        
                        // Chuyển đổi sang số để so sánh chính xác (Bỏ dấu phẩy và phần trăm)
                        const localValueNum = parseFloat(localValueStr.replace(/,/g, '').replace('%', ''));
                        const serverValueNum = parseFloat(serverValueStr.replace(/,/g, '').replace('%', ''));
                        
                        if (localValueNum > serverValueNum) {
                            displayValue = localValueStr;
                        }
                    }

                    item.innerHTML = `
                        <div class="rank-num">${index + 1}</div>
                        <div class="rank-avatar">
                            ${agent.avatar ? `<img src="${agent.avatar}">` : (agent.name ? agent.name[0].toUpperCase() : 'A')}
                        </div>
                        <div class="rank-info">
                            <div class="rank-name" title="${agent.name || ''}">${agent.name || 'ANONYMOUS_AGENT'} ${isSelf ? `<span style="color:var(--safe); font-size:0.6rem;">${t.leaderboard.you}</span>` : ''}</div>
                            <div class="rank-tag">#${agent.agent_id || '000000'}</div>
                        </div>
                        <div class="rank-value">${displayValue}</div>
                    `;
                    this.leaderboardList?.appendChild(item);
                });
            } else {
                this.leaderboardList.innerHTML = `<div style="padding:40px; text-align:center; color:rgba(255,255,255,0.3);">${t.leaderboard.noData}</div>`;
            }

            // Sync My Ranking Footer
            if (this.myRankingFooter && user) {
                const myInTop = data ? data.find(a => a.agent_id === user.agentId) : null;
                const myIndex = data ? data.findIndex(a => a.agent_id === user.agentId) : -1;
                const myRank = myIndex !== -1 ? `#${myIndex + 1}` : '#??';

                const finalMyName = myInTop ? myInTop.name : (user.name || 'Khách');
                const finalMyAvatar = myInTop ? myInTop.avatar : user.avatar;
                
                // Sử dụng giá trị cao nhất giữa Server và Local để đảm bảo hiển thị đúng nhất
                const localStats = StateManager.getInstance().getGlobalN2Stats();
                const myMetricData = {
                    total_score: Math.max(localStats.totalScore || 0, myInTop ? myInTop.total_score : 0),
                    avg_wpm: Math.max(localStats.avgWpm || 0, myInTop ? myInTop.avg_wpm : 0),
                    avg_acc: Math.max(localStats.avgAcc || 0, myInTop ? myInTop.avg_acc : 0)
                };
                const myValue = this.getFormattedMetricValue(myMetricData);

                this.myRankingFooter.innerHTML = `
                    <div class="rank-avatar">
                        ${finalMyAvatar ? `<img src="${finalMyAvatar}">` : (finalMyName ? finalMyName[0].toUpperCase() : 'Y')}
                    </div>
                    <div class="rank-info">
                        <div class="rank-name" title="${finalMyName}" style="color:var(--primary);">${finalMyName} ${myIndex !== -1 ? `<span style="color:var(--safe); font-size:0.6rem;">${t.leaderboard.topPlayer}</span>` : ''}</div>
                        <div class="rank-tag">${t.leaderboard.rankLabel}: ${myRank}</div>
                    </div>
                    <div class="rank-value" style="font-size:1.1rem; color:var(--primary-glow);">${myValue}</div>
                `;
            }

        } catch (err) {
            console.error('[Leaderboard] Sync Error:', err);
            this.leaderboardList.innerHTML = `<div style="padding:40px; text-align:center; color:#ff4757;">${LanguageConfig.translations[LanguageConfig.current].leaderboard.error}</div>`;
        }
    }

    private getFormattedMetricValue(agent: any): string {
        switch (this.currentRankMetric) {
            case 'score': return (agent.total_score || 0).toLocaleString();
            case 'wpm': return (agent.avg_wpm || 0).toFixed(1);
            case 'accuracy': 
                const acc = agent.avg_acc || 0;
                const dAcc = (acc <= 1.1 && acc > 0) ? acc * 100 : acc;
                return dAcc.toFixed(1) + '%';
            default: return '0';
        }
    }

    private setupWave5SpeedLogic() {
        if (!this.wave5SpeedSlider || !this.speedValDisplay) return;

        this.wave5SpeedSlider.addEventListener('input', () => {
            const val = parseFloat(this.wave5SpeedSlider.value);
            if (this.speedValDisplay) {
                this.speedValDisplay.innerText = `x${val.toFixed(1)}`;
            }

            // Sync with Game Engine
            EventBus.getInstance().publish('GAME_SPEED_CHANGE', val);
        });

        // Initialize display
        this.speedValDisplay.innerText = `x${parseFloat(this.wave5SpeedSlider.value).toFixed(1)}`;
    }
}
