'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LU_POINTS_DATA } from '../acupoints_data'
import { loadProgress, saveProgress } from '../progress'
import type { GameProgress } from '../progress'
import styles from '../page.module.css'

// === Types ===
interface Question {
  pointId: string
  name: string
  pinyin: string
  location: string
  emoji: string
  hint?: string
}

type Phase = string

// === Shuffle helper ===
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// === Generate 10 questions ===
function generateQuiz(): Question[] {
  const shuffled = shuffle(LU_POINTS_DATA)
  return shuffled.slice(0, 10).map(pt => ({
    pointId: pt.id,
    name: pt.name,
    pinyin: pt.pinyin,
    location: pt.location,
    emoji: pt.emoji,
  }))
}

// === SVG point coords (viewBox 200x320) ===
const POINT_COORDS: Record<string, {x: number; y: number}> = {
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

// === Point ID → full data ===
const POINT_MAP = Object.fromEntries(LU_POINTS_DATA.map(p => [p.id, p]))

// === Main Component ===
export default function GamePage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('start')
  const [clickedPoint, setClickedPoint] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)

  useEffect(() => {
    const p = loadProgress()
    setProgress(p)
    setStreak(p.streakDays || 0)
  }, [])

  const currentQ = questions[qIndex]

  const startQuiz = useCallback(() => {
    setQuestions(generateQuiz())
    setQIndex(0)
    setPhase('question')
    setCorrectCount(0)
    setClickedPoint(null)
    setHintUsed(false)
  }, [])

  const handlePointClick = useCallback((id: string) => {
    if (phase !== 'question') return
    setClickedPoint(id)
    const correct = id === questions[qIndex].pointId
    if (correct) {
      setPhase('correct')
      setCorrectCount(c => c + 1)
      setStreak(s => s + 1)
      setTimeout(() => setPhase('story'), 1500)
    } else {
      setPhase('wrong')
      setStreak(0) // gentle: wrong breaks streak but doesn't penalize
      setTimeout(() => setPhase('story'), 2500)
    }
  }, [phase, qIndex, questions])

  const handleNext = useCallback(() => {
    if (qIndex + 1 >= questions.length) {
      setPhase('done')
    } else {
      setQIndex(i => i + 1)
      setPhase('question')
      setClickedPoint(null)
      setHintUsed(false)
    }
  }, [qIndex, questions])

  const handleComplete = () => {
    if (!progress) return
    // Save progress
    const newProgress = {
      ...progress,
      currentStreak: streak,
      totalCorrect: (progress.totalCorrect || 0) + correctCount,
    }
    saveProgress(newProgress)
    setProgress(newProgress)
  }

  // === Start Screen ===
  if (phase === 'start') {
    return (
      <div className={styles.learnContainer}>
        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🏆</div>
          <h2 className={styles.endTitle}>每日挑戰</h2>
          <p className={styles.endSubtitle}>完成10道題，鞏固所學知識</p>
          <div className={styles.gameRules}>
            <div className={styles.gameRule}><span>📖</span> 10道肺經穴位題</div>
            <div className={styles.gameRule}><span>🌿</span> 無計時，慢慢想</div>
            <div className={styles.gameRule}><span>🔥</span> 連勝中斷不扣分</div>
            <div className={styles.gameRule}><span>💾</span> 自動存檔進度</div>
          </div>
          <button className={styles.bigBtn} onClick={startQuiz}>
            ▶️ 開始挑戰
          </button>
          <Link href="/acupgame" className={styles.btnSecondary}>← 返回首頁</Link>
        </div>
      </div>
    )
  }

  // === Done Screen ===
  if ((phase === 'done')) {
    const accuracy = Math.round((correctCount / questions.length) * 100)
    return (
      <div className={styles.learnContainer}>
        <div className={styles.endScreen}>
          <div className={styles.endEmoji}>🎉</div>
          <h2 className={styles.endTitle}>今日完成！</h2>
          <p className={styles.endSubtitle}>肺經學習更进一步</p>
          <div className={styles.gameStats}>
            <div className={styles.gameStat}>
              <span className={styles.gameStatNum}>{correctCount}</span>
              <span className={styles.gameStatLabel}>正確</span>
            </div>
            <div className={styles.gameStat}>
              <span className={styles.gameStatNum}>{questions.length - correctCount}</span>
              <span className={styles.gameStatLabel}>還需鞏固</span>
            </div>
            <div className={styles.gameStat}>
              <span className={styles.gameStatNum}>{accuracy}%</span>
              <span className={styles.gameStatLabel}>準確率</span>
            </div>
          </div>
          <div className={styles.gameStreakBadge}>
            <span>🔥 {streak} 連勝</span>
          </div>
          <button className={styles.bigBtn} onClick={() => {
            handleComplete()
            startQuiz()
          }}>
            🔄 再玩一次
          </button>
          <Link href="/acupgame" className={styles.btnSecondary} onClick={handleComplete}>
            ← 返回首頁
          </Link>
        </div>
      </div>
    )
  }

  if (!currentQ) return null

  const currentData = POINT_MAP[currentQ.pointId]

  return (
    <div className={styles.learnContainer}>
      {/* Header */}
      <div className={styles.learnHeader}>
        <Link href="/acupgame" className={styles.backBtn}>← 返回</Link>
        <div className={styles.learnProgress}>
          {qIndex + 1} / {questions.length}
        </div>
        <div className={styles.gameStreak}>
          🔥 {streak}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.gameProgressBar}>
        <div
          className={styles.gameProgressFill}
          style={{ width: `${((qIndex + ((phase === 'done') ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Body Map */}
      <div className={styles.learnBodyArea}>
        <GameBodyMap
          correctId={currentQ.pointId}
          clickedPoint={clickedPoint}
          phase={phase}
          hintUsed={hintUsed}
          location={currentQ.location}
          onPointClick={handlePointClick}
        />
      </div>

      {/* Question */}
      <div className={styles.learnQuestion}>
        <div className={styles.learnQuestionLabel}>請點擊穴位位置</div>
        <div className={styles.learnQuestionName}>{currentQ.emoji} {currentQ.name}</div>
        <div className={styles.learnQuestionPinyin}>{currentQ.pinyin}</div>
      </div>

      {/* Feedback */}
      {phase === 'correct' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackCorrect}`}>
          ✅ 正確！太棒了！
        </div>
      )}
      {phase === 'wrong' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackWrong}`}>
          📍 正確位置是：{currentQ.name}
        </div>
      )}

      {/* Hint */}
      {phase === 'question' && !hintUsed && (
        <button className={styles.learnNavBtn} onClick={() => setHintUsed(true)}>
          💡 需要提示？
        </button>
      )}
      {hintUsed && phase === 'question' && (
        <div className={`${styles.learnFeedback} ${styles.learnFeedbackHint}`}>
          💡 {currentQ.location.substring(0, 20)}...
        </div>
      )}

      {/* Story */}
      {phase === 'story' && currentData && (
        <div className={styles.learnStory}>
          <h3 className={styles.learnStoryTitle}>{currentData.emoji} {currentQ.name}</h3>
          <p className={styles.learnStoryText}>{currentData.story}</p>
          <div className={styles.learnTip}>💡 {currentData.healthTip}</div>
          <div className={styles.learnNav}>
            <button className={`${styles.learnNavBtn} ${styles.learnNavBtnPrimary}`} onClick={handleNext}>
              {qIndex + 1 >= questions.length ? '🏆 完成!' : '→ 下一題'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// === Game Body Map SVG ===
function GameBodyMap({
  correctId,
  clickedPoint,
  phase,
  hintUsed,
  location,
  onPointClick,
}: {
  correctId: string
  clickedPoint: string | null
  phase: Phase
  hintUsed: boolean
  location: string
  onPointClick: (id: string) => void
}) {
  const isCorrect = (id: string) => phase === 'correct' && clickedPoint === id
  const isWrong = (id: string) => phase === 'wrong' && clickedPoint === id
  const isRightAnswer = (id: string) => phase === 'wrong' && id === correctId

  return (
    <svg viewBox="0 0 200 320" className={styles.learnBodySvg} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="200" height="320" fill="#1a1a2e" rx="16" />

      {/* Body outline */}
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

      {/* Lung meridian dashed line */}
      <path
        d="M 120 20 Q 112 40 108 60 Q 100 80 90 100 Q 80 120 72 140 Q 64 160 56 180 Q 48 200 40 215"
        fill="none"
        stroke="#4fc3f7"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.5"
      />

      {/* Hint glow */}
      {hintUsed && phase === 'question' && (
        <circle
          cx={POINT_COORDS[correctId]?.x || 100}
          cy={POINT_COORDS[correctId]?.y || 100}
          r="18"
          fill="none"
          stroke="#fde047"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.6"
        />
      )}

      {/* Acupoints */}
      {LU_POINTS_DATA.map(pt => {
        const coord = POINT_COORDS[pt.id]
        if (!coord) return null
        let cls = styles.acupoint
        if (isCorrect(pt.id)) cls += ' ' + styles.acupointCorrect
        else if (isWrong(pt.id)) cls += ' ' + styles.acupointWrong
        else if (isRightAnswer(pt.id)) cls += ' ' + styles.acupointHint

        return (
          <g key={pt.id} onClick={() => phase === 'question' && onPointClick(pt.id)}
             style={{ cursor: phase === 'question' ? 'pointer' : 'default' }}>
            <circle cx={coord.x} cy={coord.y} r="7" className={cls} />
            <text x={coord.x} y={coord.y + 3} textAnchor="middle" fontSize="5" fill="#e0d0b0"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
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