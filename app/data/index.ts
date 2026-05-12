// 12經絡 + 任督二脈 模組索引
// 狀態：complete = 已填資料，stub = 空殼待開發

export interface MeridianInfo {
  code: string
  name: string
  nameEn: string
  emoji: string
  totalPoints: number
  status: 'complete' | 'stub'
}

// ============================================================
// 肺經 (Lung Meridian) - 11穴位
export const LU_MERIDIAN: MeridianInfo = {
  code: 'LU',
  name: '肺經',
  nameEn: 'Lung Meridian',
  emoji: '🫁',
  totalPoints: 11,
  status: 'complete',
}

// 大腸經 (Large Intestine) - 20穴位
export const LI_MERIDIAN: MeridianInfo = {
  code: 'LI',
  name: '大腸經',
  nameEn: 'Large Intestine Meridian',
  emoji: '💨',
  totalPoints: 20,
  status: 'complete',
}

// 胃經 (Stomach) - 45穴位
export const ST_MERIDIAN: MeridianInfo = {
  code: 'ST',
  name: '胃經',
  nameEn: 'Stomach Meridian',
  emoji: '🍽️',
  totalPoints: 45,
  status: 'complete',
}

// 脾經 (Spleen) - 21穴位
export const SP_MERIDIAN: MeridianInfo = {
  code: 'SP',
  name: '脾經',
  nameEn: 'Spleen Meridian',
  emoji: '🩸',
  totalPoints: 21,
  status: 'complete',
}

// 心經 (Heart) - 9穴位
export const HT_MERIDIAN: MeridianInfo = {
  code: 'HT',
  name: '心經',
  nameEn: 'Heart Meridian',
  emoji: '❤️',
  totalPoints: 9,
  status: 'complete',
}

// 小腸經 (Small Intestine) - 19穴位
export const SI_MERIDIAN: MeridianInfo = {
  code: 'SI',
  name: '小腸經',
  nameEn: 'Small Intestine Meridian',
  emoji: '🔥',
  totalPoints: 19,
  status: 'complete',
}

// 膀胱經 (Bladder) - 67穴位
export const BL_MERIDIAN: MeridianInfo = {
  code: 'BL',
  name: '膀胱經',
  nameEn: 'Bladder Meridian',
  emoji: '💧',
  totalPoints: 67,
  status: 'stub',
}

// 腎經 (Kidney) - 27穴位
export const KI_MERIDIAN: MeridianInfo = {
  code: 'KI',
  name: '腎經',
  nameEn: 'Kidney Meridian',
  emoji: '⚡',
  totalPoints: 27,
  status: 'stub',
}

// 心包經 (Pericardium) - 9穴位
export const PC_MERIDIAN: MeridianInfo = {
  code: 'PC',
  name: '心包經',
  nameEn: 'Pericardium Meridian',
  emoji: '💝',
  totalPoints: 9,
  status: 'stub',
}

// 三焦經 (Triple Burner) - 23穴位
export const SJ_MERIDIAN: MeridianInfo = {
  code: 'SJ',
  name: '三焦經',
  nameEn: 'Triple Burner Meridian',
  emoji: '🌡️',
  totalPoints: 23,
  status: 'stub',
}

// 膽經 (Gallbladder) - 44穴位
export const GB_MERIDIAN: MeridianInfo = {
  code: 'GB',
  name: '肝經',
  nameEn: 'Gallbladder Meridian',
  emoji: '💚',
  totalPoints: 44,
  status: 'stub',
}

// 肝經 (Liver) - 14穴位
export const LR_MERIDIAN: MeridianInfo = {
  code: 'LR',
  name: '肝經',
  nameEn: 'Liver Meridian',
  emoji: '🌱',
  totalPoints: 14,
  status: 'stub',
}

// 任脈 (Ren Mai) - 24穴位
export const RN_MERIDIAN: MeridianInfo = {
  code: 'RN',
  name: '任脈',
  nameEn: 'Conception Vessel',
  emoji: '🌙',
  totalPoints: 24,
  status: 'stub',
}

// 督脈 (Du Mai) - 28穴位
export const DV_MERIDIAN: MeridianInfo = {
  code: 'DV',
  name: '督脈',
  nameEn: 'Governing Vessel',
  emoji: '☀️',
  totalPoints: 28,
  status: 'stub',
}

// ============================================================
// 統一匯出
export const ALL_MERIDIANS: MeridianInfo[] = [
  LU_MERIDIAN,
  LI_MERIDIAN,
  ST_MERIDIAN,
  SP_MERIDIAN,
  HT_MERIDIAN,
  SI_MERIDIAN,
  BL_MERIDIAN,
  KI_MERIDIAN,
  PC_MERIDIAN,
  SJ_MERIDIAN,
  GB_MERIDIAN,
  LR_MERIDIAN,
  RN_MERIDIAN,
  DV_MERIDIAN,
]

export const MERIDIAN_MAP: Record<string, MeridianInfo> = Object.fromEntries(
  ALL_MERIDIANS.map(m => [m.code, m])
)