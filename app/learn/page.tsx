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
type BodyRegion = 'chest' | 'arm' | 'forearm' | 'hand'

// Region definitions: which part of the body to zoom into
const REGION_ZOOM: Record<string, { viewBox: string; label: string }> = {
  chest:    { viewBox: '140 200 350 300', label: '胸腹部' },
  arm:      { viewBox: '55 270 130 280',  label: '上臂' },
  forearm:  { viewBox: '55 540 130 320',  label: '前臂' },
  hand:     { viewBox: '20 860 180 250',  label: '手掌' },
}

// Map LU points to body regions
function getPointRegion(pointId: string): BodyRegion {
  const num = parseInt(pointId.replace('LU', ''))
  if (num <= 2) return 'chest'
  if (num <= 4) return 'arm'
  if (num <= 7) return 'forearm'
  return 'hand'
}

// Acupoint positions per region (viewBox-relative percentages)
const REGION_POINT_COORDS: Record<string, Record<string, {x: number, y: number}>> = {
  chest: {
    LU1: { x: 38, y: 32 },
    LU2: { x: 48, y: 32 },
  },
  arm: {
    LU3: { x: 42, y: 20 },
    LU4: { x: 38, y: 55 },
  },
  forearm: {
    LU5: { x: 35, y: 15 },
    LU6: { x: 33, y: 45 },
    LU7: { x: 28, y: 80 },
  },
  hand: {
    LU8:  { x: 45, y: 25 },
    LU9:  { x: 42, y: 42 },
    LU10: { x: 30, y: 60 },
    LU11: { x: 22, y: 75 },
  },
}

// Meridian path per region (SVG path data)
const REGION_MERIDIAN: Record<string, string> = {
  chest:   'M 280 30 Q 260 60 240 100',
  arm:     'M 300 120 Q 270 200 220 320',
  forearm: 'M 210 80 Q 200 220 185 380',
  hand:    'M 180 30 Q 160 60 140 120 Q 100 180 60 220',
}

export default function LearnPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('learning')
  const [clickedPoint, setClickedPoint] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState<Record<string, number>>({})
  const [hintUsed, setHintUsed] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<BodyRegion>('chest')

  const todayPoints = LU_POINTS_DATA

  useEffect(() => {
    const p = loadProgress()
    setProgress(p)
    // Auto-select region based on current point
    if (p && todayPoints[0]) {
      setSelectedRegion(getPointRegion(todayPoints[0].id))
    }
  }, [])

  const current = todayPoints[currentIdx]

  // Auto-switch region when point changes
  useEffect(() => {
    if (current) {
      setSelectedRegion(getPointRegion(current.id))
    }
  }, [currentIdx])

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

  // Points in current region
  const regionCoords = REGION_POINT_COORDS[selectedRegion] || {}
  const regionPoints = LU_POINTS_DATA.filter(pt => regionCoords[pt.id])

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

      {/* Region Selector */}
      <div className={styles.regionSelector}>
        {(['chest', 'arm', 'forearm', 'hand'] as BodyRegion[]).map(region => (
          <button
            key={region}
            className={`${styles.regionBtn} ${selectedRegion === region ? styles.regionBtnActive : ''}`}
            onClick={() => setSelectedRegion(region)}
          >
            {REGION_ZOOM[region].label}
          </button>
        ))}
      </div>

      {/* Split View: Full Body + Zoomed Region */}
      <div className={styles.learnSplitView}>
        {/* Left: Full body with region highlight */}
        <div className={styles.fullBodyPanel}>
          <div className={styles.bodyWrapper}>
            <Body
              data={[]}
              side="front"
              gender="male"
              scale={0.85}
              border="#c9a96e"
              defaultFill="#2a2a4a"
              defaultStroke="#c9a96e"
              defaultStrokeWidth={1}
            />
            {/* Region hotspots */}
            {(['chest', 'arm', 'forearm', 'hand'] as BodyRegion[]).map(region => {
              const coords = getRegionHotspotCoords(region)
              return (
                <button
                  key={region}
                  className={`${styles.regionHotspot} ${selectedRegion === region ? styles.regionHotspotActive : ''}`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  onClick={() => setSelectedRegion(region)}
                  title={REGION_ZOOM[region].label}
                />
              )
            })}
          </div>
        </div>

        {/* Right: Zoomed region with acupoints */}
        <div className={styles.zoomedPanel}>
          <div className={styles.zoomedLabel}>{REGION_ZOOM[selectedRegion].label}</div>
          <svg
            viewBox={REGION_ZOOM[selectedRegion].viewBox}
            className={styles.zoomedSvg}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect x="0" y="0" width="100%" height="100%" fill="#1a1a2e" rx="12" />

            {/* Simplified body part outline */}
            <BodyPartOutline region={selectedRegion} />

            {/* Meridian path */}
            <path
              d={REGION_MERIDIAN[selectedRegion]}
              fill="none"
              stroke="#4fc3f7"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />

            {/* Hint glow */}
            {hintUsed && phase === 'learning' && regionCoords[current.id] && (
              <circle
                cx={regionCoords[current.id].x + '%'}
                cy={regionCoords[current.id].y + '%'}
                r="6%"
                fill="none"
                stroke="#fde047"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.6"
                className="hintPulse"
              />
            )}

            {/* Acupoints */}
            {LU_POINTS_DATA.map(pt => {
              const coord = regionCoords[pt.id]
              if (!coord) return null
              const isCorrect = phase === 'correct' && clickedPoint === pt.id
              const isWrong = phase === 'reveal' && clickedPoint === pt.id
              const isRightAnswer = phase === 'reveal' && pt.id === current.id
              let cls = styles.zoomedAcupoint
              if (isCorrect) cls += ' ' + styles.zoomedAcupointCorrect
              else if (isWrong) cls += ' ' + styles.zoomedAcupointWrong
              else if (isRightAnswer) cls += ' ' + styles.zoomedAcupointHint

              return (
                <g
                  key={pt.id}
                  onClick={() => handlePointClick(pt.id)}
                  style={{ cursor: phase === 'learning' ? 'pointer' : 'default' }}
                >
                  <circle
                    cx={`${coord.x}%`}
                    cy={`${coord.y}%`}
                    r="5%"
                    className={cls}
                  />
                  <text
                    x={`${coord.x}%`}
                    y={`${coord.y}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3.5%"
                    fontWeight="bold"
                    fill="#1a1a2e"
                    fontFamily="sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {pt.id}
                  </text>
                </g>
              )
            })}
          </svg>
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

// Hotspot position on full body (percentage)
function getRegionHotspotCoords(region: BodyRegion): {x: number, y: number} {
  switch (region) {
    case 'chest':    return { x: 32, y: 22 }
    case 'arm':      return { x: 20, y: 30 }
    case 'forearm':  return { x: 16, y: 48 }
    case 'hand':     return { x: 14, y: 65 }
  }
}

// Simplified body part outline for zoomed view
function BodyPartOutline({ region }: { region: BodyRegion }) {
  const outlines: Record<string, React.ReactNode> = {
    chest: (
      <g fill="#3a3a5a" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Chest outline */}
        <path d="M 140 260 Q 180 250 240 255 Q 300 260 340 265 Q 350 280 345 310 Q 340 340 320 360 L 280 370 L 220 370 L 180 360 Q 160 340 155 310 Q 150 280 155 265 Z" />
        {/* Shoulder connections */}
        <path d="M 155 265 Q 120 280 80 340 L 90 350 Q 140 300 160 280 Z" opacity="0.6" />
        <path d="M 345 265 Q 380 280 420 340 L 410 350 Q 360 300 340 280 Z" opacity="0.6" />
      </g>
    ),
    arm: (
      <g fill="#3a3a5a" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Upper arm */}
        <path d="M 55 280 Q 50 320 52 380 Q 55 430 60 470 L 95 480 Q 100 430 100 380 Q 100 330 98 290 Z" />
        {/* Deltoid */}
        <path d="M 55 280 Q 80 270 98 290 Q 100 310 98 330 L 55 320 Q 50 300 55 280 Z" opacity="0.8" />
      </g>
    ),
    forearm: (
      <g fill="#3a3a5a" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Forearm */}
        <path d="M 55 540 Q 50 600 52 660 Q 55 720 60 780 Q 65 830 70 860 L 100 870 Q 105 830 105 780 Q 105 720 102 660 Q 100 600 98 540 Z" />
        {/* Elbow hint */}
        <ellipse cx="78" cy="640" rx="18" ry="12" fill="none" stroke="#c9a96e" strokeWidth="1.5" opacity="0.4" />
      </g>
    ),
    hand: (
      <g fill="#3a3a5a" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Palm */}
        <path d="M 60 920 Q 50 960 52 1000 Q 55 1040 70 1080 L 120 1100 Q 140 1060 145 1020 Q 148 980 140 940 Q 120 920 100 920 Z" />
        {/* Thumb */}
        <path d="M 60 920 Q 35 900 25 880 Q 20 860 30 850 Q 45 845 55 860 Q 65 875 70 900 Z" />
        {/* Fingers */}
        <path d="M 80 920 Q 75 870 70 850 L 85 850 Q 90 870 95 920 Z" />
        <path d="M 100 920 Q 95 860 92 840 L 108 840 Q 110 860 115 920 Z" />
        <path d="M 120 930 Q 115 870 112 850 L 128 850 Q 130 870 135 930 Z" />
      </g>
    ),
  }
  return outlines[region] || null
}