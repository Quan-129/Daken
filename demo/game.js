const GAME_STATE = {
    isRunning: false,
    mode: 'medium', 
    score: 0,
    hp: 5,
    combo: 0,
    multiplier: 1,
    coins: 0,
    speedModifier: 1.0,
    inputBuffer: "",
    maxBufferLength: 20
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');

const elScore = document.getElementById('scoreVal');
const elMultiplier = document.getElementById('multiplierVal');
const elHp = document.getElementById('hpVal');
const elBufferTrash = document.getElementById('bufferTrash');
const elBufferTyped = document.getElementById('bufferTyped');
const elBufferContainer = document.getElementById('input-buffer-display');

const elStartBtn = document.getElementById('startBtn');
const elModeSelect = document.getElementById('modeSelect');
const elSpeedSlider = document.getElementById('speedSlider');
const elSpeedDisplay = document.getElementById('speedDisplay');

const msgCenter = document.getElementById('messageCenter');
const msgTitle = document.getElementById('msgTitle');
const msgSub = document.getElementById('msgSub');

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let enemies = [];

class Enemy {
    constructor(wordObj, mode, speedMod) {
        this.word = wordObj;
        this.y = Math.random() * (canvas.height - 300) + 150;
        this.baseSpeed = (Math.random() * 0.1 + 0.1); // Giảm đi 5 lần theo yêu cầu (Từ 0.5 - 1.0 xuống còn 0.1 - 0.2)
        this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
        this.isDead = false;
        
        // 1 chiều 1 phương. Lúc nào cũng di chuyển ngang (hoặc đứng nhìn).
        this.vy = 0; 

        if (mode === 'easy') {
            this.x = Math.random() * (canvas.width - 300) + 200;
            this.vx = 0;
        } else if (mode === 'chill') {
            this.x = canvas.width + Math.random() * 200;
            this.vx = -this.baseSpeed * speedMod; // chạy sang trái
        } else {
            this.x = canvas.width + 50; 
            this.vx = -this.baseSpeed * speedMod;
        }
    }

    update() {
        if(this.isDead) return;
        this.x += this.vx;
        
        if (GAME_STATE.mode === 'chill') {
            // Screen Loop thay vì dội ngược để đỡ loạn
            if (this.x < -100) {
                this.x = canvas.width + 100;
                this.y = Math.random() * (canvas.height - 300) + 150; // đổi làn ngẫu nhiên
            }
        } 
        else if (GAME_STATE.mode !== 'easy' && this.x < 150) { // Vượt qua mốc Deadline x=150
            this.isDead = true;
            takeDamage();
        }
    }

    draw(ctx) {
        if(this.isDead) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Drone/Fish Body (Pill Shape)
        ctx.fillStyle = "rgba(10, 20, 40, 0.9)";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-65, -35, 130, 70, 35);
        ctx.fill();
        ctx.stroke();
        
        // Engine tail
        ctx.beginPath();
        if (GAME_STATE.mode === 'easy') {
            // Không vẽ đuôi lửa
        } else {
            // Đuôi ở bên phải (chạy sang trái)
            ctx.moveTo(65, -20);
            ctx.lineTo(95, 0);
            ctx.lineTo(65, 20);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 26px 'Noto Sans JP'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.word.visual, 0, -10);
        
        ctx.fillStyle = this.color; 
        ctx.font = "bold 16px 'Inter'";
        ctx.fillText(this.word.romaji, 0, 20);
        ctx.restore();
    }
}

let lastTime = 0;
let spawnTimer = 0;

function gameLoop(timestamp) {
    if (!GAME_STATE.isRunning) return;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(GAME_STATE.mode !== 'chill' && GAME_STATE.mode !== 'easy') {
        spawnTimer += dt;
        let spawnThreshold = Math.max(2000, 4000 / Math.max(1, GAME_STATE.speedModifier));
        if (spawnTimer > spawnThreshold) {
            spawnEnemy();
            spawnTimer = 0;
        }
    }

    // --- DRAW ENVIRONMENT (DEADLINE + NINJA) --- 
    if (GAME_STATE.mode !== 'chill' && GAME_STATE.mode !== 'easy') {
        // Vẽ Red Neon Deadline 
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(150, canvas.height);
        ctx.strokeStyle = "rgba(255, 0, 110, 0.6)"; 
        ctx.lineWidth = 2;
        ctx.shadowColor = "#FF006E";
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Bệ đứng Target
        ctx.fillStyle = "rgba(255, 0, 110, 0.2)";
        ctx.fillRect(145, 0, 10, canvas.height); 
        ctx.restore();
    }

    // Vẽ Nhân Vật (Ninja / Câu Cá)
    ctx.save();
    ctx.font = "80px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let floatY = Math.sin(timestamp / 500) * 10; // Floating animation nhẹ
    
    if (GAME_STATE.mode === 'chill') {
        ctx.fillText("🎣", 100, canvas.height/2 + floatY); // Cần câu
    } else {
        ctx.fillText("🥷", 80, canvas.height/2 + floatY); // Ninja gốc
    }
    ctx.restore();

    // --- ENEMY LOOP ---
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].draw(ctx);
        if (enemies[i].isDead) {
            enemies.splice(i, 1);
        }
    }
    requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
    if (enemies.length >= 20) return;
    
    // Tìm các từ chưa có trên màn hình để tránh việc bị sinh trùng (duplicate)
    const activeWords = enemies.map(e => e.word.romaji);
    const availableWords = mockVocabulary.filter(w => !activeWords.includes(w.romaji));
    
    let selectedWord;
    if (availableWords.length > 0) {
        selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    } else {
        selectedWord = mockVocabulary[Math.floor(Math.random() * mockVocabulary.length)];
    }
    
    const enemy = new Enemy(selectedWord, GAME_STATE.mode, GAME_STATE.speedModifier);
    enemies.push(enemy);
}

function spawnWave() {
    enemies = [];
    for(let i=0; i<8; i++){
        spawnEnemy();
    }
}

function takeDamage() {
    if (GAME_STATE.mode === 'chill') return;
    GAME_STATE.hp--;
    updateUI();
    uiLayer.classList.remove('shake');
    void uiLayer.offsetWidth;
    uiLayer.classList.add('shake');
    
    if (GAME_STATE.hp <= 0 || GAME_STATE.mode === 'hard') {
        gameOver();
    }
}

function getLongestPrefix(bufferStr) {
    if (!bufferStr) return "";
    let longest = "";
    for (let i = 0; i < bufferStr.length; i++) {
        let suffix = bufferStr.substring(i);
        let ok = enemies.some(e => !e.isDead && e.word.romaji.toLowerCase().startsWith(suffix));
        if (ok && suffix.length > longest.length) longest = suffix;
    }
    return longest;
}

function updateUI() {
    elScore.innerText = Math.floor(GAME_STATE.score);
    elMultiplier.innerText = `x${GAME_STATE.multiplier}`;
    elHp.innerText = GAME_STATE.hp;
    
    if(GAME_STATE.combo >= 20) GAME_STATE.multiplier = 5;
    else if (GAME_STATE.combo >= 10) GAME_STATE.multiplier = 3;
    else if (GAME_STATE.combo >= 4) GAME_STATE.multiplier = 2;
    else GAME_STATE.multiplier = 1;

    // --- LOGIC TRASH vs TYPED HIGHLIGHT ---
    let typedPart = "";
    let trashPart = GAME_STATE.inputBuffer;
    
    if (GAME_STATE.inputBuffer.length > 0) {
        let longestPrefixMatch = getLongestPrefix(GAME_STATE.inputBuffer);
        
        if (longestPrefixMatch) {
            typedPart = longestPrefixMatch;
            trashPart = GAME_STATE.inputBuffer.substring(0, GAME_STATE.inputBuffer.length - longestPrefixMatch.length);
        }
    }
        
    elBufferTrash.innerText = trashPart;
    elBufferTyped.innerText = typedPart ? `**${typedPart}` : "";
    if(typedPart) {
        elBufferContainer.style.borderColor = "var(--safe)";
        elBufferContainer.style.boxShadow = "0 0 15px rgba(0,245,255,0.4), inset 0 0 15px rgba(0,230,118,0.4)";
    } else {
        elBufferContainer.style.borderColor = "var(--primary)";
        elBufferContainer.style.boxShadow = "0 0 15px rgba(0,245,255,0.4), inset 0 0 15px rgba(0,245,255,0.2)";
    }
}

function gameOver() {
    GAME_STATE.isRunning = false;
    BGM.stop(); // Tắt nhạc khi thua
    uiLayer.classList.replace('shake', 'flicker'); 
    msgTitle.innerText = "GAME OVER";
    msgTitle.style.color = "var(--danger)";
    msgTitle.style.textShadow = "0 0 20px var(--danger)";
    msgSub.innerText = `Điểm cuối cùng: ${Math.floor(GAME_STATE.score)}`;
    msgCenter.classList.remove('hidden');
}

function startGame() {
    GAME_STATE.isRunning = true;
    GAME_STATE.score = 0;
    GAME_STATE.combo = 0;
    GAME_STATE.multiplier = 1;
    GAME_STATE.coins = 0;
    GAME_STATE.inputBuffer = "";
    GAME_STATE.mode = elModeSelect.value;
    
    if(GAME_STATE.mode === 'hard') GAME_STATE.hp = 1;
    else GAME_STATE.hp = 5;
    
    GAME_STATE.speedModifier = parseFloat(elSpeedSlider.value);
    
    enemies = [];
    msgCenter.classList.add('hidden');
    msgTitle.style.color = "var(--primary)";
    uiLayer.classList.remove('shake', 'flicker');
    
    updateUI();
    
    if (GAME_STATE.mode === 'easy' || GAME_STATE.mode === 'chill') {
        spawnWave();
    }
    
    // Khởi động nhạc nền BGM dập theo Mode
    let chosenYtUrl = "";
    if (GAME_STATE.mode === 'chill') {
        const bgmSource = document.getElementById('bgmSource');
        if (bgmSource && bgmSource.value === 'custom') {
            let activeFolder = myLibrary.find(f => f.id === activeFolderId);
            chosenYtUrl = (activeFolder && activeFolder.songs.length > 0) ? activeFolder.songs : "";
        } else {
            chosenYtUrl = bgmSource ? bgmSource.value : 'HSOtku1j600';
        }
    }
    
    BGM.start(GAME_STATE.mode, chosenYtUrl);
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function playTTS(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        window.speechSynthesis.speak(utterance);
    }
}

function processInput(key) {
    if (!GAME_STATE.isRunning) return;
    if (key === 'Escape' || key === 'Backspace') {
        GAME_STATE.inputBuffer = "";
        updateUI();
        return;
    }
    
    // Chỉ nhận ký tự chữ cái, bỏ qua lỡ bấm Space hay phím linh tinh
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
        let oldPrefixLen = getLongestPrefix(GAME_STATE.inputBuffer).length;
        
        GAME_STATE.inputBuffer += key.toLowerCase();
        if (GAME_STATE.inputBuffer.length > GAME_STATE.maxBufferLength) {
            GAME_STATE.inputBuffer = GAME_STATE.inputBuffer.substring(1);
        }
        
        let killed = checkElimination();
        let newPrefixLen = getLongestPrefix(GAME_STATE.inputBuffer).length;
        
        if (killed) {
            SFX.kill(); // Gõ dứt điểm tiêu diệt quái!
        } else {
            // Nếu từ gõ đúng hướng tới 1 Romaji Prefix, độ dài phần Neon sẽ dài hơn màn trước
            if (newPrefixLen > oldPrefixLen) {
                SFX.type(); // Sáng đúng
            } else {
                SFX.error(); // Bấm rác
            }
        }
        
        updateUI();
    }
}

function checkElimination() {
    let matches = [];
    for (let enemy of enemies) {
        if (!enemy.isDead && GAME_STATE.inputBuffer.endsWith(enemy.word.romaji.toLowerCase())) {
            matches.push(enemy);
        }
    }
    
    if (matches.length > 0) {
        // Ưu tiên 1: Chữ ngắn nhất. Ưu tiên 2: Con nào ở gần vạch đích nhất (x nhỏ nhất)
        matches.sort((a, b) => {
            if (a.word.romaji.length !== b.word.romaji.length) {
                return a.word.romaji.length - b.word.romaji.length;
            }
            return a.x - b.x;
        });
        
        let target = matches[0];
        target.isDead = true;
        
        let baseScore = target.word.romaji.length * 10;
        GAME_STATE.score += baseScore * GAME_STATE.multiplier * GAME_STATE.speedModifier;
        GAME_STATE.combo++;
        
        GAME_STATE.coins++;
        document.getElementById('coinVal').innerText = GAME_STATE.coins;
        
        playTTS(target.word.visual); 
        
        // Reset Buffer
        GAME_STATE.inputBuffer = "";
        return true;
    }
    return false;
}

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
    }
    // Không xử lý gõ từ vựng nếu user đang ở trong thẻ input hoặc dropdown
    if (document.activeElement !== elSpeedSlider && 
        document.activeElement !== elModeSelect && 
        document.activeElement.id !== 'newSongUrl' && 
        document.activeElement.id !== 'newFolderName') {
         processInput(e.key);
    }
});

elStartBtn.addEventListener('click', () => {
    startGame();
    elStartBtn.blur(); 
});

elModeSelect.addEventListener('change', () => {
    if(elModeSelect.value === 'easy' || elModeSelect.value === 'chill') {
        elSpeedSlider.parentElement.style.opacity = '0.5';
    } else {
        elSpeedSlider.parentElement.style.opacity = '1';
    }
    
    const bgmSource = document.getElementById('bgmSource');
    const playlistBtn = document.getElementById('playlistBtn');
    
    if (elModeSelect.value === 'chill') {
        if(bgmSource) bgmSource.style.display = 'block';
        if(playlistBtn) playlistBtn.style.display = bgmSource.value === 'custom' ? 'block' : 'none';
        renderMainHUDPlaylist();
    } else {
        if(bgmSource) bgmSource.style.display = 'none';
        if(playlistBtn) playlistBtn.style.display = 'none';
        const elMainPlaylistHud = document.getElementById('main-playlist-hud');
        if (elMainPlaylistHud) elMainPlaylistHud.classList.add('hidden');
    }
});

const bgmSource = document.getElementById('bgmSource');
if(bgmSource) {
    bgmSource.addEventListener('change', () => {
        const playlistBtn = document.getElementById('playlistBtn');
        if(playlistBtn) {
            playlistBtn.style.display = bgmSource.value === 'custom' ? 'block' : 'none';
        }
        if (bgmSource.value === 'custom') {
            renderMainHUDPlaylist();
        } else {
            const elMainPlaylistHud = document.getElementById('main-playlist-hud');
            if (elMainPlaylistHud) elMainPlaylistHud.classList.add('hidden');
        }
    });
}

// LOGIC MODAL PLAYLIST (FOLDERS & SONGS)
const elPlaylistBtn = document.getElementById('playlistBtn');
const elPlaylistModal = document.getElementById('playlist-modal');

// Views
const elFolderView = document.getElementById('folder-view');
const elSongView = document.getElementById('song-view');

// Folder Elements
const elFolderList = document.getElementById('folderList');
const elNewFolderName = document.getElementById('newFolderName');
const elAddFolderBtn = document.getElementById('addFolderBtn');
const elCloseFolderBtn = document.getElementById('closeFolderBtn');

// Song Elements
const elCurrentFolderName = document.getElementById('currentFolderName');
const elPlaylistList = document.getElementById('playlistList');
const elNewSongUrl = document.getElementById('newSongUrl');
const elAddSongBtn = document.getElementById('addSongBtn');
const elBackToFoldersBtn = document.getElementById('backToFoldersBtn');

let viewingFolderId = null;

// RENDER THƯ MỤC
let progressLoop = null;

const elMainPlaylistHud = document.getElementById('main-playlist-hud');

function renderLibrary() {
    elFolderList.innerHTML = "";
    myLibrary.forEach(folder => {
        let li = document.createElement('li');
        let isPlaying = folder.id === activeFolderId;
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
            activeFolderId = folder.id; 
            renderLibrary(); 
            // Thoát modal và xổ My Playlist ra màn hình chính
            elPlaylistModal.classList.add('hidden');
            renderMainHUDPlaylist();
        };
        
        let btnOpen = document.createElement('button'); 
        btnOpen.innerText = "Mở"; 
        btnOpen.className = "open-btn";
        btnOpen.onclick = () => { openFolder(folder.id); };
        
        let btnEdit = document.createElement('button'); 
        btnEdit.innerText = "✎"; 
        btnEdit.title = "Đổi tên Folder";
        btnEdit.onclick = () => { 
            let newName = prompt("Nhập tên mới cho Folder:", folder.name);
            if (newName && newName.trim() !== "") {
                folder.name = newName.trim();
                renderLibrary();
                renderMainHUDPlaylist();
            }
        };
        
        let btnRm = document.createElement('button'); 
        btnRm.innerText = "✖"; 
        btnRm.onclick = () => { 
            if(myLibrary.length > 1) {
                myLibrary = myLibrary.filter(f => f.id !== folder.id);
                if(activeFolderId === folder.id) activeFolderId = myLibrary[0].id;
                renderLibrary();
                renderMainHUDPlaylist();
            } else {
                alert("Phải giữ lại ít nhất 1 Folder!");
            }
        };
        
        acts.appendChild(btnPlay); acts.appendChild(btnOpen); acts.appendChild(btnEdit); acts.appendChild(btnRm);
        header.appendChild(txt); header.appendChild(acts);
        li.appendChild(header);
        
        elFolderList.appendChild(li);
    });
}

function renderMainHUDPlaylist() {
    if (GAME_STATE.mode !== 'chill') {
        elMainPlaylistHud.classList.add('hidden');
        return;
    }
    
    let folder = myLibrary.find(f => f.id === activeFolderId);
    if (!folder) {
        elMainPlaylistHud.classList.add('hidden');
        return;
    }
    
    elMainPlaylistHud.classList.remove('hidden');
    document.getElementById('hudPlaylistName').innerText = `📁 ${folder.name}`;
    
    let songsDiv = document.getElementById('hudPlaylistSongs');
    songsDiv.innerHTML = "";
    
    if (folder.songs.length === 0) {
        let emptyDiv = document.createElement('div');
        emptyDiv.className = "dropdown-song-item";
        emptyDiv.style.color = "#ff4757";
        emptyDiv.innerText = "Chưa có bài hát nào (Mở ⚙️ để thêm nhạc)";
        songsDiv.appendChild(emptyDiv);
        return;
    }
    
    folder.songs.forEach((song, i) => {
        let songDiv = document.createElement('div');
        songDiv.id = `hud-song-${activeFolderId}-${i}`;
        songDiv.className = "dropdown-song-item";
        songDiv.innerText = `${i+1}. ${song.title || song.url}`;
        
        let progBg = document.createElement('div');
        progBg.className = "song-progress-bg";
        let progFill = document.createElement('div');
        progFill.className = "song-progress-fill";
        progFill.id = `hud-prog-${activeFolderId}-${i}`;
        
        progBg.appendChild(progFill);
        songDiv.appendChild(progBg);
        songsDiv.appendChild(songDiv);
    });
}

function startProgressLoop() {
    if(progressLoop) clearInterval(progressLoop);
    progressLoop = setInterval(() => {
        // --- Logic cho HUD Danh sách phát tĩnh (Bên dưới) ---
        if(GAME_STATE.mode === 'chill' && !elMainPlaylistHud.classList.contains('hidden')) {
            document.querySelectorAll('#hudPlaylistSongs .dropdown-song-item').forEach(el => el.classList.remove('playing'));
            document.querySelectorAll('#hudPlaylistSongs .song-progress-fill').forEach(el => el.style.width = '0%');
            
            if(GAME_STATE.isRunning && activeFolderId) {
                let curIdx = BGM.getPlayingIndex();
                let prog = BGM.getProgress(); 
                
                let songDiv = document.getElementById(`hud-song-${activeFolderId}-${curIdx}`);
                let fillDiv = document.getElementById(`hud-prog-${activeFolderId}-${curIdx}`);
                
                if(songDiv && fillDiv) {
                    songDiv.classList.add('playing');
                    fillDiv.style.width = prog + '%';
                }
            }
        }
        
        // --- Logic cho Mini Player Nhỏ Nhỏ Dễ Thương Xinh Xắn (Kế nút Playlist) ---
        const elMiniPlayer = document.getElementById('mini-player');
        if (elMiniPlayer) {
            if (GAME_STATE.isRunning && GAME_STATE.mode === 'chill') {
                elMiniPlayer.classList.remove('hidden');
                let curIdx = BGM.getPlayingIndex();
                let prog = BGM.getProgress();
                let songName = "Lofi Radio";
                const bgmSource = document.getElementById('bgmSource');
                if (bgmSource && bgmSource.value === 'custom') {
                    let folder = myLibrary.find(f => f.id === activeFolderId);
                    if (folder && folder.songs.length > curIdx) {
                        songName = folder.songs[curIdx].title || "Unknown Track";
                    }
                } else if (bgmSource && bgmSource.value === 'HSOtku1j600') {
                    songName = "MONO - Waiting For You (Lofi)";
                }
                
                // Tự động ngắt/mở animation xoay đĩa và nút Play theo trạng thái YouTube
                let ytState = BGM.isPlaying && ytReady && ytPlayer && typeof ytPlayer.getPlayerState === 'function' ? ytPlayer.getPlayerState() : -1;
                let miniDisc = document.getElementById('mini-disc');
                let btnPlay = document.getElementById('mini-play');
                
                if (ytState === YT.PlayerState.PLAYING) {
                    miniDisc.style.animationPlayState = 'running';
                    btnPlay.innerText = "⏸";
                } else {
                    miniDisc.style.animationPlayState = 'paused';
                    btnPlay.innerText = "▶";
                }
                
                document.getElementById('mini-title').innerText = songName;
                document.getElementById('mini-progress-fill').style.width = prog + '%';
            } else {
                elMiniPlayer.classList.add('hidden');
            }
        }
        
    }, 500);
}

function showFolderView() {
    elFolderView.classList.remove('hidden');
    elSongView.classList.add('hidden');
    renderLibrary();
}

// RENDER BÀI HÁT (BÊN TRONG FOLDER)
function openFolder(folderId) {
    viewingFolderId = folderId;
    let folder = myLibrary.find(f => f.id === folderId);
    if(!folder) return;
    
    elCurrentFolderName.innerText = folder.name;
    elFolderView.classList.add('hidden');
    elSongView.classList.remove('hidden');
    renderSongList();
}

function renderSongList() {
    elPlaylistList.innerHTML = "";
    let folder = myLibrary.find(f => f.id === viewingFolderId);
    if(!folder) return;
    
    folder.songs.forEach((item, i) => {
        let li = document.createElement('li');
        let txt = document.createElement('span');
        txt.innerText = `${i+1}. ${item.title || item.url}`;
        txt.title = item.url;
        
        let acts = document.createElement('div');
        acts.className = "song-actions";
        
        let btnUp = document.createElement('button'); btnUp.innerText = "▲"; btnUp.onclick = () => moveSong(i, -1);
        let btnDn = document.createElement('button'); btnDn.innerText = "▼"; btnDn.onclick = () => moveSong(i, 1);
        let btnRm = document.createElement('button'); btnRm.innerText = "✖"; 
        btnRm.onclick = () => { folder.songs.splice(i, 1); renderSongList(); renderLibrary(); };
        
        acts.appendChild(btnUp); acts.appendChild(btnDn); acts.appendChild(btnRm);
        li.appendChild(txt); li.appendChild(acts);
        elPlaylistList.appendChild(li);
    });
}

function moveSong(idx, dir) {
    let folder = myLibrary.find(f => f.id === viewingFolderId);
    if(!folder) return;
    if (idx + dir < 0 || idx + dir >= folder.songs.length) return;
    
    let temp = folder.songs[idx];
    folder.songs[idx] = folder.songs[idx + dir];
    folder.songs[idx + dir] = temp;
    renderSongList();
}

// EVENTS TỔNG HỢP
if(elPlaylistBtn) elPlaylistBtn.addEventListener('click', () => { elPlaylistModal.classList.remove('hidden'); showFolderView(); });
if(elCloseFolderBtn) elCloseFolderBtn.addEventListener('click', () => { elPlaylistModal.classList.add('hidden'); });
if(elBackToFoldersBtn) elBackToFoldersBtn.addEventListener('click', () => { showFolderView(); });

// ADD FOLDER
if(elAddFolderBtn) {
    elAddFolderBtn.addEventListener('click', () => {
        let n = elNewFolderName.value.trim();
        if(n) {
            myLibrary.push({ id: 'f_' + Date.now(), name: n, songs: [] });
            elNewFolderName.value = "";
            renderLibrary();
        }
    });
}

// ADD SONG
if(elAddSongBtn) {
    elAddSongBtn.addEventListener('click', async () => {
        let u = elNewSongUrl.value.trim();
        let folder = myLibrary.find(f => f.id === viewingFolderId);
        if(u && folder) {
            elAddSongBtn.innerText = "Đang lấy...";
            elAddSongBtn.disabled = true;
            let songTitle = u; 
            try {
                let res = await fetch(`https://noembed.com/embed?url=${u}`);
                let data = await res.json();
                if(data && data.title) songTitle = data.title;
            } catch(e) {}
            
            folder.songs.push({ url: u, title: songTitle });
            
            elAddSongBtn.innerText = "Thêm";
            elAddSongBtn.disabled = false;
            elNewSongUrl.value = "";
            renderSongList();
        }
    });
}

elSpeedSlider.addEventListener('input', (e) => {
    elSpeedDisplay.innerText = e.target.value + 'x';
    let newSpeed = parseFloat(e.target.value);
    GAME_STATE.speedModifier = newSpeed;
    
    if(GAME_STATE.isRunning) {
        // Cập nhật ngay lập tức cho các mục tiêu đang có trên màn hình
        enemies.forEach(enemy => {
            if (GAME_STATE.mode !== 'easy') { // Easy thì đứng yên không tính
                enemy.vx = -enemy.baseSpeed * newSpeed;
            }
        });
    }
});

// INITIALIZE TRẠNG THÁI START CHO HUD AUDIO
if (GAME_STATE.mode === 'chill') {
    renderMainHUDPlaylist();
}

// --- SỰ KIỆN CHO MINI PLAYER CONTROLS ---
let ep = document.getElementById('mini-prev'); if(ep) ep.addEventListener('click', () => BGM.prev());
let en = document.getElementById('mini-next'); if(en) en.addEventListener('click', () => BGM.next());
let epl = document.getElementById('mini-play'); if(epl) epl.addEventListener('click', () => {
    if(GAME_STATE.isRunning) BGM.togglePlay();
});
let ev = document.getElementById('mini-vol'); if(ev) ev.addEventListener('input', (e) => {
    BGM.setVolume(parseInt(e.target.value));
});

startProgressLoop();