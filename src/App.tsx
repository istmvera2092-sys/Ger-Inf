import { useEffect, useState } from 'react';
import { BookText, Check, ChevronRight, CircleCheck, LockKeyhole, RotateCcw, Terminal } from 'lucide-react';
import { forms } from './data/forms';
import { meanings, matches } from './data/meaning';
import { ruleById, rules } from './data/rules';
import { sorts } from './data/sort';
import { stories } from './data/stories';
import type { Module, Page, StoryMode, Task } from './data/types';
import { hasGameAccess, rememberGameAccess, watchGameAccess } from './logic/access';
import { bank, shuffle, systemRound } from './logic/game';
import { freshProgress, isDue, readProgress, record, reviewQueue, saveProgress, storyCompleted, summarize } from './logic/progress';
import type { Attempt, Progress } from './logic/progress';
import { AccessGate } from './components/AccessGate';
import { Back, Dashboard, Empty, Header, Heading, moduleInfo } from './components/ui';
import { ProgressStrip, RoundSummary, TaskCard } from './components/Practice';
import { StoryCard, storyModes } from './components/Story';
import { RuleDialog, RulesDatabase, SettingsScreen, Statistics } from './components/Library';

const sortLevels = ['Basics','Both forms','Objects and prepositions'];
const formLevels = ['Level 1','Level 2'];
const meaningLevels = ['Interpret the meaning','Choose the sentence','Match the meanings'];

function getPage(): Page {
  const hash = window.location.hash.slice(1);
  return hash === 'rules' || hash === 'stats' || hash === 'settings' || Object.hasOwn(moduleInfo, hash) ? hash as Page : 'home';
}
function pick(page: Page, level: number, progress: Progress): Task[] {
  function available<T extends Task>(tasks: T[]): T[] {
    return tasks.filter(task => progress.tasks[task.id]?.streak !== 0 || isDue(progress, task));
  }
  function preferred<T extends Task>(tasks: T[], ids: string[]): T[] {
    return ids.flatMap(id => tasks.filter(task => task.id === id && !progress.tasks[id]));
  }
  if (page === 'sort') {
    const tasks = available(sorts.filter(task => task.stages.includes(level)));
    const intro = preferred(tasks, level === 1 ? ['sort:enjoy', 'sort:decide'] : level === 2 ? ['sort:remember'] : []);
    const groups = Array.from(new Set(tasks.map(task => task.bin))).filter(group => !intro.some(task => task.bin === group));
    const representative = groups.map(group => shuffle(tasks.filter(task => task.bin === group))[0]);
    const random = shuffle(tasks.filter(task => !intro.includes(task) && !representative.includes(task)));
    return [...intro, ...shuffle([...representative, ...random.slice(0, 10 - intro.length - representative.length)])];
  }
  if (page === 'form') {
    const tasks = available(forms.filter(task => task.level === level));
    const intro = level === 1 ? preferred(tasks, ['F01', 'F02']) : [];
    return [...intro, ...shuffle(tasks.filter(task => !intro.includes(task))).slice(0, 10 - intro.length)];
  }
  if (page === 'meaning') {
    if (level === 3) return shuffle(available(matches));
    return shuffle(available(meanings.filter(task => task.format === (level === 1 ? 'interpret' : 'context')))).slice(0,10);
  }
  return page === 'system' ? systemRound() : [];
}

export default function App() {
  const [unlocked, setUnlocked] = useState(hasGameAccess);
  useEffect(() => watchGameAccess(setUnlocked), []);

  function enter() {
    rememberGameAccess(true);
    setUnlocked(true);
  }

  function exit() {
    rememberGameAccess(false);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
    setUnlocked(false);
  }

  return unlocked ? <Game onExit={exit}/> : <AccessGate onEnter={enter}/>;
}

function Game({ onExit }: { onExit: () => void }) {
  const [progress, setProgress] = useState(readProgress);
  const [page, setPage] = useState(getPage);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState<Task[]>(() => getPage() === 'repair' ? reviewQueue(progress, bank).slice(0, 10) : pick(getPage(), 1, progress));
  const [roundId, setRoundId] = useState(0);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Attempt[]>([]);
  const [storyMode, setStoryMode] = useState<StoryMode>('heads');
  const [storyId, setStoryId] = useState('');
  const [rule, setRule] = useState<{ id: string; hint?: string } | null>(null);
  const [retrying, setRetrying] = useState(false);
  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    function navigateHistory() {
      const target = getPage();
      setPage(target);
      setLevel(1);
      setIndex(0);
      setRoundId(id => id + 1);
      setResults([]);
      setStoryId('');
      setStoryMode('heads');
      setRetrying(false);
      setRule(null);
      const saved = readProgress();
      setRound(target === 'repair' ? reviewQueue(saved, bank).slice(0, 10) : pick(target, 1, saved));
      window.scrollTo(0,0);
    }
    window.addEventListener('popstate', navigateHistory);
    return () => window.removeEventListener('popstate', navigateHistory);
  }, []);

  const stats = summarize(progress, bank);
  const queue = reviewQueue(progress, bank);
  const percent = Math.round(stats.mastered.size / rules.length * 100);
  const levels = page === 'sort' ? sortLevels : page === 'form' ? formLevels : page === 'meaning' ? meaningLevels : [];
  const activeStory = stories.find(story => story.id === storyId);
  const canMix = storyCompleted(progress, 'heads', stories) && storyCompleted(progress, 'forms', stories);
  const activeTask = round[index];
  const handleRule = (id: string, hint?: string) => setRule({ id, hint });
  const pushAttempt = (attempts: Attempt[], module: Module) => setProgress(previous => record(previous, attempts, module));
  const incRound = (module: Module) => setProgress(previous => ({ ...previous, rounds: { ...previous.rounds, [module]: previous.rounds[module] + 1 } }));

  function resetRound(next: Task[]) {
    setRound(next);
    setRoundId(id => id + 1);
    setRetrying(false);
    setResults([]);
    setIndex(0);
  }

  function go(target: Page) {
    if (target !== page) window.history.pushState(null, '', target === 'home' ? window.location.pathname + window.location.search : '#' + target);
    setPage(target);
    setLevel(1);
    setStoryId('');
    setStoryMode('heads');
    setRule(null);
    resetRound(target === 'repair' ? reviewQueue(progress, bank).slice(0, 10) : pick(target, 1, progress));
    window.scrollTo(0,0);
  }

  const taskPage = page !== 'home' && page !== 'rules' && page !== 'stats' && page !== 'settings' && page !== 'story';
  const pending = bank.filter(task => progress.tasks[task.id]?.streak === 0 && !isDue(progress, task)).length;

  return <div className={'app' + (!progress.settings.animation ? ' no-motion' : '')}>
    <Header page={page} go={go} percent={percent} onExit={onExit}/>
    <main className={page === 'home' ? 'main dashboard' : 'main interior'}>
      {page === 'home' ? <Dashboard go={go} start={() => go(progress.activity.sort ? 'form' : 'sort')} studied={stats.studied} total={rules.length}
        points={progress.points} percent={percent} review={queue.length}/>
      : <Back onClick={() => { if (activeStory && page === 'story') setStoryId(''); else go('home'); }}>
        {activeStory && page === 'story' ? 'Back to stories' : 'Back to modules'}</Back>}
      {page === 'rules' && <RulesDatabase/>}
      {page === 'stats' && <Statistics progress={progress} review={queue.length}/>}
      {page === 'settings' && <SettingsScreen settings={progress.settings}
        onChange={settings => setProgress(previous => ({ ...previous, settings }))}
        onReset={() => setProgress(previous => ({ ...freshProgress(), settings: previous.settings }))}/>}
      {taskPage && <>
        <Heading page={page}/>
        {levels.length > 0 && <div className="segments levels" aria-label="Levels">
          {levels.map((name, slot) => <button type="button" key={name} aria-pressed={level === slot + 1} onClick={() => {
            if (level === slot + 1) return;
            setLevel(slot + 1);
            resetRound(pick(page, slot + 1, progress));
          }}>{name}</button>)}
        </div>}
        {activeTask ? <>
          <ProgressStrip current={index + 1} total={round.length} label={retrying ? 'Review' : 'Question'}/>
          <TaskCard key={roundId + ':' + activeTask.id} task={activeTask} stage={level} module={page} settings={progress.settings}
            onRule={handleRule} last={index + 1 === round.length}
            onAttempt={attempt => { pushAttempt([attempt], page); setResults(previous => [...previous, attempt]); }}
            onNext={() => { if (index + 1 === round.length) incRound(page); setIndex(index + 1); }}/>
        </> : results.length > 0
          ? <RoundSummary results={results} onHome={() => go('home')} onAgain={() => resetRound(page === 'repair' ? reviewQueue(progress, bank).slice(0, 10) : pick(page, level, progress))}
            onRetry={results.some(item => !item.correct) ? () => { const wrong = round.filter(task => results.some(item => item.id === task.id && !item.correct) && isDue(progress, task));
              if (wrong.length) { resetRound(wrong); setRetrying(true); } else go('repair');
            } : undefined}/>
          : page === 'repair' && <Empty title={pending ? 'A few more questions before review' : 'Nothing to review yet'}
            action={<button type="button" className="button primary" onClick={() => go('sort')}><RotateCcw size={17}/> Start practice</button>}>
            {pending ? 'Answer a few more questions and your mistakes will appear here for review.' : 'Your mistakes and any questions due for review will appear here.'}
          </Empty>}
      </>}
      {page === 'story' && <>
        <Heading page="story"/>
        {activeStory ? <StoryCard key={activeStory.id} story={activeStory} settings={progress.settings} onRule={handleRule}
          record={attempts => pushAttempt(attempts, 'story')}
          complete={id => { incRound('story'); setProgress(previous => ({ ...previous, stories: Array.from(new Set([...previous.stories, id])) })); }}
          onAgain={() => setStoryId('')}/>
          : <>
            <div className="segments levels" aria-label="Story formats">
              {storyModes.map(([id, label]) => <button type="button" key={id} aria-pressed={storyMode === id} onClick={() => setStoryMode(id)}>{id === 'mixed' && !canMix && <LockKeyhole size={14}/>} {label}</button>)}
            </div>
            {storyMode === 'mixed' && !canMix ? <Empty title="Complete two stories first">Complete one story in Main verbs and one in Verb forms to unlock mixed stories.</Empty>
              : <div className="story-list">{stories.filter(story => story.mode === storyMode).map(story => <button type="button" key={story.id}
                className="story-select" onClick={() => setStoryId(story.id)}>
                <span className="module-icon tone-blue"><BookText size={20}/></span>
                <span><strong lang="en">{story.title}</strong><small>{story.gaps.length} gaps</small></span>
                {progress.stories.includes(story.id) ? <CircleCheck size={20} className="story-completed" aria-label="Completed"/> : <ChevronRight size={20}/>}
              </button>)}</div>}
          </>}
      </>}
    </main>
    <footer className="footer"><div><span><Terminal size={17}/> GRAMMAR OS</span><span><Check size={15}/> Progress is saved on this device</span></div></footer>
    {rule && <RuleDialog rule={ruleById.get(rule.id)} hint={rule.hint} onClose={() => setRule(null)}/>}
  </div>;
}
