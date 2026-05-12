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

const REGION_ZOOM: Record<string, { viewBox: string; label: string }> = {
  chest:    { viewBox: '220 290 280 280', label: '胸面部（肺經起點）' },
  arm:      { viewBox: '100 290 220 300', label: '上臂（天府至俠白）' },
  forearm:  { viewBox: '50 580 180 320',  label: '前臂（尺澤至列缺）' },
  hand:     { viewBox: '30 700 180 280',  label: '手掌（經渠至少商）' },
}

const REGION_PATHS: Record<string, { paths: string[], fill: string, stroke: string }[]> = {
  chest: [
    // deltoids (shoulder)
    { paths: ['M274.06 311.69q3.94 2.77 4.33 8.14.04.48-.38.73c-9.98 5.88-24.35 7.45-28.82 19.75-2.31 6.36-.97 17.35-1.43 23.68q-.55 7.51-5.73 14.07-10.37 13.11-13.81 16.67c-3.41 3.53-6.81 1.76-10.69-.47-15.42-8.87-24.95-25.45-22.52-43.22 2.05-14.92 12.71-25.79 24.06-35.02 16.99-13.82 35.58-17.99 54.99-4.33z'], fill: '#3a3a5a', stroke: '#c9a96e' },
    // chest
    { paths: ['M272.91 422.84c-18.95-17.19-22-57-12.64-78.79 5.57-12.99 26.54-24.37 39.97-25.87q20.36-2.26 37.02.75c9.74 1.76 16.13 15.64 18.41 25.04 3.99 16.48 3.23 31.38 1.67 48.06q-1.35 14.35-2.05 16.89c-6.52 23.5-38.08 29.23-58.28 24.53-9.12-2.12-17.24-4.38-24.1-10.61z'], fill: '#3a3a5a', stroke: '#c9a96e' },
  ],
  arm: [
    // biceps
    { paths: ['M189.52 492.51c-2.43.62-7.38.57-7.51-3.08-.56-16.01-.42-35.49 5.11-50.26 3.19-8.54 13.89-30.22 23.27-32.72 10.08-2.68 12.68 16.59 12.6 22.8-.22 15.98-7.51 34.79-15.05 48.71-4.29 7.94-9.95 12.38-18.42 14.55z'], fill: '#3a3a5a', stroke: '#c9a96e' },
    // triceps
    { paths: ['M206.2 514.2c-5.41-.67-6.55-7.29-4.69-11.42 11.08-24.55 22.84-50.62 30.54-75.51 1.37-4.41 3.08-8.59 3.95-12.45q2.94-13.12 5.79-26.26.42-1.98 1.82-3.39a.52.52 0 01.81.1q1.04 1.69 1.94 4.56 4.63 14.65 5.15 24.92c.57 11.36-5.11 24.55-8.65 35.5q-7.69 23.78-20.25 45.39c-2.45 4.23-11.51 19.18-16.41 18.56z'], fill: '#3a3a5a', stroke: '#c9a96e' },
  ],
  forearm: [
    // forearm flexors
    { paths: [
      'M127.23 683.05c-4.07-2.12 1.27-27.07 2.25-31.57 4.98-23.03 9.17-46.17 13.91-69.25q1.53-7.47 2.13-15.13c.93-12.09.81-22.15 6.23-31.59 7.1-12.33 13.54-29.16 26.1-36.73a1.98 1.97 62.7 012.84.91c1.92 4.48 1.93 8.28 2.06 14.15.44 19.77-1.3 41.04-8.72 59.67-11 27.62-22.22 55.21-32.62 82.91-4.04 10.76-7.56 20.66-12.82 26.39q-.59.65-1.36.24z',
      'M201.5 527.4a.84.84 0 01.67.65c3.98 17.15-2.93 39.36-10.95 54.41-4.6 8.63-13.06 20.43-18.21 31.33q-13.21 27.92-24.58 56.64-2.51 6.35-6.61 11.02a1.43 1.43 0 01-2.5-.81q-.36-3.78.84-7.17 10.31-29.18 21.57-57.99c6.32-16.18 14.55-31.65 20.66-47.87 3.69-9.82 5.36-22.36 7.32-30.62 1.49-6.27 4.19-11.06 11.79-9.59z',
    ], fill: '#3a3a5a', stroke: '#c9a96e' },
  ],
  hand: [
    // hands - fingers and palm
    { paths: [
      'M100.98 745.85c-9.03-6.62-15.78-13.18-13.3-24.59 2.67-12.29 15.01-20.6 25.37-26.41q6.63-3.73 12.78-8.14 2.27-1.62 4.57-1.86 4.21-.44 6.71 3.37 4.49 6.87 9.45 13.38 6.04 7.93 13.32 14.85c1.4 1.33 1.54 3.38-.12 4.54q-11.16 7.8-21.64 16.49c-3.55 2.95-15.4 15.43-19.93 15.32q-1.35-.04-2.43-1.28c-2.37-2.72-4.19-5.9-6.93-8.03-2.92-2.28-6.13-4.15-8.85-6.64z',
      'M53.81 746.32a.91.91 0 01-.74-.95c.14-2.49-.23-6.34 2.25-7.8 4.66-2.71 11.37-5.5 14.79-10.03q1.24-1.65 2.77-2.35a.42.42 0 01.65.33c-.24 9.07-2.05 17.46-7.16 24.65-2.73 3.86-7.54 10.18-12.65 10.16a1.19 1.19 0 01-.82-.34q-2.34-2.55.91-14.67z',
      'M87.21 745.05c1.44.46 8.14 2.66 8.61 4.55 1.26 5.12-4.42 8.54-7 12.25-7.73 11.1-13.55 22.3-18.23 34.77q-.43 1.16-1.7.98-2.42-.32-2.32-2.98.08-2.11.96-4.1c6.04-13.81 15.25-26.46 20.68-45.47z',
    ], fill: '#3a3a5a', stroke: '#c9a96e' },
  ],
}

// Region definitions for each body part (viewBox 724x1448)
function getPointRegion(pointId: string): BodyRegion {
  const num = parseInt(pointId.replace('LU', ''))
  if (num <= 2) return 'chest'
  if (num <= 4) return 'arm'
  if (num <= 7) return 'forearm'
  return 'hand'
}

// Acupoint positions in the original 724x1448 coordinate space
const ALL_POINT_COORDS: Record<string, {x: number, y: number}> = {
  LU1:  { x: 310, y: 275 },  // 中府
  LU2:  { x: 340, y: 270 },  // 雲門
  LU3:  { x: 175, y: 400 },  // 天府
  LU4:  { x: 178, y: 460 },  // 俠白
  LU5:  { x: 170, y: 540 },  // 尺澤
  LU6:  { x: 165, y: 600 },  // 孔最
  LU7:  { x: 158, y: 680 },  // 列缺
  LU8:  { x: 150, y: 720 },  // 經渠
  LU9:  { x: 148, y: 750 },  // 太淵
  LU10: { x: 140, y: 820 },  // 魚際
  LU11: { x: 120, y: 860 },  // 少商
}

// Convert 724x1448 coords to percentage within a region viewBox
function regionCoords(region: BodyRegion): Record<string, {x: string, y: string}> {
  const regionBoxes: Record<string, [number, number, number, number]> = {
    chest:    [220, 290, 280, 280],
    arm:      [100, 290, 220, 300],
    forearm:  [50,  580, 180, 320],
    hand:     [30,  700, 180, 280],
  }
  const [vx, vy, vw, vh] = regionBoxes[region]
  const coords = ALL_POINT_COORDS

  const result: Record<string, {x: string, y: string}> = {}
  for (const [ptId, ptCoord] of Object.entries(coords)) {
    // Check if point is in this region
    const inRegion = (
      (region === 'chest' && ['LU1','LU2'].includes(ptId)) ||
      (region === 'arm' && ['LU3','LU4'].includes(ptId)) ||
      (region === 'forearm' && ['LU5','LU6','LU7'].includes(ptId)) ||
      (region === 'hand' && ['LU8','LU9','LU10','LU11'].includes(ptId))
    )
    if (inRegion) {
      const px = ((ptCoord.x - vx) / vw * 100).toFixed(1)
      const py = ((ptCoord.y - vy) / vh * 100).toFixed(1)
      result[ptId] = { x: `${px}%`, y: `${py}%` }
    }
  }
  return result
}

// Meridian path per region (in original 724x1448 space, will be transformed)
const MERIDIAN_PATHS: Record<string, string> = {
  chest:    'M 310 290 Q 295 310 280 340 Q 270 360 265 390',
  arm:      'M 175 410 Q 170 450 172 520 Q 173 560 175 600',
  forearm:  'M 168 550 Q 165 600 160 660 Q 156 700 152 720',
  hand:     'M 150 730 Q 145 760 140 800 Q 130 840 120 860',
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
    if (p && todayPoints[0]) {
      setSelectedRegion(getPointRegion(todayPoints[0].id))
    }
  }, [])

  const current = todayPoints[currentIdx]

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

  const regionPaths = REGION_PATHS[selectedRegion] || []
  const pointCoords = regionCoords(selectedRegion)

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
            {REGION_ZOOM[region].label.split('（')[0]}
          </button>
        ))}
      </div>

      {/* Split View */}
      <div className={styles.learnSplitView}>
        {/* Left: Full body */}
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

        {/* Right: Zoomed region */}
        <div className={styles.zoomedPanel}>
          <div className={styles.zoomedLabel}>{REGION_ZOOM[selectedRegion].label}</div>
          <svg
            viewBox={REGION_ZOOM[selectedRegion].viewBox}
            className={styles.zoomedSvg}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect x="0" y="0" width="100%" height="100%" fill="#1a1a2e" rx="12" />

            {/* Body part paths (scaled to viewBox) */}
            {regionPaths.map((group, gi) => (
              <g key={gi} fill={group.fill} stroke={group.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                {group.paths.map((d, pi) => (
                  <path key={pi} d={d} opacity="0.85" />
                ))}
              </g>
            ))}

            {/* Meridian dashed line */}
            <path
              d={MERIDIAN_PATHS[selectedRegion]}
              fill="none"
              stroke="#4fc3f7"
              strokeWidth="2"
              strokeDasharray="5 4"
              opacity="0.6"
            />

            {/* Hint glow */}
            {hintUsed && phase === 'learning' && pointCoords[current.id] && (
              <circle
                cx={pointCoords[current.id].x}
                cy={pointCoords[current.id].y}
                r="12"
                fill="none"
                stroke="#fde047"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.7"
                className="hintPulse"
              />
            )}

            {/* Acupoints */}
            {LU_POINTS_DATA.map(pt => {
              const coord = pointCoords[pt.id]
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
                  <circle cx={coord.x} cy={coord.y} r="8" className={cls} />
                  <text
                    x={coord.x}
                    y={coord.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="3.5"
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

// Hotspot positions on full body (724x1448 viewBox)
function getRegionHotspotCoords(region: BodyRegion): {x: number, y: number} {
  switch (region) {
    case 'chest':    return { x: 38, y: 23 }
    case 'arm':      return { x: 22, y: 32 }
    case 'forearm':  return { x: 20, y: 48 }
    case 'hand':     return { x: 17, y: 60 }
  }
}