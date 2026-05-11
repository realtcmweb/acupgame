'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LU_POINTS_DATA } from '../acupoints_data'
import { loadProgress, saveProgress, addCheckIn, getTodayStr } from '../progress'
import type { GameProgress, CheckInRecord } from '../progress'
import styles from '../page.module.css'

export default function CheckinPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [selectedPoint, setSelectedPoint] = useState(LU_POINTS_DATA[0].id)
  const [duration, setDuration] = useState('5')
  const [note, setNote] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [todayCheckins, setTodayCheckins] = useState<CheckInRecord[]>([])

  useEffect(() => {
    const p = loadProgress()
    setProgress(p)
    // Filter today's check-ins
    const today = getTodayStr()
    setTodayCheckins(p.checkIns.filter(c => c.date === today))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!progress) return

    const point = LU_POINTS_DATA.find(p => p.id === selectedPoint)
    if (!point) return

    const checkIn: CheckInRecord = {
      date: getTodayStr(),
      pointId: selectedPoint,
      pointName: point.name,
      durationMinutes: parseInt(duration),
      note: note.trim() || undefined,
    }

    let p = addCheckIn(progress, checkIn)
    // Update streak
    const today = getTodayStr()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    
    if (p.lastActiveDate === today) {
      // Already active today, streak unchanged
    } else if (p.lastActiveDate === yesterdayStr) {
      p = { ...p, lastActiveDate: today, streakDays: p.streakDays + 1 }
    } else {
      p = { ...p, lastActiveDate: today, streakDays: 1 }
    }

    saveProgress(p)
    setProgress(p)
    setTodayCheckins(prev => [...prev, checkIn])
    setShowSuccess(true)
    setNote('')
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (!progress) return <div className={styles.loading}><div className={styles.loadingInner}>🏮</div></div>

  return (
    <div className={styles.checkinContainer}>
      <Link href="/acupgame" className={styles.backBtn}>← 返回首頁</Link>

      <div className={styles.checkinHeader}>
        <h1 className={styles.checkinTitle}>🩺 養生打卡</h1>
        <p className={styles.checkinSubtitle}>記錄每日穴位按摩，養成健康好習慣</p>
      </div>

      {/* Stats */}
      <div className={styles.checkinStats}>
        <div className={styles.checkinStatItem}>
          <div className={styles.checkinStatNum}>{progress.streakDays}</div>
          <div className={styles.checkinStatLabel}>連續天數</div>
        </div>
        <div className={styles.checkinStatItem}>
          <div className={styles.checkinStatNum}>{progress.checkIns.length}</div>
          <div className={styles.checkinStatLabel}>總打卡次數</div>
        </div>
        <div className={styles.checkinStatItem}>
          <div className={styles.checkinStatNum}>{todayCheckins.length}</div>
          <div className={styles.checkinStatLabel}>今日打卡</div>
        </div>
      </div>

      {/* Check-in Form */}
      <form className={styles.checkinForm} onSubmit={handleSubmit}>
        <h2 className={styles.checkinFormTitle}>＋ 新增打卡</h2>

        <select
          className={styles.checkinPointSelect}
          value={selectedPoint}
          onChange={e => setSelectedPoint(e.target.value)}
        >
          {LU_POINTS_DATA.map(pt => (
            <option key={pt.id} value={pt.id}>
              {pt.name} ({pt.id}) - {pt.meridian}
            </option>
          ))}
        </select>

        <select
          className={styles.checkinDuration}
          value={duration}
          onChange={e => setDuration(e.target.value)}
        >
          <option value="3">3 分鐘</option>
          <option value="5">5 分鐘</option>
          <option value="10">10 分鐘</option>
          <option value="15">15 分鐘</option>
          <option value="20">20 分鐘以上</option>
        </select>

        <textarea
          className={styles.checkinNote}
          placeholder="記錄一下感受（選填）：例如「按完後睡得很好」"
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={200}
        />

        <button type="submit" className={styles.checkinSubmit}>
          ✅ 打卡完成
        </button>
      </form>

      {/* Success Message */}
      {showSuccess && (
        <div className={styles.checkinSuccess}>
          🎉 打卡成功！持續下去，健康長壽！
        </div>
      )}

      {/* Today's Check-ins */}
      {todayCheckins.length > 0 && (
        <div className={styles.checkinHistory}>
          <h2 className={styles.checkinHistoryTitle}>📅 今日打卡記錄</h2>
          <div className={styles.checkinHistoryList}>
            {todayCheckins.map((c, i) => (
              <div key={i} className={styles.checkinHistoryItem}>
                <div className={styles.checkinHistoryLeft}>
                  <div className={styles.checkinHistoryPoint}>✅ {c.pointName} ({c.pointId})</div>
                  <div className={styles.checkinHistoryDate}>{c.date}</div>
                  {c.note && <div className={styles.checkinHistoryNote}>「{c.note}」</div>}
                </div>
                <div className={styles.checkinHistoryDuration}>{c.durationMinutes}分鐘</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {progress.checkIns.length > 0 && (
        <div className={styles.checkinHistory} style={{ marginTop: 12 }}>
          <h2 className={styles.checkinHistoryTitle}>📋 歷史記錄</h2>
          <div className={styles.checkinHistoryList}>
            {progress.checkIns.slice().reverse().slice(0, 20).map((c, i) => (
              <div key={i} className={styles.checkinHistoryItem}>
                <div className={styles.checkinHistoryLeft}>
                  <div className={styles.checkinHistoryPoint}>✅ {c.pointName} ({c.pointId})</div>
                  <div className={styles.checkinHistoryDate}>{c.date}</div>
                  {c.note && <div className={styles.checkinHistoryNote}>「{c.note}」</div>}
                </div>
                <div className={styles.checkinHistoryDuration}>{c.durationMinutes}分鐘</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
