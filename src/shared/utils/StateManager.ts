import { Word } from '../../core/entities/Word';
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
  private currentHubType: string = 'study';
  private currentHubLevel: string = 'n2';
  private _studyLanguage: string = 'vi';

  public get studyLanguage(): string {
      return this._studyLanguage;
  }

  public set studyLanguage(val: string) {
      this._studyLanguage = val;
      localStorage.setItem('ninja_study_lang', val);
  }

  private constructor() {
    this.eventBus = EventBus.getInstance();
    
    // Load persisted language
    const savedLang = localStorage.getItem('ninja_study_lang');
    if (savedLang) {
        this._studyLanguage = savedLang;
    }

    this.initializeUserProgress();

    // Lắng nghe sự kiện đăng nhập để đổi "ngăn kéo" dữ liệu ngay lập tức
    this.eventBus.subscribe('AUTH_SUCCESS', (user: any) => {
        if (user && user.id) {
            this.initializeUserProgress(user.id);
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
    await this.syncN2ProgressWithCloud();

    this.eventBus.publish('USER_STATE_READY', { userId });
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  public loadData(): void {
    // Không còn dùng mock data, mặc định là mảng trống nếu fetch JSON thất bại
    this.words = [];
    
    this.eventBus.publish('DATA_LOADED', this.words);
    console.log('[StateManager] Dữ liệu khởi tạo trống (chờ load JSON).');
  }

  public async loadStudyData(level: string): Promise<void> {
    try {
        const mLevel = level.toUpperCase();
        // Since we are using Vite, fetch will serve correctly from root if mapped, or we can use dynamic import.
        // But dynamic import is safer in Vite for JSON, wait, fetch('/src/data/vocabulary_generated.json') also works.
        const response = await fetch('/data/kotoba.json');
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
                        grammar: v.grammar || "",
                        tag: v.tag || ""
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

  public async loadLevelHubData(level: string, type: string = 'study'): Promise<void> {
    try {
        const mLevel = level.toUpperCase();
        this.currentHubType = type;
        this.currentHubLevel = level.toLowerCase();
        let fileName = 'kotoba.json';
        if (type === 'kanji') fileName = 'kanji.json';
        else if (type === 'grammar') fileName = 'grammar.json';
        
        const fetchUrl = `/data/${fileName}?v=${Date.now()}`;
        console.log(`[StateManager] Đang tải dữ liệu từ: ${fetchUrl} cho Level: ${mLevel} (Type: ${type})`);
        
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
                const words = unit.vocabulary_list || unit.kanji_list || unit.grammar_list || [];
                const sessions: Word[][] = [];
                const sessionMap: Record<string, Word[]> = {};

                words.forEach((w: any) => {
                    const tag = w.tag || 'Default_Session';
                    if (!sessionMap[tag]) {
                        sessionMap[tag] = [];
                    }
                    sessionMap[tag].push(w);
                });

                // Lấy các tags và sắp xếp theo số Session/Day/Ngày trong tag (ví dụ: Session_1, Day_1, Ngày_1...)
                const sortedTags = Object.keys(sessionMap).sort((a, b) => {
                    const getNum = (s: string) => {
                        const match = s.match(/(?:Session|Day|Ngày)_(\d+)/);
                        return match ? parseInt(match[1]) : 0;
                    };
                    return getNum(a) - getNum(b);
                });

                sortedTags.forEach(tag => {
                    sessions.push(sessionMap[tag]);
                });

                let ja_fallback = '語彙';
                let en_fallback = 'Vocabulary';
                let vi_fallback = 'Từ Vựng';
                if (type === 'kanji') {
                    ja_fallback = '漢字'; en_fallback = 'Kanji'; vi_fallback = 'Hán Tự';
                } else if (type === 'grammar') {
                    ja_fallback = '文法'; en_fallback = 'Grammar'; vi_fallback = 'Ngữ Pháp';
                }

                this.n2HubData.push({
                    unitName: unit.unitId || `Unit ${uIndex + 1}`,
                    studyName_JA: unit.studyName_JA || ja_fallback,
                    studyName_ENG: unit.studyName_ENG || en_fallback,
                    studyName_VI: unit.studyName_VI || vi_fallback,
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
    } finally {
        // Báo hiệu dữ liệu Hub đã sẵn sàng (dù thành công hay thất bại)
        this.eventBus.publish('HUB_DATA_LOADED', this.n2HubData);
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
          data.forEach((item: any) => {
              const l = item.level || 'n2';
              const key = `${l}_m${item.study_mode}_u${item.unit_idx}_s${item.session_idx}`;
              const cloudStats = { rank: item.rank, acc: item.acc, wpm: item.wpm, score: item.score };
              
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

    public async saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}, mode?: string) {
      let activeMode = mode || this.currentHubType || 'study';
      let dbSessionIdx = sessionIdx;

      // [REVIEW MODE LOGIC]
      if (sessionIdx === -1) {
          activeMode = 'review';
          // Tạo một ID âm duy nhất dựa trên thời gian để TÍCH LŨY điểm (không ghi đè)
          dbSessionIdx = -Math.floor(Date.now() / 1000);
      }
      // Đảm bảo không ghi đè nhầm chế độ học
      else if (mode === 'kanji' || mode === 'grammar') {
          activeMode = mode;
      }

      const cappedScore = stats.score !== undefined ? Math.min(stats.score, 3000) : undefined;
      const finalStats = { ...stats, score: cappedScore };
      
      const activeLevel = this.currentHubLevel || 'n2';
      // Local key: Vẫn giữ key cố định cho Review để tránh rác localStorage (chọn điểm cao nhất hoặc mới nhất)
      const localKey = sessionIdx === -1 
          ? `${activeLevel}_m${activeMode}_u${unitIdx}_aggregate` 
          : `${activeLevel}_m${activeMode}_u${unitIdx}_s${sessionIdx}`;

      const currentLocal = this.n2Progress[localKey];
      let shouldUpdateLocal = !currentLocal || this.isBetterStats(finalStats, currentLocal as any);
      
      if (shouldUpdateLocal || sessionIdx === -1) {
          if (sessionIdx === -1 && currentLocal) {
              // Cộng dồn điểm ở local cho đồng bộ với Cloud
              this.n2Progress[localKey] = {
                  ...finalStats,
                  score: (currentLocal.score || 0) + (finalStats.score || 0)
              };
          } else {
              this.n2Progress[localKey] = finalStats;
          }
          this.saveN2Progress();

          // Đẩy lên Cloud nếu đã đăng nhập
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
              console.log(`[StateManager] 🚀 Đang đẩy lên Cloud | Mode: ${activeMode} | ID: ${dbSessionIdx}`);
              
              const payload = {
                  user_id: session.user.id,
                  level: activeLevel,
                  unit_idx: unitIdx,
                  session_idx: dbSessionIdx,
                  study_mode: activeMode,
                  rank: finalStats.rank,
                  acc: finalStats.acc,
                  wpm: finalStats.wpm,
                  score: finalStats.score || 0,
                  updated_at: new Date().toISOString()
              };

              // Nếu là Review, dùng insert để cộng dồn. Nếu là Study, dùng upsert để ghi đè session cũ.
              const query = sessionIdx === -1 
                  ? supabase.from('n2_progress').insert(payload)
                  : supabase.from('n2_progress').upsert(payload, { onConflict: 'user_id,level,unit_idx,session_idx,study_mode' });

              const { data, error } = await query.select();
              
              if (error) {
                  console.error('[StateManager] ❌ LỖI LƯU CLOUD:', error.message);
              } else {
                  console.log('[StateManager] ✅ CLOUD SAVE SUCCESS!', data);
                  this.eventBus.publish('HUB_DATA_LOADED', null); 
              }
          }
      }
  }

  public getN2SessionProgress(unitIdx: number, sessionIdx: number, mode?: string) {
      const activeLevel = this.currentHubLevel || 'n2';
      const activeMode = mode || this.currentHubType || 'study';
      const key = `${activeLevel}_m${activeMode}_u${unitIdx}_s${sessionIdx}`;
      return this.n2Progress[key] || null;
  }

  public getGlobalN2Stats() {
      let totalStatsCount = 0;
      let accSum = 0;
      let wpmSum = 0;
      let totalScoreSum = 0;
      let rankScoreSum = 0;
      const rankMap: Record<string, number> = { 'S': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };

      Object.entries(this.n2Progress).forEach(([key, prog]: [string, any]) => {
          // Bất kể có nhãn cấp độ (n2_) hay không, miễn là chứa mstudy, mkanji hoặc mgrammar
          const isValidMode = key.includes('mstudy_') || key.includes('mkanji_') || key.includes('mgrammar_');
          
          if (isValidMode && prog && prog.rank !== '---') {
              totalStatsCount++;
              accSum += (prog.acc || 0);
              wpmSum += (prog.wpm || 0);
              totalScoreSum += Math.min(prog.score || 0, 3000);
              rankScoreSum += rankMap[prog.rank] || 0;
          }
      });

      const rawAvgAcc = totalStatsCount > 0 ? (accSum / totalStatsCount) : 0;
      let avgAcc = rawAvgAcc;
      if (rawAvgAcc > 110) avgAcc = rawAvgAcc / 100;
      else if (rawAvgAcc <= 1.1 && rawAvgAcc > 0) avgAcc = rawAvgAcc * 100;

      return {
          totalCount: totalStatsCount,
          avgAcc: avgAcc,
          avgWpm: totalStatsCount > 0 ? (wpmSum / totalStatsCount) : 0,
          totalScore: totalScoreSum,
          avgRankScore: totalStatsCount > 0 ? (rankScoreSum / totalStatsCount) : 0
      };
  }

  public getReviewStats() {
      let totalReviewScore = 0;
      Object.entries(this.n2Progress).forEach(([key, prog]: [string, any]) => {
          if (key.includes('mreview_') && prog) {
              totalReviewScore += (prog.score || 0);
          }
      });
      return { totalScore: totalReviewScore };
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
