'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LU_POINTS_DATA } from '../acupoints_data'
import { loadProgress, saveProgress, markPointLearned, markPointMastered, getTodayStr } from '../progress'
import type { GameProgress } from '../progress'
import styles from '../page.module.css'

type Phase = 'learning' | 'correct' | 'reveal' | 'story'

export default function LearnPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('learning')
  const [clickedPoint, setClickedPoint] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState<Record<string, number>>({})
  const [hintUsed, setHintUsed] = useState(false)

  // Get today's 3 homework points or all points
  const todayPoints = LU_POINTS_DATA

  useEffect(() => {
    const p = loadProgress()
    setProgress(p)
  }, [])

  const current = todayPoints[currentIdx]

  const handlePointClick = useCallback((pointId: string) => {
    if (phase !== 'learning') return
    const correct = pointId === current?.id
    setClickedPoint(pointId)

    if (correct) {
      setPhase('correct')
      // Update correct count
      setCorrectCount(prev => ({ ...prev, [pointId]: (prev[pointId] || 0) + 1 }))
      
      setTimeout(() => {
        setPhase('story')
      }, 1200)
    } else {
      setPhase('reveal')
      setTimeout(() => {
        setPhase('story')
      }, 2000)
    }
  }, [phase, current])

  const nextPoint = useCallback(() => {
    if (currentIdx + 1 >= todayPoints.length) {
      // Completed all points today
      setPhase('complete' as any)
    } else {
      setCurrentIdx(prev => prev + 1)
      setPhase('learning')
      setClickedPoint(null)
      setHintUsed(false)
    }
  }, [currentIdx, todayPoints.length])

  const handleComplete = () => {
    if (!progress || !current) return
    // Mark as learned
    let p = markPointLearned(progress, current.id)
    // Mark as mastered if answered correctly 3+ times
    const count = correctCount[current.id] || 0
    if (count >= 3) {
      p = markPointMastered(p, current.id)
    }
    // Update streak
    p = { ...p, lastActiveDate: getTodayStr() }
    saveProgress(p)
    setProgress(p)
    nextPoint()
  }

  const showHint = () => {
    setHintUsed(true)
  }

  if (!progress || !current) {
    return <div className={styles.loading}><div className={styles.loadingInner}>🏮 加載中...</div></div>
  }

  // All done screen
  if (phase === 'complete' as any || currentIdx >= todayPoints.length) {
    return (
      <div className={styles.learnContainer}>
        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🎉</div>
          <h2>今日學習完成！</h2>
          <p>已學習 {todayPoints.length} 個穴位</p>
          <p>正確次數：{Object.values(correctCount).filter((v, i) => {
            return todayPoints[i] && correctCount[todayPoints[i].id] > 0
          }).length}</p>
          <div className={styles.streakBadge}>
            <span className={styles.streakNum}>🔥 {progress.streakDays}天</span>
          </div>
          <Link href="/" className={styles.btn}>返回首頁</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.learnContainer}>
      {/* Header */}
      <div className={styles.learnHeader}>
        <div>
          <Link href="/" className={styles.backBtn}>← 返回</Link>
          <h1 className={styles.learnTitle}>🎯 緩慢闯關</h1>
        </div>
        <div className={styles.learnProgress}>
          {currentIdx + 1} / {todayPoints.length}
        </div>
      </div>

      {/* Body Map */}
      <div className={styles.learnBodyArea}>
        <BodyMapSVG
          currentPoint={current}
          clickedPoint={clickedPoint}
          phase={phase}
          hintUsed={hintUsed}
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

      {/* Hint Button */}
      {phase === 'learning' && !hintUsed && (
        <button className={styles.learnNavBtn} onClick={showHint} style={{ marginBottom: 8 }}>
          💡 需要提示？
        </button>
      )}
      {hintUsed && phase === 'learning' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackHint}`}>
          💡 提示：此穴位在{current.location.substring(0, 15)}...
        </div>
      )}

      {/* Story Section */}
      {phase === 'story' && (
        <div className={styles.learnStory}>
          <h3 className={styles.learnStoryTitle}>{current.emoji} {current.name} 的故事</h3>
          <p className={styles.learnStoryText}>{current.story}</p>
          <div className={styles.learnTip}>💡 {current.healthTip}</div>
          
          <div className={styles.learnNav}>
            <button className={`${styles.learnNavBtn} ${styles.learnNavBtnPrimary}`} onClick={handleComplete}>
              ✅ 記住了，繼續下一個 →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function BodyMapSVG({
  currentPoint,
  clickedPoint,
  phase,
  hintUsed,
  onPointClick,
}: {
  currentPoint: (typeof LU_POINTS_DATA)[0]
  clickedPoint: string | null
  phase: Phase
  hintUsed: boolean
  onPointClick: (id: string) => void
}) {
  // Map LU points to SVG coordinates (viewBox 200x320)
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
      {/* Background */}
      <rect width="200" height="320" fill="#1a1a2e" rx="16" />

      {/* Body outline */}
      <g fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <ellipse cx="100" cy="28" rx="18" ry="22" />
        {/* Neck */}
        <line x1="93" y1="48" x2="93" y2="56" />
        <line x1="107" y1="48" x2="107" y2="56" />
        {/* Torso */}
        <path d="M 75 56 L 65 65 L 60 100 L 58 150 L 65 150 L 70 115 L 100 115 L 130 115 L 135 150 L 142 150 L 140 100 L 135 65 L 125 56 Z" fill="#2a2a4a" />
        {/* Left arm (viewer right) */}
        <path d="M 125 56 L 145 58 L 165 75 L 175 100 L 172 115 L 165 110 L 155 85 L 145 72 L 130 65 Z" fill="#2a2a4a" />
        {/* Right arm (viewer left) */}
        <path d="M 65 56 L 45 58 L 25 75 L 15 100 L 18 115 L 25 110 L 35 85 L 45 72 L 60 65 Z" fill="#2a2a4a" />
        {/* Legs */}
        <path d="M 70 150 L 68 200 L 62 250 L 60 290 L 75 290 L 78 250 L 82 200 L 85 150 Z" fill="#2a2a4a" />
        <path d="M 130 150 L 132 200 L 138 250 L 140 290 L 125 290 L 122 250 L 118 200 L 115 150 Z" fill="#2a2a4a" />
      </g>

      {/* Lung meridian dashed line (right side) */}
      <path
        d="M 120 20 Q 112 40 108 60 Q 100 80 90 100 Q 80 120 72 140 Q 64 160 56 180 Q 48 200 40 215"
        fill="none"
        stroke="#4fc3f7"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.6"
      />

      {/* Hint glow for current point */}
      {hintUsed && phase === 'learning' && (
        <circle
          cx={pointCoords[currentPoint.id]?.x || 100}
          cy={pointCoords[currentPoint.id]?.y || 100}
          r="16"
          fill="none"
          stroke="#fde047"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.5"
          className="hintPulse"
        />
      )}

      {/* Acupoints */}
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
            <text
              x={coord.x}
              y={coord.y + 3}
              textAnchor="middle"
              fontSize="5"
              fill="#e0d0b0"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {pt.id}
            </text>
          </g>
        )
      })}

      <text x="100" y="310" textAnchor="middle" fill="#c9a96e" fontSize="7" fontFamily="serif">
        肺經 (Lung Meridian)
      </text>
    </svg>
  )
}
