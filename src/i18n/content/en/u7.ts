import type { UnitTr } from '../types'

export const u7: UnitTr = {
  title: 'AI mobile app',
  subtitle: 'Your own app on your phone',
  description: 'Expo and React Native: screens, navigation, testing on your phone, and publishing to the app stores',
  lessons: {
    'u7-1': {
      title: 'Website or app?',
      ex: [
        {
          title: 'What is React Native',
          situation: 'A friend says: “To make an app for iPhone and Android, you\'ll have to learn Swift and Kotlin.” The AI suggests React Native with Expo. What is it?',
          options: [
            'A way to write one app in JavaScript/TypeScript and React that works on both iOS and Android',
            'A builder that turns any website into an app with one button',
            'A phone emulator for your computer',
          ],
          explain: 'React Native renders real native UI elements, and the code is written in the familiar React. Expo is a set of tools around it: creating a project, running it on your phone, building and publishing. The AI knows this stack well.',
        },
        {
          title: 'First launch',
          prompt: 'Run your first app on your phone. Put the steps in order.',
          steps: {
            3: 'Scan the QR code in Expo Go',
          },
          extra: [
            'Buy an Apple developer account',
          ],
          explain: 'create-expo-app creates the project, expo start starts the dev server and shows a QR code. The Expo Go app on your phone opens the project from the code. You don\'t need a paid account for this — you\'ll only need it for publishing.',
        },
        {
          title: 'Prompt to start',
          prompt: 'You\'re asking the AI editor to start a mobile app for a habit tracker. Which prompt is better?',
          sides: [
            {
              prompt: 'Make a mobile app for habits.',
              result: {
                label: 'Unclear what it\'s built on and what\'s inside',
                text: 'Here\'s an HTML page with divs and CSS. Open it in your phone\'s browser.',
                code: [
                  '<div class="habit">Drink water</div>',
                ],
              },
            },
            {
              prompt: 'Expo project (React Native, TypeScript, expo-router). Screens: a habit list with a “done today” checkmark and an add screen. Store data on the phone. Start with the list.',
              result: {
                label: 'Expo screen and plan',
                text: 'Created app/index.tsx with a list on FlatList. Next step I\'ll add the app/add.tsx screen.',
              },
            },
          ],
          reasons: [
            'It names the stack, the screens and data storage, and asks to start with one step',
            'The word TypeScript makes any app mobile',
            'The AI understands short prompts worse because of typos',
            'It has the folder name app in it',
          ],
          explain: '“Mobile app” can mean anything — even a web page. The stack (Expo + React Native), the list of screens and where to store data set the boundaries, and “start with the list” keeps the AI from writing everything at once.',
        },
        {
          title: 'App myths',
          prompt: 'The AI is talking about Expo. Find the lie.',
          file: 'AI answer',
          code: [
            'Expo Go lets you open the project on your phone without building in Xcode or Android Studio.',
            'The same code runs on iOS and Android.',
            'To test the app on your phone, you first need to publish it to the App Store.',
            'Publishing to the stores requires a build — for example, via EAS Build.',
          ],
          explain: 'You can test right away: via Expo Go or a development build. Publishing is only needed so other people can download the app.',
        },
        {
          title: 'When a website is enough',
          situation: 'You need a page with a coffee shop menu and a “Call” button. It updates once a month, with no notifications and no offline.',
          options: [
            'A responsive website is enough: it doesn\'t need to be installed or pass store review',
            'You need a native app: websites don\'t open on phones',
            'You need two apps — one for iOS and one for Android',
          ],
          explain: 'An app is justified when you need phone features (camera, notifications, offline) or frequent use. For “view the menu,” a website is simpler: the link opens right away, with no install.',
        },
      ],
    },
    'u7-2': {
      title: 'Screens in React Native',
      ex: [
        {
          title: 'White screen with an error',
          prompt: 'The app crashes with the error “Text strings must be rendered within a <Text> component”. Which line is to blame?',
          code: {
            3: '      <Text style={styles.title}>My habits</Text>',
            4: '      Today: 3 of 5',
          },
          explain: 'In React Native, text can only be rendered inside <Text>. The line “Today: 3 of 5” sits directly in a <View> — that\'s where the error comes from. On the web this is fine, so the AI sometimes gets confused.',
        },
        {
          title: 'div in the app',
          prompt: 'Out of habit, the AI wrote web markup in an Expo screen. What happens when you run it on a phone?',
          input: 'I\'m running the screen on an iPhone.',
          code: {
            1: '  return <div className="card">Habit</div>',
          },
          outcomes: [
            {
              label: 'Error: div doesn\'t exist here',
            },
            {
              label: 'It will render just like on a website',
            },
            {
              label: 'Expo will replace div with View on its own',
            },
          ],
          explain: 'React Native has no HTML: instead of div — View, instead of p and span — Text, instead of img — Image, and styles are set with style, not className. Tell the AI in your prompt that this is React Native, and it won\'t mix them up.',
        },
        {
          title: 'Long list',
          prompt: 'The list has 500 habits and it\'s laggy. You asked the AI to speed it up. Review the changes.',
          request: 'The habit list is laggy. Make scrolling smooth.',
          hunks: {
            1: {
              harmful: 'The AI “sped up” the list by simply cutting it to 20 items. The rest of the habits will disappear for the user.',
            },
          },
          explain: 'FlatList renders only the visible rows, so long lists scroll smoothly. Cutting data isn\'t optimization — it\'s data loss.',
        },
        {
          title: 'Add screen',
          prompt: 'Ask the AI to build a screen for adding a habit.',
          base: 'Build a screen for adding a habit.',
          chips: [
            {
              tag: 'Stack',
              text: 'This is Expo / React Native: components View, Text, TextInput, Pressable.',
            },
            {
              tag: 'Fields',
              text: 'A name field and a day-of-week picker.',
            },
            {
              tag: 'Behavior',
              text: 'The “Save” button is disabled while the name is empty; after saving — go back to the list.',
            },
            {
              tag: 'Phone',
              text: 'The keyboard shouldn\'t cover the button.',
            },
            {
              tag: 'Stack',
              text: 'Build it with HTML and CSS, we\'ll port it later somehow.',
              trap: 'React Native has no HTML or CSS files — “porting” turns into a rewrite.',
            },
            {
              tag: 'Scope',
              text: 'While you\'re at it, also make sign-in, profile, and a paid subscription.',
              trap: 'Everything at once means a lot of code that\'s hard to check. One screen at a time.',
            },
          ],
          explain: 'Stack → fields → behavior → phone specifics. And one screen at a time: that way it\'s easy to check the result in Expo Go.',
        },
        {
          title: 'Native styles',
          prompt: 'The AI hooked up a CSS file to the Expo screen. Your move?',
          chat: [
            {
              text: 'Make a habit card with a shadow and rounded corners.',
            },
            {
              text: 'Done! I created HabitCard.css and imported it.',
            },
          ],
          options: [
            'This is React Native: styles go through StyleSheet.create and the style prop, no CSS files (unless the project uses NativeWind). Rewrite the card like this: borderRadius 16, shadow, and padding.',
            'Ok, it\'ll probably work.',
            'Then add some SCSS too, just to be safe.',
            'Remove the styles entirely.',
          ],
          explain: 'In React Native, styles are JavaScript objects (StyleSheet.create, style={…}). Tailwind-style classes are only possible through separate libraries like NativeWind. If the AI mixes up web and mobile — remind it of the stack.',
        },
      ],
    },
    'u7-3': {
      title: 'Navigation',
      ex: [
        {
          title: 'Every file is a screen',
          situation: 'In an expo-router project there are files app/index.tsx and app/settings.tsx. How do you open the settings screen?',
          options: [
            'Go to the path /settings: in expo-router every file in the app folder is a screen',
            'Register the screen in the AndroidManifest.xml file',
            'No way: an app can only have one screen',
          ],
          explain: 'Expo Router is file-based navigation, like in web frameworks: app/settings.tsx → path /settings. You can navigate with <Link href="/settings"> or router.push("/settings").',
        },
        {
          title: 'Bottom tabs',
          prompt: 'Make a bottom tab bar with the tabs “Habits” and “Stats” in expo-router. Put the steps in order.',
          steps: [
            'Create the folder app/(tabs)',
            'Add _layout.tsx with the Tabs component to it',
            'Move the screens: (tabs)/index.tsx and (tabs)/stats.tsx',
            'Set names and icons for the tabs',
            'Test the navigation on your phone',
          ],
          extra: [
            'Draw the tabs as an image on top of the screen',
          ],
          explain: 'A folder in parentheses is a route group: it doesn\'t appear in the URL, but it sets a shared _layout. In it, the Tabs component draws the bottom bar for all screens in the group.',
        },
        {
          title: 'Screen with a parameter',
          prompt: 'There\'s a file app/habit/[id].tsx. The user tapped a habit with id 42. What will the screen get?',
          code: {
            1: 'return <Text>Habit {id}</Text>',
          },
          outcomes: [
            {
              label: 'Habit 42 screen',
              ui: {
                blocks: [
                  {
                    text: 'Habit 42',
                  },
                ],
              },
            },
            {
              label: 'Error “screen not found”',
            },
            {
              label: 'Empty id',
              ui: {
                blocks: [
                  {
                    text: 'Habit',
                  },
                ],
              },
            },
          ],
          explain: 'Square brackets in a file name are a dynamic segment. The value from the URL comes in useLocalSearchParams. That way one screen shows any habit.',
        },
        {
          title: 'The “Back” button',
          prompt: 'After saving a habit, the app opens the list again — and “Back” takes you back to the form. What do you tell the AI?',
          chat: [
            {
              text: 'After saving I tap “Back” — and I see the form again with the field filled in.',
            },
            {
              text: 'Right now after saving I do router.push("/"). I can add a nicer transition animation.',
            },
          ],
          options: [
            'No animation needed. After saving, close the form screen with router.back() so the list doesn\'t open a second time and the form doesn\'t stay in history.',
            'Add an animation, maybe it\'ll help.',
            'Disable the “Back” button in the whole app.',
            'Let the user close the app themselves.',
          ],
          explain: 'push adds a new screen to the stack, so the form stays under it. router.back() returns to the previous screen — the list — and the form closes. Describe the expected “Back” behavior to the AI, not just the look.',
        },
        {
          title: 'A link to nowhere',
          prompt: 'Screens: app/index.tsx, app/stats.tsx and app/habit/[id].tsx. Which link goes to a screen that doesn\'t exist?',
          code: [
            '<Link href="/stats">My stats</Link>',
            '<Link href="/habit/7">Morning run</Link>',
            '<Link href="/settings">Settings</Link>',
            '<Link href="/">Home</Link>',
          ],
          explain: 'There\'s no app/settings.tsx file, so /settings goes to the “not found” screen. The AI may link to a screen it “was going” to make — check links against the list of files.',
        },
      ],
    },
    'u7-4': {
      title: 'Phone in hand',
      ex: [
        {
          title: 'Under the notch',
          prompt: 'The title sits at the very top of the screen with no padding. What will an iPhone owner with a camera cutout see?',
          input: 'I open the screen with the list.',
          code: {
            1: '  <Text style={styles.title}>My habits</Text>',
          },
          outcomes: [
            {
              label: 'The title is hidden under the cutout',
              ui: {
                blocks: [
                  {
                    text: '▬▬ My hab▬▬▬s',
                  },
                  {
                    items: [
                      'Drink water',
                      'Read for 10 minutes',
                    ],
                  },
                ],
              },
            },
            {
              label: 'All good, iOS will shift the text itself',
              ui: {
                blocks: [
                  {
                    text: 'My habits',
                  },
                  {
                    items: [
                      'Drink water',
                      'Read for 10 minutes',
                    ],
                  },
                ],
              },
            },
            {
              label: 'The app won\'t launch',
            },
          ],
          explain: 'The safe area is the part of the screen without the cutout, rounded corners, and the “home” bar. In Expo you use react-native-safe-area-context for it: SafeAreaView or insets from useSafeAreaInsets.',
        },
        {
          title: 'The keyboard covered the button',
          prompt: 'The tester writes: “I can\'t tap ‘Save\' — the keyboard covers it.” Your move?',
          chat: [
            {
              text: 'On the phone the keyboard covers the “Save” button on the add screen.',
            },
            {
              text: 'We can make the button smaller so it fits.',
            },
          ],
          options: [
            'Size won\'t help. Wrap the form in KeyboardAvoidingView (or make it scrollable) so the button rises above the keyboard when it\'s open. I\'ll check on iPhone and Android.',
            'Yes, make the button small.',
            'Let the user close the keyboard first.',
            'Move the button to the very top of the screen, above the title.',
          ],
          explain: 'The on-screen keyboard takes up almost half the screen — you can\'t see this in a browser on a computer. KeyboardAvoidingView or a scrollable form solves the problem. Behavior on iOS and Android differs, so test both.',
        },
        {
          title: 'Where to store the token',
          prompt: 'The AI wrote the app\'s sign-in. Which line stores the secret insecurely?',
          explain: 'AsyncStorage isn\'t encrypted — it\'s for regular data (theme, habit list). Sign-in tokens and other secrets are stored in expo-secure-store: it uses the system\'s secure storage (Keychain on iOS, Keystore on Android).',
        },
        {
          title: 'Camera permission',
          situation: 'You\'re adding a photo to habits. The AI suggests requesting camera access right when the app first launches.',
          options: [
            'Better to ask at the moment the person taps “Add photo” and explain why — that way they agree more often',
            'Ask for all permissions at launch — it\'s simpler',
            'Don\'t ask at all — the app will get access automatically',
          ],
          explain: 'Permissions are requested in context, when the benefit is clear. Without a request there\'s no access. On iOS you also need a text explanation (usage description) in the config — without it the app will crash on the request and won\'t pass review.',
        },
        {
          title: 'Test checklist',
          prompt: 'Before you hand the app to friends, test it on a phone. Put the steps in order.',
          steps: [
            'Open the project in Expo Go on your phone',
            'Go through the main scenario: add and check off a habit',
            'Close the app and open it again — is the data still there?',
            'Turn on airplane mode and test without internet',
            'Ask a friend with a different phone to test it',
          ],
          extra: [
            'Test only in the browser on a computer',
          ],
          explain: 'A computer won\'t show the keyboard, the cutout, slow internet, or a “different” phone. The main scenario, restart, offline, and someone else\'s device catch most mobile bugs.',
        },
      ],
    },
    'u7-5': {
      title: 'Publishing',
      ex: [
        {
          title: 'How much does the store cost',
          situation: 'You want to publish your app in both the App Store and Google Play. What will you have to pay for?',
          options: [
            'Apple Developer Program — $99 a year, Google Play — a one-time $25 fee',
            'Nothing: publishing in both stores is free',
            '$1000 for each version of the app',
          ],
          explain: 'An Apple developer account costs $99 a year, Google Play — $25 once. Plus the stores take a commission on sales and in-app subscriptions.',
        },
        {
          title: 'The path to the App Store',
          prompt: 'Put together the path of an Expo app to the App Store.',
          steps: [
            'Set up an Apple Developer account',
            'Build the app: eas build --platform ios',
            'Submit the build: eas submit',
            'Check it with testers via TestFlight',
            'Fill in the app page and send it for review',
          ],
          extra: [
            'Send a .zip with the code to Apple support',
          ],
          explain: 'EAS Build builds the app in the cloud (a Mac isn\'t required), EAS Submit uploads the build to App Store Connect. TestFlight gives the beta to testers, and after Apple\'s review the app goes live in the store.',
        },
        {
          title: 'Google Play rules',
          prompt: 'The AI explains publishing to Google Play for a new personal account. Find the mistake.',
          file: 'AI\'s answer',
          code: [
            'First upload the build to closed testing.',
            'New personal accounts need at least 12 testers who take part in the test for 14 days in a row.',
            'After that you can apply for access to production.',
            'You don\'t need to look for testers: just tap “Publish” on the very first day.',
          ],
          explain: 'For personal accounts created after November 2023, Google requires closed testing: at least 12 testers taking part for 14 days in a row. Only then can you request a production release.',
        },
        {
          title: 'Fix a typo',
          prompt: 'The app is already in the stores, and you found a typo in a button\'s text. The project has EAS Update set up. What happens after eas update?',
          input: 'eas update --branch production --message "Fixed a typo"',
          outcomes: [
            {
              label: 'The fix arrives without a new build or review',
              text: 'Users will get the updated JavaScript the next time they open the app.',
            },
            {
              label: 'You need to go through Apple\'s review again',
              text: 'The update will be in the store 1–3 days after review.',
            },
            {
              label: 'Nothing: a published app doesn\'t change',
              text: 'Change the text in the next version a year from now.',
            },
          ],
          explain: 'EAS Update delivers updates to JavaScript and images “over the air.” But if the native part changes (a new library with native code, permissions), you need a new build and review.',
        },
        {
          title: 'Store page',
          prompt: 'Ask the AI to help with the app description for the store.',
          base: 'Write an app description.',
          chips: [
            {
              tag: 'The point',
              text: 'The “Habits” app helps you check off good things every day.',
            },
            {
              tag: 'Audience',
              text: 'For busy people who want to start small.',
            },
            {
              tag: 'Format',
              text: 'First line — the benefit in one sentence, then the 3 main features as a list.',
            },
            {
              tag: 'Honesty',
              text: 'Mention that the data is stored only on the phone.',
            },
            {
              tag: 'Promotion',
              text: 'Add that this is the #1 app in the world and Apple praises it.',
              trap: 'False claims break store rules and can get you rejected in review.',
            },
            {
              text: 'Repeat the word “habits” 40 times for search.',
              trap: 'Keyword stuffing breaks store rules and puts people off.',
            },
          ],
          explain: 'What it does → who it\'s for → format → honest details. Stores check descriptions: deceptive promises and word spam are a common reason for rejection.',
        },
      ],
    },
    'u7-6': {
      title: 'Wrap-up: the app',
      ex: [
        {
          title: 'From idea to store',
          prompt: 'Put together the whole path of a mobile app.',
          steps: [
            'Describe the AI stack and screens',
            'Build the main screen and check it in Expo Go',
            'Add navigation and data storage',
            'Test on different phones',
            'Build with EAS and submit to the stores',
          ],
          extra: [
            'Publish right away, test later',
          ],
          explain: 'Small steps with a check on your phone after each one — just like with a website. Only testing and publishing take longer.',
        },
        {
          title: 'Added a camera',
          prompt: 'The AI added photos for habits. Review the changes.',
          request: 'Add the ability to attach a photo to a habit from the camera.',
          hunks: {
            0: {
              lines: [
                '+"plugins": [["expo-image-picker", { "cameraPermission": "The camera is needed to attach a photo to a habit." }]]',
              ],
            },
            2: {
              harmful: 'The AI also requested location and contacts on launch — that\'s not needed for photos. Extra permissions scare people and raise questions in review.',
            },
          },
          explain: 'A plugin with a clear explanation and a camera call on a button — that\'s what you need. Extra permissions “just in case” — no: request only what you use.',
        },
        {
          title: 'It doesn\'t work in Expo Go',
          prompt: 'You added a library with native code that isn\'t in Expo Go, and the app crashed. The AI is lost. Your move?',
          chat: [
            {
              text: 'After installing a Bluetooth library, the app crashes on launch in Expo Go.',
            },
            {
              text: 'Try reinstalling Expo Go.',
            },
          ],
          options: [
            'Expo Go only contains a built-in set of native modules. For a third-party native library you need a development build — help me build it with EAS and run it on my phone.',
            'I\'ll reinstall Expo Go a couple more times.',
            'I\'ll delete node_modules and stop using my phone.',
            'I\'ll rewrite the app in Swift.',
          ],
          explain: 'Expo Go has a certain set of libraries built in. If you need your own native code, you make a development build — your own “version of Expo Go” with the modules you need.',
        },
        {
          title: 'Key in the app',
          prompt: 'Which line leaks a secret to everyone who downloads the app?',
          explain: 'Variables with the EXPO_PUBLIC_ prefix end up in the app\'s code — they can be extracted from the installed file. Public addresses and the Supabase anon key (with RLS enabled) — fine, a secret AI key — not: requests to the AI go through your server.',
        },
        {
          title: 'Rejected in review',
          situation: 'Apple rejected the app: “The app requests access to the camera but doesn\'t explain why.”',
          options: [
            'Add a clear explanation for the camera request in the config (usage description), rebuild and submit again',
            'Delete the app from App Store Connect forever',
            'Submit the same build again — maybe they\'ll let it through',
          ],
          explain: 'Review isn\'t a verdict: the rejection usually states the reason. Fix it, reply in Resolution Center if needed, and submit a new build.',
        },
        {
          title: 'Error message',
          prompt: 'Habits didn\'t load: no internet. Which prompt gave a more human screen?',
          sides: [
            {
              prompt: 'If there\'s an error — show the error.',
              result: {
                label: 'Technical text',
              },
            },
            {
              prompt: 'If there\'s no network — show “No internet. Habits are saved on your phone” and a “Retry” button. Technical details — only in the logs.',
              result: {
                label: 'Clear and tells you what to do',
                ui: {
                  blocks: [
                    {
                      text: 'No internet',
                    },
                    {
                      text: 'Habits are saved on your phone',
                    },
                    {
                      text: 'Retry',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            'It tells the person what happened and what to do, and hides the details in the logs',
            'The word “internet” is shorter than the word “error”',
            'The AI only adds buttons when you ask for “retry”',
            'Technical messages are banned by store rules',
          ],
          explain: 'On a phone the network drops all the time. A good error message says what happened, what\'s up with the data, and what to do next.',
        },
      ],
    },
  },
}
