import { EventBus } from '../../../core/EventBus';
import { GameConfig } from '../../../config';

export class AudioSystem {
    private audioCtx: AudioContext;
    public ytPlayer: any = null;
    public ytReady: boolean = false;
    private bgmLoop: any = null;
    private ytUpdateLoop: any = null;
    private isBgmPlaying: boolean = false;
    private currentMode: string = 'medium';
    private usingYoutube: boolean = false;

    // Audio settings & mixing
    private masterSfxGain: GainNode;
    private ttsVolMultiplier: number = 1.0;
    private ttsRate: number = GameConfig.audio.defaultTtsRate;
    private sfxVolMultiplier: number = 1.0;
    private bgmVolMultiplier: number = 1.0;

    // Playlist States
    private playlist: string[] = [];
    private currentIndex: number = 0;
    
    private wasPlayingBeforePause: boolean = false;
    private duckingEnabled: boolean = GameConfig.audio.enableBgmDucking;
    private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();

    constructor() {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterSfxGain = this.audioCtx.createGain();
        this.masterSfxGain.gain.value = 1.0;
        this.masterSfxGain.connect(this.audioCtx.destination);
        
        // Mở khóa AudioContext khi người dùng tương tác lần đầu
        const unlockAudio = () => {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            
            // Chỉ tự động phát nếu cấu hình cho phép
            if (!this.isBgmPlaying && this.ytReady && this.ytPlayer && GameConfig.audio.autoPlayBgm) {
                this.isBgmPlaying = true;
                this.usingYoutube = true;
                if (this.playlist.length === 0) {
                    this.playlist = ['HSOtku1j600'];
                    this.currentIndex = 0;
                }
                this.ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
            } else if (this.ytReady && this.ytPlayer && !this.isBgmPlaying) {
                // Nếu không autoPlay, ít nhất hãy chuẩn bị sẵn bài hát (cue)
                if (this.playlist.length === 0) {
                    this.playlist = ['HSOtku1j600'];
                    this.currentIndex = 0;
                }
                if (typeof this.ytPlayer.cueVideoById === 'function') {
                    this.ytPlayer.cueVideoById({'videoId': this.playlist[this.currentIndex]});
                }
            }
        };

        document.addEventListener('click', unlockAudio, { once: true });
        // Tương tự cho gõ phím
        document.addEventListener('keydown', unlockAudio, { once: true });
        
        this.setupYoutubeAPI();
        this.subscribeToEventBus();
    }

    private setupYoutubeAPI() {
        // --- SETUP YOUTUBE LOFI BGM API DYNAMICALLY ---
        let tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        let firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }

        // Must assign global callback for youtube iframe api
        (window as any).onYouTubeIframeAPIReady = () => {
            this.ytPlayer = new (window as any).YT.Player('youtube-player', {
                height: '200',
                width: '200',
                host: 'https://www.youtube.com',
                videoId: 'HSOtku1j600', // Bản nhạc Chill lofi
                playerVars: {
                    'autoplay': GameConfig.audio.autoPlayBgm ? 1 : 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'loop': 0
                },
                events: {
                    'onReady': (event: any) => {
                        this.ytReady = true;
                        event.target.setVolume(50);
                        console.log("YouTube Player Sẵn sàng!");
                        // Play if game is already active
                        if (this.isBgmPlaying && this.usingYoutube) {
                            this.startBGM(this.currentMode, true);
                        } else if (GameConfig.audio.autoPlayBgm && this.playlist && this.playlist.length > 0) {
                            this.ytPlayer.playVideo(); // Force play
                        } else {
                            this.requestMusicInfoUpdate();
                        }
                    },
                    'onStateChange': (event: any) => {
                        const state = event.data;
                        const YT = (window as any).YT;
                        const isPlaying = state === YT.PlayerState.PLAYING;
                        
                        EventBus.getInstance().publish('MUSIC_STATE_CHANGED', { state: state, playing: isPlaying });
                        
                        // Cập nhật UI ngay lập tức
                        this.requestMusicInfoUpdate();

                        // Bật/tắt thanh Progress UI Timer
                        if (isPlaying) {
                            if (!this.ytUpdateLoop) this.ytUpdateLoop = setInterval(() => this.requestMusicInfoUpdate(), 1000);
                        } else {
                            if (this.ytUpdateLoop && state !== YT.PlayerState.BUFFERING) {
                                clearInterval(this.ytUpdateLoop);
                                this.ytUpdateLoop = null;
                            }
                        }
                        
                        if (state === YT.PlayerState.ENDED) {
                            if (this.playlist.length > 1) {
                                this.next();
                            } else {
                                this.ytPlayer.seekTo(0);
                                this.ytPlayer.playVideo();
                            }
                        }
                    },
                    'onError': (e: any) => {
                        console.log("YouTube Error: ", e.data);
                    }
                }
            });
        };
    }

    private subscribeToEventBus() {
        const events = EventBus.getInstance();

        events.subscribe('GAME_START', (config: { mode: string, speed: number, useYoutube?: boolean }) => {
            this.currentMode = config.mode;
            this.startBGM(config.mode, config.useYoutube);
        });

        events.subscribe('GAME_OVER', () => {
            // Stop WebAudio synthesizer but preserve YouTube for Lobby if intended
            if (this.bgmLoop) clearInterval(this.bgmLoop);
            this.bgmLoop = null;
            
            this.usingYoutube = true;
            if (this.isBgmPlaying && this.ytReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
                this.ytPlayer.playVideo();
            } else if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
                this.ytPlayer.pauseVideo();
            }
        });

        events.subscribe('GAME_PAUSED', () => {
            if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
                this.wasPlayingBeforePause = this.ytPlayer.getPlayerState() === (window as any).YT.PlayerState.PLAYING;
                this.ytPlayer.pauseVideo();
            }
        });

        events.subscribe('GAME_RESUMED', () => {
            if (this.wasPlayingBeforePause && this.ytReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
                this.ytPlayer.playVideo();
            }
        });

        events.subscribe('TYPO', () => {
            this.playErrorSFX();
        });

        events.subscribe('ENEMY_KILLED', (data: any) => {
            this.playKillSFX();
            if (data && data.enemy && data.enemy.word) {
                const isStudy = (data.enemy.mode === 'study' || data.enemy.mode === 'kanji' || data.enemy.mode === 'grammar');
                let skipExample = isStudy && (data.enemy.study.wave === 3 || data.enemy.study.wave === 5);
                this.playTTS(data.enemy.word, skipExample);
            }
        });

        events.subscribe('ENEMY_DEFEATED', (enemy: any) => {
            if (enemy && enemy.word) {
                const isStudy = (enemy.mode === 'study' || enemy.mode === 'kanji' || enemy.mode === 'grammar');
                let skipExample = isStudy && (enemy.study.wave === 3 || enemy.study.wave === 5);
                this.playTTS(enemy.word, skipExample, () => {
                    EventBus.getInstance().publish('AUDIO_TTS_ENDED', enemy);
                });
            }
        });

        events.subscribe('REPLAY_TTS', (word: any) => {
            if (word) {
                this.playTTS(word, false);
            }
        });

        // Chỉ phát âm thanh type khi có ký tự ĐÚNG được khớp. 
        // Phải đảm bảo không spam quá đà.
        events.subscribe('TARGET_LOCKED', () => {
            this.playTypeSFX();
        });

        // Summary SFX
        events.subscribe('AUDIO_BEEP', () => this.playBeepSFX());
        events.subscribe('AUDIO_SLAM', () => this.playSlamSFX());
        
        events.subscribe('PLAY_DING', () => this.playDingSFX());
        events.subscribe('PLAY_GLITCH', () => this.playGlitchSFX());
        events.subscribe('PLAY_HOVER', () => this.playHoverSFX());

        // Âm lượng hệ thống
        events.subscribe('MUSIC_VOL', (mult: number) => {
            this.bgmVolMultiplier = mult;
            this.setVolume(GameConfig.audio.defaultBgmVolume * mult);
        });
        events.subscribe('TTS_VOL_CHANGED', (mult: number) => {
            this.ttsVolMultiplier = mult;
        });
        events.subscribe('TTS_RATE_CHANGED', (rate: number) => {
            this.ttsRate = rate;
        });
        events.subscribe('SFX_VOL_CHANGED', (mult: number) => {
            this.sfxVolMultiplier = mult;
            if (this.audioCtx.state !== 'closed') {
                this.masterSfxGain.gain.setValueAtTime(GameConfig.audio.defaultSfxVolume * this.sfxVolMultiplier, this.audioCtx.currentTime);
            }
        });

        events.subscribe('DUCKING_TOGGLE_CHANGED', (enabled: boolean) => {
            this.duckingEnabled = enabled;
        });

        // Lắng nghe lệnh từ UI
        events.subscribe('MUSIC_TOGGLE', () => this.togglePlay());
        events.subscribe('MUSIC_NEXT', () => this.next());
        events.subscribe('MUSIC_PREV', () => this.prev());
        events.subscribe('MUSIC_PLAYLIST_UPDATE', (customUrls: any[]) => {
            this.playlist = customUrls.map(obj => this.extractYTID(obj.url)).filter(id => id) as string[];
            // Do not auto-play here to avoid double-load race conditions. 
            // `startBGM` or `MUSIC_PLAY_INDEX` handles starting the playback.
        });

        events.subscribe('MUSIC_PLAY_INDEX', (index: number) => {
            if (index >= 0 && index < this.playlist.length) {
                this.currentIndex = index;
                if (this.ytReady && this.ytPlayer) {
                    if (this.isBgmPlaying) {
                        this.ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
                    } else {
                        // Nếu game chưa bắt đầu, chỉ load sẵn vào chờ
                        if (typeof this.ytPlayer.cueVideoById === 'function') {
                            this.ytPlayer.cueVideoById({'videoId': this.playlist[this.currentIndex]});
                        }
                    }
                }
            }
        });

        // Bỏ qua global window keydown nếu không cần thiết
    }

    private extractYTID(url: string | null): string | null {
        if (!url || typeof url !== 'string') return null;
        let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|shorts\/)([^"&?\/\s]{11})/i);
        if (match && match[1]) return match[1];
        if (url.length === 11) return url;
        return null;
    }

    // Gửi thông tin Progress real-time về UI
    public requestMusicInfoUpdate() {
        if (this.ytReady && this.ytPlayer && typeof this.ytPlayer.getCurrentTime === 'function') {
            try {
                const cur = this.ytPlayer.getCurrentTime() || 0;
                const dur = this.ytPlayer.getDuration() || 0;
                const progress = dur > 0 ? (cur / dur) * 100 : 0;
                const data = typeof this.ytPlayer.getVideoData === 'function' ? this.ytPlayer.getVideoData() : null;
                const title = (data && data.title) ? data.title : "Ready to play...";
                const state = this.ytPlayer.getPlayerState();
                const playing = state === (window as any).YT.PlayerState.PLAYING;
                
                EventBus.getInstance().publish('MUSIC_INFO_UPDATED', { title, progress, playing });
            } catch(e) {
                console.warn("YouTube Player data not fully ready yet.", e);
            }
        }
    }

    private startBGM(mode: string, useYoutube: boolean = false) {
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        this.stopBGM();
        this.isBgmPlaying = true;
        this.usingYoutube = useYoutube || mode === 'chill' || mode === 'easy';

        if (this.usingYoutube) {
            if (this.ytPlayer && this.ytReady) {
                this.ytPlayer.unMute();
                this.ytPlayer.setVolume(Math.min(100, GameConfig.audio.defaultBgmVolume * this.bgmVolMultiplier));
                
                // Mặc định nạp nhạc 1 bài vào list nếu đang rỗng
                if (this.playlist.length === 0) {
                    this.playlist = ['HSOtku1j600']; 
                }

                if (this.playlist.length > 0) {
                    this.currentIndex = 0;
                    this.ytPlayer.loadVideoById({'videoId': this.playlist[0]});
                } else {
                    this.ytPlayer.playVideo();
                }
            } else {
                console.warn("YouTube chưa ready, sẽ chờ event onReady.");
            }
            return;
        }

        // Web Audio Synthesizer cho Heavy/Medium
        let notes = [110, 110, 220, 110, 146.83, 164.81]; 
        let speed = 150; 
        let step = 0;

        this.bgmLoop = setInterval(() => {
            if (!this.isBgmPlaying) return;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(notes[step % notes.length], this.audioCtx.currentTime);
            
            let vol = 0.04;
            gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (speed/1000) * 0.9);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + (speed/1000));
            
            // Drum kick (Bass)
            if (step % 4 === 0) {
                const kick = this.audioCtx.createOscillator();
                const kickGain = this.audioCtx.createGain();
                kick.connect(kickGain);
                kickGain.connect(this.audioCtx.destination);
                
                kick.frequency.setValueAtTime(150, this.audioCtx.currentTime);
                kick.frequency.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
                kickGain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                kickGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
                
                kick.start();
                kick.stop(this.audioCtx.currentTime + 0.1);
            }
            step++;
        }, speed);
    }

    private stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmLoop) clearInterval(this.bgmLoop);
        this.bgmLoop = null;
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            this.ytPlayer.pauseVideo();
        }
    }

    public togglePlay() {
        if (!this.ytReady || !this.ytPlayer) return;
        let state = this.ytPlayer.getPlayerState();
        if (state === (window as any).YT.PlayerState.PLAYING) {
            this.ytPlayer.pauseVideo();
            this.isBgmPlaying = false;
        } else {
            // Đảm bảo YouTube được coi như BGM
            this.usingYoutube = true;
            this.isBgmPlaying = true;
            if (this.playlist.length === 0) {
               this.playlist = ['HSOtku1j600'];
               this.currentIndex = 0;
               this.ytPlayer.loadVideoById({'videoId': this.playlist[0]});
            } else {
               this.ytPlayer.playVideo();
            }
        }
    }

    public next() {
        if (!this.ytReady || !this.ytPlayer || this.playlist.length === 0) return;
        this.currentIndex++;
        if (this.currentIndex >= this.playlist.length) this.currentIndex = 0;
        if (this.isBgmPlaying) {
             this.ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
        } else {
             this.ytPlayer.cueVideoById({'videoId': this.playlist[this.currentIndex]});
        }
    }

    public prev() {
        if (!this.ytReady || !this.ytPlayer || this.playlist.length === 0) return;
        this.currentIndex--;
        if (this.currentIndex < 0) this.currentIndex = this.playlist.length - 1;
        if (this.isBgmPlaying) {
             this.ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
        } else {
             this.ytPlayer.cueVideoById({'videoId': this.playlist[this.currentIndex]});
        }
    }

    public setVolume(vol: number) {
        if (this.ytReady && this.ytPlayer) {
            this.ytPlayer.setVolume(Math.min(100, vol));
        }
    }

    public playTypeSFX() {
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
                .then(() => this._playTypeSFX())
                .catch(() => {});
        } else {
            this._playTypeSFX();
        }
    }

    private _playTypeSFX() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
    }

    public playErrorSFX() {
        if(this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
                .then(() => this._playErrorSFX())
                .catch(() => {});
        } else {
            this._playErrorSFX();
        }
    }

    private _playErrorSFX() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    public playKillSFX() {
        if(this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
    }

    public playBeepSFX() {
        if(this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
    }
    
    public playSlamSFX() {
        if(this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.6);
    }

    public playGlitchSFX() {
        if(this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
                .then(() => this._playGlitchSFX())
                .catch(() => {});
        } else {
            this._playGlitchSFX();
        }
    }

    private _playGlitchSFX() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        // Tạo tiếng rẹt rẹt / rớt kết nối Data
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(600, this.audioCtx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(50, this.audioCtx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime); // Âm lượng nhỏ
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
    }
    
    public playDingSFX() {
        if(this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
                .then(() => this._playDingSFX())
                .catch(() => {});
        } else {
            this._playDingSFX();
        }
    }

    private _playDingSFX() {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // Pitch A5
        osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.05); // Trượt lên cao tí
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8); // Kéo dài ngân ra
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.8);
    }
    
    public playHoverSFX() {
        if(this.audioCtx.state === 'suspended') {
            this.audioCtx.resume()
                .then(() => this._playHoverSFX())
                .catch(() => {});
        } else {
            this._playHoverSFX();
        }
    }

    private _playHoverSFX() {
        // "Click click click" -> Âm tick ngắn
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.masterSfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.02);
        
        gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.03);
    }
    
    public playTTS(word: any, skipExample: boolean = false, onComplete?: () => void) {
        if (!('speechSynthesis' in window)) {
            if (onComplete) onComplete();
            return;
        }
        
        window.speechSynthesis.cancel();

        let mainText = word.visual || word.kanji || word.romaji;
        let exampleText = word.example_jp || "";
        // Xử lý loại bỏ các syntax dành cho UI/Logic để voice đọc chuẩn xác
        exampleText = exampleText.replace(/\{([^|]+)\|([^}]+)\}/g, '$1'); // Chuyển {kanji|kana} -> kanji
        exampleText = exampleText.replace(/\[|\]/g, ''); // Loại bỏ ngoặc vuông xác định cụm ngữ pháp
        exampleText = exampleText.replace(/<rp>.*?<\/rp>/g, ''); // Lọc <rp>HTML
        exampleText = exampleText.replace(/<rt>.*?<\/rt>/g, ''); // Bỏ kana trong thẻ HTML ruby, chỉ đọc kanji gốc cho tự nhiên
        exampleText = exampleText.replace(/<[^>]+>/g, ''); // Chống đọc tên thẻ HTML nếu còn sót

        // Duck volume
        if (this.duckingEnabled && this.ytPlayer && this.ytReady && this.usingYoutube) {
            this.ytPlayer.setVolume(Math.min(100, GameConfig.audio.bgmDuckVolume * this.bgmVolMultiplier));
        }

        const restoreBGM = () => {
            if (this.ytPlayer && this.ytReady && this.usingYoutube) {
                this.ytPlayer.setVolume(Math.min(100, GameConfig.audio.defaultBgmVolume * this.bgmVolMultiplier));
            }
            if (onComplete) onComplete();
        };

        const createUtterance = (text: string, isLast: boolean) => {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'ja-JP';
            utter.rate = this.ttsRate;
            utter.volume = (GameConfig.audio.defaultVocalsVolume || 0.8) * this.ttsVolMultiplier; 
            
            // Lưu reference để tránh GC làm chết tiếng giữa chừng
            this.activeUtterances.add(utter);

            const cleanup = () => {
                this.activeUtterances.delete(utter);
                if (isLast) restoreBGM();
            };

            utter.onend = cleanup;
            utter.onerror = cleanup;
            return utter;
        };

        if (!mainText.trim()) {
            restoreBGM();
            return;
        }

        if (!skipExample && exampleText.trim()) {
            window.speechSynthesis.speak(createUtterance(mainText, false));
            window.speechSynthesis.speak(createUtterance(exampleText, true));
        } else {
            window.speechSynthesis.speak(createUtterance(mainText, true));
        }
    }
}
