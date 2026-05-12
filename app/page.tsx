'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadProgress, saveProgress, updateStreak, generateDailyHomework, getTodayStr, type GameProgress } from './progress'
import styles from './page.module.css'

export default function HomePage() {
  const [progress, setProgress] = useState<GameProgress | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'daily'>('home')

  useEffect(() => {
    let p = loadProgress()
    p = updateStreak(p)
    saveProgress(p)
    
    // 檢查是否需要生成新功課
    if (p.lastHomeworkDate !== getTodayStr()) {
      p = { ...p, todayHomework: generateDailyHomework(p), lastHomeworkDate: getTodayStr() }
      saveProgress(p)
    }
    setProgress(p)
  }, [])

  if (!progress) return <div className={styles.loading}><div className={styles.loadingInner}>🏮 加載中...</div></div>

  const hw = progress.todayHomework
  const learnedCount = progress.learnedPoints.length
  const totalPoints = 11 // 肺經

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.appTitle}>🏆 經穴大師</h1>
          <p className={styles.appSubtitle}>輕鬆學穴位，健康又長壽</p>
        </div>
        <div className={styles.streakBadge}>
          <span className={styles.streakNum}>{progress.streakDays}</span>
          <span className={styles.streakLabel}>天連續</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{learnedCount}</span>
          <span className={styles.statLabel}>已學穴位</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{progress.totalCorrect}</span>
          <span className={styles.statLabel}>答對次數</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{progress.checkIns.length}</span>
          <span className={styles.statLabel}>養生打卡</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === 'home' ? styles.tabActive : ''}`} onClick={() => setActiveTab('home')}>📖 首頁</button>
        <button className={`${styles.tabBtn} ${activeTab === 'learn' ? styles.tabActive : ''}`} onClick={() => setActiveTab('learn')}>🎯 學習</button>
        <button className={`${styles.tabBtn} ${activeTab === 'daily' ? styles.tabActive : ''}`} onClick={() => setActiveTab('daily')}>📅 功課</button>
      </div>

      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className={styles.tabContent}>
          {/* 每日養生功課 Card */}
          {hw && (
            <div className={styles.hwCard}>
              <div className={styles.hwHeader}>
                <h2 className={styles.hwTitle}>📅 今日養生功課</h2>
                {hw.completed && <span className={styles.hwDone}>✅ 已完成</span>}
              </div>
              <p className={styles.hwDesc}>今日學習 {hw.points.length} 個穴位，輕鬆掌握養生知識</p>
              <div className={styles.hwPoints}>
                {hw.points.map(pid => (
                  <span key={pid} className={styles.hwPoint}>{pid}</span>
                ))}
              </div>
              <Link href="daily" className={styles.hwBtn}>
                {hw.completed ? '🔄 複習功課' : '▶️ 開始今日功課'}
              </Link>
            </div>
          )}

          {/* 症狀推薦入口 */}
          <div className={styles.menuCard}>
            <h3 className={styles.menuTitle}>🩺 症狀推薦</h3>
            <p className={styles.menuDesc}>根據不舒服的症狀，推薦對應穴位</p>
            <Link href="symptom" className={styles.menuBtn}>看看今天按什麼</Link>
          </div>

          {/* 穴位學習入口 */}
          <div className={styles.menuCard}>
            <h3 className={styles.menuTitle}>🎯 穴位學習</h3>
            <p className={styles.menuDesc}>無計時、無失敗，慢慢記住每個穴位</p>
            <Link href="learn" className={styles.menuBtn}>進入學習</Link>
          </div>

          {/* 每日挑戰入口 */}
          <div className={styles.menuCard}>
            <h3 className={styles.menuTitle}>🏆 每日挑戰</h3>
            <p className={styles.menuDesc}>每天10道題，輕鬆鞏固所學</p>
            <Link href="game" className={styles.menuBtn}>進入挑戰</Link>
          </div>

          {/* 穴位故事入口 */}
          <div className={styles.menuCard}>
            <h3 className={styles.menuTitle}>📚 穴位故事</h3>
            <p className={styles.menuDesc}>了解每個穴位的由來與功效</p>
            <Link href="stories" className={styles.menuBtn}>閱讀故事</Link>
          </div>

          {/* 養生打卡入口 */}
          <div className={styles.menuCard}>
            <h3 className={styles.menuTitle}>🩺 養生打卡</h3>
            <p className={styles.menuDesc}>記錄每日按摩穴位，養成健康好習慣</p>
            <Link href="checkin" className={styles.menuBtn}>去打卡</Link>
          </div>

          {/* 學習進度 */}
          <div className={styles.progressCard}>
            <h3 className={styles.menuTitle}>📊 肺經學習進度</h3>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(learnedCount / totalPoints) * 100}%` }} />
            </div>
            <p className={styles.progressText}>{learnedCount} / {totalPoints} 穴位</p>
          </div>
        </div>
      )}

      {/* Learn Tab */}
      {activeTab === 'learn' && (
        <div className={styles.tabContent}>
          <div className={styles.learnHeader}>
            <h2 className={styles.learnTitle}>🎯 緩慢闯關</h2>
            <p className={styles.learnSubtitle}>沒有時間限制，沒有失敗，慢慢學</p>
          </div>
          <div className={styles.meridianGrid}>
            <MeridianCard code="LU" name="肺經" emoji="🫁" learned={learnedCount} total={totalPoints} active={true} />
            <MeridianCard code="LI" name="大腸經" emoji="💨" learned={0} total={20} active={false} />
            <MeridianCard code="HT" name="心經" emoji="❤️" learned={0} total={9} active={false} />
            <MeridianCard code="SP" name="脾經" emoji="🩸" learned={0} total={21} active={false} />
            <MeridianCard code="ST" name="胃經" emoji="🍽️" learned={0} total={45} active={false} />
            <MeridianCard code="KI" name="腎經" emoji="⚡" learned={0} total={27} active={false} />
            <MeridianCard code="SI" name="小腸經" emoji="🔥" learned={0} total={19} active={false} />
            <MeridianCard code="BL" name="膀胱經" emoji="💧" learned={0} total={67} active={false} />
            <MeridianCard code="PC" name="心包經" emoji="💝" learned={0} total={9} active={false} />
            <MeridianCard code="SJ" name="三焦經" emoji="🌡️" learned={0} total={23} active={false} />
            <MeridianCard code="GB" name="膽經" emoji="💚" learned={0} total={44} active={false} />
            <MeridianCard code="LR" name="肝經" emoji="🌱" learned={0} total={14} active={false} />
            <MeridianCard code="RN" name="任脈" emoji="🌙" learned={0} total={24} active={false} />
            <MeridianCard code="DV" name="督脈" emoji="☀️" learned={0} total={28} active={false} />
          </div>
          {learnedCount > 0 && (
            <Link href="learn" className={styles.bigBtn}>▶️ 繼續學習肺經</Link>
          )}
        </div>
      )}

      {/* Daily Tab */}
      {activeTab === 'daily' && (
        <div className={styles.tabContent}>
          <div className={styles.dailyHeader}>
            <h2 className={styles.dailyTitle}>📅 每日養生功課</h2>
            <p className={styles.dailySubtitle}>每天3個穴位，輕鬆累積養生知識</p>
          </div>
          {hw ? (
            <div className={styles.dailyCard}>
              <div className={styles.dailyDate}>{getTodayStr()}</div>
              {hw.completed && (
                <div className={styles.dailyCompleteBanner}>🎉 今日功課已完成！</div>
              )}
              <div className={styles.dailyPointsList}>
                {hw.points.map((pid, i) => (
                  <div key={pid} className={styles.dailyPointItem}>
                    <span className={styles.dailyPointNum}>{i + 1}</span>
                    <span className={styles.dailyPointId}>{pid}</span>
                    <span className={styles.dailyPointDone}>{hw.completed ? '✅' : '○'}</span>
                  </div>
                ))}
              </div>
              <Link href="daily" className={`${styles.bigBtn} ${hw.completed ? styles.btnSecondary : ''}`}>
                {hw.completed ? '🔄 複習今日功課' : '▶️ 開始今日功課'}
              </Link>
            </div>
          ) : (
            <div className={styles.loadingInner}>加載中...</div>
          )}
          
          {/* 打卡入口 */}
          <div className={styles.menuCard} style={{ marginTop: 16 }}>
            <h3 className={styles.menuTitle}>🩺 養生打卡</h3>
            <p className={styles.menuDesc}>按完穴位來這裡打卡記錄</p>
            <Link href="checkin" className={styles.menuBtn}>去打卡</Link>
          </div>
        </div>
      )}
    </div>
  )
}

function MeridianCard({ code, name, emoji, learned, total, active }: {
  code: string; name: string; emoji: string; learned: number; total: number; active: boolean
}) {
  return (
    <div className={`${styles.meridianCard} ${active ? styles.meridianActive : styles.meridianLocked}`}>
      <div className={styles.meridianEmoji}>{emoji}</div>
      <div className={styles.meridianName}>{name}</div>
      <div className={styles.meridianProgress}>{learned}/{total}</div>
      {!active && <div className={styles.meridianLock}>🔒 即將推出</div>}
      {active && (
        <Link href="learn" className={styles.meridianBtn}>學習</Link>
      )}
    </div>
  )
}
