import { Word } from '../../core/entities/Word';
import { mockVocabulary } from './MockData';
import { EventBus } from '../../core/EventBus';
import { supabase } from './supabase';

export class StateManager {
  private static instance: StateManager;
  private words: Word[] = [];
  private eventBus: EventBus;
  
  private progressKey = 'ninja_study_progress';
  private studyProgress: { weak: string[], mastered: string[] } = { weak: [], mastered: [] };

  private n2ProgressKey = 'ninja_n2_progress';
  private n2Progress: Record<string, {rank: string, acc: number, wpm: number, score?: number}> = {};
  private n2HubData: any[] = [];

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.initializeUserProgress();

    // Lắng nghe sự kiện đăng nhập để đổi "ngăn kéo" dữ liệu ngay lập tức
    this.eventBus.subscribe('PLAYER_PROFILE_LOADED', (profile: any) => {
        if (profile && profile.id) {
            this.initializeUserProgress(profile.id);
        }
    });
  }

  private async initializeUserProgress(userId?: string) {
    if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user.id;
    }

    const suffix = userId ? `_${userId}` : '_guest';
    this.n2ProgressKey = `ninja_n2_progress${suffix}`;
    this.progressKey = `ninja_study_progress${suffix}`;

    console.log(`[StateManager] Switch storage keys to: ${this.n2ProgressKey}`);
    
    this.loadProgress();
    this.loadN2Progress();
    
    // Đồng bộ với Cloud
    this.syncN2ProgressWithCloud();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  public loadData(): void {
    // Tạm thời nạp dữ liệu Mock từ bộ nhớ RAM thay vì gọi Supabase
    this.words = [...mockVocabulary];
    
    // Gửi sự kiện báo hiệu rằng dữ liệu đã nạp xong
    this.eventBus.publish('DATA_LOADED', this.words);
    console.log('[StateManager] Dữ liệu đã được nạp thành công:', this.words.length, 'từ vựng');
  }

  public async loadStudyData(level: string): Promise<void> {
    try {
        const mLevel = level.toUpperCase();
        // Since we are using Vite, fetch will serve correctly from root if mapped, or we can use dynamic import.
        // But dynamic import is safer in Vite for JSON, wait, fetch('/src/data/vocabulary_generated.json') also works.
        const response = await fetch('/data/vocabulary_generated.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        const data = await response.json();
        
        const levelData = data.find((d: any) => d.level === mLevel);
        if (levelData && levelData.unit_list) {
            const parsedWords: Word[] = [];
            for (const unit of levelData.unit_list) {
                // Filter 15 vocab/unit or all inside the JSON
                for (const v of unit.vocabulary_list as any[]) {
                    parsedWords.push({
                        visual: v.visual || "",
                        romaji: v.romaji || "",
                        hanviet: v.hanviet || "",
                        vi: v.vi || "",
                        example_jp: v.example_jp || "",
                        example_vi: v.example_vi || "",
                        grammar: v.grammar || ""
                    });
                }
            }
            this.words = parsedWords;
            this.eventBus.publish('DATA_LOADED', this.words);
            console.log(`[StateManager] Study Data ${mLevel} loaded:`, this.words.length, 'từ vựng');
        } else {
            console.warn(`[StateManager] Level ${mLevel} không tìm thấy. Dùng fallback!`);
            this.loadData();
        }
    } catch(err) {
        console.error('[StateManager] Lỗi load dữ liệu JSON JLPT:', err);
        this.loadData();
    }
  }

  public async loadLevelHubData(level: string): Promise<void> {
    try {
        const mLevel = level.toUpperCase();
        const fetchUrl = `/data/vocabulary_generated.json?v=${Date.now()}`;
        console.log(`[StateManager] Đang tải dữ liệu từ: ${fetchUrl} cho Level: ${mLevel}`);
        
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            console.error(`[StateManager] Không thể tải file dữ liệu. Status: ${response.status}`);
            throw new Error('Failed to fetch JSON');
        }
        const data = await response.json();
        console.log(`[StateManager] Tải JSON thành công. Tổng cộng: ${data.length} records.`);
        
        const levelData = data.find((d: any) => d.level.toString().trim().toUpperCase() === mLevel);
        
        if (levelData && levelData.unit_list) {
            this.n2HubData = [];
            console.log(`[StateManager] Đã tìm thấy dữ liệu cho ${mLevel}. Đang chuẩn bị ${levelData.unit_list.length} Units...`);
            levelData.unit_list.forEach((unit: any, uIndex: number) => {
                const words = unit.vocabulary_list || [];
                const sessions = [];
                for (let i = 0; i < words.length; i += 10) {
                    sessions.push(words.slice(i, i + 10));
                }
                this.n2HubData.push({
                    unitName: unit.unitId || `Unit ${uIndex + 1}`,
                    studyName_JA: unit.studyName_JA || '語彙',
                    studyName_ENG: unit.studyName_ENG || 'Vocabulary',
                    sessions: sessions
                });
            });
        } else {
            this.n2HubData = []; 
            console.error(`[StateManager] CRITICAL: Không tìm thấy level ${mLevel} trong file JSON! Các level hiện có:`, data.map((d: any) => d.level));
        }
    } catch(err) {
        console.error('[StateManager] Lỗi load Hub Data:', err);
        this.n2HubData = [];
    }
  }

  public getN2HubData(): any[] {
      return this.n2HubData;
  }

  // --- N2 PROGRESS SYSTEM ---
  private loadN2Progress() {
      try {
          const data = localStorage.getItem(this.n2ProgressKey);
          if (data) {
              this.n2Progress = JSON.parse(data);
          }
          
          // Thử đồng bộ với Cloud sau khi load local xong
          setTimeout(() => this.syncN2ProgressWithCloud(), 1000);
      } catch (e) { console.error('Failed to load N2 progress', e); }
  }

  public async syncN2ProgressWithCloud() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log('[StateManager] Đang đồng bộ tiến trình N2 với Cloud...');
      
      const { data, error } = await supabase
          .from('n2_progress')
          .select('*')
          .eq('user_id', session.user.id);

      if (error) {
          console.error('[StateManager] Lỗi đồng bộ Cloud:', error.message);
          return;
      }

      if (data && data.length > 0) {
          let hasNewData = false;
          data.forEach(row => {
              const key = `u${row.unit_idx}_s${row.session_idx}`;
              const cloudStats = { rank: row.rank, acc: row.acc, wpm: row.wpm, score: row.score };
              
              // Nếu Cloud xịn hơn hoặc Local chưa có -> Cập nhật local
              if (!this.n2Progress[key] || this.isBetterStats(cloudStats, this.n2Progress[key] as any)) {
                  this.n2Progress[key] = cloudStats;
                  hasNewData = true;
              }
          });

          if (hasNewData) {
              this.saveN2Progress();
              // Báo hiệu UI update lại Hub
              this.eventBus.publish('N2_PROGRESS_SYNCED', this.n2Progress);
          }
      }
  }

  private isBetterStats(newStats: {rank: string, acc: number, wpm: number, score?: number}, oldStats: {rank: string, acc: number, wpm: number, score?: number}) {
      const ranks = ['S', 'A', 'B', 'C', 'D'];
      const oldRankIdx = ranks.indexOf(oldStats.rank);
      const newRankIdx = ranks.indexOf(newStats.rank);
      
      if (newRankIdx < oldRankIdx) return true; // S tốt hơn A
      if (newRankIdx === oldRankIdx) {
          if (newStats.score !== undefined && oldStats.score !== undefined) {
              return newStats.score > oldStats.score;
          }
          return newStats.acc > oldStats.acc;
      }
      return false;
  }

  private saveN2Progress() {
      localStorage.setItem(this.n2ProgressKey, JSON.stringify(this.n2Progress));
  }
  
  public async saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}) {
      const key = `u${unitIdx}_s${sessionIdx}`;
      const current = this.n2Progress[key];
      
      let shouldUpdate = !current || this.isBetterStats(stats, current as any);
      
      if (shouldUpdate) {
          this.n2Progress[key] = stats;
          this.saveN2Progress();

          // Đẩy lên Cloud nếu đã đăng nhập
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              const { error } = await supabase
                  .from('n2_progress')
                  .upsert({
                      user_id: session.user.id,
                      unit_idx: unitIdx,
                      session_idx: sessionIdx,
                      rank: stats.rank,
                      acc: stats.acc,
                      wpm: stats.wpm,
                      score: stats.score || 0,
                      updated_at: new Date().toISOString()
                  }, { onConflict: 'user_id,unit_idx,session_idx' });
              
              if (error) console.error('[StateManager] Lỗi lưu Cloud:', error.message);
              else console.log('[StateManager] Đã đồng bộ lên Cloud!');
          }
      }
  }
  
  public getN2SessionProgress(unitIdx: number, sessionIdx: number) {
      return this.n2Progress[`u${unitIdx}_s${sessionIdx}`] || null;
  }


  public getWords(): Word[] {
    return this.words;
  }

  // --- LEITNER SYSTEM LOGIC ---
  private loadProgress() {
    try {
        const data = localStorage.getItem(this.progressKey);
        if (data) {
            this.studyProgress = JSON.parse(data);
        }
    } catch (e) { console.error('Failed to load study progress', e); }
  }

  private saveProgress() {
    localStorage.setItem(this.progressKey, JSON.stringify(this.studyProgress));
  }

  public getProgress() {
      return this.studyProgress;
  }

  public resetProgress() {
      this.studyProgress = { weak: [], mastered: [] };
      this.saveProgress();
  }

  public markWordWeak(romaji: string) {
      // Xoá khỏi mastered nếu có
      this.studyProgress.mastered = this.studyProgress.mastered.filter(r => r !== romaji);
      // Đưa vào weak nếu chưa có
      if (!this.studyProgress.weak.includes(romaji)) {
          this.studyProgress.weak.push(romaji);
      }
      this.saveProgress();
  }

  public markWordMastered(romaji: string) {
      // Xoá khỏi weak nếu có
      this.studyProgress.weak = this.studyProgress.weak.filter(r => r !== romaji);
      // Đưa vào mastered nếu chưa có
      if (!this.studyProgress.mastered.includes(romaji)) {
          this.studyProgress.mastered.push(romaji);
      }
      this.saveProgress();
  }

  public getStudySessionDeck(size: number = 20): Word[] {
      const deck: Word[] = [];
      const weakPool = this.words.filter(w => this.studyProgress.weak.includes(w.romaji));
      const masterPool = this.words.filter(w => this.studyProgress.mastered.includes(w.romaji));
      const neutralPool = this.words.filter(w => !this.studyProgress.weak.includes(w.romaji) && !this.studyProgress.mastered.includes(w.romaji));

      // Mục tiêu: 70% Weak/Neutral, 30% Mastered
      const targetMastered = Math.floor(size * 0.3);
      let addedMastered = 0;

      // Trộn Mastered
      const shuffledMastered = [...masterPool].sort(() => Math.random() - 0.5);
      for (let i = 0; i < targetMastered && i < shuffledMastered.length; i++) {
          deck.push(shuffledMastered[i]);
          addedMastered++;
      }

      // Trộn phần còn lại từ Weak và Neutral
      const remainingSlots = size - addedMastered;
      const combinedWeakNeutral = [...weakPool, ...neutralPool].sort(() => Math.random() - 0.5);
      for (let i = 0; i < remainingSlots && i < combinedWeakNeutral.length; i++) {
          deck.push(combinedWeakNeutral[i]);
      }

      // Fill in case not enough
      if (deck.length < size) {
          const usedRomajis = deck.map(w => w.romaji);
          const theRest = this.words.filter(w => !usedRomajis.includes(w.romaji)).sort(() => Math.random() - 0.5);
          for (let i = 0; deck.length < size && i < theRest.length; i++) {
              deck.push(theRest[i]);
          }
      }

      // Trộn cuối cùng
      return deck.sort(() => Math.random() - 0.5);
  }
}
