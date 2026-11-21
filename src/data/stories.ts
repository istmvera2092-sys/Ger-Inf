import type { Gap, Story, StoryMode } from './types';

type GapRow = [rule: string, answer: string, lemma: string | null, hint: string, explanation?: string];
function story(id: string, title: string, mode: StoryMode, text: string, bank: string[] | undefined, rows: GapRow[]): Story {
  return { id, title, mode, text, bank, gaps: rows.map(([rule, answer, lemma, hint, explanation], index): Gap => ({
    id: id + '-' + (index + 1), mode: lemma ? 'form' : 'head', rule, lemma: lemma ?? undefined, answers: answer.split('|'), hint,
    explanation: explanation ?? 'The main verb pattern is “' + rule + '”.',
  })) };
}

export const stories = [
  story('S01','The School Project','heads',
    'Our class had one week to prepare a science presentation. First, we [1] to work in small teams. Emma [2] making a long video because it would take too much time. She [3] creating a short animation instead. At first, our laptop kept crashing, but we finally [4] to save the project. One student [5] to present in front of the whole class, so we gave him a different task. In the end, everyone contributed, and the presentation went well.',
    ['suggested','refused','managed','decided','avoided'], [
      ['decide','decided',null,'The team made a choice about how to work.'],
      ['avoid','avoided',null,'Emma chose not to spend time on the longer task.'],
      ['suggest','suggested',null,'Emma came up with an idea for the group.'],
      ['manage','managed',null,'The team succeeded in saving the project.'],
      ['refuse','refused',null,'The student said no to presenting.'],
    ]),
  story('S02','The Unexpected Trip','forms',
    'On Friday, we planned [1] a small coastal town. I suggested [2] the early train, but my friend wanted [3] longer. We ended up leaving late. While waiting at the station, I kept [4] the departure board. A member of staff advised us [5] another platform. Luckily, we managed [6] the train. I really enjoyed [7] the sea through the window.',
    undefined, [
      ['plan','to visit','visit','Find the verb that describes what the group intended to do.'], ['suggest','taking','take','Find the verb that introduces a suggestion.'],
      ['want','to sleep','sleep','What did the friend want to do?'], ['keep','checking','check','The action happened again and again.'],
      ['advise','to use','use','The advice was given to us. Notice the object us.'], ['manage','to catch','catch','The group succeeded in doing this.'],
      ['enjoy','watching','watch','The speaker found the activity enjoyable.'],
    ]),
  story('S03','The Interview','heads',
    'Daniel [1] to get a job at a local technology company. Before the interview, he [2] practising answers with a friend. During the meeting, he [3] feeling nervous, but he answered the questions clearly. At the end, the manager [4] to show him the office. Daniel [5] to send a sample of his work the next day. He left feeling optimistic.',
    ['offered','considered','promised','hoped','admitted'], [
      ['hope','hoped',null,'Daniel wanted a good outcome.'], ['consider','considered',null,'Daniel thought about an option.'],
      ['admit','admitted',null,'He spoke openly about how he felt.'], ['offer','offered',null,'The manager volunteered to show him the office.'],
      ['promise','promised',null,'Daniel gave his word.'],
    ]),
  story('S04','A Difficult Decision','forms',
    "Maya was thinking about [1] schools. She wanted [2] more science, but she didn't want [3] her friends. Her parents encouraged her [4] to her teachers. She enjoyed [5] possible options and eventually decided [6] to a new programme. Although she was nervous, she hoped [7] new friends there.",
    undefined, [
      ['think about','changing','change','What verb form comes after the preposition about?'], ['want','to study','study','The main verb expresses a wish.'],
      ['want','to leave','leave','The negative still uses the same pattern after want.'], ['encourage','to talk','talk','Notice the object her.'],
      ['enjoy','discussing','discuss','Find the verb that shows Maya liked the activity.'], ['decide','to apply','apply','Maya made a decision.'],
      ['hope','to make','make','What did Maya hope to do?'],
    ]),
  story('S05','Computer Trouble','contrast',
    "Yesterday, Alex forgot [1] his document before the computer shut down. He tried [2] the laptop, but the power button didn't respond. Then his friend said, “Try [3] the charger for a minute.” That worked. Alex remembered [4] a backup the previous week, so most of the document was safe. After the incident, he decided [5] his files more often.",
    undefined, [
      ['forget','to save','save','Alex needed to save the file and forgot.','Forget to + V means failing to remember to do something.'],
      ['try','to restart|restarting','restart','The laptop did not respond.','Try to restart emphasises the unsuccessful attempt. Try + V-ing also works when describing a method Alex tested.'],
      ['try','disconnecting|to disconnect','disconnect','The friend suggested a way to solve the problem.','Try disconnecting presents a method to test. Try to disconnect puts the focus on the attempt.'],
      ['remember','making','make','Alex had already made the backup the week before.','Remember + V-ing means recalling a past event.'],
      ['decide','to save','save','Alex made a decision about what to do in future.'],
    ]),
  story('S06','A Better Routine','heads',
    'Nina wanted to spend less time online. She [1] to put her phone away during dinner. Her brother [2] going for a walk after school, and Nina liked the idea. At first, she [3] checking social media while studying. After she [4] doing her homework, she went outside. She soon realised that she [5] spending time away from screens.',
    ['enjoyed','finished','avoided','suggested','agreed'], [
      ['agree','agreed',null,'Nina accepted a condition.'], ['suggest','suggested',null,'Her brother came up with an idea.'],
      ['avoid','avoided',null,'Nina tried to stay off social media.'], ['finish','finished',null,'The homework was done.'],
      ['enjoy','enjoyed',null,'She liked the time away from screens.'],
    ]),
  story('S07','The Book Drive','heads',
    'Our library was collecting books for a community centre. The librarian [1] to lend us a trolley, and we accepted her offer. I [2] to ask the principal for permission, so we had to postpone the collection for a day. Priya [3] sorting the donations by age group because children would find the shelves easier to use. Everyone [4] carrying boxes long after the first load was ready, and by five we had filled the van. The centre invited us to come back the following month.',
    ['kept','offered','forgot','suggested'], [
      ['offer','offered',null,'The librarian volunteered to help.'], ['forget','forgot',null,'The speaker failed to ask for permission in time.'],
      ['suggest','suggested',null,'Priya put forward a way to sort the books.'], ['keep','kept',null,'Everyone went on carrying boxes.'],
    ]),
  story('S08','A Place in the Team','forms',
    "Leo wasn’t sure he was good enough for the school basketball team. His sister encouraged him [1] out, and he improved his shots by [2] in the park every evening. At the tryout, he was surprised by how friendly the other players were. After [3] his final drill, Leo spoke to the coach. He said he would like [4] the team even if he spent the first few games on the bench. The coach told him [5] back on Monday.",
    undefined, [
      ['encourage','to try','try','Notice the object him after encouraged.'], ['by','practising|practicing','practise','By introduces a method.'],
      ['after','finishing','finish','After is a preposition here.'], ['would like','to join','join','Look for the expression with would.'],
      ['tell','to come','come','The coach gave Leo an instruction. Notice the object him.'],
    ]),
  story('S09','A Weekend Workshop','forms',
    'Asha signed up for a ceramics workshop without [1] anyone to go with her. She wanted [2] something she could do after work, and she had always enjoyed [3] things with her hands. At first, her bowls kept collapsing. The instructor advised her [4] less water. By the end, Asha had made a small blue bowl. She told the instructor she would like [5] again next month and was looking forward to [6] how to make a handle.',
    undefined, [
      ['without','asking','ask','Look for the preposition before the gap.'], ['want','to find','find','She wished to find an activity.'],
      ['enjoy','making','make','The main verb expresses enjoyment.'], ['advise','to use','use','The advice was given to Asha. Notice the object her.'],
      ['would like','to come','come','The expression before the gap contains would.'], ['look forward to','learning','learn','To is a preposition here.'],
    ]),
  story('S10','The Weekend Shift','mixed',
    'At the café, Sam [1] to cover a Saturday shift after a colleague called in sick. Before opening, his manager reminded him [2] the table reservations. When orders started piling up, she [3] putting the takeaway drinks on a separate counter. Sam liked the idea and managed [4] the queue moving. After closing, Sam thanked her for [5] him through the busiest part of the day. He is now looking forward to training the next new member of staff.',
    ['suggested','agreed'], [
      ['agree','agreed',null,'Sam said yes to covering the shift.'], ['remind','to check','check','What did Sam need to remember to do?'],
      ['suggest','suggested',null,'The manager came up with a new idea.'], ['manage','to keep','keep','Sam succeeded in getting a result.'],
      ['for','helping','help','For is a preposition here.'],
    ]),
  story('S11','A Plan for the Fair','mixed',
    'The class [1] to hold a small book fair in the gym. We planned [2] the circular tables near the entrance, but the caretaker told us to leave that space open. Priya [3] moving the tables by the windows instead. We spent the afternoon carrying boxes and managed [4] one corner for quiet reading. On Friday, it started raining, so we were relieved to have picked an indoor venue. The teachers offered [5] the doors early in the morning.',
    ['suggested','decided'], [
      ['decide','decided',null,'The class made a decision about the location.'], ['plan','to put','put','Find the verb that expresses a plan.'],
      ['suggest','suggested',null,'Priya put forward an alternative.'], ['manage','to save','save','What did the group succeed in doing?'],
      ['offer','to open','open','The teachers volunteered to help.'],
    ]),
  story('S12','The Long Cycle Ride','contrast',
    'On a long cycle ride, Leila stopped [1] some water by a bridge and then got back on her bike. She had meant [2] her brother before leaving, but her phone had no signal at home. When her chain came loose, she tried [3] it back on, but it kept slipping. Her friend suggested a different approach. Going home by train would mean [4] the last stretch of the route, so they fixed the bike and continued. Leila still remembers [5] the sea when they finally reached the coast.',
    undefined, [
      ['stop','to drink','drink','Why did she pause her bike ride?','Stop to + V tells us why someone paused an activity.'],
      ['mean','to phone','phone','Leila intended to make a call.','Mean to + V expresses an intention.'],
      ['try','to put|putting','put','The attempt to fix the chain failed.','To put emphasises the attempt. Putting describes a method they tested.'],
      ['mean','missing','miss','What would be a consequence of taking the train?','Mean + V-ing describes what a choice involves.'],
      ['remember','seeing','see','Leila is recalling what happened on the coast.','Remember + V-ing means recalling a past event.'],
    ]),
];
