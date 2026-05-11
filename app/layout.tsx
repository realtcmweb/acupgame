import './globals.css'

export const metadata = {
  title: '經穴大師 - 輕鬆學穴位',
  description: 'Duolingo風格的針灸學習遊戲，輕鬆記住400+穴位',
}

export default function AcupgameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}