// 經穴大師 - 存檔與狀態管理
export interface DailyHomework {
  date: string // YYYY-MM-DD
  points: string[] // 當日學習的穴位ID列表
  completed: boolean
  completedAt?: string
}

export interface CheckInRecord {
  date: string
  pointId: string
  pointName: string
  durationMinutes: number
  note?: string
}

export interface GameProgress {
  // 學習進度
  learnedPoints: string[] // 已學習過的穴位ID
  masteredPoints: string[] // 已掌握的穴位（答對3次以上）
  // 闖關模式
  challengeProgress: Record<string, number> // meridian -> currentLevel
  challengeBestScores: Record<string, number> // meridian -> bestScore
  // 每日功課
  todayHomework: DailyHomework | null
  lastHomeworkDate: string // YYYY-MM-DD
  // 養生打卡
  checkIns: CheckInRecord[]
  // 連續天數
  streakDays: number
  lastActiveDate: string
  // 統計
  totalAnswered: number
  totalCorrect: number
  totalPlayTime: number // 秒
  // 收藏
  favorites: string[]
  // 最後選的經脈
  lastMeridian: string
}

const STORAGE_KEY = 'jingxue_master_save'

const DEFAULT_PROGRESS: GameProgress = {
  learnedPoints: [],
  masteredPoints: [],
  challengeProgress: { LU: 0 },
  challengeBestScores: { LU: 0 },
  todayHomework: null,
  lastHomeworkDate: '',
  checkIns: [],
  streakDays: 0,
  lastActiveDate: '',
  totalAnswered: 0,
  totalCorrect: 0,
  totalPlayTime: 0,
  favorites: [],
  lastMeridian: 'LU',
}

export function loadProgress(): GameProgress {
  if (typeof window === 'undefined') return { ...DEFAULT_PROGRESS }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PROGRESS }
    const saved = JSON.parse(raw) as Partial<GameProgress>
    return { ...DEFAULT_PROGRESS, ...saved }
  } catch {
    return { ...DEFAULT_PROGRESS }
  }
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (e) {
    console.warn('saveProgress failed:', e)
  }
}

export function getTodayStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayStr()
}

export function updateStreak(progress: GameProgress): GameProgress {
  const today = getTodayStr()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  
  if (progress.lastActiveDate === today) {
    return progress
  } else if (progress.lastActiveDate === yesterdayStr) {
    return { ...progress, lastActiveDate: today, streakDays: progress.streakDays + 1 }
  } else {
    return { ...progress, lastActiveDate: today, streakDays: 1 }
  }
}

export function markPointLearned(progress: GameProgress, pointId: string): GameProgress {
  if (progress.learnedPoints.includes(pointId)) return progress
  return { ...progress, learnedPoints: [...progress.learnedPoints, pointId] }
}

export function markPointMastered(progress: GameProgress, pointId: string): GameProgress {
  if (progress.masteredPoints.includes(pointId)) return progress
  return { ...progress, masteredPoints: [...progress.masteredPoints, pointId] }
}

export function toggleFavorite(progress: GameProgress, pointId: string): GameProgress {
  const has = progress.favorites.includes(pointId)
  return {
    ...progress,
    favorites: has
      ? progress.favorites.filter(id => id !== pointId)
      : [...progress.favorites, pointId],
  }
}

export function addCheckIn(progress: GameProgress, checkIn: CheckInRecord): GameProgress {
  return { ...progress, checkIns: [...progress.checkIns.slice(-99), checkIn] }
}

export function generateDailyHomework(progress: GameProgress): DailyHomework {
  // 從未學習的穴位中選3個
  const allPoints = ['LU1','LU2','LU3','LU4','LU5','LU6','LU7','LU8','LU9','LU10','LU11']
  const unlearned = allPoints.filter(p => !progress.learnedPoints.includes(p))
  const toLearn = unlearned.length >= 3
    ? unlearned.slice(0, 3)
    : [...unlearned, ...allPoints.filter(p => !unlearned.includes(p))].slice(0, 3)
  
  return { date: getTodayStr(), points: toLearn, completed: false }
}
