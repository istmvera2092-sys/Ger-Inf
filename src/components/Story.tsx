import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, CircleX, Lightbulb } from 'lucide-react';
import type { Gap, Story } from '../data/types';
import { ruleById } from '../data/rules';
import { accepts, normalize, notifyAnswer } from '../logic/game';
import type { Attempt, Settings } from '../logic/progress';
import { ProgressStrip, StoryText } from './Practice';
import { RuleButton } from './ui';

export const storyModes = [
  ['heads', 'Main verbs'], ['forms', 'Verb forms'], ['mixed', 'Mixed stories'], ['contrast', 'Meaning change'],
] as const;

export function StoryCard({ story, settings, record, complete, onRule, onAgain }: {
  story: Story; settings: Settings; record: (attempts: Attempt[]) => void; complete: (id: string) => void;
  onRule: (rule: string, hint?: string) => void; onAgain: () => void;
}) {
  const [phase, setPhase] = useState<Gap['mode']>(story.mode === 'heads' || story.mode === 'mixed' ? 'head' : 'form');
  const [focus, setFocus] = useState('');
  const [values, setValues] = useState<Record<string,string>>({});
  const [review, setReview] = useState<Record<string,boolean> | null>(null);
  const [first, setFirst] = useState<Record<string,boolean>>({});
  const [hints, setHints] = useState<string[]>([]);
  const [hintText, setHintText] = useState('');
  const [done, setDone] = useState(false);
  const recorded = useRef(new Set<string>());
  const submitted = useRef(false);
  const gaps = story.gaps.filter(gap => gap.mode === phase);
  const target = gaps.find(gap => gap.id === focus && review?.[gap.id] !== true) ?? gaps.find(gap => review?.[gap.id] !== true) ?? gaps[0];
  const ready = gaps.every(gap => normalize(values[gap.id] ?? ''));
  const passed = review && gaps.every(gap => review[gap.id]);

  function check(event: FormEvent) {
    event.preventDefault();
    if (submitted.current || !ready || done || passed) return;
    submitted.current = true;
    const next = Object.fromEntries(gaps.map(gap => [gap.id, accepts(values[gap.id], gap.answers)]));
    setReview(next);
    if (!recorded.current.has(phase)) {
      recorded.current.add(phase);
      setFirst(previous => ({ ...previous, ...next }));
      record(gaps.map(gap => ({
        id: gap.id, rule: gap.rule, drill: 'story', correct: next[gap.id], hint: hints.includes(gap.id), typing: gap.mode === 'form',
      })));
    }
    const correct = gaps.every(gap => next[gap.id]);
    notifyAnswer(correct, settings.sound);
    setHintText('');
    if (correct && (story.mode !== 'mixed' || phase === 'form')) {
      setDone(true);
      complete(story.id);
    }
  }

  function update(id: string, value: string) {
    submitted.current = false;
    setValues(previous => ({ ...previous, [id]: value }));
  }
  function revealHint(rule = false) {
    if (!target) return;
    if (!review) setHints(previous => [...previous, target.id]);
    if (rule) onRule(target.rule, passed || done ? undefined : target.hint);
    else setHintText(target.hint);
  }

  return <form className="task-card story-card" onSubmit={check}>
    <div className="task-header"><div><p className="eyebrow">{done ? 'STORY COMPLETE' : phase === 'head' ? 'FILL IN THE MAIN VERBS' : 'FILL IN THE VERB FORMS'}</p>
      <h2 className="story-title" lang="en">{story.title}</h2></div>
      <RuleButton onClick={() => revealHint(true)}/>
    </div>
    {story.mode === 'mixed' && <ProgressStrip current={phase === 'head' ? 1 : 2} total={2} label="Stage"/>}
    {phase === 'head' && story.bank && !done && <div className="word-bank"><span>WORD BANK</span>
      {story.bank.map(word => {
        const current = gaps.find(gap => normalize(values[gap.id] ?? '') === normalize(word));
        const selected = gaps.find(gap => gap.id === focus && review?.[gap.id] !== true);
        const empty = gaps.find(gap => !normalize(values[gap.id] ?? ''));
        const pick = selected ?? empty ?? target;
        const unavailable = Boolean(passed || !pick || current?.id === pick.id || (current && review?.[current.id] === true));
        return <button key={word} type="button" lang="en" className={current ? 'bank-used' : undefined} disabled={unavailable} onClick={() => {
          if (!pick) return;
          submitted.current = false;
          setValues(previous => ({
            ...previous, ...(current ? { [current.id]: previous[pick.id] ?? '' } : {}), [pick.id]: word,
          }));
          setFocus('');
          setHintText('');
        }}>{word}</button>;
      })}
    </div>}
    <StoryText story={story} gapContent={(gap, index) => {
      if (done || phase === 'form' && gap.mode === 'head') return <strong className="completed-gap">{values[gap.id]}</strong>;
      if (gap.mode !== phase) return <span className="blank other-gap">[…]</span>;
      const result = review?.[gap.id];
      return <span className="inline-gap">
        <input className="answer-field"
          lang="en" aria-label={'Gap ' + index + (gap.lemma ? ', ' + gap.lemma : '')}
          aria-invalid={result === false || undefined} data-correct={result === true || undefined}
          placeholder={'[' + index + ']'} value={values[gap.id] ?? ''} disabled={result === true}
          onFocus={() => { setFocus(gap.id); setHintText(''); }} onChange={event => update(gap.id, event.target.value)}
          spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"/>
        {gap.lemma && <small>({gap.lemma})</small>}
      </span>;
    }}/>
    {hintText && !done && <p className="hint" role="status"><Lightbulb size={17}/> {hintText}</p>}
    {review && !passed && <aside className="feedback wrong" aria-live="polite">
      <div className="feedback-heading"><CircleX size={18}/><strong>Correct the highlighted gaps</strong></div>
      <ul>{gaps.filter(gap => !review[gap.id]).map(gap => <li key={gap.id}>
        <strong>[{story.gaps.indexOf(gap) + 1}]</strong> {gap.hint}
      </li>)}</ul>
    </aside>}
    {(done || passed) && <aside className="feedback right" aria-live="polite">
      <div className="feedback-heading"><Check size={19}/><strong>{done ? 'Story complete' : 'Main verbs complete'}</strong></div>
      <p>You got {Object.values(first).filter(Boolean).length} of {done ? story.gaps.length : gaps.length} right on the first try.</p>
      {done && <ul className="worked-patterns">{story.gaps.map(gap => <li key={gap.id}>
        <strong lang="en">{values[gap.id]}</strong> · {ruleById.get(gap.rule)?.pattern} <span>{gap.explanation}</span>
      </li>)}</ul>}
    </aside>}
    <div className="task-actions">
      {settings.hints && !passed && !done && <button type="button" className="button secondary" onClick={() => revealHint()}><Lightbulb size={17}/> Hint</button>}
      {done ? <button type="button" className="button primary" onClick={onAgain}>Back to stories</button>
        : passed ? <button type="button" className="button primary" onClick={() => { setPhase('form'); setReview(null); setFocus(''); submitted.current = false; }}>Continue to verb forms</button>
        : <button type="submit" className="button primary" disabled={!ready || submitted.current}><Check size={17}/> {review ? 'Check corrections' : 'Check story'}</button>}
    </div>
  </form>;
}
