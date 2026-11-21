import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, ChartNoAxesColumnIncreasing, ChevronDown, CircleHelp, RotateCcw, Search, Settings as Gear, X } from 'lucide-react';
import { rules } from '../data/rules';
import type { Group, Rule } from '../data/types';
import { bank } from '../logic/game';
import { modules, summarize } from '../logic/progress';
import type { Progress, Settings } from '../logic/progress';
import { Empty, groups, moduleInfo } from './ui';

export function RuleDetails({ rule, extraClass = '' }: { rule: Rule; extraClass?: string }) {
  return <article className={'rule-entry ' + extraClass}>
    <div className="rule-top"><h3 lang="en">{rule.label}</h3><span>{rule.gloss}</span></div>
    <div className="rule-pattern" lang="en">{rule.pattern}</div>
    {rule.examples.map(example => <p key={example} className="rule-example" lang="en">{example}</p>)}
    {rule.note && <p className="rule-note">{rule.note}</p>}
  </article>;
}

function filterRules(query: string, group: Group | 'all') {
  const search = query.trim().toLowerCase().replaceAll('’', "'");
  return rules.filter(rule => {
    const matchesGroup = group === 'all' || rule.groups.includes(group) || group === 'both' && rule.groups.includes('change');
    const searchable = [rule.label, rule.id, rule.gloss, rule.pattern, rule.id === 'practise' ? 'practice practicing' : ''].join(' ').toLowerCase();
    return matchesGroup && searchable.includes(search);
  });
}

function RuleSearch({ query, setQuery, group, setGroup, autoFocus = false }: {
  query: string; setQuery: (value: string) => void; group: Group | 'all'; setGroup: (value: Group | 'all') => void;
  autoFocus?: boolean;
}) {
  return <div className="library-tools">
    <label className="searchbox"><Search size={19}/><input type="search" autoFocus={autoFocus} value={query} onChange={event => setQuery(event.target.value)}
      placeholder="Try avoid or remember" aria-label="Search rules" /></label>
    <div className="segments" aria-label="Rule categories">
      <button type="button" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>All</button>
      {groups.map(([id, label]) => <button type="button" key={id} aria-pressed={group === id} onClick={() => setGroup(id)}>{label}</button>)}
    </div>
  </div>;
}

export function RulesDatabase() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group | 'all'>('all');
  const visible = filterRules(query, group);
  return <>
    <div className="screen-heading tone-lilac"><span className="module-icon"><BookOpen size={24}/></span><div><h1>Rules reference</h1><p>Look up a verb pattern and see examples of how to use it.</p></div></div>
    <RuleSearch query={query} setQuery={setQuery} group={group} setGroup={setGroup}/>
    {!query && group === 'all' && <div className="rule-callouts">
      <article><span className="eyebrow">PREPOSITION OR INFINITIVE?</span><h2 lang="en">Two kinds of <em>to</em></h2>
        <p><strong lang="en">look forward to seeing</strong> — Here, <em>to</em> is a preposition followed by an <em>-ing</em> form.</p>
        <p><strong lang="en">want to see</strong> — Here, <em>to</em> is part of the infinitive.</p></article>
      <article><span className="eyebrow">PREFERENCES WITH WOULD</span><h2 lang="en">Would like + to</h2>
        <p>Use <em>to + V</em> after <strong lang="en">would like / love / hate / prefer</strong>.</p>
        <p lang="en">We would like to devote more time to exam preparation.</p></article>
    </div>}
    <p className="result-count" aria-live="polite">Showing {visible.length} of {rules.length} rules</p>
    {visible.length ? <div className="rules-grid">{visible.map(rule => <RuleDetails key={rule.id} rule={rule}/>)}</div>
      : <Empty title="No matches">Try a different word or select All.</Empty>}
  </>;
}

export function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => { if (element?.open) element.close(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onClose(); } }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-content">
      <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" type="button" onClick={onClose} aria-label="Close"><X size={21}/></button></div>
      {children}
    </div>
  </dialog>;
}

export function RuleDialog({ rule, hint, onClose }: { rule?: Rule; hint?: string; onClose: () => void }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group | 'all'>('all');
  const results = showLibrary && (query.trim() || group !== 'all') ? filterRules(query, group) : [];
  return <Dialog title={showLibrary ? 'Rules reference' : hint ? 'Question hint' : 'Rule'} onClose={onClose}>
    {showLibrary ? <>
      <RuleSearch query={query} setQuery={setQuery} group={group} setGroup={setGroup} autoFocus/>
      <div className="dialog-rules" aria-live="polite">
        {results.length ? results.map(entry => <RuleDetails key={entry.id} rule={entry}/>)
          : <p>{query.trim() || group !== 'all' ? 'No matches.' : 'Enter a word or choose a category.'}</p>}
      </div>
    </> : <>
      {hint ? <div className="hint"><CircleHelp size={19}/><p>{hint}</p></div> : rule && <RuleDetails rule={rule}/>}
      <div className="task-actions"><button className="button secondary" type="button" onClick={() => setShowLibrary(true)}>
        <BookOpen size={16}/> Open rules reference
      </button></div>
    </>}
  </Dialog>;
}

export function Statistics({ progress, review }: { progress: Progress; review: number }) {
  const stats = summarize(progress, bank);
  const hard = Array.from(stats.byRule.entries()).filter(([, item]) => item.wrong > 0)
    .sort(([, a], [, b]) => b.wrong - a.wrong || b.wrong / (b.correct + b.wrong) - a.wrong / (a.correct + a.wrong)).slice(0, 8);
  const ruleCards = rules.filter(rule => stats.byRule.has(rule.id));
  return <>
    <div className="screen-heading tone-lilac"><span className="module-icon"><ChartNoAxesColumnIncreasing size={24}/></span><div><h1>Your progress</h1><p>See your first-try accuracy, the patterns you know, and what to review.</p></div></div>
    <div className="stat-grid">
      <div className="stat-box"><span>STUDIED</span><strong>{stats.studied}<small> / {rules.length}</small></strong></div>
      <div className="stat-box"><span>MASTERED</span><strong>{stats.mastered.size}<small> / {rules.length}</small></strong></div>
      <div className="stat-box"><span>FIRST-TRY ACCURACY</span><strong>{stats.accuracy === null ? '—' : stats.accuracy + '%'}</strong></div>
      <div className="stat-box"><span>REVIEW</span><strong>{review}<small> / {stats.scheduled}</small></strong><p>due / scheduled</p></div>
    </div>
    <div className="stats-columns">
      <section className="detail-panel"><h2>Practice by module</h2>
        {modules.map(id => {
          const { icon: Icon, title, color } = moduleInfo[id];
          return <div className={'stats-row tone-' + color} key={id}><Icon size={18}/><span lang="en">{title}</span>
            <span>{progress.activity[id]} {progress.activity[id] === 1 ? 'answer' : 'answers'} · {progress.rounds[id]} {progress.rounds[id] === 1 ? 'round' : 'rounds'}</span></div>;
        })}
      </section>
      <section className="detail-panel"><h2>Tricky patterns</h2>
        {hard.length ? hard.map(([word, item]) => <div className="stats-row" key={word}><span lang="en">{word}</span><span>{item.wrong} of {item.correct + item.wrong} incorrect</span></div>)
          : <p>Patterns you miss will appear here.</p>}
      </section>
    </div>
    <section className="detail-panel"><h2>Verb patterns</h2>
      <p>Master a pattern by answering correctly three times. When available, type a correct answer without a hint and practise across two exercise types.</p>
      {ruleCards.length > 0 && <div className="construction-list">
        {ruleCards.map(rule => {
          const item = stats.byRule.get(rule.id)!;
          return <div className="stats-row" key={rule.id}><span lang="en">{rule.label}</span>
            <span>{stats.mastered.has(rule.id) ? 'Mastered' : item.correct + ' correct · ' + item.wrong + ' incorrect'}</span></div>;
        })}
      </div>}
    </section>
  </>;
}

export function SettingsScreen({ settings, onChange, onReset }: {
  settings: Settings; onChange: (settings: Settings) => void; onReset: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [reset, setReset] = useState(false);
  const toggles = [['sound','Sound','Play a short sound after checking an answer.'], ['animation','Animations','Animate transitions and answer feedback.'],
    ['hints','Hints','Show a hint button in exercises.']] as const;
  return <>
    <div className="screen-heading tone-lilac"><span className="module-icon"><Gear size={24}/></span><div><h1>Settings</h1><p>Choose how you want to practise.</p></div></div>
    <div className="detail-panel settings-panel">
      {toggles.map(([key, label, caption]) => <label key={key} className="setting-row">
        <span><strong>{label}</strong><small>{caption}</small></span>
        <input type="checkbox" role="switch" checked={settings[key]} onChange={event => onChange({ ...settings, [key]: event.target.checked })}/>
      </label>)}
      <label className="setting-row"><span><strong>Answer mode</strong><small>Applies to Syntax Forge and verb-form review.</small></span>
        <span className="select-wrap"><select value={settings.input} onChange={event => onChange({ ...settings, input: event.target.value as Settings['input'] })}>
          <option value="typing">Type the answer</option><option value="choice">Choose the form</option>
        </select><ChevronDown size={16}/></span></label>
    </div>
    <section className="detail-panel reset-panel"><div><h2>Reset progress</h2><p>Delete your points, statistics, and review history from this device.</p></div>
      <button type="button" className="button danger" onClick={() => setConfirm(true)}><RotateCcw size={17}/> Reset</button>
      {reset && <p role="status">Progress reset.</p>}
    </section>
    {confirm && <Dialog title="Reset progress?" onClose={() => setConfirm(false)}>
      <p>This will delete your points, statistics, and review queue.</p>
      <div className="task-actions"><button className="button secondary" type="button" onClick={() => setConfirm(false)}>Cancel</button>
        <button className="button danger" type="button" onClick={() => { onReset(); setConfirm(false); setReset(true); }}>Reset progress</button></div>
    </Dialog>}
  </>;
}
