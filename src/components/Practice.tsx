import { Fragment, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Check, ChevronDown, CircleX, GripVertical, Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import { bins, stageBins } from '../data/sort';
import { ruleById } from '../data/rules';
import { drillOf } from '../data/types';
import type { Gap, Module, Story, Task } from '../data/types';
import { accepts, answerFamily, normalize, notifyAnswer, shuffle, structureChoices } from '../logic/game';
import type { Attempt, Settings } from '../logic/progress';
import { Meter, RuleButton } from './ui';

export function StoryText({ story, gapContent }: { story: Story; gapContent: (gap: Gap, index: number) => ReactNode }) {
  return <p className="story-text" lang="en">{story.text.split(/\[(\d+)\]/).map((piece, index) =>
    index % 2 ? <Fragment key={index}>{gapContent(story.gaps[Number(piece) - 1], Number(piece))}</Fragment> : piece,
  )}</p>;
}

function AnswerField({ value, change, disabled, label, invalid }: {
  value: string; change: (value: string) => void; disabled?: boolean; label: string; invalid?: boolean;
}) {
  return <input className="answer-field" aria-label={label} aria-invalid={invalid || undefined} lang="en" autoComplete="off"
    autoCorrect="off" autoCapitalize="off" spellCheck={false} value={value} onChange={event => change(event.target.value)} disabled={disabled} placeholder="…" />;
}
function Feedback({ correct, answer, explanation, contrast }: { correct: boolean; answer?: string; explanation: string; contrast?: string }) {
  return <aside aria-live="polite" className={'feedback ' + (correct ? 'right' : 'wrong')}>
    <div className="feedback-heading">{correct ? <Check size={19}/> : <CircleX size={19}/>}<strong>{correct ? 'Correct' : 'Not quite'}</strong>{answer && <span lang="en">{answer}</span>}</div>
    <p>{explanation}</p>
    {contrast && <p className="contrast"><span>Compare</span> <span lang="en">{contrast}</span></p>}
  </aside>;
}

const withRule = (rule: string, explanation: string) => {
  const pattern = ruleById.get(rule)?.pattern;
  return pattern && !explanation.includes(pattern) ? pattern + '. ' + explanation : explanation;
};

export function TaskCard({ task, stage, module, settings, onAttempt, onNext, onRule, last }: {
  task: Task; stage: number; module: Module; settings: Settings; onAttempt: (attempt: Attempt) => void;
  onNext: () => void; onRule: (rule: string, hint?: string) => void; last: boolean;
}) {
  const [choice, setChoice] = useState('');
  const [value, setValue] = useState('');
  const [grabbing, setGrabbing] = useState(false);
  const [linked, setLinked] = useState(['','']);
  const [pairOptions] = useState(() => shuffle([0,1]));
  const [hint, setHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const checked = useRef(false);
  const next = useRef<HTMLButtonElement>(null);
  const locked = result !== null;
  useEffect(() => { if (locked) next.current?.focus(); }, [locked]);

  const multipleChoice = task.kind === 'form' && settings.input === 'choice' && module !== 'system';
  const steps = task.kind === 'form' && task.level === 1 && module === 'form' && !multipleChoice;
  const ready = task.kind === 'match' ? linked.every(Boolean)
    : task.kind === 'form' && !multipleChoice || task.kind === 'gap' ? Boolean(normalize(value))
    : Boolean(choice);
  const availableBins = task.kind === 'sort'
    ? stageBins[(module === 'sort' ? stage : task.stages[0]) - 1] : [];
  let title: ReactNode = '';
  let solution: string | undefined;
  let contrast: string | undefined;
  let correct = false;
  switch (task.kind) {
    case 'sort':
      title = 'Which pattern goes with this card?';
      correct = choice === task.bin;
      solution = bins[task.bin].label;
      break;
    case 'form':
      title = multipleChoice || steps && !choice ? 'Choose the verb form.' : 'Type the full verb form.';
      correct = multipleChoice ? task.answers.some(answer => answerFamily(answer, task.lemma) === choice) : accepts(value, task.answers);
      solution = task.answers.join(' / ');
      break;
    case 'meaning':
      title = task.format === 'interpret' ? 'What does the highlighted phrase mean?' : 'Which sentence matches the situation?';
      correct = Number(choice) === task.correct;
      solution = task.options[task.correct];
      contrast = task.contrast;
      break;
    case 'match':
      title = 'Match each sentence to its meaning.';
      correct = linked.every((answer, index) => answer === String(index));
      contrast = task.contrast;
      break;
    case 'gap':
      title = task.gap.mode === 'head' ? 'Fill in the main verb.' : 'Fill in the correct verb form.';
      correct = accepts(value, task.gap.answers);
      solution = task.gap.answers.join(' / ');
      break;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || checked.current) return;
    checked.current = true;
    setResult(correct);
    onAttempt({ id: task.id, rule: task.rule, drill: drillOf(task), correct, hint, typing: task.kind === 'gap' || task.kind === 'form' && !multipleChoice });
    notifyAnswer(correct, settings.sound);
  }

  return <form className="task-card" onSubmit={submit}>
    <div className="task-header"><h2>{title}</h2><RuleButton onClick={() => { if (!locked) setHint(true); onRule(task.rule, locked ? undefined : task.hint); }} /></div>
    {task.kind === 'sort' && <>
      <div className="sort-area">
        <button type="button" className={'word-tile ' + (grabbing ? 'selected' : '')} disabled={locked} aria-pressed={grabbing}
          draggable={!locked} onClick={() => setGrabbing(!grabbing)}
          onDragStart={event => { event.dataTransfer.setData('text/plain', task.id); event.dataTransfer.effectAllowed = 'move'; setGrabbing(true); }}
          onDragEnd={() => setGrabbing(false)}><GripVertical size={19}/><span lang="en">{task.label}</span></button>
      </div>
      <div className="bin-grid">
        {availableBins.map(id => <button type="button" key={id} disabled={locked}
          className={'bin bin-' + id + (choice === id ? ' selected' : '')}
          aria-pressed={choice === id} onClick={() => { setChoice(id); setGrabbing(false); }}
          onDragOver={event => { if (!locked) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
          onDrop={event => { event.preventDefault(); if (!locked && event.dataTransfer.getData('text/plain') === task.id) setChoice(id); setGrabbing(false); }}>
          <span className="bin-mark">{bins[id].mark}</span><strong>{bins[id].label}</strong><span>{bins[id].caption}</span>
        </button>)}
      </div>
    </>}
    {task.kind === 'form' && <>
      <p className="sentence" lang="en">{task.prompt.split('____')[0]}
        {multipleChoice || steps && !choice ? <span className="blank">_____</span>
          : <AnswerField value={value} change={setValue} label="Verb form" disabled={locked} invalid={result === false}/>}
        {task.prompt.split('____')[1]}
      </p>
      {(multipleChoice || steps) && <div className="choice-grid">
        {structureChoices(task).map(option => <button type="button" className={'option ' + (choice === option.id ? 'selected' : '')}
          key={option.id} disabled={locked} onClick={() => setChoice(option.id)} aria-pressed={choice === option.id}>
          <strong>{option.label}</strong><span>{option.sample}</span>
        </button>)}
      </div>}
    </>}
    {task.kind === 'meaning' && <>
      <p className="sentence">
        {task.focus ? <>{task.prompt.split(task.focus)[0]}<mark>{task.focus}</mark>{task.prompt.split(task.focus)[1]}</> : task.prompt}
      </p>
      <div className="meaning-options">
        {task.options.map((option, index) => <button type="button" key={option}
          className={'option ' + (choice === String(index) ? 'selected' : '')} aria-pressed={choice === String(index)}
          disabled={locked} onClick={() => setChoice(String(index))}>
          <span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}
        </button>)}
      </div>
    </>}
    {task.kind === 'match' && <div className="match-grid">
      {task.pairs.map(([sentence], index) => <label className="match-row" key={sentence}>
        <span lang="en">{sentence}</span><span className="select-wrap"><select value={linked[index]} disabled={locked}
          onChange={event => setLinked(linked.map((item, slot) => slot === index ? event.target.value : item))}>
          <option value="">Choose a meaning</option>{pairOptions.map(option => <option key={option} value={option}>{task.pairs[option][1]}</option>)}
        </select><ChevronDown size={16}/></span></label>)}
    </div>}
    {task.kind === 'gap' && <>
      <h3 className="story-title" lang="en">{task.story.title}</h3>
      {task.gap.mode === 'head' && task.story.bank && <div className="word-bank"><span>WORD BANK</span>
        {task.story.bank.map(word => <button type="button" key={word} lang="en" disabled={locked} onClick={() => setValue(word)}>{word}</button>)}
      </div>}
      <StoryText story={task.story} gapContent={(gap, index) => gap.id === task.id
        ? <span className="inline-gap"><AnswerField value={value} change={setValue} label={'Gap ' + index} disabled={locked} invalid={result === false}/>{gap.lemma && <small>({gap.lemma})</small>}</span>
        : <span className="blank other-gap">[…]</span>}/>
    </>}
    {showHint && !locked && <p className="hint" role="status"><Lightbulb size={17}/> {task.hint}</p>}
    {locked && <Feedback correct={result} answer={solution} explanation={withRule(task.rule, task.explanation)} contrast={contrast}/>}
    <div className="task-actions">
      {settings.hints && !locked && <button className="button secondary" type="button" onClick={() => { setHint(true); setShowHint(!showHint); }} aria-expanded={showHint}><Lightbulb size={17}/> Hint</button>}
      {locked ? <button ref={next} className="button primary" type="button" onClick={onNext}>{last ? 'See results' : 'Next question'}</button>
        : <button className="button primary" type="submit" disabled={!ready}><Check size={18}/> Check answer</button>}
    </div>
  </form>;
}

export function ProgressStrip({ current, total, label = 'Question' }: { current: number; total: number; label?: string }) {
  return <div className="progress-strip"><span>{label} <strong>{current} / {total}</strong></span><Meter value={total ? current / total * 100 : 0} label="Round progress"/></div>;
}

export function RoundSummary({ results, onAgain, onHome, onRetry }: {
  results: { correct: boolean; hint: boolean }[]; onAgain: () => void; onHome: () => void; onRetry?: () => void;
}) {
  const correct = results.filter(item => item.correct).length;
  const score = results.reduce((sum, item) => sum + (item.correct ? item.hint ? 5 : 10 : 0), 0);
  return <section className="empty-panel round-summary">
    <span className="module-icon tone-lilac"><Trophy size={25}/></span>
    <h2>Round complete</h2><p><strong>{correct} of {results.length} correct</strong> on the first try · <strong>+{score} points</strong></p>
    <div className="summary-score">{Math.round(correct / results.length * 100)}<span>%</span></div>
    <div className="center-actions">{onRetry && <button type="button" className="button primary" onClick={onRetry}><RotateCcw size={17}/> Review mistakes</button>}
      <button type="button" className={onRetry ? 'button secondary' : 'button primary'} onClick={onAgain}>New round</button>
      <button type="button" className="button secondary" onClick={onHome}>Back to modules</button></div>
  </section>;
}
