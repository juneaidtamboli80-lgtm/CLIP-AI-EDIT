import { getPreset } from '@/lib/caption-presets'
import type { AspectRatio, CaptionSettings, Clip, SubtitleMode } from '@/lib/types'

export type EditorState = {
  inPoint: number
  outPoint: number
  captionsEnabled: boolean
  captionSettings: CaptionSettings
  captionText: string
  subtitleLanguage: string
  subtitleMode: SubtitleMode
  dualSubtitles: boolean
  translatedText: string
  aspectRatio: AspectRatio
  background: 'blur' | 'color' | 'image'
  backgroundColor: string
  backgroundImage: string
  logoEnabled: boolean
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  music: string
  musicVolume: number
  speed: number
  removeSilences: boolean
  intro: boolean
  outro: boolean
  splitPoints: number[]
  safeZones: boolean
}

export const DEFAULT_CAPTION_TEXT =
  'The first three seconds decide everything. Stop chasing the algorithm and start earning attention.'

export function createEditorState(clip: Clip): EditorState {
  const duration = Math.max(15, Math.round(clip.end - clip.start))
  return {
    inPoint: 0,
    outPoint: duration,
    captionsEnabled: true,
    captionSettings: getPreset('hormozi').settings,
    captionText: DEFAULT_CAPTION_TEXT,
    subtitleLanguage: 'en',
    subtitleMode: 'burned',
    dualSubtitles: false,
    translatedText: translations.hi,
    aspectRatio: clip.aspectRatio,
    background: 'blur',
    backgroundColor: '#0b1020',
    backgroundImage: backgroundPresets[0].value,
    logoEnabled: true,
    logoPosition: 'top-right',
    music: 'none',
    musicVolume: 18,
    speed: 1,
    removeSilences: false,
    intro: false,
    outro: false,
    splitPoints: [],
    safeZones: false,
  }
}

export const translations: Record<string, string> = {
  en: 'The first three seconds decide everything. Stop chasing the algorithm and start earning attention.',
  hi: 'पहले तीन सेकंड सब कुछ तय करते हैं। एल्गोरिदम के पीछे मत भागो, ध्यान कमाओ।',
  es: 'Los primeros tres segundos lo deciden todo. Deja de perseguir el algoritmo y empieza a ganar atención.',
  ar: 'أول ثلاث ثوانٍ تحدد كل شيء. توقف عن مطاردة الخوارزمية وابدأ بكسب الانتباه.',
  fr: 'Les trois premières secondes décident de tout. Arrêtez de courir après l’algorithme et gagnez l’attention.',
  de: 'Die ersten drei Sekunden entscheiden alles. Hör auf, dem Algorithmus hinterherzujagen, und gewinne Aufmerksamkeit.',
  pt: 'Os primeiros três segundos decidem tudo. Pare de perseguir o algoritmo e comece a conquistar atenção.',
  ja: '最初の3秒ですべてが決まる。アルゴリズムを追うのをやめて、注目を集めよう。',
  ko: '처음 3초가 모든 것을 결정합니다. 알고리즘을 쫓지 말고 관심을 얻으세요.',
  id: 'Tiga detik pertama menentukan segalanya. Berhenti mengejar algoritma dan mulai menarik perhatian.',
  bn: 'প্রথম তিন সেকেন্ডই সবকিছু নির্ধারণ করে। অ্যালগরিদমের পেছনে ছুটবেন না, মনোযোগ আকর্ষণ করুন।',
  ta: 'முதல் மூன்று வினாடிகள் எல்லாவற்றையும் தீர்மானிக்கின்றன. அல்காரிதத்தைத் துரத்தாதீர்கள், கவனத்தை ஈர்க்கவும்.',
}

export const backgroundPresets = [
  {
    id: 'aurora',
    label: 'Aurora',
    value: 'radial-gradient(circle at 20% 20%, #7c3aed 0%, transparent 45%), radial-gradient(circle at 80% 30%, #2563eb 0%, transparent 45%), linear-gradient(160deg, #0b1020, #111827 55%, #1e1b4b)',
  },
  {
    id: 'studio',
    label: 'Studio',
    value: 'radial-gradient(circle at 50% 20%, #334155 0%, transparent 55%), linear-gradient(170deg, #0f172a, #1e293b 60%, #020617)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    value: 'radial-gradient(circle at 25% 15%, #f97316 0%, transparent 45%), radial-gradient(circle at 80% 30%, #db2777 0%, transparent 45%), linear-gradient(160deg, #1c1917, #3b0764)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    value: 'radial-gradient(circle at 20% 20%, #059669 0%, transparent 45%), radial-gradient(circle at 80% 70%, #0891b2 0%, transparent 45%), linear-gradient(160deg, #022c22, #0f172a)',
  },
]

export const musicTracks = [
  { id: 'none', label: 'No music', bpm: '—' },
  { id: 'lofi', label: 'Lo-fi Study', bpm: '82 BPM' },
  { id: 'cinematic', label: 'Cinematic Rise', bpm: '96 BPM' },
  { id: 'upbeat', label: 'Upbeat Pop', bpm: '124 BPM' },
  { id: 'ambient', label: 'Warm Ambient', bpm: '70 BPM' },
]

export const aspectOptions: { value: AspectRatio; label: string }[] = [
  { value: '9:16', label: '9:16 · Shorts' },
  { value: '1:1', label: '1:1 · Feed' },
  { value: '16:9', label: '16:9 · YouTube' },
]

export function makeCues(text: string, duration: number, wordsPerCue = 8) {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const chunks: string[][] = []
  for (let index = 0; index < words.length; index += wordsPerCue) {
    chunks.push(words.slice(index, index + wordsPerCue))
  }
  const perCue = duration / chunks.length
  return chunks.map((chunk, index) => ({
    start: index * perCue,
    end: Math.min(duration, (index + 1) * perCue),
    text: chunk.join(' '),
  }))
}
