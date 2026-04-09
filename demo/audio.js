// Audio Synthesizer Engine (Cyberpunk / Retro Style)
// Tự generate ra nhạc và Sound FX bằng Web Audio API - Không cần load Mp3!
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// --- SETUP YOUTUBE LOFI BGM API DYNAMICALLY ---
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
if(firstScriptTag) firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
else document.head.appendChild(tag);

let ytPlayer = null;
let ytReady = false;

window.onYouTubeIframeAPIReady = function() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '200',
        host: 'https://www.youtube.com', // Bắt buộc cho chạy Local file://
        videoId: 'HSOtku1j600', // Bản nhạc Chill mặc định thiết lập sẵn
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0,
            'loop': 0 // Bắt buộc là 0 để nảy sinh event ENDED chuyển bài
        },
        events: {
            'onReady': function(event) {
                ytReady = true;
                event.target.setVolume(50); // Set volume
                console.log("YouTube Player Sẵn sàng!");
            },
            'onStateChange': function(event) {
                if (event.data === YT.PlayerState.ENDED) {
                    if (BGM.playlist && BGM.playlist.length > 1) { // Có nhiều hơn 1 bài thì Auto-Next
                        BGM.currentIndex++;
                        if (BGM.currentIndex >= BGM.playlist.length) BGM.currentIndex = 0; // Quay vòng lại đầu
                        ytPlayer.loadVideoById({'videoId': BGM.playlist[BGM.currentIndex]});
                    } else if (BGM.playlist && BGM.playlist.length === 1) { // 1 bài thì tự Seek lại lặp vòng
                        ytPlayer.seekTo(0);
                        ytPlayer.playVideo();
                    }
                }
            },
            'onError': function(e) {
                console.log("YouTube Error: ", e.data);
            }
        }
    });
}

function extractYTID(url) {
    if (!url || typeof url !== 'string') return null;
    let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|shorts\/)([^"&?\/\s]{11})/i);
    if (match && match[1]) return match[1];
    if (url.length === 11) return url;
    return null;
}


const SFX = {
    type() {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Tiếng gõ Bíp (Sáng, cao) báo hiệu gõ đúng chữ
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    },
    
    error() {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Tiếng rè rền (Sawtooth) báo hiệu gõ rác/sai
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    },
    
    kill() {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        // Tiếng chém/nổ ngắn
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
};

const BGM = {
    loop: null,
    isPlaying: false,
    start(mode, customUrl = "") {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        this.stop();
        this.isPlaying = true;

        if (mode === 'chill') {
            if (ytPlayer && ytReady) {
                ytPlayer.unMute(); // Ép mở âm lượng (phòng hờ trình duyệt tắt ngầm)
                ytPlayer.setVolume(70);
                
                if (Array.isArray(customUrl) && customUrl.length > 0) {
                    // Nếu là custom playlist. Mảng customUrl giờ chứa dạng Object {url: "", title: ""}
                    this.playlist = customUrl.map(obj => extractYTID(obj.url)).filter(id => id);
                    if (this.playlist.length > 0) {
                        this.currentIndex = 0;
                        ytPlayer.loadVideoById({'videoId': this.playlist[0]});
                    } else {
                        ytPlayer.playVideo(); // Vẫn lỗi thì hát lofi
                    }
                } else {
                    let vid = extractYTID(customUrl); // Mặc đinh 1 bài
                    if (vid) {
                        this.playlist = [vid];
                        this.currentIndex = 0;
                        ytPlayer.loadVideoById({'videoId': vid}); // Play 1 bài nhưng tự bắt loop onStateChange
                    } else {
                        ytPlayer.playVideo(); // Phát bài Lofi gốc
                    }
                }
            } else {
                console.warn("YouTube chưa load được hoặc bị chặn!");
                alert("NINJA SYSTEM BÁO LỖI: Nhạc YouTube chưa tải xong hoặc đang bị trình duyệt CHẶN do bạn đang chạy bằng đường dẫn file:/// (Local file) thay vì HTTP server.\n\nCách 1: Chờ 2-3 giây rồi ấn Start lại.\nCách 2: Mở game bằng Live Server trên VSCode (http://127.0.0.1:5500) để xài được YouTube!");
            }
            return;
        } else {
            // Dừng nhạc lo-fi nếu chuyển mode
            if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
                ytPlayer.pauseVideo();
            }
        }

        let notes = [];
        let speed = 200; 
        
        // Cyberpunk Intense Driving Bass (Sôi động, dập Bass)
        notes = [110, 110, 220, 110, 146.83, 164.81]; 
        speed = 150; 

        let step = 0;
        this.loop = setInterval(() => {
            if(!this.isPlaying) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            // Chill dùng Sine mượt, Nhộn nhịp dùng Sawtooth sắc bén
            osc.type = mode === 'chill' ? 'sine' : 'sawtooth';
            osc.frequency.setValueAtTime(notes[step % notes.length], audioCtx.currentTime);
            
            let vol = mode === 'chill' ? 0.05 : 0.04;
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (speed/1000) * 0.9);
            
            osc.start();
            osc.stop(audioCtx.currentTime + (speed/1000));
            
            // Thêm Drum kick điệp khúc Bass cho mode sôi động
            if (mode !== 'chill' && step % 4 === 0) {
                const kick = audioCtx.createOscillator();
                const kickGain = audioCtx.createGain();
                kick.connect(kickGain);
                kickGain.connect(audioCtx.destination);
                
                kick.frequency.setValueAtTime(150, audioCtx.currentTime);
                kick.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                kickGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                kickGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                
                kick.start();
                kick.stop(audioCtx.currentTime + 0.1);
            }
            
            step++;
        }, speed);
    },
    stop() {
        this.isPlaying = false;
        if(this.loop) clearInterval(this.loop);
        if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            ytPlayer.pauseVideo();
        }
    },
    togglePlay() {
        if (!ytReady || !ytPlayer) return false;
        let state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            ytPlayer.pauseVideo();
            return false;
        } else {
            ytPlayer.playVideo();
            return true;
        }
    },
    next() {
        if (!ytReady || !ytPlayer || !this.playlist || this.playlist.length === 0) return;
        this.currentIndex++;
        if (this.currentIndex >= this.playlist.length) this.currentIndex = 0;
        ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
    },
    prev() {
        if (!ytReady || !ytPlayer || !this.playlist || this.playlist.length === 0) return;
        this.currentIndex--;
        if (this.currentIndex < 0) this.currentIndex = this.playlist.length - 1;
        ytPlayer.loadVideoById({'videoId': this.playlist[this.currentIndex]});
    },
    setVolume(vol) {
        if (ytReady && ytPlayer) {
            ytPlayer.setVolume(vol);
        }
    },
    getProgress() {
        if (this.isPlaying && ytReady && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
            let cur = ytPlayer.getCurrentTime();
            let dur = ytPlayer.getDuration();
            if (dur > 0) return (cur / dur) * 100;
        }
        return 0;
    },
    getPlayingIndex() {
        return this.currentIndex || 0;
    }
};