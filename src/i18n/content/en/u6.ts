import type { UnitTr } from '../types'

export const u6: UnitTr = {
  title: 'Design and UI with AI',
  subtitle: 'Beautiful and easy-to-use interfaces',
  description: 'Prompts for the interface, components, design system, responsive design, and accessibility',
  lessons: {
    'u6-1': {
      title: 'Prompt for the interface',
      ex: [
        {
          title: 'Stats screen',
          prompt: 'You need a stats screen for a workout app. Which prompt gave a clear interface?',
          sides: [
            {
              prompt: 'Make a beautiful modern dashboard.',
              result: {
                label: 'Six charts about nothing',
                ui: {
                  blocks: {
                    2: {
                      text: 'What\'s the main thing here?',
                    },
                  },
                },
              },
            },
            {
              prompt: 'A “My week” screen for fitness beginners. The main thing is how many workouts are done out of the plan, big at the top. Below — a chart by day and a “Start workout” button.',
              result: {
                label: 'Main thing on top, one button',
                ui: {
                  blocks: [
                    {
                      text: '3 of 4 workouts',
                    },
                    {
                      text: 'One left to hit your weekly goal',
                    },
                    {
                      label: 'chart by day',
                    },
                    {
                      text: 'Start workout',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'It sets the hierarchy: what\'s main, what\'s secondary, and what action you expect',
            'It has the word “week”, and AI loves specific timeframes',
            'AI doesn\'t understand “beautiful” and “modern” at all',
            'It\'s longer — so the AI tried harder',
          ],
          explain: 'An interface is a hierarchy: what the user should see first and what they should do. “Beautiful” sets neither, so the AI draws a template “like everyone else\'s”.',
        },
        {
          title: 'Recipe card',
          prompt: 'Level up the prompt for a recipe screen in a cooking app.',
          base: 'Make a recipe screen.',
          chips: [
            {
              tag: 'Structure',
              text: 'Photo and name on top, then cooking time and servings, then ingredients and steps.',
            },
            {
              tag: 'Context',
              text: 'A person is cooking with their phone in the kitchen — hands are busy, the text should be readable from a distance.',
            },
            {
              tag: 'States',
              text: 'Mark completed steps with a checkmark; if the photo didn\'t load — show a placeholder.',
            },
            {
              tag: 'Style',
              text: 'Warm colors, large font, lots of whitespace.',
            },
            {
              tag: 'Reference',
              text: 'Copy the design of a famous cooking site one to one.',
              trap: 'You can\'t copy someone else\'s design and brand. Describe the techniques you like: big photos, numbered steps.',
            },
            {
              tag: 'Style',
              text: 'Use all the colors of the rainbow to make it bright.',
              trap: 'Lots of colors without a system is noise. Bright ≠ clear: pick a primary and an accent color.',
            },
          ],
          explain: 'Structure → usage context → states → style. Where and how a person uses the screen is often more important than colors: in the kitchen you need large text and a minimum of tiny buttons.',
        },
        {
          title: 'Better to see once',
          situation: 'You sketched the screen on paper, but describing the layout of blocks in words is hard. The AI editor can take images.',
          options: [
            'Take a photo of the sketch, attach it to the prompt, and describe what matters: “the main button is at the bottom, full width”',
            'Describe everything in words, the AI doesn\'t understand images anyway',
            'Ask the AI to guess the layout without any hints',
          ],
          explain: 'Modern models (ChatGPT, Claude, Gemini) and editors like Cursor, v0, and Lovable accept images: a screenshot or a hand-drawn sketch conveys layout faster than words. But still explain the main thing in words — the AI may understand the image its own way.',
        },
        {
          title: 'Empty list',
          prompt: 'You asked: “Make a shopping list screen.” The user opens it for the first time — the list is empty. What will they most likely see?',
          tool: 'Preview',
          input: 'Make a shopping list screen.',
          outcomes: [
            {
              label: 'Empty white screen',
              ui: {
                blocks: [
                  {
                    text: 'Shopping',
                  },
                  {
                    text: '(empty)',
                  },
                ],
              },
            },
            {
              label: 'Friendly hint and button',
              ui: {
                blocks: {
                  0: {
                    text: 'Shopping',
                  },
                  2: {
                    text: 'The list is empty — add your first item',
                  },
                  3: {
                    text: '+ Add',
                  },
                },
              },
            },
            {
              label: 'Loading error',
              ui: {
                blocks: [
                  {
                    text: 'Shopping',
                  },
                  {
                    text: 'Error: list not found',
                  },
                ],
              },
            },
          ],
          explain: 'AI usually draws the “happy path” — a screen with data. You need to explicitly ask for the empty state, loading, and error: “if the list is empty — show a hint and an add button”.',
        },
        {
          title: 'Purple gradient',
          prompt: 'The AI made a landing page, but it looks like thousands of others. Your move?',
          chat: [
            {
              text: 'Make a landing page for my bakery.',
            },
            {
              text: 'Done! Purple gradient, glass cards, and the headline “Revolutionize your bakery”.',
            },
          ],
          options: [
            'The bakery is family-run and cozy: warm beige tones, photos of pastries, a serif font in headings, text in Russian. Here\'s a site I like for its mood: [link]. Don\'t copy it — take the feeling.',
            'Make it prettier.',
            'Change purple to green.',
            'Add more animations to make it modern.',
          ],
          explain: 'Without input, AI produces an “average” style. Words about mood, colors, fonts, and references help: the AI takes the mood from them instead of copying someone else\'s site.',
        },
      ],
    },
    'u6-2': {
      title: 'Components',
      ex: [
        {
          title: 'Why components',
          situation: 'The site has 12 identical “Buy” buttons, and the AI put styles into each one. Now you need to make them all blue.',
          options: [
            'Ask the AI to extract the button into a Button component and use it everywhere — then the color changes in one place',
            'Ask the AI to change the color in 12 places — that\'s more reliable',
            'Leave it as is: components are only for big companies',
          ],
          explain: 'A component is a reusable piece of the interface (button, card, header). An edit in one place changes all copies, and the AI won\'t “forget” one of the twelve.',
        },
        {
          title: 'A page made of components',
          prompt: 'The catalog page has grown to 600 lines. Break it into components together with the AI — step by step.',
          steps: [
            'Ask the AI to list the repeating blocks',
            'Extract the first component — the product card',
            'Replace the card copies with the component',
            'Check in the preview that everything looks the same as before',
            'Move on to the next block',
          ],
          extra: [
            'Ask to rewrite the whole page at once',
          ],
          explain: 'Big refactors are better done one component at a time, checking the result after each step. “Redo everything at once” is a recipe for broken layout that\'s hard to find.',
        },
        {
          title: 'A non-universal button',
          prompt: 'The Button component is used all over the site. Which line prevents it from being reused?',
          code: {
            4: '      Buy',
          },
          explain: 'The text “Buy” is hardcoded inside — this component can\'t become a “Cancel” or “Log in” button. The content should come from outside via children.',
        },
        {
          title: 'The card component',
          prompt: 'You asked the AI to extract the product card into a component. Review the changes.',
          request: 'Extract the product card into a ProductCard component and use it in the catalog.',
          hunks: {
            2: {
              harmful: 'The AI also rewrote the global styles — this changes sizes and spacing across the whole site. That wasn\'t asked for.',
            },
          },
          explain: 'The component itself and replacing the copies is exactly what you asked for. But editing the global CSS breaks the layout everywhere; if the AI touches shared files, ask why.',
        },
        {
          title: 'Prompt for a component',
          prompt: 'Ask the AI to make a notification component (toast) that will be useful throughout the app.',
          base: 'Make a pop-up notification.',
          chips: [
            {
              tag: 'Variants',
              text: 'Three variants: success, error, warning.',
            },
            {
              tag: 'Parameters',
              text: 'Text and variant are passed as parameters (props).',
            },
            {
              tag: 'Behavior',
              text: 'Disappears after 4 seconds, has a close button.',
            },
            {
              tag: 'Stack',
              text: 'React + Tailwind, like the rest of the project.',
            },
            {
              tag: 'Text',
              text: 'Always write “Saved!” inside.',
              trap: 'Hardcoded text makes the component one-off — it should come as a parameter.',
            },
            {
              tag: 'Speed',
              text: 'Copy the styles from all pages that have notifications.',
              trap: 'That will create a mess of different styles. The component should define one common look.',
            },
          ],
          explain: 'A good component: what changes (parameters), what variants exist, how it behaves. Then you can drop it anywhere in the app.',
        },
      ],
    },
    'u6-3': {
      title: 'Design system',
      ex: [
        {
          title: 'Five shades of blue',
          prompt: 'You spent a week asking the AI to add screens without ever mentioning the project\'s colors. What\'s most likely in the code?',
          tool: 'AI editor',
          input: 'Search the project: which blues are used?',
          outcomes: [
            {
              label: 'Lots of different blues',
            },
            {
              label: 'One color from the theme',
              lines: [
                'var(--color-primary)  — everywhere',
              ],
            },
            {
              label: 'No blue at all',
              lines: [
                'nothing found',
              ],
            },
          ],
          explain: 'Every new prompt is a new AI decision “by eye.” Without shared rules, shades and spacing drift apart. The fix is a design system: colors and sizes are set once and referenced from there.',
        },
        {
          title: 'What tokens are',
          situation: 'The template guide says: “Don\'t use colors directly, use design tokens.” What does that mean?',
          options: [
            'Colors, font sizes, and spacing are set once under names (primary, space-4), and components reference those names',
            'Tokens are paid AI limits, you need to save them',
            'They\'re passwords that protect the design from being copied',
          ],
          explain: 'Design tokens are named values: --color-primary, --radius-lg, a spacing scale. In Tailwind it\'s the project theme, in CSS it\'s variables. Change a token — the whole site changes. (Don\'t confuse them with AI tokens — units of text.)',
        },
        {
          title: 'A foreign color',
          prompt: 'The project has a theme with colors. Which line breaks it?',
          explain: '#6a5acd — “almost purple” isn\'t from the theme. The AI adds dozens of little things like this, and the interface starts to look sloppy. You need var(--color-primary) or a new token in the theme.',
        },
        {
          title: 'Spacing by eye',
          prompt: 'The AI set spacing to 13px, 17px, and 22px. What do you reply?',
          chat: [
            {
              text: 'Add pricing cards under the heading.',
            },
            {
              text: 'Done!',
            },
          ],
          options: [
            'Use the project\'s spacing scale: 4, 8, 12, 16, 24, 32 px (in Tailwind that\'s p-4, gap-6, etc.). Rewrite these values to the scale and only use it from now on.',
            'Make the spacing even bigger so it feels airier.',
            'It doesn\'t matter, no one will notice by eye.',
            'Remove the spacing entirely.',
          ],
          explain: 'A spacing scale (usually a multiple of 4 or 8) makes the interface look even. If you explicitly tell the AI “only use the scale,” it stops making up random numbers.',
        },
        {
          title: 'Rules for the AI',
          prompt: 'You want the AI editor to follow the project\'s style on every new screen. Which approach is more reliable?',
          sides: [
            {
              prompt: 'Every time at the end of the prompt: “and make it in our style.”',
              result: {
                label: 'Style “from memory”',
                text: 'Made it in your style: blue buttons, 6px rounding.',
              },
            },
            {
              prompt: 'Describe the design system once in the project\'s rules file (colors, fonts, spacing, ready-made components) — the editor mixes it into requests.',
              result: {
                label: 'Style from the rules',
                text: 'Using Button and Card from src/components, colors from the theme, spacing from the scale.',
              },
            },
          ],
          reasons: [
            'The AI doesn\'t remember past chats; it gets the project rules with every request',
            'The AI reads rules files faster than prompt text',
            'The AI doesn\'t understand the word “style”',
            'The second option is longer',
          ],
          explain: 'The model doesn\'t remember “how we do things.” The editor adds rules files (like .cursor/rules in Cursor or AGENTS.md) to requests — and colors, components, and spacing are followed without reminders.',
        },
      ],
    },
    'u6-4': {
      title: 'Responsive design',
      ex: [
        {
          title: 'Three columns on a phone',
          prompt: 'The pricing cards are built like this. What will a person see on a 375px-wide phone?',
          tool: 'Preview',
          input: 'I open the pricing page on my phone.',
          outcomes: [
            {
              label: 'Three narrow squeezed columns',
              ui: {
                blocks: [
                  {
                    items: [
                      'Ba…',
                      'St…',
                      'Pro…',
                    ],
                  },
                  {
                    text: 'Text doesn\'t fit',
                  },
                ],
              },
            },
            {
              label: 'Cards stacked one under another',
              ui: {
                blocks: [
                  {
                    items: [
                      'Basic',
                      'Standard',
                      'Pro',
                    ],
                  },
                ],
              },
            },
            {
              label: 'Horizontal scroll',
              ui: {
                blocks: [
                  {
                    items: [
                      'Basic →',
                    ],
                  },
                  {
                    text: 'Swipe sideways',
                  },
                ],
              },
            },
          ],
          explain: 'grid-cols-3 without prefixes applies at any width. You need a mobile-first approach: grid-cols-1 by default and md:grid-cols-3 for wide screens.',
        },
        {
          situation: 'In Tailwind you see the classes text-base md:text-lg. How does this work?',
          options: [
            'text-base — for all screens, and from width md (768px) and wider — text-lg',
            'text-lg — only on phones',
            'md means “medium” — a medium font size on any screen',
          ],
          explain: 'In Tailwind, styles without a prefix apply to all screens, while sm: (640px), md: (768px), lg: (1024px) turn on from that width and wider. That\'s why you build from phone to computer (mobile-first).',
        },
        {
          title: 'The page slides sideways',
          prompt: 'On a phone you can scroll the page sideways and everything “floats”. Which line is to blame?',
          explain: 'The fixed width of 900px doesn\'t fit on a phone and stretches the page. You need flexible values: width: 100% and max-width: 900px.',
        },
        {
          title: 'Fixing the responsive design',
          prompt: 'You asked the AI to fix the header on a phone. Accept the useful, reject the dangerous.',
          request: 'On a phone the menu in the header doesn\'t fit. Make a burger button.',
          hunks: {
            0: {
              lines: {
                2: '+<button className="md:hidden" aria-label="Open menu">☰</button>',
              },
            },
            1: {
              harmful: 'Without width=device-width the phone shows a “shrunk copy of the desktop” — everything becomes tiny. That\'s not responsive design, it\'s turning it off.',
            },
          },
          explain: 'Hiding the menu on a narrow screen and showing a burger is a normal solution. But swapping the viewport breaks responsive design entirely: the phone stops adjusting the scale.',
        },
        {
          title: 'Checking on a phone',
          prompt: 'The AI said “responsive design is done”. Check it step by step.',
          steps: [
            'Open device mode in DevTools (F12)',
            'Go through the page at 375px width',
            'Look for sideways scroll and tiny text',
            'Describe to the AI what\'s wrong, with a screenshot',
            'Check on a real phone',
          ],
          extra: [
            'Take the AI\'s word for it',
          ],
          explain: 'Device mode in DevTools (Ctrl+Shift+M in Chrome) quickly shows a narrow screen, but a real phone catches what the emulator can\'t see: finger size, the keyboard, the “notch”.',
        },
      ],
    },
    'u6-5': {
      title: 'Accessibility',
      ex: [
        {
          title: 'Light gray on white',
          prompt: 'The AI designer chose #C8C8C8 text on a white background. What will the contrast check say?',
          tool: 'Contrast check',
          input: 'Text #C8C8C8 on background #FFFFFF, normal size 16px.',
          outcomes: [
            {
              label: 'Fails: contrast is about 1.7 : 1',
              ui: {
                blocks: {
                  1: {
                    text: 'You need at least 4.5 : 1 (WCAG AA)',
                  },
                },
              },
            },
            {
              label: 'Passes: light text is easier to read',
              ui: {
                blocks: {
                  1: {
                    text: 'Good contrast',
                  },
                },
              },
            },
            {
              label: 'No check needed: it\'s just gray',
              ui: {
                blocks: {
                  1: {
                    text: 'Contrast only matters for buttons',
                  },
                },
              },
            },
          ],
          explain: 'According to WCAG (level AA), normal text needs a contrast of at least 4.5 : 1, and large text needs 3 : 1. Pale gray on white is hard to read in sunlight and for people with low vision. You can check it in DevTools or any online contrast checker.',
        },
        {
          title: 'The invisible button',
          prompt: 'A person uses the site with a keyboard (Tab and Enter). On which line does the button “disappear” for them?',
          code: {
            1: '  <img src={photo} alt="Cappuccino in a white cup" />',
            2: '  <h3>Cappuccino</h3>',
            3: '  <div className="btn" onClick={addToCart}>Add to cart</div>',
          },
          explain: 'A div with onClick doesn\'t receive keyboard focus and isn\'t announced as a button by screen readers. For actions you need a real <button> — it works with Tab, Enter, and space out of the box.',
        },
        {
          title: 'Advice about forms',
          prompt: 'The AI explains how to make a form accessible. Find the harmful advice.',
          file: 'AI response',
          code: [
            'Every field should have a <label> tied to the field.',
            'Write the error as text next to the field, not just a red border.',
            'You can remove the label: a placeholder inside the field fully replaces it.',
            'The order of fields when tabbing should match the order on screen.',
          ],
          explain: 'A placeholder disappears as soon as you start typing, is often pale, and isn\'t always read by screen readers. A label is always needed, and a placeholder is just an example of input.',
        },
        {
          title: 'Accessible form',
          prompt: 'Ask the AI to make an appointment form that works for everyone right away.',
          base: 'Make an appointment form.',
          chips: [
            {
              tag: 'Labels',
              text: 'Every field has a visible label.',
            },
            {
              tag: 'Errors',
              text: 'Errors — as text under the field, not just color.',
            },
            {
              tag: 'Keyboard',
              text: 'The form works fully with the keyboard, focus is visible.',
            },
            {
              tag: 'Contrast',
              text: 'Text contrast is at least 4.5 : 1.',
            },
            {
              tag: 'Style',
              text: 'Remove the focus outline — it\'s ugly.',
              trap: 'Without a visible focus, a keyboard user doesn\'t know where they are. You can restyle the outline, but don\'t remove it.',
            },
            {
              tag: 'Minimalism',
              text: 'Labels aren\'t needed, a placeholder is enough.',
              trap: 'A placeholder disappears when you type and is hard to read. A label is always needed.',
            },
          ],
          explain: 'Accessibility isn\'t a separate feature, but requirements for the prompt from the very start: labels, clear errors, keyboard, contrast. Redoing it later costs more.',
        },
        {
          title: 'Image description',
          situation: 'On the home page there\'s a photo: a barista pouring latte art in the shape of a heart. The AI set alt="image1.jpg". What\'s better?',
          options: [
            'alt="Barista drawing a heart on a latte" — briefly describe what\'s in the photo',
            'Keep alt="image1.jpg" — the main thing is that the attribute exists',
            'alt="picture picture photo coffee coffee shop best coffee" — for search engines',
          ],
          explain: 'Alt is read by screen readers and shown if the photo fails to load. You need a short description of the meaning. For purely decorative images, use an empty alt="" — that way the reader skips them.',
        },
      ],
    },
    'u6-6': {
      title: 'Wrap-up: interface',
      ex: [
        {
          title: 'From idea to finished screen',
          prompt: 'Put the steps of working on a new screen with AI in order.',
          steps: [
            'Describe what\'s most important on the screen and who it\'s for',
            'Show a sketch or reference',
            'Ask it to build from the project\'s components and tokens',
            'Check the empty state and errors',
            'Check phone and accessibility',
          ],
          extra: [
            'Ask it to “make it pretty”',
          ],
          explain: 'Hierarchy and purpose → visual example → design system → all states → responsive and accessibility. That\'s how a screen turns out both beautiful and easy to use.',
        },
        {
          title: 'Delete button',
          prompt: 'A notes app needs a delete button. Which prompt will protect against accidental taps?',
          sides: [
            {
              prompt: 'Add a delete note button.',
              result: {
                label: 'Deletes right away',
                ui: {
                  blocks: {
                    1: {
                      text: 'Note deleted forever',
                    },
                  },
                },
              },
            },
            {
              prompt: 'Add a delete note button: red, labeled “Delete”. After tapping, show “Note deleted” and an “Undo” button for 5 seconds.',
              result: {
                label: 'You can undo',
                ui: {
                  blocks: [
                    {
                      text: 'Delete',
                    },
                    {
                      text: 'Note deleted · Undo',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'It describes the behavior after tapping — with a way to undo a mistake',
            'The red color by itself protects against mistakes',
            'The “Delete” label is longer than an icon',
            'AI understands prompts with numbers better',
          ],
          explain: 'A good interface forgives mistakes: undo or confirmation for dangerous actions. AI won\'t think of this on its own — you need to describe the behavior.',
        },
        {
          title: 'Feedback on a screenshot',
          prompt: 'You checked the screen on your phone and found problems. How do you tell the AI?',
          chat: [
            {
              text: 'Here\'s the profile screen.',
            },
            {
              text: 'Looks great! Anything to change?',
            },
          ],
          options: [
            'I\'m attaching a screenshot from my phone: 1) the name gets cut off on the right, 2) the “Sign out” button is right against the edge — my finger misses it, 3) the gray text is hard to see. Fix these three things, don\'t touch anything else.',
            'It\'s all bad, redo it.',
            'Make it in Apple style.',
            'Rewrite the screen from scratch on another framework.',
          ],
          explain: 'Screenshot + numbered list + boundary (“don\'t touch anything else”) — the best format for edits. The AI will fix things precisely and won\'t break what already works.',
        },
        {
          title: 'Focus is gone',
          prompt: 'After the AI\'s “cosmetic” changes, it\'s impossible to tell from the keyboard where the focus is. Find the line.',
          explain: 'outline: none removes the focus indicator from all elements. If you don\'t like the outline — replace it with your own (for example, focus-visible:ring in Tailwind), but don\'t remove it.',
        },
        {
          title: 'Bottleneck',
          situation: 'On a phone, the “Yes” and “No” buttons sit right next to each other, 24px tall. People often miss.',
          options: [
            'Make the buttons 44–48px tall and add space between them',
            'Make the font bolder',
            'Swap the button colors',
          ],
          explain: 'A finger is not a mouse cursor. Apple recommends at least 44×44 pt for tap targets, Google (Material) — 48×48 dp. Small buttons right next to each other are a common AI-layout mistake.',
        },
        {
          title: 'Theme without tokens',
          prompt: 'You\'re asking to add a dark theme to a project where all colors are hardcoded right in the components. What will most likely happen?',
          tool: 'AI editor',
          input: 'Add a dark theme.',
          outcomes: [
            {
              label: 'A hundred spot edits and forgotten spots',
              text: 'Changed 46 files. In some places white text might have stayed on a white background — check the payment and profile pages.',
            },
            {
              label: 'One edit in the theme',
              text: 'Added dark values for the tokens --color-bg and --color-text. Done!',
            },
            {
              label: 'Refusal: dark themes are impossible',
              text: 'You can\'t make a dark theme in React.',
            },
          ],
          explain: 'With tokens, a dark theme is just a second set of values for the same names. Without them, the AI edits every color by hand and inevitably misses something.',
        },
      ],
    },
  },
}
