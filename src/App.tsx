import { useRef, useState } from 'react'
import {
  Video, LayoutDashboard, FolderOpen, Scissors, Captions,
  Settings, Plus, Upload, Sparkles, Play, Clock3, Search,
  Bell, Menu, X, Film, Download, Link2, WandSparkles,
  ChevronRight, Subtitles, MonitorPlay, Trash2
} from 'lucide-react'

type Project = {
  id: number
  name: string
  duration: string
  date: string
  file?: string
}

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [active, setActive] = useState('Dashboard')
  const [video, setVideo] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [youtube, setYoutube] = useState('')
  const [search, setSearch] = useState('')
  const [duration, setDuration] = useState('30 sec')
  const [ratio, setRatio] = useState('9:16')
  const [caption, setCaption] = useState('Karaoke Highlight')
  const [language, setLanguage] = useState('Auto Detect')
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, name: 'My First Project', duration: '00:45', date: 'Demo project' },
    { id: 2, name: 'Gaming Highlights', duration: '01:20', date: 'Demo project' }
  ])

  function uploadFile(file?: File) {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file.')
      return
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    const url = URL.createObjectURL(file)
    setVideo(file)
    setVideoUrl(url)
    setActive('Create Shorts')
  }

  function saveProject() {
    if (!video) {
      alert('Please upload a video first.')
      return
    }
    const project = {
      id: Date.now(),
      name: video.name,
      duration: 'Not processed',
      date: 'Just now',
      file: video.name
    }
    setProjects(p => [project, ...p])
    alert('Project saved in this session.')
  }

  const nav = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Create Shorts', icon: Scissors },
    { name: 'My Projects', icon: FolderOpen },
    { name: 'Captions', icon: Captions },
    { name: 'Editor', icon: Film }
  ]

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><Video size={23}/></div>
          <div>
            <h2>CLIP<span>AI</span></h2>
            <small>VIDEO STUDIO</small>
          </div>
          <button className="mobile-close" onClick={() => setMobileMenu(false)}><X/></button>
        </div>

        <div className="workspace">
          <span className="workspace-dot"/>
          <div><b>My Workspace</b><small>Free workspace</small></div>
          <ChevronRight size={16}/>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav>
          {nav.map(item => (
            <button key={item.name}
              className={`nav-item ${active === item.name ? 'active' : ''}`}
              onClick={() => {setActive(item.name); setMobileMenu(false)}}>
              <item.icon size={19}/><span>{item.name}</span>
              {item.name === 'Create Shorts' && <span className="new-dot"/>}
            </button>
          ))}
        </nav>

        <p className="nav-label">PREFERENCES</p>
        <button className="nav-item" onClick={() => setActive('Settings')}>
          <Settings size={19}/><span>Settings</span>
        </button>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={20}/>
            <b>Make videos amazing</b>
            <p>Your creative studio starts here.</p>
            <span>Free plan · Phase 1</span>
          </div>
          <div className="profile">
            <div className="avatar">P</div>
            <div><b>Creator</b><small>Personal account</small></div>
            <Settings size={17}/>
          </div>
        </div>
      </aside>

      {mobileMenu && <div className="overlay" onClick={() => setMobileMenu(false)}/>}

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileMenu(true)}><Menu/></button>
          <div className="breadcrumb">Workspace <span>/</span> {active}</div>
          <div className="top-actions">
            <span className="free-badge">FREE PLAN</span>
            <button className="icon-btn"><Bell size={19}/></button>
            <div className="avatar">P</div>
          </div>
        </header>

        <div className="content">
          {active === 'Dashboard' && <>
            <section className="welcome">
              <div>
                <div className="eyebrow"><Sparkles size={14}/> YOUR AI VIDEO STUDIO</div>
                <h1>Turn long videos into <span>viral shorts.</span></h1>
                <p>Create, edit and transform your videos in one creative workspace.</p>
              </div>
              <button className="primary-btn" onClick={() => setActive('Create Shorts')}>
                <Plus size={18}/> Create New
              </button>
            </section>

            <section className="hero-card">
              <div className="hero-text">
                <span className="hero-tag"><WandSparkles size={14}/> CREATOR STUDIO</span>
                <h2>Your next viral moment<br/>starts <span>here.</span></h2>
                <p>Upload a long video and prepare it for short-form content.</p>
                <button className="hero-btn" onClick={() => setActive('Create Shorts')}>
                  Start Creating <ChevronRight size={17}/>
                </button>
              </div>
              <div className="hero-art">
                <div className="art-glow"/>
                <div className="phone-preview">
                  <div className="phone-screen">
                    <Play size={35} fill="white"/>
                    <div className="fake-caption">YOUR NEXT<br/><b>BIG MOMENT</b></div>
                    <span className="phone-timeline"/>
                  </div>
                </div>
                <div className="floating-chip"><Sparkles size={15}/> AI STUDIO</div>
              </div>
            </section>

            <section className="stats-grid">
              <div className="stat-card"><div className="stat-icon purple"><Film/></div><small>Total Projects</small><h2>{projects.length}</h2><span>In this session</span></div>
              <div className="stat-card"><div className="stat-icon blue"><Scissors/></div><small>Shorts Created</small><h2>0</h2><span>Ready to create</span></div>
              <div className="stat-card"><div className="stat-icon pink"><Clock3/></div><small>Video Minutes</small><h2>0</h2><span>Processing not started</span></div>
            </section>

            <section className="section-heading">
              <div><h2>Recent Projects</h2><p>Continue where you left off.</p></div>
              <button className="text-btn" onClick={() => setActive('My Projects')}>View all <ChevronRight size={16}/></button>
            </section>
            <div className="project-grid">
              {projects.slice(0,3).map(p => (
                <div className="project-card" key={p.id}>
                  <div className="project-thumb"><Film size={32}/><span>{p.duration}</span></div>
                  <div className="project-info"><b>{p.name}</b><small>{p.date}</small></div>
                </div>
              ))}
              <button className="add-project" onClick={() => setActive('Create Shorts')}>
                <Plus size={27}/><b>New Project</b><small>Start from a video</small>
              </button>
            </div>
          </>}

          {active === 'Create Shorts' && <>
            <section className="page-heading">
              <div><span className="eyebrow">CREATE WORKSPACE</span><h1>Create <span>Shorts</span></h1><p>Upload your video and prepare your short-form content.</p></div>
            </section>
            <div className="create-layout">
              <div className="panel upload-panel">
                <h3><Upload size={19}/> Upload your video</h3>
                <p className="muted">Choose a video from your device.</p>
                <button className="drop-zone" onClick={() => fileRef.current?.click()}>
                  <div className="upload-icon"><Upload size={27}/></div>
                  <b>Tap to browse files</b>
                  <span>Choose from your phone File Manager or Gallery</span>
                  <small>MP4 · MOV · WEBM</small>
                </button>
                <input ref={fileRef} type="file" accept="video/*" hidden
                  onChange={e => uploadFile(e.target.files?.[0])}/>
                {video && <div className="selected-file">
                  <Film size={20}/><div><b>{video.name}</b><small>{(video.size / 1024 / 1024).toFixed(1)} MB</small></div>
                  <button onClick={() => {setVideo(null);setVideoUrl('')}}><Trash2 size={17}/></button>
                </div>}
                <div className="or-divider"><span>OR IMPORT WITH LINK</span></div>
                <div className="youtube-input"><Link2 size={18}/><input placeholder="Paste a supported YouTube URL" value={youtube} onChange={e => setYoutube(e.target.value)}/></div>
                <small className="muted">YouTube import requires an authorized or supported source. Pasting a link does not download the video yet.</small>
              </div>

              <div className="panel settings-panel">
                <h3><Sparkles size={19}/> Shorts settings</h3>
                <label>SHORT DURATION</label>
                <div className="choice-grid">
                  {['15 sec','30 sec','45 sec','60 sec'].map(v =>
                    <button key={v} className={duration === v ? 'choice selected' : 'choice'} onClick={() => setDuration(v)}>{v}</button>
                  )}
                </div>
                <label>VIDEO FORMAT</label>
                <div className="choice-grid">
                  {['9:16','16:9','1:1'].map(v =>
                    <button key={v} className={ratio === v ? 'choice selected' : 'choice'} onClick={() => setRatio(v)}>{v}</button>
                  )}
                </div>
                <label>CAPTION STYLE</label>
                <select value={caption} onChange={e => setCaption(e.target.value)}>
                  <option>Karaoke Highlight</option>
                  <option>Minimal Clean</option>
                  <option>Bold Creator</option>
                  <option>Classic Subtitle</option>
                  <option>Neon Pop</option>
                </select>
                <label>SUBTITLE LANGUAGE</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  <option>Auto Detect</option><option>Hindi</option><option>English</option>
                  <option>Hinglish</option><option>Urdu</option>
                </select>
                <button className="primary-btn full" onClick={saveProject}><Sparkles size={18}/> Save Project</button>
                <p className="muted note">AI clip generation will be connected in the next development phase.</p>
              </div>
            </div>
            {videoUrl && <div className="panel preview-panel">
              <h3><MonitorPlay size={19}/> Video Preview</h3>
              <video src={videoUrl} controls playsInline/>
            </div>}
          </>}

          {active === 'My Projects' && <>
            <section className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>My <span>Projects</span></h1><p>All your saved projects in one place.</p></div><button className="primary-btn" onClick={() => setActive('Create Shorts')}><Plus size={18}/> New Project</button></section>
            <div className="search-box"><Search size={18}/><input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}/></div>
            <div className="project-grid">
              {filtered.map(p => <div className="project-card" key={p.id}><div className="project-thumb"><Film size={32}/><span>{p.duration}</span></div><div className="project-info"><b>{p.name}</b><small>{p.date}</small></div></div>)}
              {filtered.length === 0 && <p className="muted">No matching projects found.</p>}
            </div>
          </>}

          {active === 'Captions' && <>
            <section className="page-heading"><div><span className="eyebrow">TEXT STUDIO</span><h1>Captions & <span>Subtitles</span></h1><p>Choose how your future captions will look.</p></div></section>
            <div className="panel settings-panel narrow">
              <h3><Subtitles/> Caption preferences</h3>
              <label>CAPTION STYLE</label>
              <select value={caption} onChange={e => setCaption(e.target.value)}><option>Karaoke Highlight</option><option>Minimal Clean</option><option>Bold Creator</option><option>Classic Subtitle</option><option>Neon Pop</option></select>
              <label>LANGUAGE</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}><option>Auto Detect</option><option>Hindi</option><option>English</option><option>Hinglish</option><option>Urdu</option></select>
              <p className="muted note">Automatic speech recognition and subtitle generation are planned for a later phase.</p>
            </div>
          </>}

          {active === 'Editor' && <>
            <section className="page-heading"><div><span className="eyebrow">CREATIVE STUDIO</span><h1>Video <span>Editor</span></h1><p>Your professional editing workspace.</p></div></section>
            <div className="panel editor-placeholder">
              <MonitorPlay size={48}/>
              <h2>Editing Studio</h2>
              <p>Timeline, trimming, transitions and effects are coming in Phase 2.</p>
              <button className="primary-btn" onClick={() => setActive('Create Shorts')}><Upload size={18}/> Upload Video</button>
            </div>
          </>}

          {active === 'Settings' && <>
            <section className="page-heading"><div><span className="eyebrow">PREFERENCES</span><h1>Settings</h1><p>CLIP AI workspace settings.</p></div></section>
            <div className="panel settings-panel narrow"><h3>Account & workspace</h3><label>WORKSPACE NAME</label><input value="My Workspace" readOnly/><label>PLAN</label><input value="Free Plan" readOnly/><p className="muted">More settings will be added in future phases.</p></div>
          </>}
          <footer>© 2026 CLIP AI <span>Made for creators</span></footer>
        </div>
      </main>
    </div>
  )
}
