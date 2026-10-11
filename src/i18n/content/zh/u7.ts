import type { UnitTr } from '../types'

export const u7: UnitTr = {
  title: '带 AI 的移动应用',
  subtitle: '把应用装进你的手机',
  description: 'Expo 和 React Native：屏幕、导航、在手机上测试并发布到应用商店',
  lessons: {
    'u7-1': {
      title: '网站还是应用？',
      ex: [
        {
          title: '什么是 React Native',
          situation: '朋友说：“要做 iPhone 和 Android 的应用，就得学 Swift 和 Kotlin。”AI 建议用 React Native 加 Expo。这是什么？',
          options: [
            '用 JavaScript/TypeScript 和 React 写一个应用，同时能在 iOS 和 Android 上运行的方法',
            '一个按钮就能把任何网站变成应用的构建器',
            '电脑上的手机模拟器',
          ],
          explain: 'React Native 绘制真正的原生界面元素，而代码用你熟悉的 React 来写。Expo 是围绕它的一套工具：创建项目、在手机上运行、构建和发布。AI 很熟悉这套技术栈。',
        },
        {
          title: '第一次运行',
          prompt: '在手机上运行你的第一个应用。把步骤排好。',
          steps: {
            3: '在 Expo Go 里扫描二维码',
          },
          extra: [
            '购买 Apple 开发者账号',
          ],
          explain: 'create-expo-app 创建项目，expo start 启动开发服务器并显示二维码。手机上的 Expo Go 应用通过二维码打开项目。这一步不需要付费账号——只有发布时才需要。',
        },
        {
          title: '起步提示词',
          prompt: '你让 AI 编辑器开始做一个习惯追踪的移动应用。哪个提示词更好？',
          sides: [
            {
              prompt: '做一个习惯的移动应用。',
              result: {
                label: '不清楚用什么技术、里面有什么',
                text: '这是一个带 div 和 CSS 的 HTML 页面。在手机浏览器里打开它吧。',
                code: [
                  '<div class="habit">喝水</div>',
                ],
              },
            },
            {
              prompt: '用 Expo 的项目（React Native、TypeScript、expo-router）。页面：带“今天已完成”标记的习惯列表和添加页面。数据存在手机上。从列表开始。',
              result: {
                label: 'Expo 页面和计划',
                text: '已创建 app/index.tsx，用 FlatList 做列表。下一步我会添加 app/add.tsx 页面。',
              },
            },
          ],
          reasons: [
            '它说明了技术栈、页面和数据存储，并要求从一步开始',
            'TypeScript 这个词能让任何应用变成移动应用',
            '短提示词因为错别字，AI 理解得更差',
            '里面有 app 文件夹的名字',
          ],
          explain: '“移动应用”怎么理解都行——哪怕是网页。技术栈（Expo + React Native）、页面列表和数据存哪里划定了范围，而“从列表开始”让 AI 不会一次写完所有东西。',
        },
        {
          title: '关于应用的误区',
          prompt: 'AI 在讲 Expo。找出不实之处。',
          file: 'AI 的回答',
          code: [
            'Expo Go 让你不用在 Xcode 或 Android Studio 里构建，就能在手机上打开项目。',
            '同一份代码能在 iOS 和 Android 上运行。',
            '要在自己手机上测试应用，得先把它发布到 App Store。',
            '要发布到应用商店需要构建——比如通过 EAS Build。',
          ],
          explain: '测试可以马上进行：通过 Expo Go 或 development build。发布只是为了让别人能下载你的应用。',
        },
        {
          title: '什么时候网站就够了',
          situation: '你需要一个带咖啡店菜单和“拨打电话”按钮的页面。每月更新一次，不需要通知和离线。',
          options: [
            '响应式网站就够了：不用安装，也不用通过应用商店审核',
            '需要原生应用：网站在手机上打不开',
            '需要两个应用——分别给 iOS 和 Android',
          ],
          explain: '当需要手机功能（相机、通知、离线）或高频使用时，应用才值得做。对于“看看菜单”，网站更简单：链接一点就开，不用安装。',
        },
      ],
    },
    'u7-2': {
      title: 'React Native 的屏幕',
      ex: [
        {
          title: '带错误的白色屏幕',
          prompt: '应用崩溃并报错 “Text strings must be rendered within a <Text> component”。哪一行有问题？',
          code: {
            3: '      <Text style={styles.title}>我的习惯</Text>',
            4: '      今天：5 个中的 3 个',
          },
          explain: '在 React Native 中，文本只能放在 <Text> 里。字符串 “今天：5 个中的 3 个” 直接放在 <View> 里——所以报错。在网页里可以这样写，所以 AI 有时会搞混。',
        },
        {
          title: '应用里的 div',
          prompt: 'AI 习惯性地在 Expo 屏幕里写了网页标记。在手机上运行时会发生什么？',
          input: '我在 iPhone 上运行屏幕。',
          code: {
            1: '  return <div className="card">习惯</div>',
          },
          outcomes: [
            {
              label: '错误：这里不存在 div',
            },
            {
              label: '会像网站上一样渲染出来',
            },
            {
              label: 'Expo 会自动把 div 换成 View',
            },
          ],
          explain: 'React Native 里没有 HTML：div 换成 View，p 和 span 换成 Text，img 换成 Image，样式通过 style 设置，而不是 className。在提示词里告诉 AI 这是 React Native，它就不会搞混。',
        },
        {
          title: '长列表',
          prompt: '列表里有 500 个习惯，卡顿。你让 AI 加速。检查改动。',
          request: '习惯列表卡顿。让滚动变流畅。',
          hunks: {
            1: {
              harmful: 'AI “加速” 列表的方式是直接截断到 20 个。其余习惯对用户来说就消失了。',
            },
          },
          explain: 'FlatList 只渲染可见的行，所以长列表滚动流畅。而截断数据不是优化，是数据丢失。',
        },
        {
          title: '添加屏幕',
          prompt: '让 AI 做一个添加习惯的屏幕。',
          base: '做一个添加习惯的屏幕。',
          chips: [
            {
              tag: '技术栈',
              text: '这是 Expo / React Native：组件用 View、Text、TextInput、Pressable。',
            },
            {
              tag: '字段',
              text: '名称输入框和星期选择。',
            },
            {
              tag: '行为',
              text: '名称为空时 “保存” 按钮不可用；保存后返回列表。',
            },
            {
              tag: '手机',
              text: '键盘不能挡住按钮。',
            },
            {
              tag: '技术栈',
              text: '先用 HTML 和 CSS 写，之后再想办法迁移。',
              trap: 'React Native 里没有 HTML 和 CSS 文件——“迁移” 会变成重写。',
            },
            {
              tag: '范围',
              text: '顺便把登录、个人资料和付费订阅也做了。',
              trap: '一次全做意味着大量代码，很难检查。一次一个屏幕。',
            },
          ],
          explain: '技术栈 → 字段 → 行为 → 手机特性。而且一次一个屏幕：这样在 Expo Go 里很容易检查结果。',
        },
        {
          title: '原生样式',
          prompt: 'AI 把 CSS 文件接入了 Expo 屏幕。你怎么办？',
          chat: [
            {
              text: '做一个带阴影和圆角的习惯卡片。',
            },
            {
              text: '搞定！创建了 HabitCard.css 并通过 import 接入了。',
            },
          ],
          options: [
            '这是 React Native：样式通过 StyleSheet.create 和 style 属性，不用 CSS 文件（除非项目里有 NativeWind）。把卡片重写成这样：borderRadius 16、阴影和外边距。',
            '好吧，大概能行。',
            '那就再加个 SCSS 保险一点。',
            '把样式全删了。',
          ],
          explain: '在 React Native 里，样式是 JavaScript 对象（StyleSheet.create、style={…}）。Tailwind 风格的类名只能通过 NativeWind 之类的独立库实现。如果 AI 把网页和移动端搞混了——提醒它技术栈。',
        },
      ],
    },
    'u7-3': {
      title: '导航',
      ex: [
        {
          title: '每个文件都是一个屏幕',
          situation: '在 expo-router 项目中有 app/index.tsx 和 app/settings.tsx 文件。如何打开设置屏幕？',
          options: [
            '通过路径 /settings 访问：在 expo-router 中，app 文件夹里的每个文件都是一个屏幕',
            '在 AndroidManifest.xml 文件中注册屏幕',
            '无法打开：应用中只能有一个屏幕',
          ],
          explain: 'Expo Router 是文件式导航，就像网页框架一样：app/settings.tsx → 路径 /settings。可以通过 <Link href="/settings"> 或 router.push("/settings") 跳转。',
        },
        {
          title: '底部标签栏',
          prompt: '在 expo-router 中做一个底部面板，包含“习惯”和“统计”标签。整理步骤。',
          steps: [
            '创建 app/(tabs) 文件夹',
            '在其中添加 _layout.tsx，包含 Tabs 组件',
            '移动屏幕：(tabs)/index.tsx 和 (tabs)/stats.tsx',
            '为标签设置名称和图标',
            '在手机上检查跳转',
          ],
          extra: [
            '用图片在屏幕上方绘制标签',
          ],
          explain: '带括号的文件夹是路由组：它不会出现在地址中，但会定义共享的 _layout。其中的 Tabs 组件为该组所有屏幕绘制底部面板。',
        },
        {
          title: '带参数的屏幕',
          prompt: '有一个文件 app/habit/[id].tsx。用户点击了 id 为 42 的习惯。屏幕会得到什么？',
          code: {
            1: 'return <Text>习惯 {id}</Text>',
          },
          outcomes: [
            {
              label: '习惯 42 的屏幕',
              ui: {
                blocks: [
                  {
                    text: '习惯 42',
                  },
                ],
              },
            },
            {
              label: '错误“屏幕未找到”',
            },
            {
              label: '空的 id',
              ui: {
                blocks: [
                  {
                    text: '习惯',
                  },
                ],
              },
            },
          ],
          explain: '文件名中的方括号是动态段。地址中的值会传入 useLocalSearchParams。这样同一个屏幕就能显示任何习惯。',
        },
        {
          title: '“返回”按钮',
          prompt: '保存习惯后，应用重新打开列表——而“返回”又回到表单。你会对 AI 说什么？',
          chat: [
            {
              text: '保存后我按“返回”——又看到填好的表单。',
            },
            {
              text: '现在保存后我执行 router.push("/")。我可以添加更漂亮的过渡动画。',
            },
          ],
          options: [
            '不需要动画。保存后用 router.back() 关闭表单屏幕，这样列表不会第二次打开，表单也不会留在历史记录中。',
            '添加动画，也许会有帮助。',
            '在整个应用中禁用“返回”按钮。',
            '让用户自己关闭应用。',
          ],
          explain: 'push 会把新屏幕添加到栈中，所以表单会留在下面。router.back() 返回上一个屏幕——列表，而表单会关闭。向 AI 描述“返回”的预期行为，而不仅仅是外观。',
        },
        {
          title: '指向虚无的链接',
          prompt: '屏幕：app/index.tsx、app/stats.tsx 和 app/habit/[id].tsx。哪个链接指向不存在的屏幕？',
          code: [
            '<Link href="/stats">我的统计</Link>',
            '<Link href="/habit/7">晨跑</Link>',
            '<Link href="/settings">设置</Link>',
            '<Link href="/">主页</Link>',
          ],
          explain: '没有 app/settings.tsx 文件，所以 /settings 会指向“未找到”屏幕。AI 可能会引用一个它“打算”做的屏幕——请根据文件列表检查链接。',
        },
      ],
    },
    'u7-4': {
      title: '手机在手',
      ex: [
        {
          title: '在“刘海”下面',
          prompt: '标题紧贴屏幕最顶部，没有任何边距。带摄像头刘海的 iPhone 用户会看到什么？',
          input: '我打开列表页面。',
          code: {
            1: '  <Text style={styles.title}>我的习惯</Text>',
          },
          outcomes: [
            {
              label: '标题被藏在刘海下面',
              ui: {
                blocks: [
                  {
                    text: '▬▬ 我的习▬▬▬惯',
                  },
                  {
                    items: [
                      '喝水',
                      '阅读 10 分钟',
                    ],
                  },
                ],
              },
            },
            {
              label: '一切正常，iOS 会自动把文字挪开',
              ui: {
                blocks: [
                  {
                    text: '我的习惯',
                  },
                  {
                    items: [
                      '喝水',
                      '阅读 10 分钟',
                    ],
                  },
                ],
              },
            },
            {
              label: '应用根本打不开',
            },
          ],
          explain: '安全区域（safe area）是指屏幕上没有刘海、圆角和“home”横条的那部分。在 Expo 里用 react-native-safe-area-context 来处理：SafeAreaView 或 useSafeAreaInsets 提供的边距。',
        },
        {
          title: '键盘挡住了按钮',
          prompt: '测试人员说：“我点不到‘保存’——键盘把它挡住了。”你怎么办？',
          chat: [
            {
              text: '在手机上，键盘挡住了添加页面上的“保存”按钮。',
            },
            {
              text: '可以把按钮做小一点，这样就能放下了。',
            },
          ],
          options: [
            '改大小没用。把表单包进 KeyboardAvoidingView（或者做成可滚动），这样键盘弹出时按钮会升到键盘上方。我会在 iPhone 和 Android 上都测一下。',
            '好，把按钮做小。',
            '让用户先自己把键盘收起来。',
            '把按钮挪到屏幕最上面，标题上方。',
          ],
          explain: '屏幕键盘几乎占了半个屏幕——在电脑浏览器里根本看不到。KeyboardAvoidingView 或可滚动的表单能解决这个问题。iOS 和 Android 的表现不一样，所以两个都要测。',
        },
        {
          title: '令牌存在哪里',
          prompt: 'AI 写好了应用登录。哪一行不安全地存储了密钥？',
          explain: 'AsyncStorage 不加密——它只适合普通数据（主题、习惯列表）。登录令牌和其他密钥要存在 expo-secure-store 里：它使用系统的安全存储（iOS 的 Keychain、Android 的 Keystore）。',
        },
        {
          title: '相机权限',
          situation: '你在给习惯添加照片。AI 建议在应用第一次启动时就请求相机权限。',
          options: [
            '最好在用户点“添加照片”的那一刻再问，并说明为什么——这样同意的人更多',
            '启动时一次性请求所有权限——这样更省事',
            '干脆不问——应用会自动获得权限',
          ],
          explain: '权限要在用户能理解其用途的场景下请求。不请求就拿不到权限。在 iOS 上还需要在配置里写文字说明（usage description）——没有它，应用在请求权限时会崩溃，也过不了审核。',
        },
        {
          title: '测试清单',
          prompt: '把应用交给朋友之前，先在手机上测一遍。把步骤排好。',
          steps: [
            '在自己的手机上用 Expo Go 打开项目',
            '走一遍主流程：添加并勾选一个习惯',
            '关掉应用再打开——数据还在吗？',
            '打开飞行模式，测试没有网络的情况',
            '找个用别的手机的朋友帮你测一下',
          ],
          extra: [
            '只在电脑浏览器里测',
          ],
          explain: '电脑不会显示键盘、刘海、慢网络和“别人的”手机。主流程、重启、离线、别人的设备，这四样能抓住大多数移动端 bug。',
        },
      ],
    },
    'u7-5': {
      title: '发布',
      ex: [
        {
          title: '商店要花多少钱',
          situation: '你想把应用同时上架 App Store 和 Google Play。需要支付什么费用？',
          options: [
            'Apple Developer Program — 每年 $99，Google Play — 一次性 $25',
            '什么都不用：两个商店发布都免费',
            '每个应用版本 $1000',
          ],
          explain: 'Apple 开发者账号每年 $99，Google Play 一次性 $25。另外商店还会从应用内销售和订阅中抽取佣金。',
        },
        {
          title: '通往 App Store 的路',
          prompt: '把 Expo 应用上架 App Store 的流程排好。',
          steps: [
            '注册 Apple Developer 账号',
            '构建应用：eas build --platform ios',
            '提交构建：eas submit',
            '通过 TestFlight 让测试者检查',
            '填写应用页面并提交审核',
          ],
          extra: [
            '把代码的 .zip 发给 Apple 支持团队',
          ],
          explain: 'EAS Build 在云端构建应用（不需要 Mac），EAS Submit 把构建上传到 App Store Connect。TestFlight 把测试版分发给测试者，Apple 审核通过后应用就上架了。',
        },
        {
          title: 'Google Play 的规则',
          prompt: 'AI 在解释新个人账号如何发布到 Google Play。找出错误。',
          file: 'AI 的回答',
          code: [
            '先把构建上传到封闭测试。',
            '新的个人账号需要至少 12 名测试者，连续参与测试 14 天。',
            '之后就可以申请生产环境访问权限。',
            '不用找测试者：第一天直接点“发布”就行。',
          ],
          explain: '对于 2023 年 11 月之后创建的个人账号，Google 要求封闭测试：至少 12 名测试者连续参与 14 天。只有之后才能申请发布到生产环境。',
        },
        {
          title: '修正错别字',
          prompt: '应用已经在商店里了，你发现按钮文字里有个错别字。项目配置了 EAS Update。执行 eas update 后会发生什么？',
          input: 'eas update --branch production --message "修正了错别字"',
          outcomes: [
            {
              label: '修正无需新构建和审核即可生效',
              text: '用户下次启动应用时会收到更新后的 JavaScript。',
            },
            {
              label: '需要重新通过 Apple 审核',
              text: '更新会在审核后 1–3 天出现在商店里。',
            },
            {
              label: '什么都不会发生：已发布的应用不会改变',
              text: '等明年下一个版本再改文字吧。',
            },
          ],
          explain: 'EAS Update 通过“空中”方式推送 JavaScript 和图片更新。但如果原生部分发生变化（新的带原生代码的库、权限），就需要新的构建和审核。',
        },
        {
          title: '商店页面',
          prompt: '请 AI 帮忙写应用商店的描述。',
          base: '写一段应用描述。',
          chips: [
            {
              tag: '核心',
              text: '“习惯”应用帮你每天标记有益的事情。',
            },
            {
              tag: '受众',
              text: '适合想从小事做起的忙碌人群。',
            },
            {
              tag: '格式',
              text: '第一行用一句话说明好处，然后列出 3 个主要功能。',
            },
            {
              tag: '诚实',
              text: '说明数据只保存在手机上。',
            },
            {
              tag: '推广',
              text: '加上这是世界第一的应用，Apple 都称赞它。',
              trap: '虚假声明违反商店规则，可能导致审核被拒。',
            },
            {
              text: '把“习惯”这个词重复 40 次以便搜索。',
              trap: '关键词堆砌违反商店规则，还会吓跑用户。',
            },
          ],
          explain: '做什么 → 给谁 → 格式 → 诚实的细节。商店会检查描述：虚假承诺和关键词垃圾是常见的被拒原因。',
        },
      ],
    },
    'u7-6': {
      title: '总结：应用',
      ex: [
        {
          title: '从想法到应用商店',
          prompt: '把移动应用的整个流程串起来。',
          steps: [
            '描述 AI 技术栈和各个屏幕',
            '搭好主屏幕并在 Expo Go 里检查',
            '加上导航和数据存储',
            '在不同手机上测试',
            '用 EAS 打包并提交到应用商店',
          ],
          extra: [
            '先发布，之后再测试',
          ],
          explain: '小步走，每一步都在手机上检查——和做网站一样。只是测试和发布要花更多时间。',
        },
        {
          title: '加了相机',
          prompt: 'AI 给习惯加了照片。检查一下改动。',
          request: '加上从相机给习惯附上照片的功能。',
          hunks: {
            0: {
              lines: [
                '+"plugins": [["expo-image-picker", { "cameraPermission": "需要相机权限，才能给习惯附上照片。" }]]',
              ],
            },
            2: {
              harmful: 'AI 顺手在启动时请求了定位和通讯录——对照片来说根本不需要。多余的权限会吓到用户，也会在审核时引起质疑。',
            },
          },
          explain: '带清楚说明的插件，加上按按钮才调用相机——这才是对的。多余的“以防万一”权限——不行：只请求你真正用到的。',
        },
        {
          title: '在 Expo Go 里跑不起来',
          prompt: '你加了一个带原生代码的库，Expo Go 里没有，应用就崩了。AI 也懵了。你下一步怎么做？',
          chat: [
            {
              text: '装了蓝牙库之后，应用在 Expo Go 里一启动就崩。',
            },
            {
              text: '试试重新安装 Expo Go。',
            },
          ],
          options: [
            'Expo Go 只包含内置的原生模块。要用第三方的原生库，需要 development build——帮我用 EAS 打包并在手机上运行。',
            '我再重装几次 Expo Go。',
            '删掉 node_modules，然后不用手机了。',
            '把应用用 Swift 重写。',
          ],
          explain: 'Expo Go 里预先内置了一组固定的库。如果需要自己的原生代码，就要做 development build——也就是带上所需模块的“你自己的 Expo Go 版本”。',
        },
        {
          title: '应用里的密钥',
          prompt: '哪一行会把密钥泄露给所有下载应用的人？',
          explain: '带 EXPO_PUBLIC_ 前缀的变量会进入应用代码——可以从安装包里提取出来。公开地址和 Supabase 的 anon 密钥（开启 RLS 时）——可以，AI 的密钥——不行：对 AI 的请求要走你自己的服务器。',
        },
        {
          title: '审核被拒',
          situation: 'Apple 拒绝了应用：“应用请求访问相机，但没有说明原因”。',
          options: [
            '在配置里给相机请求加上清楚的说明（usage description），重新打包再提交',
            '把应用从 App Store Connect 永久删除',
            '把同一个包再提交一次——说不定能过',
          ],
          explain: '审核不是判决：拒绝里通常会写明原因。改掉它，必要时在 Resolution Center 回复，然后提交新的包。',
        },
        {
          title: '错误提示',
          prompt: '习惯没加载出来：没有网络。哪个提示词给出了更人性化的界面？',
          sides: [
            {
              prompt: '如果出错——就显示错误。',
              result: {
                label: '技术文本',
              },
            },
            {
              prompt: '如果没有网络——显示“没有网络。习惯已保存在手机上”和“重试”按钮。技术细节——只写进日志。',
              result: {
                label: '清楚又知道该做什么',
                ui: {
                  blocks: [
                    {
                      text: '没有网络',
                    },
                    {
                      text: '习惯已保存在手机上',
                    },
                    {
                      text: '重试',
                    },
                  ],
                },
              },
            },
          ],
          reasons: [
            '它告诉用户发生了什么、该做什么，而把细节藏进日志',
            '“网络”这个词比“错误”短',
            'AI 只在提示词里写了“重试”才会加按钮',
            '应用商店规则禁止技术性提示',
          ],
          explain: '手机上的网络总是断。好的错误提示会说清楚发生了什么、数据怎么样了、接下来该做什么。',
        },
      ],
    },
  },
}
