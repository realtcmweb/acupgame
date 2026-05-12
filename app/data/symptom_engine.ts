// 症狀 → 穴位推薦引擎

import { LU_POINTS_DATA } from './LU_lung'
import { LI_POINTS_DATA } from './LI_large_intestine'
import { ST_POINTS_DATA } from './ST_stomach'
import { SP_POINTS_DATA } from './SP_spleen'
import { HT_POINTS_DATA } from './HT_heart'
import { SI_POINTS_DATA } from './SI_small_intestine'
import { SYMPTOMS, SYMPTOMS_ALT } from './symptoms'
import type { AcupointStory } from './types'
import type { Symptom } from './symptoms'

// 合併所有已完成的穴位數據
const ALL_POINTS: AcupointStory[] = [
  ...LU_POINTS_DATA,
  ...LI_POINTS_DATA,
  ...ST_POINTS_DATA,
  ...SP_POINTS_DATA,
  ...HT_POINTS_DATA,
  ...SI_POINTS_DATA,
]

/**
 * 根據症狀關鍵字匹配穴位
 */
export function matchPointsBySymptom(symptom: Symptom): AcupointStory[] {
  const matched: { point: AcupointStory; score: number }[] = []

  for (const point of ALL_POINTS) {
    const indication = point.indication || ''
    let score = 0

    for (const keyword of symptom.keywords) {
      if (indication.includes(keyword)) {
        score += keyword.length
      }
    }

    if (score > 0) {
      matched.push({ point, score })
    }
  }

  return matched
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(m => m.point)
}

/**
 * 根據症狀ID獲取推薦穴位
 */
export function getRecommendations(symptomId: string): AcupointStory[] {
  const allSymptoms = [...SYMPTOMS, ...SYMPTOMS_ALT]
  const symptom = allSymptoms.find(s => s.id === symptomId)
  if (!symptom) return []
  return matchPointsBySymptom(symptom)
}

/**
 * 取得所有症狀列表
 */
export function getAllSymptoms(): Symptom[] {
  return [...SYMPTOMS, ...SYMPTOMS_ALT]
}