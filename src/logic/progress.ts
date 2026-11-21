import type { Drill, Module, StoryMode, Task } from '../data/types';

const key = 'grammar-os-progress-v1';
const day = 86_400_000;
const intervals = [1, 3, 7, 14];
const drills = ['sort', 'form', 'meaning', 'story'] as const;
export const modules = [...drills, 'repair', 'system'] as const;
export interface Settings { sound: boolean; animation: boolean; hints: boolean; input: 'typing' | 'choice' }
interface RecordStats {
  rule: string; drill: Drill; attempts: number; firstTryCorrect: number; correctCount: number;
  wrongCount: number; lastSeenAt: number; nextReviewAt: number; streak: number; hintUsed: number;
  lastTurn: number; independent: number;
}
export interface Progress {
  version: 1; turn: number; points: number; tasks: Record<string, RecordStats>;
  activity: Record<Module, number>; rounds: Record<Module, number>; stories: string[]; settings: Settings;
}
export interface Attempt { id: string; rule: string; drill: Drill; correct: boolean; hint: boolean; typing: boolean }

const zeroModules = () => ({ sort: 0, form: 0, meaning: 0, story: 0, repair: 0, system: 0 });
export const defaults: Settings = { sound: false, animation: true, hints: true, input: 'typing' };
export const freshProgress = (): Progress => ({
  version: 1, turn: 0, points: 0, tasks: {}, activity: zeroModules(), rounds: zeroModules(), stories: [], settings: { ...defaults },
});
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value)
  ? value as Record<string, unknown> : {};

export function readProgress(): Progress {
  const initial = freshProgress();
  try {
    const raw = object(JSON.parse(localStorage.getItem(key) ?? 'null'));
    if (raw.version !== 1) return initial;
    const settings = object(raw.settings);
    const activity = object(raw.activity);
    const rounds = object(raw.rounds);
    const tasks = Object.entries(object(raw.tasks)).flatMap(([id, value]) => {
      const entry = object(value);
      if (typeof entry.rule !== 'string' || !drills.includes(entry.drill as Drill) || !number(entry.attempts)) return [];
      const record: RecordStats = {
        rule: entry.rule, drill: entry.drill as Drill, attempts: number(entry.attempts),
        firstTryCorrect: number(entry.firstTryCorrect), correctCount: number(entry.correctCount),
        wrongCount: number(entry.wrongCount), lastSeenAt: number(entry.lastSeenAt), nextReviewAt: number(entry.nextReviewAt),
        streak: number(entry.streak), hintUsed: number(entry.hintUsed), lastTurn: number(entry.lastTurn), independent: number(entry.independent),
      };
      return [[id, record] as const];
    });
    return {
      ...initial, turn: number(raw.turn), points: number(raw.points), tasks: Object.fromEntries(tasks),
      activity: Object.fromEntries(modules.map(mode => [mode, number(activity[mode])])) as Progress['activity'],
      rounds: Object.fromEntries(modules.map(mode => [mode, number(rounds[mode])])) as Progress['rounds'],
      stories: Array.isArray(raw.stories) ? raw.stories.filter((id): id is string => typeof id === 'string') : [],
      settings: {
        sound: settings.sound === true, animation: settings.animation !== false,
        hints: settings.hints !== false, input: settings.input === 'choice' ? 'choice' : 'typing',
      },
    };
  } catch {
    return initial;
  }
}

export function saveProgress(progress: Progress) {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* Progress is still available in this session. */ }
}

export function record(progress: Progress, attempts: Attempt[], module: Module, now = Date.now()): Progress {
  const tasks = { ...progress.tasks };
  let points = progress.points;
  let turn = progress.turn;
  for (const attempt of attempts) {
    const old = Object.hasOwn(tasks, attempt.id) ? tasks[attempt.id] : undefined;
    const success = Number(attempt.correct);
    const streak = success ? (old?.streak ?? 0) + 1 : 0;
    turn += 1;
    points += success ? (attempt.hint ? 5 : 10) : 0;
    tasks[attempt.id] = {
      rule: attempt.rule, drill: attempt.drill, attempts: (old?.attempts ?? 0) + 1,
      firstTryCorrect: (old?.firstTryCorrect ?? 0) + success, correctCount: (old?.correctCount ?? 0) + success,
      wrongCount: (old?.wrongCount ?? 0) + 1 - success, lastSeenAt: now, lastTurn: turn,
      nextReviewAt: now + (success ? intervals[Math.min(streak - 1, intervals.length - 1)] * day : 0),
      streak, hintUsed: (old?.hintUsed ?? 0) + Number(attempt.hint),
      independent: (old?.independent ?? 0) + Number(attempt.typing && attempt.correct && !attempt.hint),
    };
  }
  return { ...progress, turn, tasks, points, activity: { ...progress.activity, [module]: progress.activity[module] + attempts.length } };
}

export function summarize(progress: Progress, bank: readonly Task[]) {
  const applicable = new Map<string, Set<Drill>>();
  for (const task of bank) {
    const kinds = applicable.get(task.rule) ?? new Set<Drill>();
    kinds.add(task.kind === 'match' ? 'meaning' : task.kind === 'gap' ? 'story' : task.kind);
    applicable.set(task.rule, kinds);
  }
  const byRule = new Map<string, { correct: number; wrong: number; independent: number; completed: Set<Drill> }>();
  let attempts = 0;
  let correct = 0;
  let scheduled = 0;
  for (const entry of Object.values(progress.tasks)) {
    const item = byRule.get(entry.rule) ?? { correct: 0, wrong: 0, independent: 0, completed: new Set<Drill>() };
    item.correct += entry.correctCount;
    item.wrong += entry.wrongCount;
    item.independent += entry.independent;
    if (entry.correctCount) item.completed.add(entry.drill);
    byRule.set(entry.rule, item);
    attempts += entry.attempts;
    correct += entry.firstTryCorrect;
    if (entry.nextReviewAt) scheduled += 1;
  }
  const mastered = new Set(Array.from(byRule).flatMap(([word, item]) => {
    const kinds = applicable.get(word);
    const production = kinds?.has('form') || kinds?.has('story');
    return item.correct >= 3 && (!production || item.independent > 0) && item.completed.size >= Math.min(2, kinds?.size ?? 1)
      ? [word] : [];
  }));
  return { byRule, mastered, attempts, correct, scheduled, studied: byRule.size, accuracy: attempts ? Math.round(correct / attempts * 100) : null };
}

export function isDue(progress: Progress, task: Task, now = Date.now()) {
  const entry = progress.tasks[task.id];
  return Boolean(entry && entry.nextReviewAt <= now && (entry.streak > 0 || progress.turn - entry.lastTurn >= 3));
}
export function reviewQueue(progress: Progress, bank: readonly Task[], now = Date.now()) {
  return bank.filter(task => {
    const entry = progress.tasks[task.id];
    return entry && (isDue(progress, task, now) || (progress.turn - entry.lastTurn >= 3 && entry.wrongCount > entry.correctCount));
  }).sort((a,b) => {
    const first = progress.tasks[a.id];
    const second = progress.tasks[b.id];
    return Number(second.streak === 0) - Number(first.streak === 0) || first.nextReviewAt - second.nextReviewAt;
  });
}

export const storyCompleted = (progress: Progress, mode: StoryMode, stories: { id: string; mode: StoryMode }[]) =>
  stories.some(story => story.mode === mode && progress.stories.includes(story.id));
