'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LU_POINTS_DATA } from '../acupoints_data'
import styles from '../page.module.css'

export default function StoriesPage() {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)

  const current = selectedPoint ? LU_POINTS_DATA.find(p => p.id === selectedPoint) : null

  if (current) {
    return (
      <div className={styles.storyContainer}>
        <div className={styles.storyDetail}>
          <Link href="/acupgame/stories" className={styles.storyDetailBack} onClick={() => setSelectedPoint(null)}>
            ← 返回故事列表
          </Link>
          
          <div className={styles.storyDetailName}>{current.emoji} {current.name}</div>
          <div className={styles.storyDetailPinyin}>{current.pinyin}</div>
          <div className={styles.storyDetailMeta}>
            <span className={styles.storyDetailTag}>{current.meridian}</span>
            {current.specialType && <span className={styles.storyDetailTag}>{current.specialType}</span>}
            <span className={styles.storyDetailTag}>{current.id}</span>
          </div>

          <div className={styles.storyDetailSection}>
            <div className={styles.storyDetailLabel}>📍 位置</div>
            <p className={styles.storyDetailText}>{current.location}</p>
          </div>

          <div className={styles.storyDetailSection}>
            <div className={styles.storyDetailLabel}>💡 主治</div>
            <p className={styles.storyDetailText}>{current.indication}</p>
          </div>

          <div className={styles.storyDetailSection}>
            <div className={styles.storyDetailLabel}>📖 穴位故事</div>
            <p className={styles.storyDetailText}>{current.story}</p>
          </div>

          <div className={styles.storyDetailSection}>
            <div className={styles.storyDetailLabel}>🩺 養生小竅門</div>
            <div className={styles.storyDetailTip}>
              <p className={styles.storyDetailTipText}>{current.healthTip}</p>
            </div>
          </div>

          <Link href="/acupgame/learn" className={styles.bigBtn} style={{ marginTop: 16 }}>
            🎯 去練習這個穴位
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.storyContainer}>
      <div className={styles.storyHeader}>
        <h1 className={styles.storyPageTitle}>📚 穴位故事</h1>
        <p className={styles.storyPageSubtitle}>了解每個穴位的由來、功效與養生智慧</p>
      </div>

      <div className={styles.storyList}>
        {LU_POINTS_DATA.map(pt => (
          <div
            key={pt.id}
            className={styles.storyCard}
            onClick={() => setSelectedPoint(pt.id)}
          >
            <div className={styles.storyCardTop}>
              <span className={styles.storyEmoji}>{pt.emoji}</span>
              <div>
                <div className={styles.storyCardName}>{pt.name}</div>
                <div className={styles.storyCardPinyin}>{pt.pinyin}</div>
              </div>
              {pt.specialType && (
                <span className={styles.storyCardType}>{pt.specialType}</span>
              )}
            </div>
            <p className={styles.storyCardPreview}>{pt.story.substring(0, 60)}...</p>
          </div>
        ))}
      </div>

      <Link href="/acupgame" className={styles.backBtn} style={{ marginTop: 12 }}>
        ← 返回首頁
      </Link>
    </div>
  )
}
