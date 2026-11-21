import { changes } from './rules';
import type { MatchTask, MeaningTask } from './types';

type Verb = keyof typeof changes;
type Row = [Verb, string, string, string, string, 'to' | 'ing', string];
const rows: Row[] = [
  ['remember','I remembered to send the email.','remembered to send','I remembered the task and sent the email.','I can recall the experience of sending the email.','to','I remember sending the email.'],
  ['remember','I remember sending the email.','remember sending','I can recall sending the email.','I still need to send the email.','ing','I remembered to send the email.'],
  ['forget','I forgot to bring the keys.','forgot to bring','I left the keys behind because taking them slipped my mind.','I took the keys and later forgot that I had taken them.','to','I’ll never forget meeting you.'],
  ['forget',"I'll never forget meeting you.",'forget meeting','The memory of our meeting will always stay with me.','I will remember to meet you tomorrow.','ing','I forgot to bring the keys.'],
  ['regret','I regret telling him the truth.','regret telling','I wish I had kept the truth to myself.','I feel sorry to share some news right now.','ing','We regret to tell you that the event is cancelled.'],
  ['regret','We regret to tell you that the event is cancelled.','regret to tell','We are breaking some bad news to you now.','We feel sorry that we shared the news in the past.','to','I regret telling him the truth.'],
  ['try','Try restarting the computer.','Try restarting','Test whether a restart fixes the problem.','Make every effort to get the computer to restart.','ing','I tried to restart the computer, but it wouldn’t turn on.'],
  ['try',"I tried to restart the computer, but it wouldn't turn on.",'tried to restart','I made an effort to restart it, but it would not turn on.','I restarted it to see whether that would solve the problem.','to','Try restarting the computer.'],
  ['mean','I meant to phone you.','meant to phone','I intended to call you.','Making calls is part of my job.','to','This position means working at weekends.'],
  ['mean','This position means working at weekends.','means working','Working at weekends is part of the job.','I intend to work at weekends.','ing','I meant to phone you.'],
  ['stop','We stopped to take photos.','stopped to take','We paused what we were doing so we could take photos.','We ended the activity of taking photos.','to','We stopped taking photos.'],
  ['stop','We stopped taking photos.','stopped taking','We ended the activity of taking photos.','We paused another activity in order to take photos.','ing','We stopped to take photos.'],
  ['remember','Remind a friend to lock the door before leaving.','','Remember to lock the door.','I remember locking the door.','to','I remember locking the door.'],
  ['remember','You recall the first time you met your teacher.','','I remember meeting our teacher.','I remembered to meet our teacher.','ing','I remembered to meet our teacher.'],
  ['forget','You left your umbrella at home because taking it slipped your mind.','','I forgot to take my umbrella.','I forgot taking my umbrella.','to','I’ll never forget meeting my favourite writer.'],
  ['forget','You will always remember performing in your first concert.','','I’ll never forget playing my first concert.','I’ll never forget to play my first concert.','ing','I forgot to play the last song.'],
  ['regret','You are making a formal announcement that a flight has been cancelled.','','We regret to announce that the flight is cancelled.','We regret announcing that the flight is cancelled.','to','We regret announcing the news too early.'],
  ['regret','You wish you had kept the photos you deleted yesterday.','','I regret deleting the photos yesterday.','I regret to delete the photos yesterday.','ing','We regret to inform you that the photos are gone.'],
  ['try','You made an effort to move the cupboard and it stayed in place.','','I tried to move the cupboard, but it wouldn’t budge.','The cupboard was in the way, so I tried moving it somewhere else.','to','Try moving the cupboard closer to the window.'],
  ['try','Suggest a password change as a possible fix for a sign-in problem.','','Try changing your password. That might fix it.','Try to change your password before it expires.','ing','I tried to change my password, but the page wouldn’t load.'],
  ['mean','You intended to write and it slipped your mind.','','I meant to write, but I forgot.','A longer report means writing more.','to','A longer report means writing more.'],
  ['mean','Moving out of town would make the journey to work longer.','','Moving out of town means travelling further to work.','I meant to travel further out of town.','ing','I meant to travel further out of town.'],
  ['stop','The walkers paused their walk to have a short break.','','They stopped to rest.','They stopped resting.','to','They stopped resting and started walking again.'],
  ['stop','Sam no longer cycles to work after moving house.','','Sam stopped cycling to work.','Sam stopped to cycle to work.','ing','Sam stopped to cycle around the lake.'],
];

export const meanings: MeaningTask[] = rows.map(([rule,prompt,focus,right,wrong,form,contrast], index) => {
  const correct = Math.floor(index / 2) % 2;
  return {
    id: 'M' + String(index + 1).padStart(2,'0'), kind: 'meaning', rule, prompt, focus: focus || undefined,
    options: correct === 0 ? [right,wrong] : [wrong,right], correct, contrast,
    format: index < 12 ? 'interpret' : 'context',
    explanation: (form === 'to' ? 'To + V. ' + changes[rule][1] : 'V-ing. ' + changes[rule][2]),
    hint: 'Think about what the second action means in this situation.',
  };
});

export const matches: MatchTask[] = (Object.keys(changes) as Verb[]).map(rule => {
  const [, toMeaning, ingMeaning, toExample, ingExample] = changes[rule];
  return {
    id: 'match:' + rule, kind: 'match', rule, pairs: [[toExample,toMeaning],[ingExample,ingMeaning]],
    explanation: 'To + V — ' + toMeaning + ' V-ing — ' + ingMeaning,
    contrast: toExample + ' / ' + ingExample,
    hint: 'Find to + V and the -ing form, then think about what each one expresses.',
  };
});
