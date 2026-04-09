import { Word } from '../entities/Word';
import { mockVocabulary } from './MockData';
import { EventBus } from '../utils/EventBus';

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
    this.loadProgress();
    this.loadN2Progress();
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
        const response = await fetch('/src/data/vocabulary_generated.json');
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

  public async loadN2HubData(): Promise<void> {
    try {
        const response = await fetch('/src/data/vocabulary_generated.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        const data = await response.json();
        
        const levelData = data.find((d: any) => d.level === 'N2');
        if (levelData && levelData.unit_list) {
            this.n2HubData = [];
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
            console.log('[StateManager] N2 Hub Data loaded:', this.n2HubData.length, 'Units');
        }
    } catch(err) {
        console.error('[StateManager] Lỗi load N2 Hub Data:', err);
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
      } catch (e) { console.error('Failed to load N2 progress', e); }
  }

  private saveN2Progress() {
      localStorage.setItem(this.n2ProgressKey, JSON.stringify(this.n2Progress));
  }
  
  public saveN2SessionProgress(unitIdx: number, sessionIdx: number, stats: {rank: string, acc: number, wpm: number, score?: number}) {
      const key = `u${unitIdx}_s${sessionIdx}`;
      // Chỉ lưu nếu tốt hơn (Rank ưu tiên, sau đó tới Score hoặc Acc)
      const current = this.n2Progress[key];
      let shouldUpdate = false;
      if (!current) {
          shouldUpdate = true;
      } else {
          const ranks = ['S', 'A', 'B', 'C', 'D'];
          const currentRankIdx = ranks.indexOf(current.rank);
          const newRankIdx = ranks.indexOf(stats.rank);
          if (newRankIdx < currentRankIdx) {
              shouldUpdate = true; // S tốt hơn A
          } else if (newRankIdx === currentRankIdx) {
              if (stats.score !== undefined && current.score !== undefined) {
                  if (stats.score > current.score) shouldUpdate = true;
              } else if (stats.acc > current.acc) {
                  shouldUpdate = true;
              }
          }
      }
      
      if (shouldUpdate) {
          this.n2Progress[key] = stats;
          this.saveN2Progress();
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
