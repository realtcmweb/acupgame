'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SYMPTOMS, SYMPTOMS_ALT } from '../data/symptoms'
import { matchPointsBySymptom } from '../data/symptom_engine'
import type { Symptom } from '../data/symptoms'
import type { AcupointStory } from '../data/types'
import styles from '../page.module.css'

export default function SymptomPage() {
  const [selected, setSelected] = useState<Symptom | null>(null)
  const [showAlt, setShowAlt] = useState(false)
  const [altPage, setAltPage] = useState(0)
  const [recommendations, setRecommendations] = useState<AcupointStory[]>([])

  const displaySymptoms = showAlt ? SYMPTOMS_ALT : SYMPTOMS

  const handleSelect = (symptom: Symptom) => {
    setSelected(symptom)
    const matched = matchPointsBySymptom(symptom)
    setRecommendations(matched)
  }

  const handleBack = () => {
    setSelected(null)
    setRecommendations([])
  }

  const handleShowAlt = () => {
    setShowAlt(true)
    setAltPage(1)
  }

  // Show recommendations
  if (selected) {
    return (
      <div className={styles.symptomContainer}>
        <div className={styles.symptomHeader}>
          <button className={styles.backBtn} onClick={handleBack}>← 返回</button>
          <h1 className={styles.symptomTitle}>📍 症狀推薦</h1>
        </div>

        <div className={styles.symptomSelectedBanner}>
          <span className={styles.symptomEmoji}>{selected.emoji}</span>
          <span className={styles.symptomName}>{selected.name}</span>
        </div>

        <div className={styles.recommendSubtitle}>
          根據中醫經絡學說，以下穴位對「{selected.name}」有幫助：
        </div>

        <div className={styles.recommendList}>
          {recommendations.length === 0 ? (
            <div className={styles.recommendEmpty}>
              目前數據庫中尚無此症狀的穴位記錄
            </div>
          ) : (
            recommendations.map(point => (
              <div key={point.id} className={styles.recommendCard}>
                <div className={styles.recommendCardHeader}>
                  <span className={styles.recommendPointId}>{point.id}</span>
                  <span className={styles.recommendPointName}>{point.name}</span>
                  <span className={styles.recommendMeridian}>{point.meridian}</span>
                </div>
                <p className={styles.recommendIndication}>{point.indication}</p>
                <div className={styles.recommendActions}>
                  <Link href="learn" className={styles.recommendBtn}>
                    🎯 學習定位
                  </Link>
                  <Link href="checkin" className={styles.recommendBtnSecondary}>
                    🩺 打卡記錄
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.symptomDisclaimer}>
          ⚠️ 以上僅供參考，如有疾病請諮詢中醫師
        </div>
      </div>
    )
  }

  // Main symptom selection view
  return (
    <div className={styles.symptomContainer}>
      <div className={styles.symptomHeader}>
        <Link href="/" className={styles.backBtn}>← 返回</Link>
        <h1 className={styles.symptomTitle}>🙏 今日症狀</h1>
      </div>

      <div className={styles.symptomIntro}>
        選擇你今天不舒服的症狀，系統會推薦對應的穴位
      </div>

      <div className={styles.symptomGrid}>
        {displaySymptoms.map(symptom => (
          <button
            key={symptom.id}
            className={styles.symptomBtn}
            onClick={() => handleSelect(symptom)}
          >
            <span className={styles.symptomBtnEmoji}>{symptom.emoji}</span>
            <span className={styles.symptomBtnName}>{symptom.name}</span>
          </button>
        ))}
      </div>

      {!showAlt && (
        <button className={styles.symptomMoreBtn} onClick={handleShowAlt}>
          沒有找到？試試其他症狀 →
        </button>
      )}

      {showAlt && altPage === 1 && (
        <div className={styles.symptomAltNote}>
          換了一組常見症狀，還是沒有？
          <button className={styles.symptomMoreBtn} onClick={() => setAltPage(2)}>
            再換一組 →
          </button>
        </div>
      )}

      {showAlt && altPage === 2 && (
        <div className={styles.symptomAltNote}>
          這是最後一組了。找不到對應症狀？
          <button className={styles.symptomMoreBtn} onClick={() => { setShowAlt(false); setAltPage(0); }}>
            回到一開始的列表 ↑
          </button>
        </div>
      )}
    </div>
  )
}