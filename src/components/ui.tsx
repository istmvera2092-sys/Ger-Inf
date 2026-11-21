import type { ReactNode } from 'react';
import { ArrowLeft, AudioLines, BookOpen, BookText, ChartNoAxesColumnIncreasing, CircleHelp, CodeXml, Cpu, Layers3, ListFilter, LogOut, Play, ScanLine, Settings as Gear, Shuffle, Terminal, Wrench } from 'lucide-react';
import type { Module, Page } from '../data/types';

export const moduleInfo = {
  sort: { title: 'Sort Engine', description: 'Sort verbs by the patterns they follow.', icon: Layers3, color: 'lilac', tag: 'SORTING' },
  form: { title: 'Syntax Forge', description: 'Complete each sentence with the right verb form.', icon: CodeXml, color: 'mint', tag: 'VERB FORMS' },
  meaning: { title: 'Meaning Switch', description: 'See how the verb form changes the meaning.', icon: Shuffle, color: 'pink', tag: 'MEANING' },
  story: { title: 'Story Protocol', description: 'Fill in the gaps in short stories.', icon: BookText, color: 'blue', tag: 'IN CONTEXT' },
  repair: { title: 'Error Repair', description: 'Review mistakes and revisit earlier exercises.', icon: Wrench, color: 'amber', tag: 'REVIEW' },
  system: { title: 'System Check', description: 'Test yourself with 20 mixed questions.', icon: ScanLine, color: 'lilac', tag: '20 QUESTIONS' },
} satisfies Record<Module, object>;

export const groups = [
  ['ing','V-ing'], ['to','to + V'], ['object','Object + to'], ['both','Both forms'],
  ['change','Meaning change'], ['prep','Prepositions'], ['expression','Expressions'],
] as const;

export function Meter({ value, label }: { value: number; label: string }) {
  return <progress className="meter" value={value} max={100} aria-label={label}>{value}%</progress>;
}

export function Header({ page, go, percent, onExit }: { page: Page; go: (page: Page) => void; percent: number; onExit: () => void }) {
  return <header className="topbar">
    <div className="top-inner">
      <button type="button" className="wordmark" onClick={() => go('home')} aria-label="Grammar OS home">
        <span className="logo"><Terminal size={22} strokeWidth={2.5} /></span>
        <span>GRAMMAR<span className="brand-os"> OS</span></span>
      </button>
      <nav className="nav" aria-label="Main navigation">
        <button type="button" className={page === 'home' || page in moduleInfo ? 'active' : ''} onClick={() => go('home')}><ListFilter size={16} /><span>Modules</span></button>
        <button type="button" className={page === 'rules' ? 'active' : ''} onClick={() => go('rules')}><BookOpen size={16} /><span>Rules</span></button>
        <button type="button" className={page === 'stats' ? 'active' : ''} onClick={() => go('stats')}><ChartNoAxesColumnIncreasing size={16} /><span>Progress</span></button>
      </nav>
      <div className="top-end">
        <span className="top-progress"><Meter value={percent} label="Overall progress" /> <span>{percent}%</span></span>
        <button type="button" className={'icon-button ' + (page === 'settings' ? 'active' : '')} onClick={() => go('settings')} aria-label="Settings" title="Settings"><Gear size={19} /></button>
        <button type="button" className="button secondary compact exit-game" onClick={onExit} aria-label="Exit game" title="Exit game">
          <LogOut size={17} aria-hidden="true"/><span>Exit<span className="exit-word"> game</span></span>
        </button>
      </div>
    </div>
  </header>;
}

export function GrammarDiagram() {
  return <div className="grammar-diagram" aria-hidden="true">
    <svg viewBox="0 0 500 310" className="diagram-lines" fill="none">
      <defs>
        <linearGradient id="circuit"><stop stopColor="#6eefcf"/><stop offset="1" stopColor="#ae8bff"/></linearGradient>
        <radialGradient id="halo"><stop stopColor="#a283ff" stopOpacity=".11"/><stop offset="1" stopColor="#a283ff" stopOpacity="0"/></radialGradient>
      </defs>
      <circle cx="255" cy="146" r="142" fill="url(#halo)" />
      <g stroke="#a78bfa" strokeOpacity=".17">
        <circle cx="255" cy="146" r="61"/><circle cx="255" cy="146" r="91" strokeDasharray="3 6"/><circle cx="255" cy="146" r="119"/>
        <path d="M255 15v43m0 176v53M116 146h37m201 0h40M164 55l21 21m140 140 21 21m0-182-21 21M185 216l-21 21"/>
        <path d="M14 116h53l23 23h20m246 73h58l20 20h47M382 80h45l13-13h35M27 211h64l58-58"/>
        <path d="M255 44v-8m-5 4h10m-5 219v-8m-5 4h10M112 149v-8m-5 4h10m276 4v-8m-5 4h10"/>
      </g>
      <path d="M127 120h34l36 26h115l37 31h43" stroke="url(#circuit)" strokeOpacity=".72" strokeWidth="1.4" />
      <path d="M231 39h48m-48 215h48" stroke="#b399ff" strokeOpacity=".5" strokeDasharray="2 5" />
      <g fill="#ad93ff"><circle cx="255" cy="27" r="2"/><circle cx="255" cy="267" r="2"/><circle cx="394" cy="145" r="2"/><circle cx="349" cy="177" r="3"/></g>
      <circle cx="161" cy="120" r="3" fill="#77edcc"/>
    </svg>
    <div className="diagram-window diagram-ing"><span><i/> GERUND</span><strong>V-ing</strong></div>
    <div className="diagram-chip"><Cpu size={26} strokeWidth={1.6}/><span>VERB</span></div>
    <div className="diagram-window diagram-to"><span><i/> INFINITIVE</span><strong>to + V</strong></div>
  </div>;
}

export function Dashboard({ go, start, studied, total, points, percent, review }: {
  go: (page: Page) => void; start: () => void; studied: number; total: number; points: number; percent: number; review: number;
}) {
  return <>
    <section className="hero">
      <div className="hero-copy">
        <div className="hero-label"><span className="signal" /> ENGLISH GRAMMAR PRACTICE <span className="level">B1–B2</span></div>
        <h1 lang="en">Gerunds <span className="amp">&amp;</span><br/><span className="title-accent">Infinitives</span></h1>
        <p>Practise verb patterns and see how <span>-ing</span> and <span>to + V</span> change what a sentence means.</p>
        <div className="hero-actions">
          <button type="button" className="button primary" onClick={start}><Play size={17} fill="currentColor" /> Start practice</button>
          <button type="button" className="button secondary" onClick={() => go('rules')}><BookOpen size={17}/> Rules reference</button>
        </div>
      </div>
      <GrammarDiagram />
    </section>
    <section className="module-section" aria-labelledby="modules-title">
      <div className="section-line"><div><h2 id="modules-title">Practice modules</h2><p>Choose what you want to practise.</p></div><span className="section-tag"><Layers3 size={15}/> 6 MODULES</span></div>
      <div className="module-grid">
        {(Object.entries(moduleInfo) as [Module, typeof moduleInfo[Module]][]).map(([id, item]) => {
          const Icon = item.icon;
          return <button type="button" key={id} className={'module-card tone-' + item.color} onClick={() => go(id)}>
            <span className="card-top"><span className="module-icon"><Icon size={22} strokeWidth={1.8}/></span><span className="module-tag">{id === 'repair' && review > 0 ? review + ' DUE FOR REVIEW' : item.tag}</span></span>
            <strong lang="en">{item.title}</strong><span className="module-description">{item.description}</span>
          </button>;
        })}
      </div>
    </section>
    <section className="home-progress">
      <span className="module-icon tone-lilac"><ChartNoAxesColumnIncreasing size={21} /></span>
      <div><h2>Your progress</h2><p>{studied} of {total} patterns studied · {points} {points === 1 ? 'point' : 'points'}</p></div>
      <Meter value={percent} label="Patterns mastered" />
      <button className="button secondary" type="button" onClick={() => go('stats')}>View stats</button>
    </section>
  </>;
}

export const Back = ({ onClick, children = 'Back to modules' }: { onClick: () => void; children?: ReactNode }) =>
  <button type="button" className="text-button back" onClick={onClick}><ArrowLeft size={16}/>{children}</button>;
export const RuleButton = ({ onClick }: { onClick: () => void }) =>
  <button type="button" className="button secondary compact" onClick={onClick}><CircleHelp size={16}/> Rule</button>;

export function Heading({ page, children }: { page: Module; children?: ReactNode }) {
  const info = moduleInfo[page];
  const Icon = info.icon;
  return <div className={'screen-heading tone-' + info.color}>
    <div className="module-icon"><Icon size={24} /></div>
    <div><h1 lang="en">{info.title}</h1><p>{children ?? info.description}</p></div>
  </div>;
}
export function Empty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-panel"><span className="module-icon tone-lilac"><AudioLines size={23}/></span><h2>{title}</h2><p>{children}</p>{action}</div>;
}
