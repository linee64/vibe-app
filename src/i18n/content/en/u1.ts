import type { UnitTr } from '../types'

export const u1: UnitTr = {
  title: 'Your first prompt',
  subtitle: 'Learn to give AI clear tasks',
  description: 'What vibe coding is and what makes a good prompt',
  lessons: {
    'u1-1': {
      title: 'What is vibe coding',
      ex: [
        {
          title: 'What is vibe coding?',
          situation: 'A friend asks: “Everyone’s talking about vibe coding. What even is it?” How do you explain it in one sentence?',
          options: [
            'You describe the task in words, AI writes the code, and you check the result and steer',
            'AI comes up with the product idea itself and ships it with no human involved',
            'A new programming language that neural networks are written in',
          ],
          explain: 'Andrej Karpathy coined the term “vibe coding” in February 2025: you describe the task in words and AI writes the code. Karpathy joked that you can “forget that the code even exists”, but in a real project checking the result is still your job.',
        },
        {
          title: 'Who can see your files?',
          prompt: 'You opened a regular AI chat in your browser and sent it this. What will it most likely reply?',
          tool: 'AI chat in the browser',
          input: 'Fix the color of the “Buy” button in my project.',
          outcomes: [
            { label: 'It asks you to send the code — it can’t see the project', text: 'I can’t see your project files. Send me the button code and I’ll tell you what to change — you’ll paste it in yourself.' },
            { label: 'It opens Button.tsx and saves the change itself', text: 'Done! Opened src/components/Button.tsx and changed the color to coral. Changes saved.' },
            { label: 'It deploys the updated site', text: 'Updated the color and published a new version of the site. Check your link!' },
          ],
          explain: 'A browser chat only sees what you paste into it. AI editors and agents can edit files right in your project: Cursor, Claude Code in the terminal and similar tools. And v0, Lovable and Bolt build the app in their own cloud, right on the website.',
        },
        {
          title: 'The vibe coding loop',
          prompt: 'Put the steps of working with AI in order. One card doesn’t belong.',
          steps: ['Describe the task in words', 'AI writes the code', 'Run it and check it yourself', 'Say what to fix'],
          extra: ['Ship it right away without opening it'],
          explain: 'Vibe coding is a loop: prompt → result → check → follow-up. You keep spinning it until you’re happy with the result. Shipping unchecked work means handing bugs to your users.',
        },
        {
          title: 'What can’t you trust here?',
          prompt: 'AI finished a sign-in form and reported back. Find the sentence you can’t rely on.',
          file: 'AI reply',
          code: [
            'Done! I built a sign-in form with email and password fields.',
            'The code is fully tested and 100% working — no need to check it.',
            'Errors show up under the fields, the logic is in LoginForm.tsx.',
            'If you want, I’ll add a “Forgot password?” link.',
          ],
          explain: 'AI makes mistakes in a confident tone and may sincerely believe everything works. Your role is client and tester: run it, click around, try a wrong password. For learning projects manual testing is enough; for serious ones you also want humans to review the code.',
        },
        {
          title: 'Your first prompt',
          prompt: 'Two prompts for the same app. Which one worked better?',
          sides: [
            {
              prompt: 'Make a web Pomodoro timer: a big “Start” button, a 25-minute countdown, and a sound at the end.',
              result: { label: 'Pomodoro timer', ui: { blocks: { 1: { text: 'Focus session' }, 2: { text: '▶ Start' }, 3: { text: '🔔 A sound will play at the end' } } } },
            },
            { prompt: 'Make an app.', result: { label: 'Generic template' } },
          ],
          reasons: [
            'It describes exactly what should come out: purpose, elements and behavior',
            'It’s longer, and AI always answers long prompts better',
            'It doesn’t contain the word “app”, and AI doesn’t like that word',
            'It’s more polite, so AI tries harder',
          ],
          explain: 'Ask for “an app” and AI gives you the internet average. Purpose, key elements and behavior remove the guesswork — it’s about specifics, not length.',
        },
      ],
    },
    'u1-2': {
      title: 'Context is everything',
      ex: [
        {
          title: 'Level up the coffee shop prompt',
          prompt: 'With this prompt, AI will spit out a bland template. Add what it needs to know and dodge the traps.',
          base: 'Make a website for a coffee shop.',
          chips: [
            { tag: 'Context', text: 'Zerno coffee shop near the university; guests are students and freelancers.' },
            { tag: 'Stack', text: 'A single page in React + Tailwind.' },
            { tag: 'Structure', text: 'Sections: menu with prices, opening hours, map and a “Book a table” button.' },
            { tag: 'Style', text: 'Warm colors: coffee #6B4226 and coral #FF7A59, Nunito font.' },
            { tag: 'Style', text: 'Make it beautiful and modern.', trap: 'Everyone has their own idea of “beautiful” — AI will pick a template at random. Colors and a font are specifics.' },
            { tag: 'Emphasis', text: 'URGENT!!! MY JOB DEPENDS ON THIS!!!', trap: 'Caps lock and pressure add no information. AI needs context, not emotions.' },
            { tag: 'Example', text: 'Make it exactly like Starbucks.', trap: 'You can’t copy someone else’s brand, and “like theirs” without details will be read AI’s own way. Better to describe the techniques you like.' },
          ],
          explain: 'A good prompt names the context, stack, structure and style. The less AI has to guess, the closer the result is to what you had in mind.',
        },
        {
          title: 'The “About us” page',
          prompt: 'Both prompts ask for the same thing. Why are the results so different?',
          sides: [
            {
              prompt: 'I have a bakery website in React; our customers are families with kids. Make an “About us” page in the same style as the home page.',
              result: { label: 'A warm page for families', ui: { blocks: { 0: { items: ['Menu', 'About us', 'Order'], logo: '🥐 Pyshka' }, 1: { text: 'Baking for the whole family since 2019' }, 2: { label: 'bakery photo' }, 3: { text: 'Kids’ corner, cocoa and buns with less sugar.' } } } },
            },
            { prompt: 'Make an “About us” page.', result: { label: 'Generic template' } },
          ],
          reasons: [
            'It has context: what the project is, who it’s for and what style',
            'It’s longer, and more words always mean a better result',
            'It mentions React — without the stack name AI can’t write pages at all',
            'It’s more polite',
          ],
          explain: 'Picture a smart newcomer on your team: they don’t know your project. Audience, stack, existing code and style are context. Length alone doesn’t help — what matters is what you actually told it.',
        },
        {
          title: 'Who is the app for?',
          prompt: 'The prompt says who the product is for. What will AI most likely build?',
          tool: 'App builder',
          input: 'Make a to-do list for my elderly parents: big buttons, simple words, no settings.',
          outcomes: [
            { label: 'Big buttons and simple words', ui: { blocks: { 0: { text: 'My tasks' }, 1: { items: ['☐ Take my pills', '☐ Call my grandson'] }, 2: { text: '＋ Add a task' } } } },
            { label: 'A dense interface with filters and tags', ui: { blocks: { 0: { items: ['Filters', 'Tags', '⚙'] }, 2: { text: 'Settings · Integrations · API' } } } },
            { label: 'A dark dashboard for developers' },
          ],
          explain: 'Once AI knows who the product is for, it makes its own choices: font size, tone of the copy, number of features. “For my elderly parents” tells it more than a list of ten layout requirements.',
        },
        {
          title: 'AI filled in the blanks',
          prompt: 'You asked for a payment button with no details — and AI filled in the gaps on its own. What do you reply?',
          chat: [
            { text: 'Add a payment button.' },
            { text: 'Done! Added a “Pay” button and hooked up PayPal with a $9.99/month subscription 💳' },
          ],
          options: [
            'No: it’s a one-time payment via Stripe Checkout. The button opens the Stripe payment page, and after payment goes to /thanks. Remove the subscription and PayPal.',
            'Make the button bigger and coral.',
            'That’s not it, redo it.',
            'Make it like the big online stores do.',
          ],
          explain: 'Payments can be one-time or a subscription, through a widget or the provider’s page. Which provider and what happens after payment shape all of the code. “That’s not it” makes AI guess again, and the button color can be fixed later.',
        },
        {
          title: 'A new chat is a blank slate',
          situation: 'You open a new chat and type “add a cart”. AI sends you Vue code, even though your project is React + Supabase.',
          options: [
            'Give context: the stack, the project structure, what’s already done — and ask again',
            'Write “no, not like that” and wait for AI to figure it out',
            'Rewrite the project in Vue, since AI decided so',
          ],
          explain: 'A new chat doesn’t remember previous conversations about your project. In AI editors you can pin context with rules files — for example .cursor/rules or AGENTS.md in Cursor, CLAUDE.md in Claude Code — but in a regular chat you have to describe the stack and the task yourself.',
        },
      ],
    },
    'u1-3': {
      title: 'Role and response format',
      ex: [
        {
          title: 'Check before launch',
          prompt: 'You want to find your app’s weak spots before launch. Which prompt won?',
          sides: [
            { prompt: 'Check my notes app.', result: { label: 'Compliments', text: 'Looks great! The code is clean and the structure is clear 👍 Ready to launch.' } },
            {
              prompt: 'You are a strict QA tester. Find 5 scenarios in which my notes app might break. Answer as a numbered list.',
              result: { label: 'A list of risks', text: '1. An empty note gets saved.\n2. Very long text breaks the layout.\n3. A double click creates a duplicate.\n4. No internet — the note is lost.\n5. Emoji in the title break search.' },
            },
          ],
          reasons: [
            'The role sets AI up to hunt for problems, and the format makes the answer easy to check',
            'The role gives AI access to testers’ knowledge it doesn’t otherwise have',
            'AI always answers with a list if the prompt is longer than one line',
            'The word “strict” makes AI work longer',
          ],
          explain: 'A role sets focus and tone: a “tester” looks for edge cases, a “designer” looks at spacing and contrast. A role adds no new knowledge, so still spell out the task and the response format explicitly.',
        },
        {
          title: 'Format matters',
          prompt: 'The prompt sets the response format. What will AI send?',
          input: 'Give me 5 name ideas for a habit-tracker app. As a numbered list, one per line, no explanations.',
          outcomes: [
            { label: 'Exactly 5 lines as a list', text: '1. Habitly\n2. Step by Step\n3. Every Day\n4. Spark\n5. Rhythm' },
            { label: 'An essay on why names matter', text: 'A name is the face of a product. It should be short, memorable and capture the essence. For example, you could play on the idea of consistency, or…' },
            { label: 'A table with analysis', text: '| Name | Pros | Cons |\n| Habitly | catchy | long |\n| Rhythm | short | taken |' },
          ],
          explain: 'The response format is part of the prompt. A list, a table, “code only”, “no more than 3 sentences” — AI follows such instructions easily when you state them directly.',
        },
        {
          title: 'Just the code, please',
          prompt: 'Every time, AI writes a wall of explanations, but you need a ready-to-use file. Level up the prompt.',
          base: 'Make a sign-in form component.',
          chips: [
            { tag: 'Role', text: 'You are an experienced React developer.' },
            { tag: 'Details', text: 'Email and password fields; show errors under the fields.' },
            { tag: 'Format', text: 'Reply with only the full code of LoginForm.tsx, no explanations.' },
            { tag: 'Constraint', text: 'No third-party libraries.' },
            { tag: 'Format', text: 'Keep it short.', trap: '“Short” can mean anything: shorter code? shorter explanations? Name the format directly: “only the file’s code”.' },
            { tag: 'Tone', text: 'How many times do I have to explain!', trap: 'Emotions don’t help: AI responds to concrete instructions, not irritation.' },
            { tag: 'Role', text: 'You are the best programmer in the world, a genius.', trap: 'Flattery clarifies nothing. A role works when it sets a point of view: “React developer”, “tester”.' },
          ],
          explain: 'Role, details, constraints and an explicit response format (“only the full file code, no explanations”) — and AI sends exactly what you can paste into your project.',
        },
        {
          title: 'A wall of text instead of an answer',
          prompt: 'AI replied with a long text, but you need to compare the options quickly. Your move?',
          chat: [
            { text: 'Compare Vercel, Netlify and GitHub Pages for my landing page.' },
            { text: 'Great question! Vercel is a platform created by the Next.js team that offers… Netlify, in turn, came earlier and is known for… As for GitHub Pages, it’s a service… (6 more paragraphs)' },
          ],
          options: [
            'Put this in a table: columns “free tier”, “ease of use”, “best for”. No intros.',
            'Too long.',
            'You wrote a wall of text again, come on!',
            'So which one is better?',
          ],
          explain: 'When you ask for a specific format — a table with the columns you need — the answer is instantly easy to compare. “Too long” doesn’t say what the answer should look like.',
        },
        {
          title: 'Explain it simpler',
          situation: 'You asked AI to explain what a piece of code does, and it showers you with jargon: “closure”, “memoization”, “side effect”.',
          options: [
            'Set a role and audience: “Explain like a mentor to a beginner, no jargon, in 3 sentences”',
            'Write “explain it properly”',
            'Learn all the terms first, then ask again',
          ],
          explain: 'Who the answer is for and how long it should be are part of the prompt too. “A mentor for a beginner, 3 sentences, no jargon” gives AI a clear frame; “properly” doesn’t.',
        },
      ],
    },
    'u1-4': {
      title: 'Constraints and criteria',
      ex: [
        {
          title: 'Dark mode without surprises',
          prompt: 'Add constraints and a done criterion so AI doesn’t renovate the whole project.',
          base: 'Add dark mode.',
          chips: [
            { tag: 'Context', text: 'The project uses React + Tailwind.' },
            { tag: 'Constraint', text: 'Don’t change component markup and don’t touch App.tsx.' },
            { tag: 'Criterion', text: 'Done when the toggle in the header switches the theme and the choice persists after a reload.' },
            { tag: 'Format', text: 'Show only the changed files.' },
            { tag: 'Freedom', text: 'Feel free to improve the whole project while you’re at it.', trap: 'That’s an invitation to rewrite everything. Constraints exist precisely so AI doesn’t touch working code.' },
            { tag: 'Criterion', text: 'Do a good job.', trap: '“Good” can’t be checked. A done criterion is something you can verify by hand.' },
            { tag: 'Emphasis', text: 'DON’T YOU DARE MAKE MISTAKES!', trap: 'Threats and caps lock don’t add precision.' },
          ],
          explain: 'Constraints narrow AI’s room for improvisation (which stack, what not to touch), and a done criterion says how to check the result. Together they protect working code.',
        },
        {
          title: 'Change a button color',
          prompt: 'You need to change the color of one button in a big project. Whose prompt is safer?',
          sides: [
            { prompt: 'Make the button better and improve the whole project while you’re at it.', result: { label: 'Renovation across 14 files', lines: ['✎ Files changed: 14', '✎ New folder structure', '✎ 6 libraries updated', '✗ npm run build: 3 errors'] } },
            { prompt: 'Change the color of the “Buy” button to #FF7A59. Don’t touch any other code.', result: { label: 'One line in one file', lines: { 3: '>Buy</button>' } } },
          ],
          reasons: [
            'A precise task plus a constraint: AI changes one line instead of renovating',
            'Freedom always gives a better result, but this prompt is shorter',
            'Without a HEX code AI can’t change colors at all',
            'Short prompts are always safer than long ones',
          ],
          explain: 'A precise task and the constraint “don’t touch anything else” — and AI won’t go where you didn’t ask. “Improve everything” invites changes across dozens of files that are then hard to review.',
        },
        {
          title: 'Guardrails for AI',
          prompt: 'The prompt has three constraints. What will the AI agent most likely do?',
          tool: 'AI editor',
          input: 'Make a contact form. Constraints: no third-party libraries, only “name” and “email” fields, don’t touch App.tsx.',
          outcomes: [
            { label: 'A separate component, App.tsx untouched', text: 'Created ContactForm.tsx: “name” and “email” fields, validation in plain React. I didn’t change App.tsx — add the form yourself: <ContactForm />.' },
            { label: 'Installed libraries and rewrote App.tsx', text: 'Installed react-hook-form and yup, added “phone” and “address” fields, and rewrote App.tsx for the new form.' },
          ],
          explain: 'Constraints are guardrails: which libraries are allowed, which fields are needed, which files not to touch. The clearer the guardrails, the fewer surprises in the diff.',
        },
        {
          title: '“Everything is saved now”',
          prompt: 'AI insists the task is done. How do you make the result verifiable?',
          chat: [
            { text: 'Make the tasks get saved.' },
            { text: 'Done! Everything is saved now 👍' },
          ],
          options: [
            'Criterion: tasks stay after a page reload and after closing the tab. Where are they stored and how can I check that?',
            'Thanks, I believe you!',
            'Are you absolutely sure?',
            'Make it save even better.',
          ],
          explain: 'A done criterion is something you can check by hand: “after a reload the tasks are still there”. Another “yes, I’m sure” from AI proves nothing.',
        },
        {
          title: 'I only asked for the color',
          prompt: 'AI finished the change. Accept what you asked for and reject the extras.',
          request: 'Change the color of the “Buy” button to coral #FF7A59. Don’t touch anything else.',
          hunks: {
            2: {
              lines: { 1: '-  <a href="/catalog">Catalog</a>', 2: '-  <a href="/delivery">Delivery</a>', 3: '+  <a href="/">Home</a>' },
              harmful: 'You only asked for the button color, but AI rewrote the menu and deleted the links to the catalog and delivery.',
            },
          },
          explain: 'The hover color is part of the same button — that change is on point. A rewritten menu is a change outside the task. Reviewing the diff before accepting a change catches these “while I was at it” edits.',
        },
      ],
    },
    'u1-5': {
      title: 'Iterate instead of starting over',
      ex: [
        {
          title: 'Cramped cards',
          prompt: 'The result is almost there, but the product cards are squeezed together. How do you follow up?',
          chat: [
            { text: 'Make a catalog: product cards with a photo, name and price.' },
            { text: 'Done, here’s the catalog:', preview: { blocks: { 0: { text: 'Catalog' }, 1: { items: ['Mug $6', 'Thermos $15', 'Tea $4'] } } } },
          ],
          options: [
            'Increase the gap between cards to 24px and the padding inside each card to 16px. Don’t change anything else.',
            'That’s not it, redo it.',
            'Do it all over, but better.',
            'The cards look kind of off.',
          ],
          explain: 'A good follow-up says what’s wrong and what it should be instead. “That’s not it” makes AI guess again — and it may break what already works.',
        },
        {
          title: 'The silent form',
          prompt: 'The form works, but nothing visible happens after submitting. Pattern: what works → what’s wrong → what to do.',
          chat: [
            { text: 'Make a booking form: name and phone.' },
            { text: 'Done! The form sends the data to the server.', preview: { blocks: { 0: { label: 'Name', value: 'Aida' }, 1: { label: 'Phone', value: '+1 555 …' }, 2: { text: 'Book now' } } } },
          ],
          options: [
            'The form submits, but the person doesn’t see any result. After submitting, show “Thanks, we’ll call you back!” and clear the fields.',
            'Why is nothing happening???',
            'Delete the form, it doesn’t work.',
            'Start the project over.',
          ],
          explain: 'What works → what’s wrong → what should happen. A follow-up like this keeps what’s done and adds what’s missing.',
        },
        {
          title: 'Small steps',
          prompt: 'You need to change the font, add a menu, connect payments and add dark mode. Build the rhythm for working on one change.',
          steps: ['Ask for one change', 'Check the result in the browser', 'Save a working version (commit)', 'Move on to the next change'],
          extra: ['Ask for all four changes in one message'],
          explain: 'Small steps are easy to check and roll back. If you ask for everything at once and something breaks, it’s hard to tell what exactly.',
        },
        {
          title: 'AI started forgetting',
          situation: 'The conversation with AI got very long: it gets confused and forgets agreements you made an hour ago.',
          options: [
            'Start a new chat and briefly describe the project, its current state and the task',
            'Keep going in the same chat and write “you forgot again” every time',
            'Switch to another AI and just say “continue” without explaining anything',
          ],
          explain: 'AI has a limited “context window”: in a long conversation early details get lost or compressed. A new chat with a short summary gives it back everything important, while another AI with no explanation knows nothing about the project.',
        },
        {
          title: 'Edit or start over?',
          prompt: 'The landing page is almost done, but the heading is a bit small. Which request is better?',
          sides: [
            {
              prompt: 'Do it all over, but better.',
              result: { label: 'A new site — and losses', ui: { blocks: { 0: { text: 'A totally different design' }, 2: { text: 'Gone: the booking form and your copy' } } } },
            },
            {
              prompt: 'Leave everything as is, just make the hero heading bigger (48px) and centered.',
              result: { label: 'Same, but a bigger heading', ui: { blocks: { 0: { text: 'Guitar lessons for adults' }, 1: { text: 'Your first song in a month' }, 2: { text: 'Sign up' } } } },
            },
          ],
          reasons: [
            'It keeps what’s done and changes one specific spot',
            'Starting over is always cheaper than editing',
            'It’s shorter than the first one',
            'AI understands “better” exactly the way you do',
          ],
          explain: 'Vibe coding is a loop: prompt → result → follow-up. Small precise edits work better than “rewrite everything”: a rewrite loses what was already good.',
        },
      ],
    },
    'u1-6': {
      title: 'Unit final test',
      ex: [
        {
          title: 'Tip calculator',
          prompt: 'You need a tip calculator. Which prompt won?',
          sides: [
            { prompt: 'calculator', result: { label: 'A regular calculator' } },
            {
              prompt: 'Make a web tip calculator: a bill amount field, 10/15/20% buttons and the total in a large font. One page, no sign-up.',
              result: { label: 'Tip calculator', ui: { blocks: { 0: { label: 'Bill amount', value: '$120' }, 2: { text: 'Total: $138' } } } },
            },
          ],
          reasons: [
            'Goal, interface contents and constraints — AI doesn’t have to guess',
            'It has numbers, and AI loves numbers',
            'It starts with a capital letter',
            'AI reads a short prompt as “do whatever you want”, and that’s only bad sometimes',
          ],
          explain: 'Goal, interface contents and constraints in one prompt. Given the single word “calculator”, AI honestly built the most ordinary calculator.',
        },
        {
          title: 'Plan first, code second',
          prompt: 'It’s a big task: a user account area. Level up the prompt so AI doesn’t rush into writing hundreds of lines.',
          base: 'Add a user account area to the app.',
          chips: [
            { tag: 'Questions', text: 'Before writing code, ask me clarifying questions.' },
            { tag: 'Plan', text: 'Then propose a step-by-step plan.' },
            { tag: 'Stop', text: 'Only start writing code after I say “ok”.' },
            { tag: 'Speed', text: 'Don’t ask questions, just write all the code right away.', trap: 'Then AI writes hundreds of lines based on its guesses, and misunderstandings surface way too late.' },
            { tag: 'Example', text: 'Make it like the big services do.', trap: '“Like the big services” means hundreds of different solutions. Without specifics AI will pick at random.' },
          ],
          explain: 'A plan before code catches misunderstandings before AI writes hundreds of lines of the wrong thing. Cursor and Claude Code have a dedicated planning mode for this — Plan Mode.',
        },
        {
          title: 'The cart adds up to NaN',
          prompt: 'AI wrote a function that sums the cart, but it returns NaN. Tap the line with the bug.',
          explain: 'The condition “i <= prices.length” goes past the end of the array: the last prices[i] is undefined, and the sum turns into NaN. It should be “<”.',
        },
        {
          title: 'A function that doesn’t exist',
          prompt: 'AI explains its change. One sentence is made up. Find it.',
          file: 'AI reply',
          code: [
            'Done! Prices on the cards are now formatted with thousands separators: $12,000.',
            'I used the browser’s built-in formatPrice() function — it’s available everywhere.',
            'The call is in ProductCard.jsx, on the price line.',
            'If needed, I’ll add the currency symbol to the settings.',
          ],
          explain: 'Browsers have no built-in formatPrice() — AI sometimes confidently “invents” functions. For formatting numbers there’s Intl.NumberFormat. Hallucinations like this surface on the very first run: “formatPrice is not defined”.',
        },
        {
          title: 'One precise edit',
          prompt: 'The result is almost done; only the heading needs fixing. What do you write?',
          chat: [
            { text: 'Make the hero section for an English course.' },
            { text: 'Done:', preview: { blocks: { 0: { text: 'English in 3 months' }, 2: { text: 'Sign up' } } } },
          ],
          options: [
            'Make the heading large (40px), bold and centered. Don’t touch anything else.',
            'Redo everything.',
            'The heading is bad.',
            'Make ten versions, I’ll pick one.',
          ],
          explain: 'Iterating in small, precise steps is a vibe coder’s core skill: which element → what it should become → what not to touch.',
        },
        {
          title: 'A table, on request',
          prompt: 'What will AI send for this request?',
          input: 'Compare Vercel, Netlify and GitHub Pages in a table: columns “free tier”, “ease of use”, “best for”.',
          outcomes: [
            { label: 'A table with three columns', text: '| Service | Free | Ease | Best for |\n| Vercel | yes | high | React, Next.js |\n| Netlify | yes | high | static sites, forms |\n| GitHub Pages | yes | medium | static sites |' },
            { label: 'A story about the history of hosting', text: 'Website hosting has come a long way: in the ’90s, sites were hosted on their own servers…' },
          ],
          explain: 'When you ask for a table with specific columns, the answer is instantly easy to compare. Format is as much a part of the task as the question itself.',
        },
      ],
    },
  },
}
