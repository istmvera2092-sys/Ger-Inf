import { rules } from './rules';
import type { Bin, SortTask } from './types';

export const bins: Record<Bin, { label: string; caption: string; mark: string }> = {
  ing: { label: 'V-ing', caption: 'Gerund', mark: '−ing' },
  to: { label: 'to + V', caption: 'Infinitive', mark: 'to' },
  both: { label: 'BOTH', caption: 'Both forms are possible', mark: '±' },
  object: { label: 'object + to + V', caption: 'Object and infinitive', mark: 'obj' },
  prep: { label: 'expression + V-ing', caption: 'Preposition or expression', mark: 'prep' },
};
export const stageBins: Bin[][] = [['ing','to'], ['ing','to','both'], ['ing','to','object','prep']];

export const sorts: SortTask[] = rules.flatMap((rule): SortTask[] => {
  const [group] = rule.groups;
  let bin: Bin;
  let stages = [1,2,3];
  let label = rule.label;
  if (group === 'object') {
    bin = 'object';
    stages = [3];
    label += ' somebody';
  } else if (group === 'expression' || group === 'prep') {
    if (["can't stand","can't bear","take up"].includes(rule.id)) return [];
    bin = 'prep';
    stages = [3];
  } else if (group === 'both' || group === 'change' || rule.id === 'bother') {
    bin = 'both';
    stages = [2];
  } else {
    if (['recommend','gerund subject'].includes(rule.id)) return [];
    bin = group === 'ing' ? 'ing' : 'to';
    if (rule.id.startsWith('would ')) stages = [2,3];
  }
  return [{ id: 'sort:' + rule.id, kind: 'sort', rule: rule.id, label, bin, stages,
    explanation: rule.note ?? 'This pattern uses ' + rule.pattern + '.',
    hint: 'Think of an example and notice which verb form follows.',
  }];
});
