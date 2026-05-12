'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Body from 'react-muscle-highlighter'
import type { ExtendedBodyPart, Slug } from 'react-muscle-highlighter'
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
      setCorrectCount(prev => ({ ...prev, [pointId]: (prev[pointId] || 0) + 1 }))
      setTimeout(() => setPhase('story'), 1200)
    } else {
      setPhase('reveal')
      setTimeout(() => setPhase('story'), 2000)
    }
  }, [phase, current])

  const nextPoint = useCallback(() => {
    if (currentIdx + 1 >= todayPoints.length) {
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
    let p = markPointLearned(progress, current.id)
    const count = correctCount[current.id] || 0
    if (count >= 3) p = markPointMastered(p, current.id)
    p = { ...p, lastActiveDate: getTodayStr() }
    saveProgress(p)
    setProgress(p)
    nextPoint()
  }

  const showHint = () => setHintUsed(true)

  if (!progress || !current) {
    return <div className={styles.loading}><div className={styles.loadingInner}>🏮 加載中...</div></div>
  }

  if (phase === 'complete' as any || currentIdx >= todayPoints.length) {
    return (
      <div className={styles.learnContainer}>
        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🎉</div>
          <h2>今日學習完成！</h2>
          <p>已學習 {todayPoints.length} 個穴位</p>
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

      {/* Interactive Body with Acupoint Overlay */}
      <div className={styles.learnBodyArea}>
        <div className={styles.bodyWrapper}>
          {/* Muscle body background */}
          <Body
            data={[]}
            side="front"
            gender="male"
            scale={1.1}
            border="none"
            defaultFill="#2a2a4a"
            defaultStroke="#c9a96e"
            defaultStrokeWidth={1}
          />
          {/* Acupoint overlay */}
          <AcupointOverlay
            currentPoint={current}
            clickedPoint={clickedPoint}
            phase={phase}
            hintUsed={hintUsed}
            onPointClick={handlePointClick}
          />
        </div>
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

function AcupointOverlay({
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
  // Acupoint positions overlaid on the muscle body SVG
  // The body viewBox is roughly 500x800, we map LU points proportionally
  const pointCoords: Record<string, {x: string, y: string}> = {
    LU1:  { x: '62%', y: '6%' },
    LU2:  { x: '57%', y: '7%' },
    LU3:  { x: '38%', y: '11%' },
    LU4:  { x: '34%', y: '12%' },
    LU5:  { x: '32%', y: '16%' },
    LU6:  { x: '28%', y: '18%' },
    LU7:  { x: '24%', y: '20%' },
    LU8:  { x: '22%', y: '21%' },
    LU9:  { x: '20%', y: '22%' },
    LU10: { x: '18%', y: '23%' },
    LU11: { x: '16%', y: '24%' },
  }

  const coord = pointCoords[currentPoint.id]

  return (
    <div className={styles.acupointOverlay}>
      {/* Meridian line hint */}
      <svg className={styles.meridianOverlaySvg} viewBox="0 0 500 800" preserveAspectRatio="none">
        <path
          d="M 310 50 Q 285 100 240 170 Q 200 250 160 320 Q 120 390 90 450"
          fill="none"
          stroke="#4fc3f7"
          strokeWidth="2"
          strokeDasharray="6 4"
          opacity="0.5"
        />
      </svg>

      {/* Hint glow */}
      {hintUsed && phase === 'learning' && coord && (
        <div
          className={styles.acupointHintGlow}
          style={{ left: coord.x, top: coord.y }}
        />
      )}

      {/* All LU points */}
      {LU_POINTS_DATA.map(pt => {
        const c = pointCoords[pt.id]
        if (!c) return null
        const isCorrect = phase === 'correct' && clickedPoint === pt.id
        const isWrong = phase === 'reveal' && clickedPoint === pt.id
        const isRightAnswer = phase === 'reveal' && pt.id === currentPoint.id
        let cls = styles.acupointDot
        if (isCorrect) cls += ' ' + styles.acupointDotCorrect
        else if (isWrong) cls += ' ' + styles.acupointDotWrong
        else if (isRightAnswer) cls += ' ' + styles.acupointDotHint

        return (
          <button
            key={pt.id}
            className={cls}
            style={{ left: c.x, top: c.y }}
            onClick={() => onPointClick(pt.id)}
            disabled={phase !== 'learning'}
            title={pt.name}
          >
            <span className={styles.acupointDotLabel}>{pt.id}</span>
          </button>
        )
      })}
    </div>
  )
}
