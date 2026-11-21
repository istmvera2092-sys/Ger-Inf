import { sorts } from '../data/sort';
import { forms } from '../data/forms';
import { meanings, matches } from '../data/meaning';
import { stories } from '../data/stories';
import type { FormTask, GapTask, Task } from '../data/types';

export const gapTasks: GapTask[] = stories.flatMap(story => story.gaps.map(gap => ({ ...gap, kind: 'gap', story, gap })));
export const bank: Task[] = [...sorts, ...forms, ...meanings, ...matches, ...gapTasks];

export const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\.$/, '').trim();
export const accepts = (value: string, answers: string[]) => answers.some(expected => normalize(expected) === normalize(value));

export function shuffle<T>(source: readonly T[]): T[] {
  const items = [...source];
  for (let index = items.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [items[index], items[next]] = [items[next], items[index]];
  }
  return items;
}

export function systemRound() {
  return shuffle<Task>([
    ...shuffle(sorts).slice(0, 5),
    ...shuffle(forms).slice(0, 7),
    ...shuffle(meanings).slice(0, 4),
    ...shuffle(stories).slice(0, 4).map(story => shuffle(gapTasks.filter(task => task.story.id === story.id))[0]),
  ]);
}

export function structureChoices(task: FormTask): { id: string; label: string; sample: string }[] {
  const choices = [
    { id: 'ing', label: 'V-ing', sample: 'Gerund' },
    { id: 'to', label: 'to + V', sample: 'To-infinitive' },
  ];
  if (task.answers.includes(task.lemma)) choices.push({ id: 'bare', label: 'V', sample: 'Bare infinitive' });
  return choices;
}

export const answerFamily = (answer: string, lemma: string) => normalize(answer).startsWith('to ') ? 'to'
  : normalize(answer) === normalize(lemma) ? 'bare' : 'ing';

export function notifyAnswer(correct: boolean, enabled: boolean) {
  if (!enabled || !window.AudioContext) return;
  try {
    const audio = new AudioContext();
    const sound = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    sound.type = 'sine';
    sound.frequency.setValueAtTime(correct ? 660 : 300, now);
    sound.frequency.linearRampToValueAtTime(correct ? 880 : 250, now + 0.12);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    sound.connect(gain).connect(audio.destination);
    sound.onended = () => { void audio.close(); };
    sound.start();
    sound.stop(now + 0.2);
  } catch { /* Audio is optional on devices without Web Audio support. */ }
}
