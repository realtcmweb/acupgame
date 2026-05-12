// 症狀 → 穴位推薦對應表
// 基於 LU、LI、ST、SP、HT、SI 共125穴位 的 indication 關鍵字比對

export interface Symptom {
  id: string
  name: string
  emoji: string
  keywords: string[]  // 對應 indication 關鍵字
  relatedMeridians: string[]
}

export const SYMPTOMS: Symptom[] = [
  {
    id: 'cough',
    name: '咳嗽',
    emoji: '🤧',
    keywords: ['咳嗽', '咯血', '氣喘', '喘', '胸痛', '胸悶', '支氣管', '肺'],
    relatedMeridians: ['LU', 'LI', 'ST', 'SP', 'SI'],
  },
  {
    id: 'sore_throat',
    name: '喉嚨痛',
    emoji: '🗣️',
    keywords: ['咽喉腫痛', '喉嚨', '咽乾', '咽痛', '失音', '咽喉', '咽'],
    relatedMeridians: ['LU', 'LI', 'HT', 'ST'],
  },
  {
    id: 'fever',
    name: '發燒/感冒',
    emoji: '🌡️',
    keywords: ['發熱', '發燒', '熱病', '感冒', '外感', '瘟疫'],
    relatedMeridians: ['LU', 'LI', 'SI'],
  },
  {
    id: 'nasal',
    name: '鼻塞/鼻出血',
    emoji: '👃',
    keywords: ['鼻塞', '鼻衄', '鼻炎', '鼻', '嗅覺'],
    relatedMeridians: ['LU', 'LI'],
  },
  {
    id: 'headache',
    name: '頭痛/頭暈',
    emoji: '🤕',
    keywords: ['頭痛', '眩暈', '頭暈', '眩'],
    relatedMeridians: ['HT', 'LI', 'SI', 'SP'],
  },
  {
    id: 'insomnia',
    name: '失眠/多夢',
    emoji: '🌙',
    keywords: ['失眠', '多夢', '健忘', '癲狂', '癲癇', '痴呆', '神志'],
    relatedMeridians: ['HT', 'SP', 'LU'],
  },
  {
    id: 'stomach_pain',
    name: '胃痛/消化不良',
    emoji: '🍽️',
    keywords: ['胃痛', '胃炎', '嘔吐', '噎膈', '胃', '納少', '食欲不振', '消化不良'],
    relatedMeridians: ['ST', 'SP', 'LI'],
  },
  {
    id: 'diarrhea',
    name: '腹瀉/嘔吐',
    emoji: '🤢',
    keywords: ['腹瀉', '痢疾', '嘔吐', '泄瀉', '便溏', '腸鳴', '腹痛', '腹脹', '腹'],
    relatedMeridians: ['ST', 'SP', 'SI'],
  },
  {
    id: 'constipation',
    name: '便祕/腹脹',
    emoji: '😣',
    keywords: ['便祕', '便秘', '糞', '大便', '腹脹', '腸鳴', '闌尾'],
    relatedMeridians: ['ST', 'SP', 'SI'],
  },
  {
    id: 'shoulder_pain',
    name: '肩背痠痛',
    emoji: '💪',
    keywords: ['肩', '背', '臂', '手臂', '上臂', '肘', '腕', '項強', '頸項', '痹', '攣', '麻木', '痿'],
    relatedMeridians: ['SI', 'LI', 'ST', 'LU'],
  },
  {
    id: 'fatigue',
    name: '疲勞/體虛',
    emoji: '😴',
    keywords: ['乏力', '倦怠', '虛勞', '虛弱', '疲勞', '無力', '氣虛', '血虛'],
    relatedMeridians: ['ST', 'SP'],
  },
  {
    id: 'emotion',
    name: '情緒/壓力',
    emoji: '😰',
    keywords: ['焦慮', '憂鬱', '悲愁', '怔忡', '心悸', '煩躁', '易驚'],
    relatedMeridians: ['HT', 'SP'],
  },
  {
    id: 'menstrual',
    name: '月經/婦科',
    emoji: '🩸',
    keywords: ['月經', '痛經', '崩漏', '閉經', '帶下', '陰挺', '不孕', '產後', '乳汁', '經'],
    relatedMeridians: ['SP', 'ST'],
  },
  {
    id: 'eye_fatigue',
    name: '眼睛疲勞',
    emoji: '👁️',
    keywords: ['目', '眼', '視', '翳', '近視', '夜盲', '視力'],
    relatedMeridians: ['SI', 'ST', 'LI'],
  },
  {
    id: 'ear',
    name: '耳鳴/聽力',
    emoji: '👂',
    keywords: ['耳鳴', '耳聾', '聽力', '耳'],
    relatedMeridians: ['SI', 'HT'],
  },
]

// 額外的症狀組（點「其他」時替換）
export const SYMPTOMS_ALT: Symptom[] = [
  { id: 'neck', name: '頸項僵硬', emoji: '🦒', keywords: ['頸項', '項強', '頸'], relatedMeridians: ['SI', 'LI'] },
  { id: 'urinary', name: '泌尿/水腫', emoji: '🚰', keywords: ['尿', '小便', '水腫', '淋', '癃'], relatedMeridians: ['SP', 'ST'] },
  { id: 'skin', name: '皮膚問題', emoji: '🦟', keywords: ['癮疹', '濕疹', '蕁麻疹', '癢', '瘰鬁', '癤'], relatedMeridians: ['LI', 'SI'] },
  { id: 'tooth', name: '牙痛', emoji: '🦷', keywords: ['齲', '牙', '齒'], relatedMeridians: ['LI', 'ST'] },
  { id: 'face', name: '面部問題', emoji: '😶', keywords: ['面', '口歪', '面癱', '癱'], relatedMeridians: ['LI', 'ST'] },
  { id: 'limb_joint', name: '四肢關節痛', emoji: '🦴', keywords: ['膝', '踝', '腕', '關節', '痹'], relatedMeridians: ['ST', 'SI'] },
]

export const SYMPTOM_GROUPS = [
  SYMPTOMS.slice(0, 6),
  SYMPTOMS.slice(6, 12),
  SYMPTOMS.slice(12),
]