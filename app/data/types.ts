// 穴位資料型別定義

export interface AcupointStory {
  id: string
  name: string
  pinyin: string
  meridian: string
  meridianCode: string
  pointNumber: number
  specialType?: string
  location: string
  indication: string
  story: string
  healthTip: string
  emoji: string
}

export interface MeridianInfo {
  code: string
  name: string
  nameEn: string
  emoji: string
  totalPoints: number
  status: 'complete' | 'stub'
}