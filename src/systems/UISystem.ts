import { EventBus } from '../utils/EventBus';
import { StateManager } from '../data/StateManager';
import { GameConfig } from '../config';
import { byId } from '../utils/uiHelpers';
import { AuthSystem } from './AuthSystem';
import { supabase } from '../utils/supabase';
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
    private currentStudyLevel = 'n5';
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

    // Màn hình xác nhận STOP
    private stopConfirmModal = byId('stopConfirmModal');
    private confirmStopBtn = byId('confirmStopBtn');
    private cancelStopBtn = byId('cancelStopBtn');

    // State Thư Viện
    private myLibrary: { id: string, name: string, songs: { url: string, title: string }[] }[] = [];
    private activeFolderId: string | null = null;
    private viewingFolderId: string | null = null;

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
        if (enemy.mode === 'easy' || (enemy.mode === 'study' && (enemy.studyWave === 1 || enemy.studyWave === 2 || enemy.studyWave === 4))) {
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

        // Đảm bảo HP và Wave UI ẩn khi ở Lobby
        const batteryContainer = byId('hpBatteryContainer');
        if (batteryContainer) batteryContainer.style.display = 'none';
        if (this.waveProgressContainer) this.waveProgressContainer.classList.add('hidden');

        this.setupGuideLogic();
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
                            this.startBtn.innerText = selectedMode === 'study' && selectedLevel ? selectedLevel.toUpperCase() : selectedMode.toUpperCase();
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
                        this.startBtn.innerText = selectedMode === 'study' && selectedLevel ? selectedLevel.toUpperCase() : selectedMode.toUpperCase();
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
                        this.startBtn.innerText = mode.toUpperCase();
                        this.startBtn.style.fontSize = '2.6rem';
                    }
                }, 60);

                EventBus.getInstance().publish('PLAY_HOVER');
            });

            opt.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                // Nếu click dính vào sub-blade thì nhường cho sub-blade xử lý
                if (target.closest('.sub-blade')) return;

                let mode = (e.currentTarget as HTMLElement).getAttribute('data-mode');
                if (mode && mode !== 'study') {
                    this.currentMode = mode;
                    document.querySelectorAll('.fan-blade').forEach(p => p.classList.remove('active'));
                    (e.currentTarget as HTMLElement).classList.add('active');

                    // Mutate The Core Text & Collapse
                    if (this.startBtn) {
                        this.startBtn.innerText = mode.toUpperCase();
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
                }, 60);

                EventBus.getInstance().publish('PLAY_HOVER');
            });

            opt.addEventListener('click', (e) => {
                e.stopPropagation(); // Không trào lên cha
                let level = (e.currentTarget as HTMLElement).getAttribute('data-level');
                if (level) {
                    this.currentStudyLevel = level;
                    this.currentMode = 'study';

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
                        setTimeout(() => this.openJLPTHub(level), 300); // Đợi menu gập lại mượt mà
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
                EventBus.getInstance().publish('GAME_OVER', null);
                EventBus.getInstance().publish('GAME_STOPPED', null);
                if (this.hudTerminal) this.hudTerminal.classList.remove('show');
            });
        }

        if (this.cancelStopBtn) {
            this.cancelStopBtn.addEventListener('click', () => {
                if (this.stopConfirmModal) {
                    this.stopConfirmModal.classList.add('hidden');
                    this.stopConfirmModal.classList.remove('show');
                }

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
                    this.addSongBtn!.innerText = "Đang lấy...";
                    (this.addSongBtn as HTMLButtonElement).disabled = true;
                    let songTitle = u;
                    try {
                        let res = await fetch(`https://noembed.com/embed?url=${u}`);
                        let data = await res.json();
                        if (data && data.title) songTitle = data.title;
                    } catch (e) { }

                    folder.songs.push({ url: u, title: songTitle });
                    this.saveLibrary();

                    this.addSongBtn!.innerText = "Thêm";
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

                this.currentMode = 'study';
                this.currentStudyLevel = 'n2';

                const data = StateManager.getInstance().getN2HubData();
                if (this.currentN2Context && data) {
                    const sessionWords = data[this.currentN2Context.unitIdx].sessions[this.currentN2Context.sessionIdx];

                    this.updateHp(5);
                    this.updateScore(0);

                    if (this.menuControls) this.menuControls.classList.add('hidden');
                    if (this.stopBtn) this.stopBtn.classList.remove('hidden');

                    EventBus.getInstance().publish('GAME_START_N2', {
                        mode: 'study',
                        studyLevel: 'n2',
                        words: sessionWords,
                        unitIdx: this.currentN2Context.unitIdx,
                        sessionIdx: this.currentN2Context.sessionIdx
                    });
                }
            });
        }
    }

    private subscribeToEventBus() {
        const events = EventBus.getInstance();

        events.subscribe('GAME_OVER', () => {
            if (this.currentMode === 'study' && this.currentStudyLevel === 'n2') {
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

            // Xoá trạng thái lưu của mode, trả Lõi về form gốc để các nan quạt bung ra
            if (this.startBtn) {
                this.startBtn.innerText = "打検";
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
                if (count >= 3) {
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
            // Reset các màu viền và nền đã bị ám từ lúc Defeat/Skip
            this.hudTerminal.style.border = '';
            this.hudTerminal.style.boxShadow = '';
            this.hudTerminal.style.backgroundColor = '';

            if (enemy.mode === 'study' && (enemy.studyWave === 3 || enemy.studyWave === 5)) return;

            const word = enemy.word;

            // Xử lý riêng cho diện mạo câu hỏi Wave 4
            if (enemy.mode === 'study' && enemy.studyWave === 4) {
                let exampleJpRaw = word.example_jp || word.visual;
                // Tô khoảng trống
                exampleJpRaw = exampleJpRaw.replace(/\[(.*?)\]/g, '<span style="color: var(--neon-cyan); letter-spacing: 2px;">[ _ _ _ _ ]</span>');
                let exampleJp = exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

                let html = `
                    <div class="bubble-header" style="align-items: center; justify-content: center; margin-bottom: 20px;">
                        <span style="font-size: 1.2rem; font-weight: 700; color: #fff; opacity: 0.7;">Q: Hãy điền vào chỗ trống</span>
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

            if (enemy.mode === 'study' && enemy.studyWave >= 2) {
                if (enemy.studyWave === 2) {
                    isHidden = !enemy.isDefeated; // Wave 2: Sài sai vẫn giấu, chỉ hiện khi đã Defeat/Skip
                } else {
                    isHidden = !enemy.isDefeated && !enemy.isWeak;
                }
            }

            // Ở wave 2, nếu đang ẩn thông tin thì giấu luôn cả bảng card (bóp lại thành viên thuốc)
            if (enemy.mode === 'study' && enemy.studyWave === 2 && isHidden) {
                this.hudTerminal.classList.remove('show');
                return;
            }
            // (Bỏ khai báo vì const word = enemy.word đã có ở trên đầu)
            let exampleJpRaw = word.example_jp || word.visual;
            // Tô sáng phần trong ngoặc bằng màu vàng
            exampleJpRaw = exampleJpRaw.replace(/\[(.*?)\]/g, '<span style="color: #ffd700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">$1</span>');
            let exampleJp = isHidden
                ? (enemy.revealType === 'vi' ? "???" : exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '$1')) // Nếu là chiều Vi->Romaji thì giấu sạch câu Nhật
                : exampleJpRaw.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

            let romajiText = isHidden ? "???" : word.romaji;
            let viText = isHidden ? (enemy.revealType === 'vi' ? word.vi : "???") : (word.vi || '');
            let exampleViText = isHidden ? "???" : (word.example_vi || '');
            let hanvietText = isHidden && enemy.revealType === 'vi' ? "???" : (word.hanviet || '---');

            let html = `
                <div class="bubble-header" style="align-items: baseline;">
                    <div>
                        <span class="bubble-hanviet" style="margin-right: 12px;">[${hanvietText}]</span>
                        <span style="font-size: 1.6rem; font-weight: 700; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.5); font-family: 'Noto Sans JP', sans-serif;">${isHidden && enemy.revealType === 'vi' ? '???' : word.visual}</span>
                    </div>
                    <span class="bubble-vi" style="text-align: right;">${viText}</span>
                </div>
                <div class="bubble-romaji">${romajiText}</div>
                <div class="bubble-example-jp" style="position: relative; padding-right: 30px;">
                    ${exampleJp}
                    ${!isHidden ? `<button id="ttsReplayBtn" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--neon-cyan); opacity: 0.8; transition: transform 0.1s; padding: 5px;" onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.2)'" onmouseout="this.style.opacity='0.8'; this.style.transform='translateY(-50%) scale(1)'" title="Nghe lại">🔊</button>` : ''}
                </div>
                <div class="bubble-example-vi">${exampleViText}</div>
                ${(word.grammar_vi || word.grammar) ? `<div class="bubble-grammar"><span class="grammar-icon">💡</span> ${word.grammar_vi || word.grammar}</div>` : ''}
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

            if (this.bufferTrash && enemy.mode === 'study' && enemy.studyWave >= 2) {
                this.bufferTrash.innerHTML = `<span style="color: rgba(255,255,255,0.2); font-size: 0.7em;">[ Nhấn ENTER nếu quên từ ]</span>`;
            }

            if (enemy.mode === 'study' && enemy.studyWave === 1) {
                this.hudTerminal.classList.add('center-screen');
            } else {
                this.hudTerminal.classList.remove('center-screen');
            }

            this.hudTerminal.classList.remove('hidden');
            this.hudTerminal.classList.add('show');

            requestAnimationFrame(() => {
                document.documentElement.style.setProperty('--shift-up', `0px`);
                if (enemy) {
                    enemy.dynamicStudyOffset = 0;
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
            if (this.enemiesSpawnedThisWave > 0 && enemy && enemy.mode === 'study') {
                const idx = this.waveSegmentStates.indexOf('empty');
                if (idx !== -1) {
                    this.waveSegmentStates[idx] = enemy.isWeak ? 'failed' : 'filled';
                }
                this.renderWaveSegments();
            }

            if (!this.hudTerminal) return;

            // Ở Wave 4, sau khi trả lời, thẻ chuyển từ "Câu hỏi" (top 40%) sang "Giải thích"
            // Xóa inline style và class canh giữa để thẻ Giải thích rớt xuống sát ô nhập text
            if (enemy.mode === 'study' && enemy.studyWave === 4) {
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

            if (enemy.mode === 'study' && (enemy.studyWave === 3 || enemy.studyWave === 5)) return;
            EventBus.getInstance().publish('PLAY_DING', null); // Âm báo thành công ah-ha
            const word = enemy.word;
            let exampleJp = word.example_jp || word.visual;
            // Tô sáng phần trong ngoặc bằng màu vàng
            exampleJp = exampleJp.replace(/\[(.*?)\]/g, '<span style="color: #ffd700; text-shadow: 0 0 5px rgba(255,215,0,0.5);">$1</span>');
            exampleJp = exampleJp.replace(/\{([^|]+)\|([^}]+)\}/g, '<ruby>$1<rt>$2</rt></ruby>');

            // If enemy is skipped/weak, show red text instead of green
            let resultColor = enemy.isWeak ? '#ff4757' : '#00e676';
            if (this.hudTerminal) {
                if (enemy.isWeak) {
                    this.hudTerminal.style.border = '2px solid rgba(255, 71, 87, 0.8)';
                    this.hudTerminal.style.boxShadow = '0 0 30px rgba(255, 71, 87, 0.3), inset 0 0 20px rgba(255, 71, 87, 0.15)';
                    this.hudTerminal.style.backgroundColor = 'rgba(255, 71, 87, 0.1)';
                } else {
                    this.hudTerminal.style.border = '2px solid rgba(0, 230, 118, 0.8)';
                    this.hudTerminal.style.boxShadow = '0 0 30px rgba(0, 230, 118, 0.3), inset 0 0 20px rgba(0, 230, 118, 0.1)';
                    this.hudTerminal.style.backgroundColor = 'rgba(0, 230, 118, 0.1)';
                }
            }

            let html = `
                <div class="bubble-header" style="align-items: baseline;">
                    <div>
                        <span class="bubble-hanviet" style="color:${resultColor}; margin-right: 12px;">[${word.hanviet || '---'}]</span>
                        <span style="font-size: 1.6rem; font-weight: 700; color: ${resultColor}; text-shadow: 0 0 10px ${resultColor}80; font-family: 'Noto Sans JP', sans-serif;">${word.visual}</span>
                    </div>
                    <span class="bubble-vi" style="color:${resultColor}; text-align: right;">${word.vi || ''}</span>
                </div>
                <div class="bubble-romaji" style="color:${resultColor};">${word.romaji}</div>
                <div class="bubble-example-jp" style="position: relative; padding-right: 30px;">
                    ${exampleJp}
                    <button id="ttsReplayBtnDefeated" style="position: absolute; right: 0; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--neon-cyan); opacity: 0.8; transition: transform 0.1s; padding: 5px;" onmouseover="this.style.opacity='1'; this.style.transform='translateY(-50%) scale(1.2)'" onmouseout="this.style.opacity='0.8'; this.style.transform='translateY(-50%) scale(1)'" title="Nghe lại toàn bộ">🔊</button>
                </div>
                <div class="bubble-example-vi" style="color:${resultColor};">${word.example_vi || ''}</div>
                ${(word.grammar_vi || word.grammar) ? `<div class="bubble-grammar"><span class="grammar-icon">💡</span> ${word.grammar_vi || word.grammar}</div>` : ''}
            `;
            this.hudTerminal.innerHTML = html;
            if (enemy && enemy.mode === 'study') {
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
                this.bufferTrash.innerHTML = `<span style="color: rgba(255,255,255,0.2); font-size: 0.7em;">[ Nhấn ENTER nếu quên từ ]</span>`;
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
            this.updateScore(this.currentScore + points);
            this.savedBaseScore += points;
            this.currentWaveBaseScore += points;

            // Wave 5: Tự động chốt đơn khi đạt 3000 điểm
            if (this.currentMode === 'study' && this.currentWaveNumber === 5 && this.currentScore >= 3000) {
                setTimeout(() => {
                    EventBus.getInstance().publish('STUDY_SESSION_END', null);
                }, 500);
            }

            // Add to combat log
            const label = data.combo > 1 ? `COMBO x${data.combo}` : 'WORD CLEAR';
            this.addScoreFeedItem(points, label);

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
            if (enemy && enemy.mode === 'study') {
                if (this.hudTerminal) {
                    this.hudTerminal.classList.remove('hidden');
                    this.hudTerminal.classList.add('show');
                }
                setTimeout(() => {
                    if (this.bufferTrash) {
                        this.bufferTrash.innerHTML = `<span class="blink" style="color: var(--neon-cyan); font-size: 0.8em; letter-spacing: 1px;">[ BẤM SPACE ĐỂ QUA TỪ ]</span>`;
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
            if (this.currentMode === 'study' && this.currentWaveNumber < 5) return;

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

                if (bonusPoints > 0) {
                    this.msgTitle.innerText = bonusLabel;
                    this.msgTitle.style.color = bonusLabel === "GOLD CLEAR" ? "#ffd700" : (bonusLabel === "SILVER CLEAR" ? "#c0c0c0" : "#cd7f32");
                    this.msgSub.innerText = `+${bonusPoints} Time Bonus!\n[ BẤM SPACE ĐỂ TIẾP TỤC ]`;
                } else {
                    this.msgTitle.innerText = "WAVE CLEARED";
                    this.msgTitle.style.color = "#00e676";
                    this.msgSub.innerText = isWaitingManual ? "[ BẤM SPACE ĐỂ TIẾP TỤC ]" : "Chuẩn bị đợt mới...";
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
            if (this.currentMode === 'study' && this.currentStudyLevel === 'n2') {
                this.openJLPTHub();
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
            if (this.miniPlayer) this.miniPlayer.classList.remove('hidden');
            if (this.mainPlaylistHud) this.mainPlaylistHud.classList.add('hidden');



            // Hiển thị thông báo nếu do chết (HP <= 0), không hiển thị nếu bấm STOP khi HP > 0
            if (this.currentHp <= 0) {
                if (this.messageCenter && this.msgTitle && this.msgSub) {
                    this.messageCenter.classList.remove('hidden');
                    if (this.currentMode === 'study' && this.currentWaveNumber >= 5) {
                        this.msgTitle.innerText = "BATTERY DEPLETED";
                        this.msgTitle.style.color = "var(--neon-cyan)";
                        this.msgSub.innerText = "CALCULATING RESULTS...";
                    } else {
                        this.msgTitle.innerText = "BUSTED!";
                        this.msgTitle.style.color = "var(--danger)";
                        this.msgSub.innerText = `Chết nhục nhã. Điểm: ${this.currentScore}`;
                    }
                }
            } else {
                if (this.messageCenter && this.msgTitle && this.msgSub) {
                    this.messageCenter.classList.remove('hidden');
                    this.msgTitle.innerText = "NINJA TYPING";
                    this.msgTitle.style.color = "var(--primary-glow)";
                    this.msgSub.innerText = `Chọn cấu hình và nhấn START để quẩy!`;
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
                this.messageCenter.classList.remove('hidden');
                this.msgTitle.innerText = `SESSION CLEARED - RANK ${data.rank}`;
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
            if (this.miniTitle) this.miniTitle.innerText = data.title;
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
            this.isGameActive = false;
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
        };

        events.subscribe('GAME_START', onMatchStart);
        events.subscribe('GAME_START_N2', onMatchStart);
        events.subscribe('GAME_OVER', onMatchEnd);
        events.subscribe('STUDY_SESSION_END', onMatchEnd);
        events.subscribe('GAME_STOPPED', onMatchEnd);

        events.subscribe('AUTH_SUCCESS', (user: any) => {
            // Kiểm tra: Nếu chưa có tên thực sự HOẶC chưa có mã Agent ID (#000000)
            const isNewAgent = user.name === 'GUEST_AGENT' || !user.agentId || user.agentId === '000000';

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
                this.updateProfileUI();
                StateManager.getInstance().syncN2ProgressWithCloud();

                const guideShown = localStorage.getItem('DAKEN_GUIDE_SHOWN');
                if (!guideShown && this.generalGuideModal) {
                    setTimeout(() => {
                        this.generalGuideModal?.classList.remove('hidden');
                    }, 2000);
                }
            }
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

            if (this.loginStatus) this.loginStatus.innerText = 'STATUS: SYNCING_IDENTITY...';
            try {
                await auth.updateProfile({ name: name, agentId: randomID });
                if (this.loginStatus) this.loginStatus.innerText = 'STATUS: IDENTITY_SECURED';

                // Sau khi thành công, UISystem sẽ tự nhận event AUTH_SUCCESS và ẩn setup-view
            } catch (err: any) {
                if (this.loginStatus) this.loginStatus.innerText = `STATUS: ${err.message.toUpperCase()}`;
            }
        });

        // Loop cũ của nút Google (vẫn giữ logic loginWithGoogle)
        this.googleLoginBtn?.addEventListener('click', async () => {
            if (this.loginStatus) this.loginStatus.innerText = 'STATUS: REDIRECTING...';
            await auth.loginWithGoogle();
        });

        events.subscribe('N2_PROGRESS_SYNCED', () => {
            if (this.jlptHubPage && !this.jlptHubPage.classList.contains('hidden')) {
                this.renderJLPTUnits();
            }
            this.updateProfileUI(); // Cập nhật cả bảng Profile (Total Score)
        });
    }

    private updateProfileUI() {
        const auth = AuthSystem.getInstance();
        const state = StateManager.getInstance();
        const user = auth.getCurrentUser();

        if (this.playerNameEl) {
            this.playerNameEl.innerText = user?.name || "GUEST_AGENT";
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

        // Tính toán các chỉ số trung bình từ StateManager
        const n2Data = state.getN2HubData();
        let totalStatsCount = 0;
        let accSum = 0;
        let wpmSum = 0;
        let totalScoreSum = 0;
        let rankScoreSum = 0;
        const rankMap: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
        const reverseRank = ['D', 'C', 'B', 'A', 'S'];

        n2Data.forEach((unit, uIdx) => {
            unit.sessions.forEach((_: any, sIdx: number) => {
                const prog = state.getN2SessionProgress(uIdx, sIdx);
                if (prog && prog.rank !== '---') {
                    totalStatsCount++;
                    accSum += (prog.acc || 0) * 100;
                    wpmSum += (prog.wpm || 0);
                    totalScoreSum += (prog.score || 0);
                    rankScoreSum += rankMap[prog.rank] || 0;
                }
            });
        });

        if (this.totalScoreEl) this.totalScoreEl.innerText = totalScoreSum.toLocaleString();

        if (totalStatsCount > 0) {
            if (this.avgAccEl) this.avgAccEl.innerText = Math.floor(accSum / totalStatsCount) + "%";
            if (this.avgWpmEl) this.avgWpmEl.innerText = Math.floor(wpmSum / totalStatsCount).toString();
            if (this.playerRankEl) {
                const avgRank = reverseRank[Math.round(rankScoreSum / totalStatsCount)];
                this.playerRankEl.innerText = `CLASS ${avgRank}`;
                this.playerRankEl.className = `rank-value jlpt-rank-${avgRank}`;
            }

            // [LEADERBOARD] Tự động đồng bộ các chỉ số tổng hợp lên Cloud
            if (auth.isLoggedIn()) {
                const totalScore = totalScoreSum;
                const avgWpm = Math.floor(wpmSum / totalStatsCount);
                const avgAcc = Math.floor(accSum / totalStatsCount);

                const lastSyncedScore = parseInt(localStorage.getItem('LAST_SYNCED_TOTAL_SCORE') || '0');
                if (totalScore > lastSyncedScore) {
                    auth.updateProfile({
                        total_score: totalScore,
                        avg_wpm: avgWpm,
                        avg_acc: avgAcc
                    }).then(() => {
                        localStorage.setItem('LAST_SYNCED_TOTAL_SCORE', totalScore.toString());
                        console.log("[Social] Stats synchronized with Neural Hierarchy.");
                    }).catch(err => console.error("[Social] Link synchronization failed:", err));
                }
            }
        } else {
            if (this.avgAccEl) this.avgAccEl.innerText = "0%";
            if (this.avgWpmEl) this.avgWpmEl.innerText = "0";
            if (this.playerRankEl) this.playerRankEl.innerText = "UNRANKED";
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
                    // Supabase metadata có giới hạn (thường < 10KB), ưu tiên ảnh siêu nhỏ hoặc URL
                    // Ở đây ta vẫn cho Base64 nhưng cảnh báo nếu quá lớn
                    if (file.size > 50 * 1024) { // 50KB limit for metadata safety
                        alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 50KB để đồng bộ Cloud thành công.");
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        const base64 = event.target?.result as string;
                        if (this.playerAvtImg) this.playerAvtImg.src = base64;

                        // Lưu local dự phòng
                        localStorage.setItem('DAKEN_PLAYER_AVATAR', base64);

                        // Đồng bộ Cloud nếu đã login
                        const auth = AuthSystem.getInstance();
                        if (auth.isLoggedIn()) {
                            try {
                                await auth.updateProfile({ avatar: base64 });
                            } catch (err) {
                                console.error("Cloud sync failed.");
                            }
                        }

                        EventBus.getInstance().publish('AUDIO_BEEP', null);
                    };
                    reader.readAsDataURL(file);
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
            if (this.currentMode === 'study' && this.currentWaveNumber >= 5) {
                EventBus.getInstance().publish('STUDY_SESSION_END', null);
            } else if (this.currentMode !== 'study') {
                EventBus.getInstance().publish('GAME_OVER', null);
            }
        }
    }

    private updateScore(score: number) {
        this.currentScore = score;
        if (this.scoreEl) this.scoreEl.innerText = this.currentScore.toString();

        // Wave 5 Victory condition: 3000 points
        if (this.currentMode === 'study' && this.currentWaveNumber >= 5 && this.currentScore >= 3000 && !this.isSessionEnding) {
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

        if (this.currentWaveNumber === 5) {
            this.waveLabel.innerText = `WAVE 05 (ENDLESS)`;
            // Hides the segments and progress bar in Endless Sprint
            const barFill = byId('waveProgressBarFill');
            const pctText = byId('wavePercentText');
            if (barFill) barFill.parentElement!.style.display = 'none';
            if (pctText) pctText.parentElement!.style.display = 'none';
        } else {
            this.waveLabel.innerText = `WAVE ${this.currentWaveNumber.toString().padStart(2, '0')}`;

            const barFill = byId('waveProgressBarFill');
            const pctText = byId('wavePercentText');
            if (barFill) barFill.parentElement!.style.display = 'block';
            if (pctText) pctText.parentElement!.style.display = 'flex';

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
        this.synapseMatrixModal.classList.remove('hidden');
        this.synapseMatrixModal.classList.add('show');

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

        let html = `
            <div class="summary-content" style="width: 600px; max-width: 90vw; max-height: 80vh; overflow-y: auto; overflow-x: hidden; position: relative; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: var(--primary-glow); text-shadow: 0 0 10px var(--primary); margin-bottom: 5px; font-family: 'Orbitron';">SESSION COMPLETED</h2>
                    <div style="font-size: 3.5rem; font-weight: 900; color: ${rankColor}; text-shadow: 0 0 30px ${rankColor}80; font-family: 'Arial Black', sans-serif; font-style: italic;">RANK ${rank}</div>
                </div>

                <div style="text-align: center; margin-bottom: 15px; font-size: 1.8rem; font-weight: bold;">
                    <span style="color: #aaa; font-size: 0.75rem; display: block; margin-bottom: 5px; letter-spacing: 2px;">TOTAL SCORE</span>
                    <span style="color: var(--primary); text-shadow: 0 0 15px var(--primary);">${this.currentScore}</span>
                </div>

                ${breakdownHtml}
                ${perfHtml}

                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px;">
                    <button id="closeSynapseBtn" class="neon-button danger-btn" style="width: 100%; height: 50px; font-size: 1.1rem; border-radius: 8px; margin: 0;">KẾT THÚC PHIÊN</button>
                </div>
            </div>
        `;
        this.synapseMatrixModal.innerHTML = html;

        this.synapseMatrixModal.querySelector('#closeSynapseBtn')?.addEventListener('click', () => {
            this.synapseMatrixModal?.classList.add('hidden');
            this.synapseMatrixModal?.classList.remove('show');
            if (this.menuControls) this.menuControls.classList.remove('hidden');
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
        const tier1 = byId('svgTier1') as SVGElement | null;
        const tier2 = byId('svgTier2') as SVGElement | null;
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

        // --- TIER 1 --- (5 Chế độ = 72 độ mỗi Mode)
        const modes = [
            { id: "easy", text: "EASY (SOON)", start: -36, end: 36, mode: 'easy', disabled: true },     // TOP 
            { id: "study", text: "STUDY", start: 36, end: 108, mode: 'study', disabled: false },       // RIGHT
            { id: "hard", text: "HARD (SOON)", start: 108, end: 180, mode: 'hard', disabled: true },   // BOTTOM
            { id: "chill", text: "CHILL (SOON)", start: 180, end: 252, mode: 'chill', disabled: true }, // BOTTOM-LEFT
            { id: "medium", text: "MEDIUM (SOON)", start: 252, end: 324, mode: 'medium', disabled: true }// TOP-LEFT
        ];

        let defs = document.querySelector('#radialSvg defs');

        modes.forEach(m => {
            let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "fan-blade");
            g.setAttribute("data-mode", m.mode);
            if ((m as any).disabled) {
                g.classList.add("disabled-blade");
                g.style.opacity = "0.3";
                g.style.pointerEvents = "none";
            }
            if (m.mode === "study") {
                g.classList.add("has-sub");
                g.setAttribute("id", "studyBlade");

                // Cầu nối tàng hình giúp duy trì hover từ Tier 1 qua Tier 2, chống bug "né chuột"
                let studyBridge = document.createElementNS("http://www.w3.org/2000/svg", "path");
                studyBridge.setAttribute("d", this.describeArc(cx, cy, 200, 255, m.start - 5, m.end + 5, true));
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
            tp.textContent = m.text;

            txt.appendChild(tp);
            g.appendChild(path);
            g.appendChild(txt);
            tier1.appendChild(g);
        });

        // --- TIER 2 --- (N1 - N5) 
        // Tạo cầu nối tàng hình lót dưới toàn bộ cung N1-N5 để chặn chuột rơi xuống khe hở trúng phải STUDY
        let tier2Bridge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        tier2Bridge.setAttribute("d", this.describeArc(cx, cy, 210, 250, 34, 110, true)); // Rộng hơn 1 xíu để bao kín
        tier2Bridge.setAttribute("fill", "rgba(0,0,0,0)");
        tier2Bridge.setAttribute("stroke", "none");
        tier2.appendChild(tier2Bridge);

        const segment = 72 / 5;
        const nLevels = [
            { level: 'n1', text: 'N1' },
            { level: 'n2', text: 'N2' },
            { level: 'n3', text: 'N3' },
            { level: 'n4', text: 'N4' },
            { level: 'n5', text: 'N5' }
        ];

        nLevels.forEach((nl, i) => {
            let start = 36 + i * segment;
            let end = start + segment;

            let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("class", "sub-blade");
            g.setAttribute("data-level", nl.level);

            let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", this.describeArc(cx, cy, 215, 245, start, end));
            path.setAttribute("class", "svg-sub-path");

            let tpId = `text-path-${nl.level}`;
            let tPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tPath.setAttribute("id", tpId);
            tPath.setAttribute("d", this.describeTextArc(cx, cy, 230, start + 2, end - 2, 1));
            tPath.setAttribute("fill", "transparent");
            tPath.setAttribute("stroke", "transparent");
            defs?.appendChild(tPath);

            let txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("class", "svg-sub-text");
            txt.setAttribute("dy", "5");

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
    }

    public openJLPTHub(level: string = 'n2') {
        const mLevel = level.toUpperCase();
        if (this.menuControls) this.menuControls.classList.add('hidden');
        if (this.messageCenter) this.messageCenter.classList.add('hidden');
        if (this.profileCard) this.profileCard.classList.add('hidden');

        // Hide Lobby Tools
        if (this.leaderboardTrigger) this.leaderboardTrigger.classList.add('hidden');
        if (this.guideTrigger) this.guideTrigger.classList.add('hidden');

        // Cập nhật nhãn Level và Con dấu (Seal)
        const sealNames: Record<string, string> = {
            'N1': '一級', 'N2': '二級', 'N3': '三級', 'N4': '四級', 'N5': '五級'
        };

        if (this.hubLevelName) this.hubLevelName.innerText = mLevel;
        if (this.hubSealName) this.hubSealName.innerText = sealNames[mLevel] || '---';

        // Load dữ liệu cho level này
        StateManager.getInstance().loadLevelHubData(mLevel).then(() => {
            if (this.jlptHubPage) {
                this.jlptHubPage.classList.remove('hidden');
                this.renderJLPTUnits(); // Vẫn dùng renderJLPTUnits vì nó lấy dữ liệu từ state.n2HubData đã được cập nhật
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
            console.error('[UISystem] Không tìm thấy jlptUnitsContainer trong DOM!');
            return;
        }
        this.jlptUnitsContainer.innerHTML = '';

        if (data.length === 0) {
            this.jlptUnitsContainer.innerHTML = '<div style="color: var(--danger); text-align: center; width: 100%; padding: 40px; font-family: monospace; font-size: 1.2rem; letter-spacing: 2px;">[ HỆ THỐNG: KHÔNG TÌM THẤY DỮ LIỆU CẤP ĐỘ NÀY ]</div>';
            console.warn('[UISystem] Dữ liệu Hub rỗng, hiển thị thông báo trống.');
        }

        let completedCount = 0;
        let totalCount = 0;

        let globalAccSum = 0;
        let globalWpmSum = 0;
        let globalRankScoreSum = 0;
        let globalScoreSum = 0;

        data.forEach((unit, uIdx) => {
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
                let score = prog && prog.score ? prog.score : 0;

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
            header.innerHTML = `
                <div class="jlpt-unit-rope left-rope"></div>
                
                <div class="jlpt-unit-title-box">
                    <div class="jlpt-ja-title" title="${unit.studyName_JA}">${unit.studyName_JA}</div>
                    <div class="jlpt-en-title" title="[ ${unit.unitName.replace('_', ' ')}: ${unit.studyName_ENG.toUpperCase()} ]">[ ${unit.unitName.replace('_', ' ')}: ${unit.studyName_ENG.toUpperCase()} ]</div>
                </div>

                <div class="jlpt-unit-hud">
                    <div class="hud-stat-box">
                        <span class="hud-label">RANK</span>
                        <span class="hud-val jlpt-rank-${avgRank}">${avgRank}</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">ACCURACY</span>
                        <span class="hud-val">${avgAcc}%</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">AVG WPM</span>
                        <span class="hud-val">${avgWpm}</span>
                    </div>
                    <div class="hud-stat-box">
                        <span class="hud-label">TOTAL SCORE</span>
                        <span class="hud-val" style="color: var(--primary); text-shadow: 0 0 10px rgba(0,245,255,0.6);">${unitScoreSum.toLocaleString()}</span>
                    </div>
                    <div class="hud-sess-count">✦ ${unit.sessions.length} Cuộn ✦</div>
                </div>
                
                <div class="jlpt-unit-rope right-rope"></div>
            `;



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
    }

    private openjlptCalibrationModal(unitName: string, sessionNum: number) {
        if (!this.jlptCalibrationModal) return;

        // Cập nhật giá trị UI theo cache Audio hiện tại
        if (this.bgmVolSlider && this.calibBgmSlider) this.calibBgmSlider.value = this.bgmVolSlider.value;
        if (this.sfxVolSlider && this.calibSfxSlider) this.calibSfxSlider.value = this.sfxVolSlider.value;
        if (this.ttsVolSlider && this.calibTtsSlider) this.calibTtsSlider.value = this.ttsVolSlider.value;


        if (this.calibSessionTitle) {
            this.calibSessionTitle.innerText = `${unitName} - Session ${sessionNum}`;
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
        if (!this.leaderboardList) return;
        this.leaderboardList.innerHTML = '<div class="loading-spinner">SYNCING_DATA...</div>';

        const auth = AuthSystem.getInstance();
        const user = auth.getCurrentUser();

        if (this.currentRankScope === 'friends') {
            this.leaderboardList.innerHTML = '<div style="padding:40px; text-align:center; color:rgba(255,255,255,0.3); font-size:0.8rem;">FRIEND_SYSTEM_OFFLINE<br>(COMMING SOON WITH AGENT_LINK UPDATE)</div>';
            return;
        }

        try {
            // Xác định cột để sort
            let sortColumn = 'total_score';
            if (this.currentRankMetric === 'wpm') sortColumn = 'avg_wpm';
            if (this.currentRankMetric === 'accuracy') sortColumn = 'avg_acc';

            // Query từ bảng profiles (giả định có các cột này, fallback nếu lỗi)
            const { data, error } = await supabase
                .from('profiles')
                .select('name, agent_id, avatar, total_score, avg_wpm, avg_acc')
                .order(sortColumn, { ascending: false })
                .order('updated_at', { ascending: false })
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
                        const localData = {
                            total_score: user.total_score || 0,
                            avg_wpm: user.avg_wpm || 0,
                            avg_acc: user.avg_acc || 0
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
                            <div class="rank-name">${agent.name || 'ANONYMOUS_AGENT'} ${isSelf ? '<span style="color:var(--safe); font-size:0.6rem;">(YOU)</span>' : ''}</div>
                            <div class="rank-tag">#${agent.agent_id || '000000'}</div>
                        </div>
                        <div class="rank-value">${displayValue}</div>
                    `;
                    this.leaderboardList?.appendChild(item);
                });
            } else {
                this.leaderboardList.innerHTML = '<div style="padding:40px; text-align:center; color:rgba(255,255,255,0.3);">NO_AGENT_DATA_FOUND</div>';
            }

            // Sync My Ranking Footer
            if (this.myRankingFooter && user) {
                const myInTop = data ? data.find(a => a.agent_id === user.agentId) : null;
                const myIndex = data ? data.findIndex(a => a.agent_id === user.agentId) : -1;
                const myRank = myIndex !== -1 ? `#${myIndex + 1}` : '#??';

                const finalMyName = myInTop ? myInTop.name : (user.name || 'GUEST_AGENT');
                const finalMyAvatar = myInTop ? myInTop.avatar : user.avatar;
                
                // Sử dụng giá trị cao nhất giữa Server và Local để đảm bảo hiển thị đúng nhất
                const myMetricData = {
                    total_score: Math.max(user.total_score || 0, myInTop ? myInTop.total_score : 0),
                    avg_wpm: Math.max(user.avg_wpm || 0, myInTop ? myInTop.avg_wpm : 0),
                    avg_acc: Math.max(user.avg_acc || 0, myInTop ? myInTop.avg_acc : 0)
                };
                const myValue = this.getFormattedMetricValue(myMetricData);

                this.myRankingFooter.innerHTML = `
                    <div class="rank-avatar">
                        ${finalMyAvatar ? `<img src="${finalMyAvatar}">` : (finalMyName ? finalMyName[0].toUpperCase() : 'Y')}
                    </div>
                    <div class="rank-info">
                        <div class="rank-name" style="color:var(--primary);">${finalMyName} ${myIndex !== -1 ? '<span style="color:var(--safe); font-size:0.6rem;">(TOP PLAYER)</span>' : ''}</div>
                        <div class="rank-tag">HIERARCHY_RANK: ${myRank}</div>
                    </div>
                    <div class="rank-value" style="font-size:1.1rem; color:var(--primary-glow);">${myValue}</div>
                `;
            }

        } catch (err) {
            console.error('[Leaderboard] Sync Error:', err);
            this.leaderboardList.innerHTML = '<div style="padding:40px; text-align:center; color:#ff4757;">CONNECTION_INTERRUPTED</div>';
        }
    }

    private getFormattedMetricValue(agent: any): string {
        switch (this.currentRankMetric) {
            case 'score': return (agent.total_score || 0).toLocaleString();
            case 'wpm': return (agent.avg_wpm || 0).toFixed(1);
            case 'accuracy': return (agent.avg_acc || 0) + '%';
            default: return '0';
        }
    }
}
