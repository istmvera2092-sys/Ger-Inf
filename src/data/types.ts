export type Group = 'ing' | 'to' | 'object' | 'both' | 'change' | 'prep' | 'expression';
export type Drill = 'sort' | 'form' | 'meaning' | 'story';
export type Module = Drill | 'repair' | 'system';
export type Page = 'home' | 'rules' | 'stats' | 'settings' | Module;

export interface Rule {
  id: string;
  label: string;
  gloss: string;
  groups: Group[];
  pattern: string;
  examples: string[];
  note?: string;
}

export interface BaseTask { id: string; rule: string; explanation: string; hint: string }
export type Bin = 'ing' | 'to' | 'object' | 'both' | 'prep';
export interface SortTask extends BaseTask { kind: 'sort'; label: string; bin: Bin; stages: number[] }
export interface FormTask extends BaseTask { kind: 'form'; prompt: string; lemma: string; answers: string[]; level: number }
export interface MeaningTask extends BaseTask {
  kind: 'meaning'; prompt: string; focus?: string; options: [string, string]; correct: number;
  contrast: string; format: 'interpret' | 'context';
}
export interface MatchTask extends BaseTask {
  kind: 'match'; pairs: [string, string][]; contrast: string;
}
export type StoryMode = 'heads' | 'forms' | 'mixed' | 'contrast';
export interface Gap extends BaseTask {
  mode: 'head' | 'form'; lemma?: string; answers: string[]; pattern?: string;
}
export interface Story {
  id: string; title: string; mode: StoryMode; text: string; bank?: string[]; gaps: Gap[];
}
export interface GapTask extends BaseTask { kind: 'gap'; story: Story; gap: Gap }
export type Task = SortTask | FormTask | MeaningTask | MatchTask | GapTask;

export const drillOf = (task: Task): Drill => task.kind === 'gap' ? 'story' : task.kind === 'match' ? 'meaning' : task.kind;
