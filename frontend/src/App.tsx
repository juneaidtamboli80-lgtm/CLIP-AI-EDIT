import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownToLine, ArrowRight, Bell, Check, ChevronDown, Clapperboard,
  Clock3, CloudUpload, Command, Film, FolderOpen, Gauge, HelpCircle, Home,
  Layers3, Menu, MoreHorizontal, Play, Plus, Search, Settings, ShieldCheck,
  Sparkles, Subtitles, Upload, Video, WandSparkles, X, Zap
} from 'lucide-react'

type Project = { id: string; name: string; size: string; duration: string; status: string; date: string; file?: File; url?: string }
const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '')
const initialProjects: Project[] = [
  { id: 'demo-1', name: 'Creator podcast — Episode 08', size: '—', duration: '42:18', status: 'Ready to edit', date: 'Sample project' },
  { id: 'demo-2', name: 'Product launch story', size: '—', duration: '18:42', status: 'Ready to edit', date: 'Sample project' },
  { id: 'demo-3', name: 'Behind the scenes', size: '—', duration: '26:05', status: 'Ready to edit', date: 'Sample project' }
]
const nav = [
  { label: 'Workspace', items: [{ name: 'Overview', icon: Home }, { name: 'AI Shorts', icon: Sparkles, tag: 'Soon' }, { name: 'Video editor', icon: Clapperboard, tag: 'Soon' }] },
  { label: 'Manage', items: [{ name: 'My projects', icon: Layers3 }, { name: 'Subtitle studio', icon: Subtitles, tag: 'Soon' }, { name: 'Upload video', icon: CloudUpload }] },
  { label: 'Preferences', items: [{ name: 'Settings', icon: Settings }] }
]
function formatSize(bytes: number) { return bytes > 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB` }
function App() {
  const [active, setActive] = useState('Overview')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [query, setQuery] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [apiStatus, setApiStatus] = useState<'checking'|'online'|'offline'>('checking')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [preview, setPreview] = useState<Project | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const filtered = useMemo(() => projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase())), [projects, query])

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.ok ? r.json() : Promise.reject()).then(() => setApiStatus('online')).catch(() => setApiStatus('offline'))
  }, [])

  function chooseFile(f?: File) {
    if (!f) return
    if (!f.type.startsWith('video/')) { setMessage('Please select a valid video file.'); return }
    setFile(f); setMessage('')
  }
  async function upload() {
    if (!file) { inputRef.current?.click(); return }
    setUploading(true); setMessage('')
    const body = new FormData(); body.append('video', file)
    try {
      const response = await fetch(`${API}/uploads`, { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      const item: Project = { id: data.project.id, name: data.project.name, size: formatSize(file.size), duration: 'Processing metadata', status: 'Uploaded', date: 'Just now', url: URL.createObjectURL(file), file }
      setProjects(p => [item, ...p]); setFile(null); setActive('My projects')
      setMessage('Upload complete. Your video is now in My Projects.')
    } catch (e) {
      // Local preview is still useful if backend is not configured yet.
      const local: Project = { id: crypto.randomUUID(), name: file.name, size: formatSize(file.size), duration: 'Not analysed', status: 'Local preview', date: 'Just now', url: URL.createObjectURL(file), file }
      setProjects(p => [local, ...p]); setFile(null); setActive('My projects')
      setMessage(e instanceof Error ? `${e.message}. Added a local preview; configure the backend for server uploads.` : 'Backend unavailable. Added local preview.')
    } finally { setUploading(false) }
  }
  const totalSize = projects.reduce((n, p) => n + (p.file?.size || 0), 0)
  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Clapperboard size={21}/></div><div><b>CLIP<span>AI</span></b><small>VIDEO WORKSPACE</small></div><button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <button className="workspace-switch"><div className="workspace-avatar">P</div><div><b>Personal workspace</b><small>Free workspace</small></div><ChevronDown size={15}/></button>
      <nav>{nav.map(group => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map(item => { const Icon = item.icon; return <button key={item.name} className={`nav-item ${active === item.name ? 'active' : ''}`} onClick={() => { setActive(item.name); setMobileOpen(false) }}><Icon size={17}/><span>{item.name}</span>{item.tag && <em>{item.tag}</em>}</button> })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="storage-card"><div className="storage-head"><span>Workspace storage</span><b>{totalSize ? formatSize(totalSize) : '0 MB'}</b></div><div className="storage-track"><i style={{width: `${Math.min(100, totalSize / (2*1024**3) * 100)}%`}}/></div><small>Local session usage · 2 GB reference</small></div><button className="help-link"><HelpCircle size={16}/> Help center <ArrowRight size={14}/></button><div className="profile"><div className="profile-avatar">P</div><div><b>Prime</b><small>Personal account</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)}/>}
    <main className="main">
      <header className="topbar"><div className="top-left"><button className="icon-btn menu-btn" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><span className="crumb">Workspace</span><span className="slash">/</span><b>{active}</b></div><div className="top-actions"><div className={`api-pill ${apiStatus}`}><i/>{apiStatus === 'checking' ? 'Checking API' : apiStatus === 'online' ? 'Backend connected' : 'Backend offline'}</div><button className="icon-btn" aria-label="Notifications"><Bell size={18}/></button><div className="top-avatar">P</div></div></header>
      <div className="content">
        {active === 'Settings' ? <section className="page"><div className="page-heading"><div><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="muted">Manage your workspace and integrations.</p></div></div><div className="panel settings-panel"><h3>Connection status</h3><p className="muted">API endpoint: <code>{API}</code></p><p className="muted">Backend: <b>{apiStatus}</b></p><p className="notice">API keys will be configured securely on the backend in a later phase. Never paste secret keys into frontend code.</p></div></section> :
        <section className="page">
          <div className="welcome-row"><div><p className="eyebrow"><span className="spark-dot"/> YOUR CREATIVE WORKSPACE</p><h1>{active === 'Overview' ? <>Make every video <span className="gradient-text">count.</span></> : active}</h1><p className="muted">{active === 'Overview' ? 'Turn your long-form content into scroll-stopping short videos.' : 'Your videos, organised in one creative workspace.'}</p></div><button className="primary-btn" onClick={() => {setActive('Upload video'); inputRef.current?.click()}}><Plus size={17}/> New project</button></div>
          <div className="hero-card"><div className="hero-copy"><div className="hero-tag"><WandSparkles size={14}/> YOUR NEXT BIG EDIT STARTS HERE</div><h2>One long video.<br/><span>Endless possibilities.</span></h2><p>Bring your footage into CLIP AI. Your AI-powered editing workflow starts here.</p><button className="hero-btn" onClick={() => {setActive('Upload video'); inputRef.current?.click()}}>Upload a video <ArrowRight size={16}/></button><div className="hero-points"><span><Check size={13}/> Simple workflow</span><span><Check size={13}/> Creator-first tools</span></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-core"><Film size={43}/><span>CLIP AI</span></div><div className="float-chip chip-top"><Sparkles size={14}/> AI WORKFLOW</div><div className="float-chip chip-bottom"><Subtitles size={14}/> SMART SUBTITLES</div><div className="art-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div>
          <div className="section-title"><div><h2>Workspace overview</h2><p className="muted">A quick look at your content activity.</p></div><button className="period-btn">All time <ChevronDown size={14}/></button></div>
          <div className="stats-grid"><Stat icon={<Video/>} label="Total projects" value={String(projects.length)} change="Videos in your workspace"/><Stat icon={<ScissorsIcon/>} label="Shorts created" value="—" change="AI processing coming soon"/><Stat icon={<Clock3/>} label="Video duration" value="—" change="Analysis not yet enabled"/><Stat icon={<Gauge/>} label="Processing jobs" value="0" change="No active jobs"/></div>
          <div className="section-title project-title"><div><h2>Recent projects</h2><p className="muted">Pick up where you left off.</p></div><button className="text-btn" onClick={() => setActive('My projects')}>View all <ArrowRight size={15}/></button></div>
          <div className="project-toolbar"><div className="searchbox"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your projects..."/></div><button className="filter-btn"><Activity size={15}/> Recent <ChevronDown size={14}/></button></div>
          {filtered.length ? <div className="project-grid">{filtered.slice(0,6).map((p,i)=><ProjectCard key={p.id} project={p} index={i} onOpen={()=>setPreview(p)}/>)}</div> : <div className="empty-state"><FolderOpen size={28}/><b>No projects found</b><span>Try another search or upload a video.</span></div>}
          <div className="upload-strip"><div className="upload-icon"><CloudUpload size={22}/></div><div><b>Ready to create something?</b><p>Upload your first video and start building your content library.</p></div><button className="secondary-btn" onClick={() => {setActive('Upload video');inputRef.current?.click()}}>Upload video <ArrowRight size={15}/></button></div>
          {active === 'Upload video' && <div className="upload-modal-backdrop" onClick={() => setActive('Overview')}><div className="upload-modal" onClick={e=>e.stopPropagation()}><button className="modal-close icon-btn" onClick={()=>setActive('Overview')}><X size={18}/></button><div className="modal-icon"><Upload size={23}/></div><h2>Upload your video</h2><p className="muted">Choose a video from your device. MP4, MOV, MKV and WebM supported by the server where compatible.</p><div className="dropzone" onClick={()=>inputRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseFile(e.dataTransfer.files[0])}}><CloudUpload size={29}/><b>{file ? file.name : 'Drop your video here'}</b><span>{file ? formatSize(file.size) : 'or browse files from your device'}</span><small>Server upload limit is configured by deployment</small></div><input ref={inputRef} type="file" accept="video/*" hidden onChange={e=>chooseFile(e.target.files?.[0])}/>{message && <p className="notice">{message}</p>}<button className="primary-btn full-btn" disabled={uploading} onClick={upload}>{uploading ? 'Uploading…' : file ? 'Upload video' : 'Choose a video'} <ArrowRight size={16}/></button><p className="tiny-note"><ShieldCheck size={13}/> Only upload content you own or are authorised to use.</p></div></div>}
          {preview && <div className="upload-modal-backdrop" onClick={()=>setPreview(null)}><div className="preview-modal" onClick={e=>e.stopPropagation()}><button className="modal-close icon-btn" onClick={()=>setPreview(null)}><X size={18}/></button><h2>{preview.name}</h2>{preview.url ? <video src={preview.url} controls playsInline/> : <div className="preview-placeholder"><Play size={30}/><span>Preview unavailable for sample project</span></div>}<div className="preview-meta"><span>{preview.size}</span><span>{preview.duration}</span><span>{preview.status}</span></div><p className="notice">Phase 1 project preview. AI clip generation and timeline editing are planned for upcoming phases.</p></div></div>}
        </section>}
        <footer><span>© 2026 CLIP AI EDIT</span><span>Built for creators, made for momentum <Zap size={13}/></span></footer>
      </div>
    </main>
  </div>
}
function Stat({icon,label,value,change}:{icon:React.ReactNode,label:string,value:string,change:string}) { return <div className="stat-card"><div className="stat-top"><span className="stat-icon">{icon}</span><MoreHorizontal size={17} className="dim"/></div><b className="stat-value">{value}</b><span className="stat-label">{label}</span><small>{change}</small></div> }
function ScissorsIcon(){return <Clapperboard/>}
function ProjectCard({project,index,onOpen}:{project:Project,index:number,onOpen:()=>void}) {
  const palettes=['purple','blue','pink','orange']
  return <button className="project-card" onClick={onOpen}><div className={`project-thumb ${palettes[index%4]}`}>{project.url ? <video src={project.url} muted/> : <><div className="thumb-glow"/><Film size={34}/><span className="duration">{project.duration}</span></>}<span className="play-overlay"><Play size={17} fill="currentColor"/></span></div><div className="project-info"><div><b>{project.name}</b><small>{project.date} · {project.size}</small></div><MoreHorizontal size={18}/></div><div className="project-status"><span className="status-dot"/>{project.status}<span className="open-project">Open <ArrowRight size={13}/></span></div></button>
}
export default App
