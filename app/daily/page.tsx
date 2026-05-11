'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LU_POINTS_DATA } from '../acupoints_data'
import { loadProgress, saveProgress, getTodayStr, markPointLearned } from '../progress'
import type { GameProgress } from '../progress'
import styles from '../page.module.css'

type Phase = 'intro' | 'learning' | 'correct' | 'reveal' | 'story' | 'done'

export default function DailyPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [clickedPoint, setClickedPoint] = useState<string | null>(null)
  const [learnedInSession, setLearnedInSession] = useState<string[]>([])

  useEffect(() => {
    const p = loadProgress()
    setProgress(p)
    // If homework already done, go to done state
    if (p.todayHomework?.completed) {
      setPhase('done')
    }
  }, [])

  const hw = progress?.todayHomework
  const homeworkPoints = hw?.points || []
  const current = homeworkPoints[currentIdx] ? LU_POINTS_DATA.find(p => p.id === homeworkPoints[currentIdx]) : null

  const handlePointClick = useCallback((pointId: string) => {
    if (phase !== 'learning' || !current) return
    setClickedPoint(pointId)

    if (pointId === current.id) {
      setPhase('correct')
      setLearnedInSession(prev => [...prev, pointId])
      setTimeout(() => setPhase('story'), 1200)
    } else {
      setPhase('reveal')
      setTimeout(() => setPhase('story'), 2000)
    }
  }, [phase, current])

  const handleNext = () => {
    if (currentIdx + 1 >= homeworkPoints.length) {
      // Mark homework complete
      if (progress) {
        let p = markPointLearned(progress, homeworkPoints[currentIdx])
        homeworkPoints.forEach(pid => {
          if (!p.learnedPoints.includes(pid)) {
            p = { ...p, learnedPoints: [...p.learnedPoints, pid] }
          }
        })
        if (p.todayHomework) {
          p = {
            ...p,
            todayHomework: { ...p.todayHomework, completed: true, completedAt: new Date().toISOString() },
          }
        }
        saveProgress(p)
        setProgress(p)
      }
      setPhase('done')
    } else {
      setCurrentIdx(prev => prev + 1)
      setPhase('learning')
      setClickedPoint(null)
    }
  }

  if (!progress) {
    return <div className={styles.dailyPageContainer}><div className={styles.loadingInner}>🏮</div></div>
  }

  // Done screen
  if (phase === 'done') {
    return (
      <div className={styles.dailyPageContainer}>
        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🎉</div>
          <h2>今日養生功課完成！</h2>
          <p>今日學習了 {homeworkPoints.length} 個穴位</p>
          <p>🔥 連續 {progress.streakDays} 天</p>
          <div className={styles.streakBadge}>
            <span className={styles.streakNum}>🏆</span>
            <span className={styles.streakLabel}>養生大師</span>
          </div>
          <Link href="/" className={styles.btn}>返回首頁</Link>
        </div>
      </div>
    )
  }

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className={styles.dailyPageContainer}>
        <div className={styles.learnHeader}>
          <Link href="/" className={styles.backBtn}>← 返回</Link>
          <h1 className={styles.learnTitle}>📅 每日養生功課</h1>
        </div>

        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🧘</div>
          <h2>今日功課：學習 {homeworkPoints.length} 個穴位</h2>
          <p style={{ maxWidth: 300 }}>跟著步驟，輕鬆學會穴位定位與功效</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '80%', marginTop: 10 }}>
            <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: '0.95rem', color: '#d0c0a0', border: '1px solid #c9a96e22' }}>
              ① 看症狀，猜穴位
            </div>
            <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: '0.95rem', color: '#d0c0a0', border: '1px solid #c9a96e22' }}>
              ② 在人體圖上點位置
            </div>
            <div style={{ background: '#1a1a2e', padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: '0.95rem', color: '#d0c0a0', border: '1px solid #c9a96e22' }}>
              ③ 閱讀穴位故事與功效
            </div>
          </div>
          <button className={`${styles.btn}`} onClick={() => setPhase('learning')}>
            ▶️ 開始今日功課
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className={styles.learnContainer}>
      {/* Header */}
      <div className={styles.learnHeader}>
        <Link href="/" className={styles.backBtn}>← 返回</Link>
        <h1 className={styles.learnTitle}>📅 每日功課</h1>
        <div className={styles.learnProgress}>{currentIdx + 1}/{homeworkPoints.length}</div>
      </div>

      {/* Body Map */}
      <div className={styles.learnBodyArea}>
        <DailyBodyMap
          currentPoint={current}
          clickedPoint={clickedPoint}
          phase={phase}
          onPointClick={handlePointClick}
        />
      </div>

      {/* Question */}
      <div className={styles.learnQuestion}>
        <div className={styles.learnQuestionLabel}>請點擊穴位位置</div>
        <div className={styles.learnQuestionName}>{current.name}</div>
        <div className={styles.learnQuestionPinyin}>{current.pinyin}</div>
        {current.specialType && (
          <div className={styles.learnQuestionType}>{current.specialType}</div>
        )}
      </div>

      {/* Feedback */}
      {phase === 'correct' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackCorrect}`}>
          ✅ 正確！{current.name} 位置找對了！
        </div>
      )}
      {phase === 'reveal' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackWrong}`}>
          📍 正確位置是 {current.name}
        </div>
      )}

      {/* Story */}
      {phase === 'story' && (
        <div className={styles.learnStory}>
          <h3 className={styles.learnStoryTitle}>{current.emoji} {current.name} 的故事</h3>
          <p className={styles.learnStoryText}>{current.story}</p>
          <div className={styles.learnTip}>💡 {current.healthTip}</div>
          <div className={styles.learnNav}>
            <button className={`${styles.learnNavBtn} ${styles.learnNavBtnPrimary}`} onClick={handleNext}>
              {currentIdx + 1 >= homeworkPoints.length ? '🎉 完成功課' : '✅ 記住了，繼續下一個 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DailyBodyMap({
  currentPoint,
  clickedPoint,
  phase,
  onPointClick,
}: {
  currentPoint: (typeof LU_POINTS_DATA)[0]
  clickedPoint: string | null
  phase: Phase
  onPointClick: (id: string) => void
}) {
  const pointCoords: Record<string, {x: number, y: number}> = {
    LU1: { x: 120, y: 58 },
    LU2: { x: 108, y: 61 },
    LU3: { x: 80, y: 90 },
    LU4: { x: 72, y: 96 },
    LU5: { x: 68, y: 122 },
    LU6: { x: 60, y: 138 },
    LU7: { x: 52, y: 154 },
    LU8: { x: 48, y: 163 },
    LU9: { x: 44, y: 170 },
    LU10: { x: 40, y: 179 },
    LU11: { x: 36, y: 189 },
  }

  const isCorrect = (id: string) => phase === 'correct' && clickedPoint === id
  const isWrong = (id: string) => phase === 'reveal' && clickedPoint === id
  const isRightAnswer = (id: string) => phase === 'reveal' && id === currentPoint.id

  return (
    <svg viewBox="0 0 200 320" className={styles.learnBodySvg} xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="320" fill="#1a1a2e" rx="16" />
      <g fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="100" cy="28" rx="18" ry="22" />
        <line x1="93" y1="48" x2="93" y2="56" />
        <line x1="107" y1="48" x2="107" y2="56" />
        <path d="M 75 56 L 65 65 L 60 100 L 58 150 L 65 150 L 70 115 L 100 115 L 130 115 L 135 150 L 142 150 L 140 100 L 135 65 L 125 56 Z" fill="#2a2a4a" />
        <path d="M 125 56 L 145 58 L 165 75 L 175 100 L 172 115 L 165 110 L 155 85 L 145 72 L 130 65 Z" fill="#2a2a4a" />
        <path d="M 65 56 L 45 58 L 25 75 L 15 100 L 18 115 L 25 110 L 35 85 L 45 72 L 60 65 Z" fill="#2a2a4a" />
        <path d="M 70 150 L 68 200 L 62 250 L 60 290 L 75 290 L 78 250 L 82 200 L 85 150 Z" fill="#2a2a4a" />
        <path d="M 130 150 L 132 200 L 138 250 L 140 290 L 125 290 L 122 250 L 118 200 L 115 150 Z" fill="#2a2a4a" />
      </g>
      <path d="M 120 20 Q 112 40 108 60 Q 100 80 90 100 Q 80 120 72 140 Q 64 160 56 180 Q 48 200 40 215" fill="none" stroke="#4fc3f7" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      {LU_POINTS_DATA.map(pt => {
        const coord = pointCoords[pt.id]
        if (!coord) return null
        let cls = styles.acupoint
        if (isCorrect(pt.id)) cls += ' ' + styles.acupointCorrect
        else if (isWrong(pt.id)) cls += ' ' + styles.acupointWrong
        else if (isRightAnswer(pt.id)) cls += ' ' + styles.acupointHint
        return (
          <g key={pt.id} onClick={() => onPointClick(pt.id)} style={{ cursor: phase === 'learning' ? 'pointer' : 'default' }}>
            <circle cx={coord.x} cy={coord.y} r="7" className={cls} />
            <text x={coord.x} y={coord.y + 3} textAnchor="middle" fontSize="5" fill="#e0d0b0" style={{ pointerEvents: 'none', userSelect: 'none' }}>{pt.id}</text>
          </g>
        )
      })}
      <text x="100" y="310" textAnchor="middle" fill="#c9a96e" fontSize="7" fontFamily="serif">肺經 (Lung Meridian)</text>
    </svg>
  )
}
