import type { UnitTr } from '../types'

export const u5: UnitTr = {
  title: 'Launch',
  subtitle: 'Putting your project online',
  description: 'GitHub, deploy, domain, analytics and first users',
  lessons: {
    'u5-1': {
      title: 'Git and GitHub',
      ex: [
        {
          title: 'Git and GitHub',
          situation: 'A friend is sure git and GitHub are the same thing. How do you explain the difference?',
          options: [
            'Git keeps the project’s version history on your computer; GitHub is a website that holds a copy of the repository in the cloud',
            'They’re the same thing, just different names',
            'Git is an AI model for code, and GitHub is its website',
          ],
          explain: 'Git stores “snapshots” of the project (commits) and lets you roll back — for a vibe coder that’s insurance. GitHub (as well as GitLab and Bitbucket) keeps a copy of the repository online, and it’s convenient to deploy the project from there.',
        },
        {
          title: 'Send it to GitHub',
          prompt: 'Save your changes and send them to GitHub. Put the commands in order.',
          steps: ['git add .', 'git commit -m "Add form"', 'git push'],
          explain: 'add selects the changes, commit saves a snapshot with a description, push sends the commits to GitHub. The very first push usually looks like git push -u origin main. Git has no upload or deploy commands.',
        },
        {
          title: 'Commit message',
          prompt: 'You ask AI to write a commit message. Which request gave a clear description?',
          sides: [
            { prompt: 'Come up with a commit message.', result: { label: 'An empty “update”' } },
            {
              prompt: 'Look at the changes (git diff) and write a commit message: one line — what changed and why.',
              result: { label: 'A specific description', lines: { 1: 'a1f3c2e Add request form with saving to Supabase' } },
            },
          ],
          reasons: [
            'AI got the actual changes and the format — so the description is specific',
            'Commit messages in English are forbidden',
            'A long commit message is always better than a short one',
            'git log only accepts messages from AI',
          ],
          explain: 'A month from now, the commit description should make it clear what changed. AI editors can suggest such descriptions themselves — when they see the diff.',
        },
        {
          title: 'It works — what’s next?',
          prompt: 'The new feature works. AI is rushing ahead. Your move?',
          chat: [
            { text: 'Dark mode works, I checked everything!' },
            { text: 'Awesome! Let’s keep going: shall we add a cart, payments and a profile?' },
          ],
          options: [
            'First I’ll commit: “Add dark mode”. Then the cart, one feature at a time.',
            'Let’s do the cart, payments and profile all at once.',
            'I’ll commit at the end of the month, when everything’s ready.',
            'Let’s delete the old commits first so they don’t get in the way.',
          ],
          explain: 'Frequent commits mean lots of save points. If AI breaks something, you roll back five minutes, not a week.',
        },
        {
          title: 'Push without a commit',
          prompt: 'You edited some files but forgot git add and git commit. What will git push say?',
          tool: 'Terminal',
          input: 'Running git push.',
          outcomes: [
            { label: '“Everything up-to-date” — nothing to send' },
            { label: 'The changes went to GitHub' },
            { label: 'Git made a commit by itself', lines: { 1: '[auto-commit] Saved changes' } },
          ],
          explain: 'push sends commits, not files. Until the changes are committed, there’s nothing to send — and the site on the hosting won’t update either.',
        },
      ],
    },
    'u5-2': {
      title: 'Deploying to Vercel',
      ex: [
        {
          title: 'What is a deploy?',
          situation: 'You sent a friend the link http://localhost:5173 — and nothing opens for them.',
          options: [
            'localhost is your own computer; for the site to open for everyone, you need to deploy it to hosting',
            'Your friend needs to install the same browser as you',
            'You need to restart npm run dev with the --share flag',
          ],
          explain: 'npm run dev runs the project on localhost — only you can see it. A deploy puts it on a server: after that, the project gets a public address, like my-app.vercel.app.',
        },
        {
          title: 'First deploy',
          prompt: 'Put the steps of your first Vercel deploy in order.',
          steps: ['Push the project to GitHub', 'Import the repository into Vercel', 'Add environment variables', 'Click Deploy'],
          extra: ['Send the keys in a chat'],
          explain: 'Vercel connects to GitHub, detects the framework on its own (for example, Vite) and builds the project. Keys from .env are entered in the project settings: the .env file itself never goes into git.',
        },
        {
          title: 'Commit without a push',
          prompt: 'The project is connected to Vercel via GitHub. You made a commit locally but didn’t push. What happens to the site?',
          input: 'Opening my site after a local commit.',
          outcomes: [
            { label: 'Nothing changed', ui: { blocks: { 0: { text: 'Old version' }, 1: { text: 'Last deploy: yesterday' } } } },
            { label: 'The site has already updated', ui: { blocks: { 0: { text: 'New version' }, 1: { text: 'Deploy: just now' } } } },
            { label: 'A preview link appeared' },
          ],
          explain: 'Vercel only sees what made it to GitHub: a local commit without a push won’t deploy anything. A push to main is a new production deploy; a push to other branches is a preview deploy with its own link.',
        },
        {
          title: 'The deploy never finishes',
          prompt: 'The deploy on the hosting hangs and never completes. Which line in package.json is to blame?',
          explain: 'The hosting runs npm run build, and here that’s the dev server, which runs forever. You need the "vite build" command: it builds the site into the dist folder and exits.',
        },
        {
          title: 'Build failed',
          prompt: 'The deploy is red, and AI suggests “just try again”. Your move?',
          chat: [
            { text: 'The deploy on Vercel failed: “Build failed”.' },
            { text: 'Try clicking Redeploy — sometimes it helps.' },
          ],
          options: [
            "Here’s the build log: “src/App.tsx(12,7): error TS2322: Type 'string' is not assignable to type 'number'”. Locally, npm run build fails the same way. What should I fix?",
            'I’ll keep clicking Redeploy until I get lucky.',
            'I’ll delete the project on Vercel and create it again.',
            'Turn off type checking so it doesn’t get in the way.',
          ],
          explain: 'Build logs are the same console, just on the server. It helps to run npm run build on your machine: the error usually reproduces, and with its text AI fixes the cause.',
        },
      ],
    },
    'u5-3': {
      title: 'Your own domain',
      ex: [
        {
          title: 'What is a domain?',
          situation: 'The coffee shop’s site opens at zerno-coffee-x7k2.vercel.app. You want a shorter, more professional address.',
          options: [
            'Buy a domain (for example, zerno-coffee.com) and connect it to the project on the hosting',
            'Rename the project folder on your computer',
            'Ask AI to shorten the address in the site’s code',
          ],
          explain: 'A domain is a human-friendly site address. You buy it from a registrar (Namecheap, Cloudflare, GoDaddy and others) or right in Vercel, usually for a year, and then connect it to your hosting.',
        },
        {
          title: 'Which DNS records?',
          prompt: 'AI recommended the wrong records. Correct it.',
          chat: [
            { text: 'I bought zerno-coffee.com and added the domain in Vercel. What do I set up at the registrar?' },
            { text: 'Add two MX records with the value vercel.com, for the root and for www.' },
          ],
          options: [
            'MX records are for email. The root zerno-coffee.com needs an A record, www needs a CNAME, and I’ll get the exact values from the domain settings in Vercel. Right?',
            'OK, adding MX.',
            'I’ll delete all the records at the registrar to keep it clean.',
            'I’ll buy another domain, maybe this one is broken.',
          ],
          explain: 'DNS is the “phone book” of the internet. For the root domain, Vercel asks for an A record, for a subdomain (www) a CNAME, and it shows the exact values in the domain settings. AI can mix up record types — check against your hosting’s instructions.',
        },
        {
          title: 'The domain won’t open',
          situation: 'You added the DNS records 10 minutes ago, and the site still won’t open on the domain.',
          options: [
            'Check that the records match Vercel’s instructions and wait: DNS updates usually take from minutes to a couple of hours, sometimes up to 48 hours',
            'Buy another domain',
            'Delete all the records and start over',
          ],
          explain: 'DNS servers remember old records for a while. If everything is set up correctly, all that’s left is to wait: changing NS servers takes the longest (up to 48 hours).',
        },
        {
          title: 'Your own domain, step by step',
          prompt: 'Connect your own domain to a site on Vercel. Put the steps together.',
          steps: ['Buy a domain from a registrar', 'Add it in the Vercel project settings', 'Set up the DNS records at the registrar', 'Wait for verification and the HTTPS certificate'],
          extra: ['Rewrite the site for the new domain'],
          explain: 'The hosting tells you which records you need, you add them at the registrar, and after verification the domain starts working — with free HTTPS. There’s no need to rewrite the site.',
        },
        {
          title: 'The padlock in the browser',
          prompt: 'AI is explaining HTTPS. Find the false statement.',
          file: 'AI reply',
          code: [
            'After you connect the domain, Vercel will issue an HTTPS certificate automatically.',
            'Without HTTPS, the browser will show a “Not secure” warning.',
            'A certificate costs from 1,000 dollars a year and has to be bought separately.',
            'HTTPS encrypts data between the visitor and the site.',
          ],
          explain: 'Vercel and Netlify issue a certificate for free and automatically as soon as the domain is connected. You don’t need to pay thousands of dollars for a regular site.',
        },
      ],
    },
    'u5-4': {
      title: 'Analytics',
      ex: [
        {
          title: 'What to measure',
          prompt: 'You want to know how many people click the main button. Which prompt gets you that?',
          sides: [
            { prompt: 'Set up analytics.', result: { label: 'Only page views', ui: { blocks: { 0: { text: 'Analytics' }, 1: { items: [['Visitors', '1,000'], ['Page views', '2,340']] }, 2: { text: 'Not tracking the button' } } } } },
            {
              prompt: 'Set up analytics and send a cta_click event when “Sign up” is clicked. Don’t send personal data.',
              result: { label: 'The main action is visible', ui: { blocks: { 0: { text: 'Analytics' }, 1: { items: [['Visitors', '1,000'], ['cta_click', '30'], ['Conversion', '3%']] } } } },
            },
          ],
          reasons: [
            'It says which action to count — so you can see the main button’s conversion',
            'Without events, analytics doesn’t even show visitors',
            'AI tracks the word “Sign up” automatically',
            'It’s longer',
          ],
          explain: 'Events show actions: clicks, sign-ups, payments. Without them you only see how many people came, not what they did. Personal data isn’t sent to analytics.',
        },
        {
          title: 'Calculate the conversion',
          prompt: 'Out of 1,000 visitors, 30 signed up for a class. What will analytics show in the “Conversion” column?',
          tool: 'Analytics dashboard',
          input: 'Opening the weekly report: 1,000 visitors, 30 sign-ups.',
          outcomes: [
            { ui: { blocks: { 0: { text: 'Conversion: 3%' }, 1: { text: '30 of 1,000' } } } },
            { ui: { blocks: { 0: { text: 'Conversion: 30%' }, 1: { text: '30 of 1,000' } } } },
            { label: '0.3%', ui: { blocks: { 0: { text: 'Conversion: 0.3%' }, 1: { text: '30 of 1,000' } } } },
          ],
          explain: 'Conversion = people who took the action / all visitors. 30 / 1,000 = 3%. It’s compared before and after changes.',
        },
        {
          title: 'Too much in analytics',
          prompt: 'Which line violates users’ privacy?',
          explain: 'Passwords and other sensitive data must never be sent to analytics. To count sign-ups, the event name and the plan are enough.',
        },
        {
          title: 'Did it get better?',
          prompt: 'You changed the main button’s text. AI is sure it’s a success. Your move?',
          chat: [
            { text: 'I changed the button text from “Send” to “Book a trial class”. Is it better now?' },
            { text: 'The new text sounds much more convincing — I’m sure it’s better!' },
          ],
          options: [
            'Let’s check with numbers: compare the sign-up conversion for the week before and the week after. And an A/B test is more reliable.',
            'Great, I believe you!',
            'I’ll ask my friends whether they like the color.',
            'I’ll change it again, just in case.',
          ],
          explain: 'Decisions are checked with numbers: conversion before and after, with enough visitors. An A/B test is even more reliable — the old and new versions are shown to different people at the same time. AI’s opinion isn’t data.',
        },
        {
          title: 'Why analytics?',
          situation: 'The landing page is live. You’re wondering whether to set up analytics — “I can already see everything works”.',
          options: [
            'Set it up: it shows how many people come, where from and what they do on the site',
            'No need: analytics is only for making the site load faster',
            'No need: AI already knows what people like',
          ],
          explain: 'Without analytics, you’re guessing. Services like Plausible, Google Analytics, PostHog or Vercel Analytics show the real picture.',
        },
      ],
    },
    'u5-5': {
      title: 'First users',
      ex: [
        {
          title: 'When to show it to people?',
          situation: 'Your app solves the main problem but isn’t perfect yet: a couple of buttons are wonky, there’s no dark mode.',
          options: ['Show it to the first users now and collect feedback', 'Wait another six months until everything is perfect', 'Don’t show it to anyone'],
          explain: 'An MVP (Minimum Viable Product) is the minimal version that already delivers value. With vibe coding, you can realistically build one over a weekend, and early feedback saves months of work on features nobody needs.',
        },
        {
          title: 'Where to find your first users',
          prompt: 'AI gave tips on finding your first users. One tip is a red flag.',
          file: 'AI reply',
          code: [
            'Start with friends and acquaintances from your target audience.',
            'Talk about the project in topic-specific chats and communities.',
            'Buy a list of 10,000 emails and send a mass mailing — that’s the fastest way.',
            'When you have something to show, launch the project on Product Hunt.',
          ],
          explain: 'Start with people who have the problem you’re solving. Mailing a purchased list is spam: it ruins your reputation and breaks email rules and laws.',
        },
        {
          title: 'A duel of questions',
          prompt: 'You ask a tester about their first impression. Which question got a useful answer?',
          sides: [
            { prompt: 'You liked it, right?', result: { label: 'A polite “yes”', text: 'Yeah, it’s great! 👍' } },
            { prompt: 'What was confusing or inconvenient when you tried the app for the first time?', result: { label: 'Specifics', text: 'I didn’t find right away where to add a task, and I couldn’t tell if it was saved — there was no message at all.' } },
          ],
          reasons: [
            'An open question that doesn’t hint at the answer surfaces specific problems',
            'It’s longer, so it looks more serious',
            'Testers only answer honestly to questions with the word “inconvenient”',
            'The first question is too polite',
          ],
          explain: 'Open questions get specifics. “You liked it, right?” nudges toward a polite “yes” and tells you nothing about what to fix.',
        },
        {
          title: 'The growth loop',
          prompt: 'How do you work with user feedback? Build the loop.',
          steps: ['Collect feedback', 'Pick the main problem', 'Fix it with AI', 'Ship an update and check again'],
          extra: ['Add ten new features at once'],
          explain: 'It’s the same loop as with prompts: small steps, checking the result on real people.',
        },
        {
          title: 'Analyzing feedback with AI',
          prompt: 'You have 12 reviews from testers. Ask AI to help you draw conclusions, not hand out compliments.',
          base: 'Here’s the testers’ feedback. What should I do?',
          chips: [
            { tag: 'Data', text: 'Below are 12 reviews, one per line.' },
            { tag: 'Task', text: 'Group them by problem and count how many times each one comes up.' },
            { tag: 'Format', text: 'Answer as a table: problem, how many times, an example quote.' },
            { tag: 'Focus', text: 'Suggest one main fix for this week.' },
            { tag: 'Tone', text: 'Tell me everything is great, I need motivation.', trap: 'That way AI will hide the problems. You need conclusions, not compliments.' },
            { tag: 'Data', text: 'Make up 20 more reviews so there’s more data.', trap: 'Made-up reviews distort the picture: your decisions will be about people who don’t exist.' },
          ],
          explain: 'Data → task → format → focus. AI is good at grouping and counting recurring problems, and one main fix keeps you from spreading yourself too thin.',
        },
      ],
    },
    'u5-6': {
      title: 'Finale: the project is live',
      ex: [
        {
          title: 'The launch path',
          prompt: 'Put the stages of launching a project in order.',
          steps: ['Push the code to GitHub', 'Deploy', 'Connect a domain', 'Set up analytics', 'Invite your first users'],
          extra: ['Spam a purchased email list'],
          explain: 'Save the code → put it online → give it a clear address → set up analytics → bring people in and listen to them. Analytics is set up before the first users arrive, or the first data will be lost.',
        },
        {
          title: 'Keys on the hosting',
          prompt: 'The site on Vercel can’t see the Supabase key, even though everything works locally. AI suggests…',
          chat: [
            { text: 'On Vercel the site can’t see VITE_SUPABASE_URL, but locally everything works.' },
            { text: 'Just commit the .env file to GitHub — Vercel will pick it up.' },
          ],
          options: [
            'No, .env doesn’t go into git. I’ll add the variables in the Vercel project settings (Environment Variables) and make a new deploy.',
            'OK, committing .env.',
            'I’ll put the key right in the code.',
            'I’ll wait, it’ll start working on its own.',
          ],
          explain: '.env doesn’t go into git, so the hosting doesn’t know about it. Variables are set in the hosting dashboard, and they only apply to new deploys.',
        },
        {
          title: 'An edit in a branch',
          prompt: 'You made an edit in the feature/menu branch and pushed it to GitHub. What will Vercel do?',
          outcomes: [
            { label: 'A preview deploy at a separate link', ui: { blocks: { 2: { text: 'The main site hasn’t changed' } } } },
            { label: 'Immediately update the main site', ui: { blocks: { 1: { text: 'vibe-app.vercel.app updated' } } } },
            { label: 'Nothing: Vercel doesn’t see branches', ui: { blocks: { 0: { text: 'No deployments' } } } },
          ],
          explain: 'A push to main updates the main site, while a push to another branch creates a preview deploy with its own link. That way you can check an AI edit before users see it.',
        },
        {
          title: 'A tricky .gitignore',
          prompt: 'After git push, the secret keys ended up on GitHub. Which line of .gitignore is wrong?',
          code: { 0: '# dependencies', 2: '# build', 4: '# secrets' },
          explain: 'The .env.example template is ignored, but the real .env isn’t. You need a .env line — and .env.example, which has no secrets, is exactly what you should commit so it’s clear which variables are needed.',
        },
        {
          title: 'Conversion',
          situation: 'Version A: 1,000 visitors, 30 sign-ups. Version B: 400 visitors, 20 sign-ups. Which version has the higher conversion?',
          options: ['B: 5% vs 3%', 'A: it has more sign-ups', 'They’re the same'],
          explain: 'Conversion is a share, not a count: 20 / 400 = 5%, 30 / 1,000 = 3%. A has more sign-ups only because it has more visitors.',
        },
        {
          title: 'Nobody found the button',
          prompt: 'Three out of five testers couldn’t find the sign-up button. AI made an edit — check it.',
          request: 'Make the sign-up button more visible and add a click event to analytics.',
          hunks: [
            { lines: ['-<a className="text-sm text-gray-400">Sign up</a>', '+<button className="btn btn-coral">Create account</button>'] },
            {},
            { harmful: 'Email and phone are personal data; they don’t get sent to analytics. To count clicks, the event name is enough.' },
          ],
          explain: 'A visible button and a click event are exactly what you need to check the fix on new users. But personal data in analytics is a privacy violation.',
        },
      ],
    },
  },
}
