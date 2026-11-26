type Tone = 'green' | 'yellow' | 'gray' | 'red'

// Цвета прикинуты по макету, точные возьмите из Figma
const tones: Record<Tone, { bg: string; border: string; color: string }> = {
  green: { bg: '#e6f9ec', border: '#8fd6a6', color: '#1f9d4a' },
  yellow: { bg: '#fffbd1', border: '#e6dd7a', color: '#8a7f00' },
  gray: { bg: '#e0e0e0', border: '#a0a0a0', color: '#333' },
  red: { bg: '#fde0e0', border: '#e89a9a', color: '#c0392b' },
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const t = tones[tone]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 14px',
        borderRadius: 12,
        fontSize: 13,
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
      }}
    >
      {label}
    </span>
  )
}