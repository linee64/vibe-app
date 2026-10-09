import type { UnitTr } from '../types'

export const u2: UnitTr = {
  title: 'Building a landing page',
  subtitle: 'From idea to a live page',
  description: 'The page, sections, style, responsive layout and follow-up edits',
  lessons: {
    'u2-1': {
      title: 'Describing the page',
      ex: [
        {
          title: 'A landing page for guitar lessons',
          prompt: 'Start with why the page exists and who it’s for. You’ll add design details later, in iterations.',
          base: 'Make a landing page for guitar lessons.',
          chips: [
            { tag: 'Audience', text: 'For adult beginners who have never played.' },
            { tag: 'Goal', text: 'The main action is signing up for a trial lesson.' },
            { tag: 'Sections', text: 'Sections: hero, how lessons work, prices, FAQ.' },
            { tag: 'Freedom', text: 'Come up with something yourself.', trap: 'AI will come up with “something” — the internet average. The goal and audience set the direction.' },
            { tag: 'Audience', text: 'For everyone in the world.', trap: 'A page “for everyone” speaks to no one: the copy and examples will come out generic.' },
            { tag: 'Example', text: 'Copy a famous music school’s website in full.', trap: 'You can’t copy someone else’s website, copy and brand. You can describe the techniques you like.' },
          ],
          explain: 'What the page is → who it’s for → what the main action is. The target action (sign-up, purchase, subscription) shapes the whole structure of a landing page.',
        },
        {
          title: 'Yoga studio',
          prompt: 'Both prompts are about a yoga studio landing page. Which one worked?',
          sides: [
            { prompt: 'Make a landing page for the Lotus yoga studio.', result: { label: 'Generic template, no button', ui: { blocks: { 0: { items: ['About us', 'Values', 'Contact'], logo: 'Lotus' }, 1: { text: 'Harmony of body and mind' } } } } },
            {
              prompt: 'Make a landing page for the Lotus yoga studio for busy people aged 25–40. The main goal is sign-ups for a trial class.',
              result: { label: 'An offer for busy people and a sign-up button', ui: { blocks: { 0: { items: ['Schedule', 'Prices'], logo: '🪷 Lotus' }, 1: { text: 'Yoga after work — 45 minutes' }, 2: { text: 'Classes at 7:00 and 19:30, next to the subway' }, 3: { text: 'Book a trial class' } } } },
            },
          ],
          reasons: [
            'It names the audience and the main action — AI builds the structure and the button around them',
            'It includes the studio’s name',
            'It’s longer, and AI reads long prompts more carefully',
            'It has numbers, so AI tries harder',
          ],
          explain: 'Both prompts have the studio’s name — the difference is the audience and the goal. Knowing the visitor is busy and the goal is a trial class, AI writes an offer about time and adds a sign-up button on its own.',
        },
        {
          title: 'Too good to be true',
          prompt: 'AI wrote a draft of the copy. What do you reply?',
          chat: [
            { text: 'Write the copy for my drawing course landing page.' },
            { text: '“Over 10,000 graduates worldwide! Our teachers are winners of international awards. Results guaranteed in 7 days!”' },
          ],
          options: [
            'Remove the numbers, awards and guarantees — they aren’t real. Here are the facts: I’ve been teaching since 2023, 12 students, groups of up to 6 people.',
            'Great, keep it — sounds impressive.',
            'Also add reviews from famous artists.',
            'Take the copy from a competitor’s website, theirs is better.',
          ],
          explain: 'AI writes great drafts, but it easily “hallucinates” numbers and facts. Check everything written about your product yourself. You can’t copy other people’s copy.',
        },
        {
          title: 'You like someone else’s site',
          situation: 'You really like how one online service’s website looks. You want something similar for your landing page.',
          options: [
            'Describe what exactly you like: “large heading on the left, illustration on the right, lots of white space” — a screenshot helps too',
            'Ask to copy the site one-to-one, including the logo and copy',
            'No way: AI doesn’t understand references',
          ],
          explain: 'Describe the techniques you like — you can attach a screenshot of the reference and explain what to take from it. You can’t copy someone else’s brand, logo or copy.',
        },
        {
          title: 'One main button',
          prompt: 'The prompt asked for one CTA. What hero section will AI build?',
          tool: 'Website builder',
          input: 'Make the hero section: a benefit-driven headline, a short subheading and one main button (CTA) “Book a trial lesson”.',
          outcomes: [
            { label: 'Headline, subheading and one prominent CTA', ui: { blocks: { 0: { text: 'Play your first song in a month' }, 1: { text: 'Guitar lessons for adult beginners' }, 2: { text: 'Book a trial lesson' } } } },
            { label: 'Four identical buttons', ui: { blocks: { 0: { text: 'Guitar studio' }, 1: { items: ['Learn more', 'About us', 'Blog', 'Contact'] } } } },
            { label: 'A long text with no button', ui: { blocks: { 0: { text: 'Our story' } } } },
          ],
          explain: 'A CTA (call to action) is the reason the page exists. A good landing page leads to one main action, not four equal buttons.',
        },
      ],
    },
    'u2-2': {
      title: 'Landing page sections',
      ex: [
        {
          title: 'Top to bottom',
          prompt: 'Order the landing page sections logically: promise → arguments → price → answers to doubts.',
          steps: ['Hero with a button', 'Benefits', 'Prices', 'FAQ — frequently asked questions'],
          extra: ['Server code'],
          explain: 'First the promise and the button, then the arguments, then prices and answers to doubts. This is the classic landing page funnel. Visitors never see the server code at all.',
        },
        {
          title: 'The first 5 seconds',
          prompt: 'Which hero section will keep a visitor on the page?',
          sides: [
            { prompt: 'Make the hero section: tell the story of our studio from the very beginning.', result: { label: 'A long company history', ui: { blocks: { 0: { text: 'Since 1998…' } } } } },
            {
              prompt: 'Make the hero section: a benefit-driven headline (“Play your first song in a month”), a short subheading and a “Sign up” button.',
              result: { label: 'Benefit + button', ui: { blocks: { 0: { text: 'Play your first song in a month' }, 1: { text: 'For adults starting from zero' }, 2: { text: 'Sign up' } } } },
            },
          ],
          reasons: [
            'In a couple of seconds it answers “what is this?” and “what do I do next?”',
            'A company story builds more trust, so it should come first',
            'It has less text, and less is always better',
            'A “Sign up” button is a trendy thing',
          ],
          explain: 'In a few seconds a visitor decides whether to stay. The hero section is a benefit-driven headline, a subheading and the main button. The story can go further down.',
        },
        {
          title: 'Pricing section',
          prompt: 'Level up the prompt for the pricing section: layout, what to highlight, which actions.',
          base: 'Add a pricing section.',
          chips: [
            { tag: 'Structure', text: 'Three cards in a row: “Starter”, “Pro”, “Team”.' },
            { tag: 'Emphasis', text: 'Highlight the middle plan with a “Popular” badge.' },
            { tag: 'Action', text: 'Each card has a monthly price and a “Choose” button.' },
            { tag: 'Content', text: 'Make up the prices yourself, add plenty of zeros.', trap: 'Prices are a fact about your business. AI doesn’t know them and will invent them.' },
            { tag: 'Format', text: 'Make it an Excel spreadsheet.', trap: 'A landing page needs a page section, not an Excel file.' },
            { tag: 'Style', text: 'No text, just pictures.', trap: 'Without plan names, prices and a button, the section sells nothing.' },
          ],
          explain: 'What to add → how to lay it out → what to highlight → which actions. Specifics save iterations, and facts (prices) come from you, not AI.',
        },
        {
          title: 'Reviews out of thin air',
          prompt: 'There are no customers yet, but AI reported back on the reviews section. Find the red flag.',
          file: 'AI reply',
          code: [
            'Added a “Reviews” section below the pricing.',
            'Wrote 6 reviews from “real customers” with names and photos — it makes the page look more solid.',
            'On phones the reviews stack in one column.',
            'When real reviews come in, it’s easy to drop them into the reviews array.',
          ],
          explain: 'Fake reviews deceive people and are outright banned in a number of countries — for example, by the FTC rule in the US since October 2024. While you have no reviews, show how things work or add reviews from your first testers.',
        },
        {
          title: 'The same questions again',
          prompt: 'AI suggests a more complex solution than needed. Your move?',
          chat: [
            { text: 'Visitors keep DMing the same questions: how long a lesson lasts, whether they need their own guitar, whether they can reschedule.' },
            { text: 'Let’s add an AI chatbot to the site — it’ll answer 24/7! We’ll connect an API, a knowledge base and…' },
          ],
          options: [
            'Let’s keep it simpler: add an FAQ section before the footer with these three questions and short answers, as an accordion.',
            'Yes, connect the chatbot and a live chat agent too.',
            'Make a pop-up with the questions 3 seconds after the visitor arrives.',
            'Ok, do whatever you think is best.',
          ],
          explain: 'An FAQ (Frequently Asked Questions) clears up doubts before sign-up. Three clear answers on the page work more reliably than a complex bot — don’t overcomplicate things without a reason.',
        },
      ],
    },
    'u2-3': {
      title: 'Styles and colors',
      ex: [
        {
          title: 'Describe the style',
          prompt: 'You want a friendly, bright style. Whose prompt is closer to the goal?',
          sides: [
            { prompt: 'Make it beautiful.', result: { label: 'Grey template' } },
            {
              prompt: 'Friendly, cartoonish style: primary color #7C4DFF, accent #FF7A59, 16px corner radius, Nunito font.',
              result: { label: 'A bright, recognizable style', ui: { blocks: { 0: { text: 'Learn through play' }, 1: { text: 'Short lessons every day' }, 2: { text: 'Start' }, 3: { text: 'Pricing' } } } },
            },
          ],
          reasons: [
            'It sets parameters that can be reproduced exactly: HEX colors, font, corner radius',
            'AI understands “beautiful” exactly the way you do',
            'HEX codes are only for designers, AI ignores them',
            'It has more adjectives',
          ],
          explain: 'HEX colors, a font, corner radius and mood are concrete parameters that AI will reproduce. Everyone has their own idea of “beautiful”.',
        },
        {
          title: 'What is Tailwind',
          prompt: 'You asked for a card “in Tailwind”. What code will AI most likely send?',
          input: 'Make a product card in Tailwind: photo, name, price.',
          outcomes: [
            { label: 'JSX with utility classes right in the markup' },
            { label: 'A ready-made component from a “tailwind” library' },
            { label: 'A separate CSS file with classes' },
          ],
          explain: 'Tailwind CSS is a set of small utility classes (p-4, text-lg, bg-white) that you write right in the markup. It has no ready-made components — libraries like shadcn/ui on top of Tailwind provide those. v0 and Lovable write Tailwind by default, so it’s useful to recognize it.',
        },
        {
          title: 'Consistent buttons',
          prompt: 'The site has five different buttons. Describe the style once — and ask to apply it everywhere.',
          base: 'Make all the buttons on the site the same.',
          chips: [
            { tag: 'Color', text: 'Background #7C4DFF, white text.' },
            { tag: 'Shape', text: '16px corner radius, 48px height.' },
            { tag: 'States', text: 'On hover — darker (#5B2FD6); on press — shift down by 2px.' },
            { tag: 'Scope', text: 'Make a shared Button component and replace all buttons with it.' },
            { tag: 'Variety', text: 'Let each button be a little different.', trap: 'That contradicts the task: a single style is what makes the site feel whole.' },
            { tag: 'Readability', text: 'Small light-grey text — that’s trendy.', trap: 'Light-grey text on a light background is hard to read: WCAG AA requires a contrast ratio of at least 4.5:1 for normal text.' },
          ],
          explain: 'Color, shape, states and a shared component — and all buttons look the same, and later you can change the style in one place.',
        },
        {
          title: 'Readability',
          prompt: 'You asked to improve readability. Check what AI did.',
          request: 'The text on the page is light grey and hard to read. Make it more readable.',
          hunks: { 2: { harmful: 'AI “improved readability” by deleting the whole FAQ section. You didn’t ask for that.' } },
          explain: 'Dark text instead of light grey and a bigger font size are on-point changes: WCAG AA requires normal text to have a contrast ratio of at least 4.5:1 against the background. A deleted section, however, is a change outside the task.',
        },
        {
          title: 'Wrong shades',
          situation: 'A designer sent you the colors: primary #7C4DFF, accent #FF7A59. You told AI “purple and orange” — and got completely different shades.',
          options: [
            'Paste the HEX codes into the prompt and ask to move them into theme variables',
            'Describe them more precisely in words: “a nicer purple”',
            'Pick the shades by hand with an eyedropper in every file',
          ],
          explain: 'A HEX code is a color in hexadecimal notation, two digits each for the red, green and blue channels. AI understands it unambiguously. And theme variables (CSS variables or a Tailwind theme) let you change a color in one place.',
        },
      ],
    },
    'u2-4': {
      title: 'Responsive for phones',
      ex: [
        {
          title: 'Make it responsive',
          prompt: 'The landing page is done, but on phones everything is falling apart. Name the breakpoints and how elements should behave.',
          base: 'Make the site responsive.',
          chips: [
            { tag: 'Approach', text: 'Mobile-first layout.' },
            { tag: 'Grid', text: 'Up to 640px — one column; on desktop — three.' },
            { tag: 'Menu', text: 'On narrow screens the menu collapses into a “hamburger”.' },
            { tag: 'Text', text: 'Body text at least 16px.' },
            { tag: 'Goal', text: 'Just make it work.', trap: '“Make it work” leaves AI guessing what exactly is broken and how it should be.' },
            { tag: 'Approach', text: 'Make a separate site for every phone model.', trap: 'A responsive layout is one page that adapts to the screen width.' },
          ],
          explain: 'Name the approach, the breakpoints and how elements behave: columns, menu, text size. More than half of the world’s web traffic comes from phones, so responsive design is a must.',
        },
        {
          title: 'Squashed cards',
          prompt: 'Needed: 1 column on phones and 3 on desktop. But on phones there are three squashed columns. Where’s the bug?',
          code: { 1: '  <h2 className="text-2xl font-bold">Pricing</h2>' },
          explain: 'Tailwind is mobile-first: a class without a prefix applies on all screens, and md: applies from 768px and up. Here it’s the other way round. It should be grid-cols-1 md:grid-cols-3.',
        },
        {
          title: 'Mobile-first in Tailwind',
          prompt: 'How big will the heading be on a phone that’s 375px wide?',
          tool: 'Phone preview',
          input: 'I open the landing page on a phone 375px wide.',
          code: { 1: '  Learn to draw' },
          outcomes: [
            { label: 'text-3xl: a neat heading', ui: { blocks: { 0: { text: 'Learn to draw' }, 2: { text: 'Sign up' } } } },
            { label: 'text-5xl: a huge heading', ui: { blocks: { 0: { text: 'LEARN TO DR-AW' }, 1: { text: 'The text doesn’t fit' } } } },
            { label: 'No styles: plain text', ui: { blocks: { 0: { text: 'Learn to draw' } } } },
          ],
          explain: 'A class without a prefix (text-3xl) applies on all screens, while md:text-5xl only kicks in from 768px. That’s why the mobile style is written without a prefix and the desktop one with md: or lg:.',
        },
        {
          title: 'Checking the responsive layout',
          prompt: 'You want to see how the site looks on a phone without reaching for your phone. Put the checks in order.',
          steps: ['Open DevTools (F12)', 'Turn on device mode: Ctrl+Shift+M', 'Pick a 375px width and scroll the page', 'Before launch, check on a real phone'],
          extra: ['Lower the monitor brightness'],
          explain: 'In Chrome, device mode is turned on with a button in DevTools or Ctrl+Shift+M (Cmd+Shift+M on a Mac). A typical phone width is 375 or 390px. But the emulator doesn’t show everything, so the final check is on a real device.',
        },
        {
          title: 'The menu doesn’t fit',
          prompt: 'AI “fixed” the menu on phones. What do you reply?',
          chat: [
            { text: 'On phones the menu items don’t fit on one line.' },
            { text: 'Reduced the menu font to 9px — now all the items fit!', preview: { blocks: { 0: { items: ['Home', 'Courses', 'Prices', 'Reviews', 'Contact'], logo: 'Art' }, 1: { text: 'Learn to draw' } } } },
          ],
          options: [
            'Nobody can read 9px. Bring back 16px, and on screens narrower than 768px hide the items behind a hamburger button with a dropdown.',
            'Great, thanks!',
            'Remove the menu on phones entirely.',
            'Make it 6px so it definitely fits.',
          ],
          explain: 'Condition (screen width) → what to do → how. A hamburger menu is the standard solution for phones, and text smaller than 16px is hard to read on a phone.',
        },
      ],
    },
    'u2-5': {
      title: 'Edits through follow-ups',
      ex: [
        {
          title: '“The heading is bad”',
          prompt: 'You meant the size, but AI understood it differently. How do you fix the situation?',
          chat: [
            { text: 'The heading is bad.' },
            { text: 'Rewrote the heading: “Welcome to the amazing world of music!” Is that better?' },
          ],
          options: [
            'Bring back the previous text. I meant the size: the hero heading should be 48px on desktop and 32px on phones.',
            'Wrong again!',
            'Redo the whole landing page.',
            'Make the heading better.',
          ],
          explain: 'AI interprets a vague “bad” however it likes. A good follow-up names the element and the desired result — then AI changes only what’s needed.',
        },
        {
          title: 'A targeted edit',
          prompt: 'The “Sign up” button gets lost against the background. Where → what → how → what not to touch.',
          base: 'The “Sign up” button gets lost against the background.',
          chips: [
            { tag: 'Where', text: 'I mean the button in the hero section.' },
            { tag: 'How', text: 'Make it coral #FF7A59 with white text.' },
            { tag: 'Limits', text: 'Don’t change the other sections.' },
            { tag: 'Scope', text: 'Change whatever you think is needed across the whole project.', trap: 'Then AI may redo things that already work. The edit should be targeted.' },
            { tag: 'Style', text: 'Up to you.', trap: '“Up to you” is guesswork again. Name the color.' },
          ],
          explain: 'Where → what → how → what not to touch. The constraint “don’t change anything else” protects the parts that are already done.',
        },
        {
          title: 'Too many re-renders',
          prompt: 'AI’s counter crashes with the error “Too many re-renders”. Where’s the bug?',
          code: { 4: '      Clicked: {count}' },
          explain: 'setCount is called right away on every render, not on click — that creates an infinite update loop. You need to pass a function: onClick={() => setCount(count + 1)}.',
        },
        {
          title: 'Hard to put into words',
          situation: 'On phones, a button and an image overlap in one spot. You try to explain to AI exactly where — and get tangled up.',
          options: [
            'Attach a screenshot with the spot marked and briefly write what’s wrong',
            'Record a five-minute voice message',
            'Paste the entire project code into the chat with no explanation',
          ],
          explain: 'ChatGPT, Claude, Cursor, v0 and Lovable understand images. A marked-up screenshot shows the problem better than a long description, and a short caption says what the result should be.',
        },
        {
          title: 'I only asked about the button',
          prompt: 'AI changed more than you asked for. Review the changes.',
          request: 'Make the “Sign up” button coral.',
          hunks: [
            { lines: { 2: '   Sign up' } },
            { lines: ['-<a href="#prices">Prices</a>', '-<a href="#faq">FAQ</a>', '+<a href="#contacts">Contact us</a>'], harmful: 'The menu was rewritten without being asked: the links to prices and FAQ are gone.' },
            { harmful: 'A new animation library just to change a color isn’t needed — it’s extra weight and extra risk.' },
          ],
          explain: 'In Cursor and similar editors you can view the diff and reject the extra chunks or restore a checkpoint. Then repeat the request with clear limits: “change only the button”.',
        },
      ],
    },
    'u2-6': {
      title: 'Chest: the landing page is ready',
      ex: [
        {
          title: 'A prompt for the whole landing page',
          prompt: 'Build a starting prompt: audience → sections → style → responsive.',
          base: 'Make a landing page for a drawing course.',
          chips: [
            { tag: 'Audience', text: 'For kids aged 8–12; the copy is for parents.' },
            { tag: 'Sections', text: 'Sections: hero, curriculum, prices, FAQ.' },
            { tag: 'Style', text: 'Bright style, Nunito font, primary color #FF7A59.' },
            { tag: 'Responsive', text: 'Responsive, mobile-first layout.' },
            { tag: 'Screen', text: 'Desktop only.', trap: 'Parents will most often open the link on their phones.' },
            { tag: 'Action', text: 'No buttons, let them just read.', trap: 'Without a CTA the landing page leads nowhere — there won’t be any sign-ups.' },
          ],
          explain: 'Audience, structure, style and responsiveness — a complete starting prompt for a landing page. The rest is polished through iterations.',
        },
        {
          title: 'The main button',
          situation: 'You’re choosing the text for the main button on a drawing course landing page.',
          options: ['Book a trial lesson', 'Click here', 'More about our company and its history'],
          explain: 'A good CTA says what exactly will happen after the click. “Click here” promises nothing.',
        },
        {
          title: 'A 900px-wide image',
          prompt: 'AI inserted an image with a fixed width. How will it look on a 375px phone?',
          tool: 'Phone preview',
          input: 'I open the page on a phone 375px wide.',
          outcomes: [
            { label: 'The image overflows the edge, horizontal scrolling appears', ui: { blocks: { 0: { text: 'Learn to draw' }, 2: { text: '↔ the page scrolls sideways' } } } },
            { label: 'The image neatly shrinks to fit', ui: { blocks: { 0: { text: 'Learn to draw' }, 2: { text: 'Sign up' } } } },
            { label: 'The image disappears', ui: { blocks: { 0: { text: 'Learn to draw' } } } },
          ],
          explain: 'A fixed 900px is wider than a phone screen: the page starts scrolling sideways. You need a responsive width, for example className="w-full max-w-[900px]".',
        },
        {
          title: 'An empty link preview',
          prompt: 'The link looks empty in Telegram. AI suggested a fix — reply to it.',
          chat: [
            { text: 'I shared the landing page link in Telegram — the preview is empty: no image, no description.' },
            { text: 'Made the hero image bigger, 1200px — now the preview will definitely show up!' },
          ],
          options: [
            'The preview is built from Open Graph tags. Add og:title, og:description and og:image with a full https://… link to a 1200×630 image into <head>.',
            'Thanks, I’ll check.',
            'Rename index.html to preview.html.',
            'Make the image even bigger.',
          ],
          explain: 'Messengers and social networks build previews from Open Graph tags in <head>, not from the page content. og:image needs a full link (https://…) to an image, usually 1200×630.',
        },
        {
          title: 'The “Curriculum” section',
          prompt: 'AI added a section. Is everything in the change on point?',
          request: 'Add a “Course curriculum” section after the hero.',
          hunks: { 2: { lines: ['-  Book a trial lesson', '+  Learn more'], harmful: 'AI replaced the main CTA with “Learn more” — the button no longer says what happens after the click.' } },
          explain: 'A new component and wiring it up — exactly what was asked. But changing the main button’s text is an edit outside the task that also makes the CTA worse.',
        },
        {
          title: 'Grown-up responsive design',
          prompt: 'Which request will give a predictable mobile screen?',
          sides: [
            { prompt: 'Make it responsive.', result: { label: 'Some things shrank, some didn’t', ui: { blocks: { 0: { text: 'Learn to draw' }, 2: { text: 'Sign up' } } } } },
            {
              prompt: 'On screens narrower than 640px — one column, the image full width (w-full), the button full width, text at least 16px.',
              result: { label: 'A neat single column', ui: { blocks: { 0: { text: 'Learn to draw' }, 2: { text: 'A course for kids aged 8–12' }, 3: { text: 'Sign up' } } } },
            },
          ],
          reasons: [
            'It sets a breakpoint and the behavior of each element — a result you can verify',
            'AI always understands the word “responsive” the same way',
            'It mentions Tailwind classes, and responsive design is impossible without them',
            'AI executes short prompts more carefully',
          ],
          explain: '“Responsive” is a general word. A breakpoint plus element behavior (columns, image and button width, text size) turns a wish into a verifiable requirement.',
        },
      ],
    },
  },
}
