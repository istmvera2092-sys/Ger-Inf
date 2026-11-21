# Gerunds & Infinitives · Grammar OS

An English grammar game for B1–B2 learners. [Play on GitHub Pages](https://istmvera2092-sys.github.io/Ger-Inf/).

## Run the game

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173/ in your browser. To try the production build at the same address, stop the dev server, then run `npm run build` followed by `npm run preview`. The production build caches its files on the first visit so you can reopen it offline at the same address. The browser stores your points, settings, and review schedule.

## Enter and exit

Enter the access code supplied with the game. The browser remembers access across visits. Select **Exit game** to return to the access screen. Your points, settings, and review schedule are available when you enter again.

Access is checked locally in the browser. Use localhost or HTTPS to run the game.

## Practice modules

- **Sort Engine** lets you sort verb patterns at three levels using a keyboard, touch, or drag and drop.
- **Syntax Forge** lets you type verb forms or choose a form, depending on your settings.
- **Meaning Switch** lets you interpret sentences, pick a sentence for a given situation, or match sentences to meanings.
- **Story Protocol** covers main verbs, verb forms, and meaning changes. Complete one story in Main verbs and one in Verb forms to unlock mixed stories.
- **Error Repair** brings back mistakes after you answer three other questions. Correct answers are scheduled for review after 1, 3, 7, and 14 days.
- **System Check** scores your first answers to 20 mixed questions.

## Add exercises

Rules live in `src/data/rules.ts`, sorting in `src/data/sort.ts`, verb forms in `src/data/forms.ts`, meanings in `src/data/meaning.ts`, and stories in `src/data/stories.ts`. Append new form and meaning entries to preserve existing IDs. Include a rule ID, checked answers, and an explanation. Separate alternative answers with `|`. In stories, number the gaps `[1]`, `[2]`, and so on, and list the answers in the same order.
