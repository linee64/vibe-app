import type { UnitTr } from '../types'

export const u3: UnitTr = {
  title: 'Debugging with AI',
  subtitle: 'Fixing bugs together with AI',
  description: 'Reading errors, giving AI context and rolling back what went wrong',
  lessons: {
    'u3-1': {
      title: 'Reading an error',
      ex: [
        {
          title: 'What does the error say?',
          situation: 'In the console: “TypeError: Cannot read properties of undefined (reading \'map\')”. What does it mean?',
          options: [
            'The code called .map on a variable that is still undefined — for example, the data hasn’t loaded yet',
            'The browser ran out of memory',
            'The site got hacked',
          ],
          explain: 'The error says it plainly: “can’t read map of undefined”. So the array isn’t there yet — often it’s data that is still loading from the server.',
        },
        {
          title: 'Where to look?',
          prompt: 'Here is the full error from the console. Which line tells you where to look for the problem in YOUR code?',
          explain: 'The format is “file:line:column”: Products.jsx, line 4, character 16 — that’s where you look first. The react-dom lines are the library’s internals; they only show how React got to your code.',
        },
        {
          title: 'The root of the problem',
          prompt: 'The error points to the line with items.map, but the cause is higher up. Which line holds the root of the problem?',
          explain: 'useState() with no initial value gives undefined, and while the data is loading, items.map crashes. The fix is useState([]): an empty list while we wait for the data.',
        },
        {
          title: 'Blank screen',
          prompt: 'The page is blank, nothing is visible. Put the steps in order.',
          steps: ['Open the console: F12 → Console', 'Find the first red error', 'Look at the file and line in it', 'Send AI the error and that code'],
          extra: ['Press Ctrl+U and read the HTML'],
          explain: 'A blank screen almost always means a JavaScript error, and its text is in the browser console. The page source (Ctrl+U) won’t help here: the page is built by scripts.',
        },
        {
          title: 'One parenthesis',
          prompt: 'The AI’s code is missing a parenthesis. What will the console show on launch?',
          tool: 'Browser console',
          input: 'Running the page with this code.',
          code: { 1: "  console.log('Hello'" },
          outcomes: [
            { label: 'SyntaxError: the code breaks the language rules' },
            { label: 'TypeError: the variable is undefined' },
            { label: '404: file not found' },
          ],
          explain: 'SyntaxError means the code breaks the rules of the language, and the browser can’t even run it. Often the culprit is a single missing parenthesis, comma or quote.',
        },
      ],
    },
    'u3-2': {
      title: 'Error + context in the chat',
      ex: [
        {
          title: 'What to send AI',
          prompt: 'The error points to TaskList.jsx. Which request to a regular AI chat worked better?',
          sides: [
            { prompt: 'Here’s the error, and here are all 47 files of my project in a row. Find what’s wrong.', result: { label: 'General advice', text: 'There could be several problems. Check your dependencies, clear the cache, update the libraries and try restarting the server…' } },
            {
              prompt: 'Here’s the error with the stack trace and the TaskList.jsx component it points to (line 8). Explain the cause.',
              result: { label: 'The exact cause and a fix', text: 'On line 8, tasks is an object, not an array: setTasks(data) puts the whole server response there. You need setTasks(data.items).' },
            },
          ],
          reasons: [
            'It gives the full error text and exactly the code the error points to',
            'The less AI knows, the fewer mistakes it makes',
            'AI simply can’t read forty-seven files',
            'The word “stack trace” switches AI into debugging mode',
          ],
          explain: 'The full error with the stack trace shows the file and line, and the right code snippet gives AI context without noise. AI agents in an editor can open project files themselves, but a precise clue saves them time too.',
        },
        {
          title: 'A debugging prompt',
          prompt: 'The product list doesn’t show up. Give AI the clues and ask for a minimal fix.',
          base: 'The product list doesn’t show up.',
          chips: [
            { tag: 'Clue', text: "Error from the console: TypeError: Cannot read properties of undefined (reading 'map')." },
            { tag: 'Where', text: 'It points to Products.jsx, line 4 — the component code is below.' },
            { tag: 'Request', text: 'Explain the cause and suggest a minimal fix.' },
            { tag: 'Scope', text: 'Rewrite everything from scratch.', trap: 'Rewriting everything hides the cause and breaks what worked. You need a minimal fix.' },
            { tag: 'Emphasis', text: 'URGENT!!!', trap: 'Urgency gives AI no new information.' },
            { tag: 'Context', text: 'Here’s the secret database key, if you need it: sb_secret_…', trap: 'Never send secrets to a chat: debugging doesn’t need the key, and a leaked key has to be rotated.' },
          ],
          explain: 'The error → where it is → a request to explain → a minimal fix. That way you learn something and don’t get unwanted changes.',
        },
        {
          title: 'What to redact',
          prompt: 'You’re about to paste this log into an AI chat. Which line should you hide?',
          explain: 'Before sending logs, replace secrets and personal data with placeholders like ***. Keep the error text and the stack trace lines — they’re needed for debugging.',
        },
        {
          title: 'Send the stack trace',
          situation: 'AI asks: “Please send the full stack trace.” What do you send?',
          options: [
            'The whole red error, together with the “at … (file:line)” lines below it',
            'Only the first word of the error — TypeError',
            'A screenshot of the whole site page',
          ],
          explain: 'A stack trace is the list of function calls that led to the error, with files and line numbers. It’s the “route” to where the error happened, and you copy it whole along with the error itself.',
        },
        {
          title: 'AI asks for details',
          prompt: 'AI asked the right questions. Answer so it can fix it on the first try.',
          chat: [
            { text: 'Why did everything break???' },
            { text: 'Happy to help! What did you do, what did you expect to see, and what do you see now? Is there an error in the console?' },
          ],
          options: [
            'I click “Save” — I expect the task to appear in the list, but nothing happens. In the console: “TypeError: tasks.push is not a function”. The component code is below.',
            'Just fix it, you’re an AI.',
            'Everything broke, make it like it was.',
            'I don’t know, look for yourself.',
          ],
          explain: 'A good bug report: what you did → what you expected → what you got → the error text → the code. That’s exactly what AI needs.',
        },
      ],
    },
    'u3-3': {
      title: 'The console and logs',
      ex: [
        {
          title: 'What will console.log print?',
          prompt: 'getUsers returns two users: Aida and Timur. What appears in the console?',
          tool: 'Browser console',
          input: 'Running the AI’s code.',
          outcomes: [
            {},
            { label: "['Aida', 'Timur']", lines: ["▸ (2) ['Aida', 'Timur']"] },
            {},
          ],
          explain: 'An arrow function with curly braces is a function body, and without return it returns nothing. You need u => u.name. console.log is exactly what helps you catch quiet bugs like this quickly.',
        },
        {
          title: 'Always “Error”',
          prompt: 'The function that loads a user always fails with “Error”. Where’s the bug?',
          code: { 2: "  if (!res.ok) throw new Error('Error');" },
          explain: 'fetch returns a Promise. Without await, res holds a promise, which has no ok field. You need: const res = await fetch(...).',
        },
        {
          title: 'Did the request go out?',
          situation: 'The “Send” button doesn’t save the data. How do you check whether the request reached the server?',
          options: [
            'Open F12 → Network and look at the request and its status (200, 404, 500…)',
            'Open the Elements tab and check whether the button is on the page',
            'Click the button ten more times',
          ],
          explain: 'The Network tab shows every request: the address, the status and the server’s response. A 4xx status is an error in the request, 5xx is on the server.',
        },
        {
          title: 'Logs at every step',
          prompt: 'It’s unclear at which step checkout breaks. Ask AI to add logs.',
          base: 'Checkout breaks, I don’t know where.',
          chips: [
            { tag: 'Steps', text: 'Add console.log at every checkout step: cart, address, payment, confirmation.' },
            { tag: 'Data', text: "In each log, print the step label and the key data: console.log('step: address', address)." },
            { tag: 'Cleanup', text: 'Once we find the bug, remove the temporary logs.' },
            { tag: 'Speed', text: 'Guess where the error is and fix it right away.', trap: 'Guessing is the edit loop again. Logs show how far the code actually got.' },
            { tag: 'Tidiness', text: 'Remove all the checks so they don’t get in the way.', trap: 'Checks protect your data. Removing them creates new bugs.' },
            { tag: 'Data', text: 'Log the full card number too.', trap: 'Payment and personal data never go into logs: many people read logs, and they’re kept for a long time.' },
          ],
          explain: 'Logs at every step show how far the code got, and with them AI finds the cause much faster. Labels keep the logs from getting mixed up, and after the fix the temporary logs are removed.',
        },
        {
          title: 'It’s not the button',
          prompt: 'In the Network tab you saw that the request fails on the server. But AI went after the button…',
          chat: [
            { text: 'The “Send” button doesn’t save the review.' },
            { text: 'The problem is probably the button. I rewrote the whole Button component.' },
          ],
          options: [
            'Stop, it’s not the button: in Network, POST /api/feedback returns 500, and the response says “column "email" does not exist”. Let’s look at the server side.',
            'OK, thanks.',
            'Rewrite the form too while you’re at it.',
            'Why doesn’t it work???',
          ],
          explain: 'A 500 status is a server error, and the response text hints at the cause. With a clue like that, AI fixes the right place instead of rewriting what worked.',
        },
      ],
    },
    'u3-4': {
      title: 'How not to get stuck in a loop',
      ex: [
        {
          title: 'The edit loop',
          prompt: 'You’ve written “doesn’t work” yet again, and AI keeps offering almost the same thing. Break the loop.',
          chat: [
            { text: 'Still doesn’t work.' },
            { text: 'Sorry! Here’s the fixed version:' },
            { text: 'Still doesn’t work.' },
            { text: 'Got it! Let’s try this:' },
          ],
          options: [
            'Stop. Don’t change the code. List 3 possible causes of the bug and which logs would help check each one.',
            'Still doesn’t work!!!',
            'Try again, it should work.',
            'Accept all your edits and ship it.',
          ],
          explain: 'If the fixes go in circles, change the approach: “don’t write code, first explain why this could be happening”. Hypotheses plus a way to check them — that’s what a real debugger does.',
        },
        {
          title: 'Outdated code',
          prompt: 'AI keeps writing code for an old version of the router, and it crashes. Which request helped?',
          sides: [
            { prompt: 'Fix the error: “does not provide an export named useHistory”.', result: { label: 'The old API again' } },
            {
              prompt: 'package.json has react-router 7. Here’s a link to the current docs. Fix the error: “does not provide an export named useHistory”.',
              result: { label: 'The current API' },
            },
          ],
          reasons: [
            'The exact version and the current docs remove the guesswork',
            'With a link, AI always answers faster',
            'React Router can’t be used with AI at all without docs',
            'It’s longer',
          ],
          explain: 'Models were trained on data up to a certain date and may not know about recent API changes: useHistory stayed in React Router 5, while version 7 has useNavigate and imports from react-router. The version from package.json and a link to the docs solve the problem.',
        },
        {
          title: 'Debugging without a loop',
          prompt: 'Put together the workflow for a stubborn bug.',
          steps: ['Write down the steps that reproduce the bug', 'Ask AI for hypotheses without code changes', 'Check the hypotheses with logs', 'Fix the cause with a minimal edit', 'Add a test for this bug'],
          extra: ['Keep writing “doesn’t work” until you get lucky'],
          explain: 'Reproduce → hypotheses → check → minimal fix → test. That way you fix the cause, not the symptoms, and the bug won’t quietly come back.',
        },
        {
          title: 'Too much going on',
          situation: 'The bug only shows up on a big page with 20 components, and AI gets lost in its guesses.',
          options: [
            'Ask AI to build a minimal example: the smallest code where the error still reproduces',
            'Send AI 20 more components for the full picture',
            'Delete half of the page at random',
          ],
          explain: 'A minimal reproducible example strips away everything extra. Often the cause becomes obvious on its own, and AI stops guessing.',
        },
        {
          title: 'Fixed it — or hid it?',
          prompt: 'AI reported that the bug is fixed and the tests are green. Check the diff.',
          request: 'Fix the bug: the discount is applied twice.',
          hunks: [
            {},
            { lines: { 0: "+it('applies the discount once', () => {" } },
            {
              lines: ["-it('delivery is free from 5000', () => {", "+it.skip('delivery is free from 5000', () => {"],
              harmful: 'AI disabled someone else’s test that started failing. That means the edit broke something — and the test was simply silenced.',
            },
          ],
          explain: 'A test locks in the correct behavior: a new test for the bug is great. But a disabled (skip) or deleted test hides the problem. If AI touches tests, check why.',
        },
      ],
    },
    'u3-5': {
      title: 'Rollbacks and checkpoints',
      ex: [
        {
          title: 'Review the changes',
          prompt: 'The AI agent finished its edit and showed the diff. Accept what’s useful and reject what’s dangerous.',
          request: 'Add a “Delete” button to a task.',
          hunks: [
            { lines: { 1: '+  <button onClick={() => onRemove(task.id)}>Delete</button>' } },
            {},
            {
              lines: { 1: "+const key = 'sb_secret_9fK2…' // temporary, just to make sure it works" },
              harmful: 'AI wrote the secret key right into the code. It will end up in git and in every visitor’s browser.',
            },
          ],
          explain: 'A diff shows what was added and what was removed — so you can see if AI also did something you didn’t ask for, or something dangerous. In git, git diff shows the same thing.',
        },
        {
          title: 'A safe edit',
          prompt: 'Put the steps of working safely with AI in order.',
          steps: ['Commit the working version', 'Ask for the edit', 'Check the result', 'Commit — or roll back'],
          extra: ['Delete the git history'],
          explain: 'A commit before the edit is your insurance. It works — make a new commit; it broke — roll back to the previous one.',
        },
        {
          title: 'Checkpoints in the editor',
          situation: 'Cursor and Claude Code have checkpoints. A friend asks why you need them if you have git.',
          options: [
            'To quickly return files to the state before a specific AI request',
            'To save the project to the cloud, like on GitHub',
            'To make AI work faster',
          ],
          explain: 'Checkpoints are a quick “undo” for the agent’s edits. They’re stored locally, separate from git, and don’t roll back your manual edits or terminal commands — so a reliable history is still kept with commits.',
        },
        {
          title: 'Three screens broke',
          prompt: 'After a big AI edit, several screens broke at once. Your move?',
          chat: [
            { text: 'After your edit, the profile, cart and search broke. The errors make no sense.' },
            { text: 'Let’s fix them one by one! Let’s start with the profile: try replacing line 14 with…' },
          ],
          options: [
            'Let’s do it differently: I’ll roll back to the last working commit, and you’ll make this edit in smaller steps — one screen at a time.',
            'OK, fix them one by one, however long it takes.',
            'Let’s ship it as is and fix it later.',
            'Delete these three screens.',
          ],
          explain: 'If an edit broke a lot of things, it’s cheaper to roll back and redo it more carefully than to patch the consequences on top.',
        },
        {
          title: 'A big rework',
          prompt: 'You need to move sign-in to a new library. Which approach is more reliable?',
          sides: [
            { prompt: 'Rewrite all of the authentication on the new library.', result: { label: 'Everything at once — and the build failed', lines: { 2: '? last commit — 3 days ago' } } },
            {
              prompt: 'I’ve committed the working version. Move sign-in to the new library in 3 steps, and after each one stop so I can check.',
              result: { label: 'Step by step', text: 'Step 1 of 3 is done: I hooked up the library and the sign-in form and didn’t touch anything else. Check sign-in and type “next”.' },
            },
          ],
          reasons: [
            'A commit as insurance and small steps: if something breaks, rolling back is easy',
            'AI works better when it’s interrupted often',
            'Three steps are always faster than one',
            'It’s more polite',
          ],
          explain: 'A commit is a snapshot of the project you can return to. Small steps with checks show exactly which step broke something.',
        },
      ],
    },
    'u3-6': {
      title: 'Unit finale',
      ex: [
        {
          title: 'A bug’s journey',
          prompt: 'From finding a bug to a fixed version. Build the pipeline.',
          steps: ['Reproduce the bug', 'Find the error in the console', 'Send AI the error and the code', 'Check the fix with the same steps', 'Commit'],
          extra: ['Ship right away without checking'],
          explain: 'Reproduce → gather clues → give AI context → check the fix with the same steps → save. Without a check, “fixed” is just words.',
        },
        {
          title: 'Deletes the wrong thing',
          prompt: 'After clicking “Delete”, every task disappears except the one you wanted to delete. Where’s the bug?',
          explain: 'filter keeps the elements for which the condition is true, so the code keeps only the task being deleted. You need t.id !== id.',
        },
        {
          title: 'Red or yellow?',
          situation: 'The console has a dozen yellow warnings and one red error, and the button doesn’t work. Where do you start?',
          options: [
            'With the red error: it’s what breaks things, while warnings are usually just hints',
            'With the yellow warnings: there are more of them, so they matter more',
            'Clear the console and click the button again',
          ],
          explain: 'A red error means the code crashed, while a yellow warning means something suspicious that still works. If there are several errors, start with the first one: the rest are often its consequences.',
        },
        {
          title: '“Fixed!”',
          prompt: 'AI reported the fix. Which statement shouldn’t you take at its word?',
          file: 'AI reply',
          code: [
            'Found the cause: removeTask had ===, but it needs !==.',
            'Fixed one line in tasks.js.',
            'I checked everything — this bug will never come back.',
            'To make sure: add three tasks and delete the middle one.',
          ],
          explain: 'AI can be honestly wrong about the result, and “will never come back” is a promise nobody can make. The check is the same reproduction steps; if the bug doesn’t come back, the edit can be committed.',
        },
        {
          title: 'What will Network show?',
          prompt: 'The frontend and the server differ by one letter. What will you see in the Network tab?',
          input: 'Opening the orders page.',
          code: { 0: '// frontend', 3: '// server' },
          outcomes: [
            {},
            { lines: ['GET /api/order   200 OK  (12 orders)'] },
            {},
          ],
          explain: '404 means “not found”: the server has no /api/order route, only /api/orders. For comparison: 200 is success, 401 is not signed in, 403 is no permission, 500 is a server error.',
        },
        {
          title: 'The perfect bug report',
          prompt: 'Put together the report: action → expectation → reality → clue.',
          base: 'The “Buy” button doesn’t work.',
          chips: [
            { tag: 'Action', text: 'I click “Buy” on the product page.' },
            { tag: 'Expectation', text: 'I expect to go to checkout.' },
            { tag: 'Reality', text: 'I get a blank screen.' },
            { tag: 'Clue', text: "In the console: TypeError: Cannot read properties of null (reading 'price'), Cart.jsx:12." },
            { tag: 'Emphasis', text: 'Everything is broken, fix it now!!!', trap: 'Emotions don’t replace facts: AI still doesn’t know what broke.' },
            { tag: 'Scope', text: 'Rewrite the cart from scratch.', trap: 'Find the cause first. A rewrite doesn’t guarantee the bug won’t come back.' },
          ],
          explain: 'Action → expectation → reality → error. Both AI and a human understand a report like this, and the file and line from the console show right away where to look.',
        },
      ],
    },
  },
}
