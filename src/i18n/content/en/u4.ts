import type { UnitTr } from '../types'

export const u4: UnitTr = {
  title: 'Data and backend',
  subtitle: 'Database, sign-in and secrets',
  description: 'Databases, tables, sign-in, API keys and forms',
  lessons: {
    'u4-1': {
      title: 'What a database is',
      ex: [
        {
          title: 'Laptop → phone',
          prompt: 'Tasks are stored in localStorage. A user added them on a laptop and opened the app on a phone. What will they see?',
          tool: 'App on the phone',
          input: 'Opening the to-do list on my phone.',
          outcomes: [
            { label: 'An empty list', ui: { blocks: { 0: { text: 'My tasks' }, 1: { text: 'No tasks yet' }, 2: { text: '＋ Add' } } } },
            { label: 'All the tasks from the laptop', ui: { blocks: { 0: { text: 'My tasks' }, 1: { items: ['☐ Buy milk', '☐ Hand in the report', '☐ Call mom'] } } } },
            { label: 'A sync error', ui: { blocks: { 0: { text: 'My tasks' } } } },
          ],
          explain: 'localStorage lives inside one browser on one device, so the phone can’t see the tasks from the laptop. Shared storage for all devices is a database on a server.',
        },
        {
          title: 'The data’s journey',
          prompt: 'What happens when a user saves a note? Put it in order.',
          steps: ['The user clicks “Save”', 'The frontend sends a request', 'The backend checks permissions', 'The database writes the note'],
          extra: ['The note is saved in cookies'],
          explain: 'The frontend is what the user sees; the backend is the “kitchen” that checks access and stores data. Nothing is written to the database “just in case”: first the request passes a permission check — in Supabase this is often done by RLS policies right in the database.',
        },
        {
          title: 'Where to store orders?',
          situation: 'You’re building an online store. Where do you store customers’ orders?',
          options: ['In a database on the server', 'In the customer’s browser localStorage', 'In the customer’s browser cookies'],
          explain: 'localStorage and cookies live in the customer’s browser: the store can’t see them, and the customer can erase or tamper with them. Orders are stored on the server, in a database.',
        },
        {
          title: 'Saving notes',
          prompt: 'Notes need to be available from any device. Which prompt gets you that?',
          sides: [
            { prompt: 'Make the notes get saved.', result: { label: 'Saving in the browser' } },
            {
              prompt: 'Save notes in Supabase, in the notes table, so that after signing in they’re available from any device.',
              result: { label: 'Saving in the database' },
            },
          ],
          reasons: [
            'It says where to store them and why: on the server, shared across all devices',
            'Supabase is faster than localStorage',
            'localStorage is banned in new browsers',
            'It has the word “table” in it',
          ],
          explain: 'For “make it save”, AI honestly picks the simplest option — localStorage. If the data needs to be on every device, you have to say so: then you need a database on a server.',
        },
        {
          title: 'What Supabase is',
          prompt: 'AI is explaining Supabase. One statement is wrong — find it.',
          file: 'AI reply',
          code: [
            'Supabase is a ready-made backend: a Postgres database, user sign-in and file storage.',
            'Lovable Cloud — Lovable’s default backend — is built on it.',
            'Essentially, Supabase is frontend hosting; it’s used instead of Vercel.',
            'Bolt and other AI builders can connect your Supabase project.',
          ],
          explain: 'Supabase (like Firebase) saves you from writing a server from scratch: database, sign-in, files. The site itself is usually deployed to hosting like Vercel or Netlify — these are different roles.',
        },
      ],
    },
    'u4-2': {
      title: 'Tables like in Supabase',
      ex: [
        {
          title: 'Rows and columns',
          prompt: 'The tasks table has the columns id, title, done. A user added two tasks. What does the table look like?',
          input: 'Opening the tasks table.',
          outcomes: [
            { label: 'One task — one row', lines: { 1: '1  | Buy milk       | false', 2: '2  | Call mom       | true' } },
            { label: 'All tasks in one row', lines: { 1: '1  | Buy milk, Call mom            | false' } },
            { label: 'Each task is a new column', lines: { 0: 'Buy milk      | Call mom' } },
          ],
          explain: 'A table is like an Excel sheet: columns are fields (what we store), rows are records (specific tasks). Each row has its own id — the primary key.',
        },
        {
          title: 'A table for notes',
          prompt: 'Name → columns → link to the user → access rule. Level up the prompt.',
          base: 'Create a table for notes.',
          chips: [
            { tag: 'Where', text: 'In Supabase, the notes table.' },
            { tag: 'Columns', text: 'Columns: id (primary key), user_id, text, created_at (timestamptz).' },
            { tag: 'Link', text: 'user_id references the user from auth.users.' },
            { tag: 'Access', text: 'Enable RLS: everyone sees and edits only their own notes.' },
            { tag: 'Access', text: 'Let everyone see everything, it’s simpler.', trap: 'Notes are personal. Without access rules, anyone with the public key can read other people’s records.' },
            { tag: 'Structure', text: 'No primary key needed.', trap: 'The primary key uniquely identifies a row: it’s how a specific record is found, updated and deleted.' },
          ],
          explain: 'Table name → columns with types → link to the user → access rule. From a prompt like this, AI will generate both the SQL and the security policies.',
        },
        {
          title: 'Other people’s tasks',
          prompt: 'The query should show only the current user’s tasks, but it shows everyone’s. Where’s the bug?',
          code: { 0: '-- the current user’s tasks' },
          explain: 'The condition user_id = user_id compares the column with itself and is always true. You need to compare it with the current user’s id — in Supabase that’s auth.uid(), usually inside an RLS policy.',
        },
        {
          title: 'Column type',
          situation: 'You’re adding a done field to the table — “done / not done”. Which type do you pick?',
          options: ['boolean (true/false)', 'text (a string)', 'timestamptz (date and time)'],
          explain: 'Every column has a type: text for strings, int8 for numbers, boolean for yes/no, timestamptz for date and time with a time zone (that’s how Supabase creates created_at by default).',
        },
        {
          title: 'A migration from AI',
          prompt: 'AI prepared an SQL migration. Accept what’s safe, reject what’s dangerous.',
          request: 'Add a priority column (priority from 0 to 3) to the tasks table.',
          hunks: {
            1: { harmful: 'AI recreates the table — all of the users’ tasks will be deleted.' },
            2: { harmful: 'Disabling RLS exposes every user’s tasks to anyone who has the public key.' },
          },
          explain: 'You can add a column with a single alter table command — without losing data. drop table wipes everything, and disabled RLS removes the protection. Read SQL from AI especially carefully: it works with live data.',
        },
      ],
    },
    'u4-3': {
      title: 'Sign-in and sign-up',
      ex: [
        {
          title: 'How to build sign-in',
          prompt: 'You need sign-in with email and password. Which prompt is safer?',
          sides: [
            { prompt: 'Build sign-up: store the email and password in a users table.', result: { label: 'A homemade table with passwords' } },
            {
              prompt: 'Connect Supabase Auth: sign-in with email and with Google, a “Forgot password?” page and a redirect to the dashboard after sign-in.',
              result: { label: 'Ready-made authentication', lines: { 3: '// Supabase Auth stores the password as a hash' } },
            },
          ],
          reasons: [
            'Ready-made authentication stores passwords as a hash and handles recovery and Google sign-in',
            'Your own users table is slower',
            'Supabase Auth doesn’t need the internet',
            'It has more features, and more is always better',
          ],
          explain: 'Homemade sign-in is a common source of security holes. Ready-made services already store passwords as hashes, restore access and support Google sign-in.',
        },
        {
          title: 'A dangerous line',
          prompt: 'AI wrote sign-up with its own users table. Which line is dangerous?',
          explain: 'The password is saved as plain text: if the database leaks, everyone will see it. Passwords are stored only as a hash (Argon2id, bcrypt) — and it’s better to leave that to ready-made authentication.',
        },
        {
          title: 'A table without protection',
          prompt: 'AI created a table with an SQL query and is pleased with itself. What do you reply?',
          chat: [
            { text: 'Create a notes table for personal notes.' },
            { text: 'Done! I ran this SQL:' },
          ],
          options: [
            'The table was created with an SQL query — enable RLS on it and add a policy: everyone sees only their own notes ((select auth.uid()) = user_id).',
            'Great, connecting it to the app!',
            'Make the table public so it definitely works.',
            'Add five more tables just in case.',
          ],
          explain: 'A table without RLS in the public schema can be read and changed by anyone with the public key. In the Table Editor, RLS is enabled automatically, but for tables created with an SQL query you have to enable it manually.',
        },
        {
          title: 'Authentication or authorization?',
          situation: 'The docs use two words: authentication and authorization. What’s the difference?',
          options: [
            'Authentication is who you are (sign-in), authorization is what you’re allowed to do (permissions)',
            'They’re the same thing',
            'Authorization is sign-up, authentication is sign-out',
          ],
          explain: 'First the system recognizes the user (sign-in), then it decides what they have access to (for example, only their own notes).',
        },
        {
          title: 'The sign-in flow',
          prompt: 'What happens when someone signs in to an app with Supabase Auth? Put the steps together.',
          steps: ['The user enters their email and password', 'Supabase Auth checks the credentials', 'The app receives a session', 'Redirect to the dashboard'],
          extra: ['The password is saved in localStorage'],
          explain: 'The auth service checks the password, and the app receives a session (a token) and uses it to recognize the user. The password itself is never stored in the browser.',
        },
      ],
    },
    'u4-4': {
      title: 'Keys and secrets',
      ex: [
        {
          title: 'A key in the frontend',
          prompt: 'AI put the payment provider’s secret key into the frontend code. What will any visitor see in DevTools?',
          input: 'Opening the site’s source code in the browser.',
          outcomes: [
            { label: 'The whole key, in plain text' },
            { label: 'Asterisks instead of the key' },
            { label: 'Nothing: the code is minified, the key can’t be found', lines: { 1: '(file is encrypted)' } },
          ],
          explain: 'Everything that ends up in the frontend is visible to any visitor — minifying the code doesn’t hide keys. Secrets live only on the server, in environment variables, and .env files are added to .gitignore.',
        },
        {
          title: 'The VITE_ prefix',
          prompt: 'A Vite project. Which line in .env exposes a secret to every visitor of the site?',
          code: { 0: '# public settings', 3: '# secrets' },
          explain: 'Vite embeds variables with the VITE_ prefix into the site’s code, and anyone can see them. That’s exactly what the Supabase public key is meant for, but the Stripe secret key must live only on the server and without the VITE_ prefix.',
        },
        {
          title: 'Before publishing',
          prompt: 'AI is preparing the project for GitHub. One edit is dangerous.',
          request: 'Prepare the project for publishing on GitHub.',
          hunks: [
            { lines: { 0: '+# Vibe Notes', 1: '+Run: npm install && npm run dev' } },
            { lines: { 3: '+# .env no longer needs to be ignored' }, harmful: 'AI removed .env from .gitignore — with the next commit, the keys will go to GitHub.' },
            {},
          ],
          explain: '.gitignore lists the files git doesn’t track: .env with keys must be there (the default Vite template only ignores *.local, so check the .env line yourself). And .env.example with variable names but no values is exactly what you should commit.',
        },
        {
          title: 'The key leaked',
          prompt: 'AI is reassuring you. Is it right?',
          chat: [
            { text: 'I accidentally pasted a secret key into a public forum post. I’ve already deleted the post.' },
            { text: 'Great that you deleted it! Everything’s fine now 👍' },
          ],
          options: [
            'Deleting isn’t enough: the key could have been copied. Tell me how to revoke it in the service’s dashboard, issue a new one and update it on the server.',
            'Phew, dodged that one!',
            'Then I’ll make the forum private.',
            'I’ll rename the variable in the code, that’s enough.',
          ],
          explain: 'Bots find leaked keys within minutes. A leaked key is considered compromised: revoke it and replace it with a new one.',
        },
        {
          title: 'Supabase keys',
          situation: 'Supabase has a public key (publishable, formerly anon) and a secret one (secret, formerly service_role). Which one can be used in the frontend?',
          options: ['Only the public one — and only with RLS enabled', 'The secret one — it’s more powerful', 'Both, there’s no difference'],
          explain: 'The public key (sb_publishable_…) is visible to everyone, so access is restricted by RLS policies. The secret key (sb_secret_…) bypasses RLS and belongs only on the server; Supabase is phasing out the old anon and service_role keys.',
        },
        {
          title: 'A safe prompt',
          prompt: 'You need help connecting payments. AI itself doesn’t need the key.',
          base: 'Help me connect Stripe.',
          chips: [
            { tag: 'Where’s the key', text: 'I’ll read the key from process.env.STRIPE_SECRET_KEY on the server.' },
            { tag: 'What', text: 'I need a one-time payment via Stripe Checkout.' },
            { tag: 'Format', text: 'Show the server code and what to add to the frontend.' },
            { tag: 'Context', text: 'Here’s my key sk_live_51H…, put it in the code.', trap: 'A secret in the code is visible to anyone with access to the repository or the site.' },
            { tag: 'Context', text: 'Here’s my key sk_live_51H…, just put it in .env.', trap: 'A secret pasted into a chat has already left your computer — even if it ends up in .env later.' },
          ],
          explain: 'AI doesn’t need the key itself — the name of the environment variable is enough. That way the code is correct and the secret doesn’t leak anywhere.',
        },
      ],
    },
    'u4-5': {
      title: 'A form that saves',
      ex: [
        {
          title: 'A request form',
          prompt: 'Fields → validation → where to save → what the user sees. Level up the prompt.',
          base: 'Make a request form.',
          chips: [
            { tag: 'Fields', text: 'Fields: name and phone.' },
            { tag: 'Validation', text: 'Check that the fields are filled in before sending.' },
            { tag: 'Where', text: 'Save the request to the leads table in Supabase.' },
            { tag: 'Response', text: 'After sending, show “Thank you!” and clear the fields.' },
            { tag: 'Speed', text: 'Don’t validate the fields — it’s faster.', trap: 'Without validation, empty and junk requests will pour into the database.' },
            { tag: 'Where', text: 'Show the request in an alert instead of saving it.', trap: 'An alert saves nothing: the request disappears as soon as the person closes the window.' },
          ],
          explain: 'Fields → validation → where to save → what the user sees. Without the last step, people don’t know whether their request went through.',
        },
        {
          title: '“Thank you!”, but the table is empty',
          prompt: 'The form shows “Thank you!”, but the table is empty. Where’s the bug?',
          code: { 4: "  setStatus('Thank you!');" },
          explain: 'There’s no await: a supabase-js query is only sent on await (or .then), so the row isn’t saved and error is empty. You need: const { error } = await supabase…',
        },
        {
          title: 'Double click',
          prompt: 'The “Send” button isn’t disabled while the request is in progress. The user quickly clicked it twice. What ends up in the table?',
          input: 'Looking at the leads table after the double click.',
          outcomes: [
            { label: 'Two identical requests', lines: { 1: '41 | Aida | +7 701 555 01 02', 2: '42 | Aida | +7 701 555 01 02' } },
            { label: 'One request', lines: { 1: '41 | Aida | +7 701 555 01 02' } },
            { label: 'An error and no requests at all' },
          ],
          explain: 'Each click sends a separate request — you get duplicates. The standard technique is a loading state: the button is disabled and shows “Sending…” until the server responds.',
        },
        {
          title: 'Email validation',
          prompt: 'AI added email validation. Is everything in the edit reasonable?',
          request: 'Add email validation to the feedback form.',
          hunks: [
            { lines: { 1: "+  return setError('Check your email')" } },
            { harmful: 'AI removed the server-side check because “the form checks it now”. A browser check is easy to bypass — the server check must not be removed.' },
            {},
          ],
          explain: 'Validation in the frontend is for the user’s convenience. Protection lives on the server: server code, column constraints, RLS policies. They have to work together.',
        },
        {
          title: 'The internet dropped',
          prompt: 'AI added error handling its own way. How do you improve it?',
          chat: [
            { text: 'If the internet drops, the request is silently lost.' },
            { text: 'Added error output:' },
          ],
          options: [
            'Show a clear message: “Couldn’t send. Check your internet connection and try again” — and don’t erase the data already entered.',
            'OK, let’s leave it like that.',
            'Then it’s better to show nothing.',
            'Show the error in technical English, it looks more serious.',
          ],
          explain: 'A technical stack trace tells the user nothing. A human-friendly message plus the saved data — and the person will simply click “Send” again.',
        },
      ],
    },
    'u4-6': {
      title: 'The backend chest',
      ex: [
        {
          title: 'RLS is on, but there’s no data',
          prompt: 'RLS is enabled on the reviews table, but there are no policies. What will a request from the browser with the public key return?',
          tool: 'Browser console',
          input: 'Requesting reviews from the app.',
          outcomes: [
            { label: 'An empty list with no error' },
            { label: 'All rows of the table' },
            { label: 'A “table deleted” error' },
          ],
          explain: 'RLS enabled with no policies locks everything down — a common reason for “the data disappeared”. In the SQL editor the rows are still visible (it runs as the owner), but the app needs a policy, for example read access for everyone.',
        },
        {
          title: 'A safe setup',
          prompt: 'Put the steps for connecting a database to the app in order. One card is dangerous.',
          steps: ['Create a table', 'Enable RLS', 'Add access policies', 'Use the public key in the frontend'],
          extra: ['Put the secret key in the code'],
          explain: 'Protection first, then connection. The secret key (secret or the old service_role) never goes into the frontend.',
        },
        {
          title: 'Reading an RLS policy',
          prompt: 'notes has three notes: two are Aida’s, one is Timur’s. Aida signs in and requests all notes. How many rows will she get?',
          tool: 'RLS policy',
          input: 'Aida signs in and runs select * from notes.',
          code: { 0: 'create policy "Own notes" on notes' },
          outcomes: [
            { label: '2 rows — only her own', lines: { 1: '1  | aida    | Plan for the week', 2: '3  | aida    | Landing page ideas' } },
            { label: '3 rows — all notes', lines: { 1: '1  | aida    | Plan for the week', 2: '2  | timur   | Shopping', 3: '3  | aida    | Landing page ideas' } },
            { label: '0 rows', lines: ['(empty)'] },
          ],
          explain: 'auth.uid() returns the id of whoever is making the request, and the policy works like an invisible WHERE: everyone sees only their own rows. If the user isn’t signed in, auth.uid() returns null and there will be no rows.',
        },
        {
          title: 'Bypassing RLS',
          prompt: 'Which line opens access to all the data, bypassing RLS?',
          explain: 'With the VITE_ prefix the key ends up in the site’s code, and the secret key (sb_secret_…, like the old service_role) bypasses RLS. Only the public key goes in the frontend: publishable or the old anon.',
        },
        {
          title: 'Where to store images?',
          situation: 'Users upload avatars. What’s the right way to store them?',
          options: [
            'Files go in storage (for example, Supabase Storage), and the table holds the path to the file',
            'Right in the table, by turning the image into a long base64 string',
            'In the user’s browser localStorage',
          ],
          explain: 'Tables are designed for strings and numbers, and there’s storage for files. Access to files in Supabase Storage is also configured with policies, like RLS for tables.',
        },
        {
          title: 'Deleted it in the next commit',
          prompt: 'AI thinks the problem is solved. Reply to it.',
          chat: [
            { text: 'I committed .env with a key to a public repository, and deleted the file in the next commit.' },
            { text: 'Great, the file is no longer in the repository — problem solved!' },
          ],
          options: [
            'No: the key is still in the git history. Help me revoke it in the service’s dashboard and issue a new one; we’ll clean up the history later.',
            'I’ll make the repository private, that’s enough.',
            'Thanks, what a relief!',
            'Delete the README too while you’re at it.',
          ],
          explain: 'A deleted file stays in the commit history, and bots scan GitHub constantly. A leaked key is considered compromised: replace it — cleaning the history doesn’t make replacing it unnecessary.',
        },
      ],
    },
  },
}
