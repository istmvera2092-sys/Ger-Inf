import type { Group, Rule } from './types';

type Row = [string, string, string, string?, string?];
const make = (group: Group, pattern: string, rows: Row[]): Rule[] =>
  rows.map(([label, gloss, example, second, note]) => ({
    id: label, label, gloss, groups: [group], pattern: pattern.replace('{word}', label),
    examples: second ? [example, second] : [example], note,
  }));

export const changes = {
  remember: ['keep something in mind', 'Remember a task you need to do.', 'Recall something that already happened.', 'Remember to lock the door.', 'I remember locking the door.'],
  forget: ['fail to remember', 'Fail to remember to do a task.', 'Lose or keep the memory of a past experience.', 'I forgot to send the email.', 'I’ll never forget meeting her.'],
  regret: ['feel sorry about something', 'Introduce bad news formally.', 'Feel sorry about something that already happened.', 'We regret to inform you that the event is cancelled.', 'I regret telling him the secret.'],
  try: ['make an attempt or test a method', 'Make an effort to do something.', 'Test a method or a possible solution.', 'I tried to open the window.', 'Try opening the window.'],
  mean: ['intend or involve', 'Intend to do something.', 'Involve something as part of an action or as its result.', 'I meant to call you.', 'This job means travelling a lot.'],
  stop: ['pause or come to an end', 'Pause one activity to do something else.', 'End the activity named in the sentence.', 'She stopped to drink water.', 'She stopped drinking coffee.'],
} as const;

const ing = make('ing', '{word} + V-ing', [
  ['admit','say that something is true','She admitted making a mistake.'],
  ['appreciate','be grateful for','I appreciate you helping me.'],
  ['avoid','stay away from','We avoided taking the motorway.'],
  ['celebrate','mark a happy occasion','He celebrated passing the exam.'],
  ['consider','think about a possibility','I’m considering changing my routine.'],
  ['delay','put off until later','They delayed making a decision.'],
  ['deny','say that something is untrue','She denied copying the answer.'],
  ['dislike','find something unpleasant','He dislikes waiting in queues.'],
  ['enjoy','take pleasure in','I enjoy learning new words.'],
  ['finish','bring to an end','We finished decorating the room.'],
  ['imagine','picture in your mind','Can you imagine living on Mars?'],
  ['involve','include as a necessary part','The job involves dealing with customers.'],
  ['keep','go on','Keep practising!'],
  ['mind','object to','Would you mind opening the window?'],
  ['miss','wish you could still do something','I miss spending time with my friends.'],
  ['postpone','put off until later','They postponed meeting the director.'],
  ['practise','do regularly to improve','She practises speaking every day.', 'He is practicing every day.', 'Practice and practicing are the American spellings.'],
  ['risk','take the chance that something bad will happen','You risk losing your progress.'],
  ['suggest','put forward an idea','I suggest revising these phrases.'],
  ['recommend','say that something is a good idea','I recommend reading this book.', 'I recommend that you read this book.', 'Use recommend doing or recommend that someone do something. With a noun, you can say “I recommended the book to her.”'],
]);
const to = make('to', '{word} + to + V', [
  ['agree','say yes to a proposal','We agreed to meet at six.'],
  ['appear','seem to be true','She appears to understand the problem.'],
  ['bother','make the effort','Don’t bother to call again.', 'He didn’t bother replying.', 'An -ing form also works in some contexts.'],
  ['decide','make a choice','They decided to leave early.'],
  ['demand','ask for strongly','He demanded to see the manager.'],
  ['fail','be unable to do what was expected','I failed to notice the sign.'],
  ['hope','want something to happen','She hopes to pass the exam.'],
  ['learn','gain a skill','I’m learning to drive.'],
  ['manage','succeed in doing something','He managed to solve the puzzle.'],
  ['offer','say you are willing to help','They offered to help.'],
  ['plan','decide what to do in advance','We plan to travel in June.'],
  ['refuse','say no','He refused to answer.'],
  ['seem','give the impression','She seems to know the answer.'],
  ['threaten','say you might do something harmful','They threatened to cancel the event.'],
  ['be supposed to','be expected or required to do something','You’re supposed to wear a helmet.'],
  ['promise','give your word','I promised to help.','I promised her that I would help.', 'To name the person you are making a promise to, use “promise someone (that) …”.'],
]);
const optionalObject = make('object', '{word} + (somebody) + to + V', [
  ['ask','make a request','I asked to leave.','I asked her to leave.'],
  ['choose','pick from several options','He chose to stay.','They chose Emma to lead the team.'],
  ['expect','think something will happen','We expect to win.','We expect them to win.'],
  ['help','make something easier for someone','He helped me to carry the boxes.','He helped me carry the boxes.', 'Help can also take an infinitive without to.'],
  ['intend','plan to do something','She intends to apply.','She intends her son to study abroad.', 'The pattern with an object is more formal.'],
  ['want','wish for something','I want to learn.','I want you to learn.'],
]).map(rule => ({ ...rule, groups: ['object', 'to'] as Group[] }));
const object = make('object', '{word} + somebody + to + V', [
  ['advise','give advice','The doctor advised me to rest.','The doctor advised resting at home.'],
  ['allow','give permission','They allowed us to enter.','They don’t allow smoking indoors.'],
  ['enable','make something possible','The software enables students to practise.'],
  ['encourage','give someone confidence or support','She encouraged me to try again.'],
  ['forbid','say that something is not allowed','They forbade visitors to take photos.','The museum forbids taking photos.'],
  ['force','make someone do something','The rules forced us to wait.'],
  ['invite','ask someone to join or attend','He invited us to join the club.'],
  ['order','give a command','The officer ordered them to stop.'],
  ['permit','give permission','They permitted us to leave.','This area permits cycling.'],
  ['persuade','get someone to agree to do something','She persuaded him to apologise.'],
  ['remind','help someone remember','Please remind me to call.'],
  ['teach','show someone how to do something','My teacher taught me to swim.'],
  ['tell','give an instruction','I told them to be quiet.'],
  ['warn','tell someone about a risk','They warned us not to touch the wire.'],
]).map(rule => ['advise','allow','forbid','permit'].includes(rule.id)
  ? { ...rule, groups: ['object','ing'] as Group[], note: 'Use an -ing form in the pattern without an object.' }
  : rule);
const prepositions = make('prep', '{word} + V-ing', [
  ['for','gives a reason','She thanked me for helping.'],
  ['by','shows the method','He improved his English by reading.'],
  ['after','later than an action','After finishing work, she went home.'],
  ['before','earlier than an action','Check the lights before leaving.'],
  ['without','in the absence of an action','He left without asking.'],
  ['look forward to','be excited about something in the future','I look forward to receiving your reply.', undefined, 'To is a preposition here.'],
  ['be used to','be familiar or comfortable with something','I’m used to getting up early.', undefined, 'To is a preposition here.'],
  ['be good at','be skilled at something','She’s good at solving puzzles.'],
  ['think about','think about a possibility','She was thinking about changing schools.'],
  ['take up','start doing as a hobby or activity','She took up swimming.'],
]);
const expressions = make('expression', '{word} + V-ing', [
  ["it's no good",'something will not help','It’s no good arguing about it.'],
  ["it's not worth",'something is not worth the effort','It’s not worth buying a new laptop yet.'],
  ["it's no use",'something will have no effect','It’s no use waiting here.'],
  ["it's a waste of time",'something takes time for little benefit','It’s a waste of time complaining without acting.'],
  ["can't stand",'find something very unpleasant','I can’t stand hearing that noise.','I can’t stand to see you so upset.', 'An infinitive also works in some contexts.'],
  ["can't bear",'find something very hard to tolerate','I can’t bear watching sad films.','I can’t bear to watch.', 'An infinitive also works in some contexts.'],
  ["can't help",'be unable to stop yourself','I can’t help laughing.'],
]);
const similar = make('both', '{word} + V-ing / to + V', [
  ['love','enjoy very much','I love cooking.','I love to cook for friends.'],
  ['hate','dislike intensely','I hate criticising people.','I hate to criticise people.'],
  ['like','find something enjoyable','I like reading on the train.','I like to read on the train.'],
  ['prefer','like one option more than another','I prefer travelling by train.','I prefer to travel by train.'],
  ['continue','go on','It continued being foggy.','It continued to be foggy.'],
]);
const would = make('to', '{word} + to + V', [
  ['would like','want politely','We would like to devote more time to exam preparation.','I’d like you to help.'],
  ['would love','be very keen to do something','I would love to join you.'],
  ['would hate','be very unwilling to do something','She would hate to miss the concert.'],
  ['would prefer','would choose one option over another','I would prefer to sit by the window.'],
]);
export const rules: Rule[] = [
  ...ing, ...to, ...optionalObject, ...object, ...prepositions, ...expressions, ...similar, ...would,
  ...Object.entries(changes).map(([id, [gloss, toMeaning, ingMeaning, toExample, ingExample]]): Rule => ({
    id, label: id, gloss, groups: ['change', ...(id === 'stop' || id === 'regret' ? ['ing' as const] : [])],
    pattern: id + ' + to + V / V-ing', examples: [toExample, ingExample],
    note: 'To + V — ' + toMeaning + ' V-ing — ' + ingMeaning,
  })),
  { id: 'gerund subject', label: 'V-ing as subject', gloss: 'an activity as the subject of a sentence', groups: ['ing' as const],
    pattern: 'V-ing + verb', examples: ['Reading helps me relax.', 'Correcting mistakes is part of learning.'] },
].map(rule => rule.id === 'be supposed to' ? { ...rule, pattern: 'be supposed to + V' } : rule);
export const ruleById = new Map(rules.map(rule => [rule.id, rule]));
