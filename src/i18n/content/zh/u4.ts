import type { UnitTr } from '../types'

export const u4: UnitTr = {
  title: '数据与后端',
  subtitle: '数据库、登录与密钥',
  description: '数据库、数据表、登录、API 密钥和表单',
  lessons: {
    'u4-1': {
      title: '什么是数据库',
      ex: [
        {
          title: '笔记本 → 手机',
          prompt: '任务保存在 localStorage 里。用户在笔记本电脑上添加了任务，然后在手机上打开应用。他会看到什么？',
          tool: '手机上的应用',
          input: '我在手机上打开待办清单。',
          outcomes: [
            { label: '空列表', ui: { blocks: { 0: { text: '我的任务' }, 1: { text: '还没有任务' }, 2: { text: '＋ 添加' } } } },
            { label: '笔记本上的所有任务', ui: { blocks: { 0: { text: '我的任务' }, 1: { items: ['☐ 买牛奶', '☐ 交报告', '☐ 给妈妈打电话'] } } } },
            { label: '同步错误', ui: { blocks: { 0: { text: '我的任务' } } } },
          ],
          explain: 'localStorage 只存在于一台设备上的一个浏览器里，所以手机看不到笔记本上的任务。所有设备共享的存储是服务器上的数据库。',
        },
        {
          title: '数据的旅程',
          prompt: '用户保存一条笔记时会发生什么？按顺序排列。',
          steps: ['用户点击“保存”', '前端发送请求', '后端检查权限', '数据库写入笔记'],
          extra: ['笔记保存到 cookies 里'],
          explain: '前端是用户看到的部分；后端是负责检查权限、保存数据的“后厨”。数据不会“碰运气”写进数据库：请求要先通过权限检查——在 Supabase 中，这通常由数据库里的 RLS 策略直接完成。',
        },
        {
          title: '订单存在哪里？',
          situation: '你在做一个网店。顾客的订单应该存在哪里？',
          options: ['服务器上的数据库里', '顾客浏览器的 localStorage 里', '顾客浏览器的 cookies 里'],
          explain: 'localStorage 和 cookies 存在顾客的浏览器里：商店看不到它们，顾客还能删除或篡改。订单要存在服务器上的数据库里。',
        },
        {
          title: '保存笔记',
          prompt: '笔记需要在任何设备上都能访问。哪个提示词能做到？',
          sides: [
            { prompt: '让笔记能保存下来。', result: { label: '保存在浏览器里' } },
            {
              prompt: '把笔记保存到 Supabase 的 notes 表里，这样登录后在任何设备上都能访问。',
              result: { label: '保存在数据库里' },
            },
          ],
          reasons: [
            '它说明了存在哪里、为什么：存在服务器上，所有设备共享',
            'Supabase 比 localStorage 快',
            '新浏览器禁止使用 localStorage',
            '它里面有“表”这个字',
          ],
          explain: '面对“能保存就行”，AI 会老老实实选最简单的方案——localStorage。如果数据必须在所有设备上都有，就要说出来：那就需要服务器上的数据库。',
        },
        {
          title: 'Supabase 是什么',
          prompt: 'AI 在介绍 Supabase。有一句是错的——找出来。',
          file: 'AI 的回复',
          code: [
            'Supabase 是现成的后端：Postgres 数据库、用户登录和文件存储。',
            'Lovable 的默认后端 Lovable Cloud 就是基于它构建的。',
            '本质上 Supabase 是前端托管服务，可以用它替代 Vercel。',
            'Bolt 和其他 AI 建站工具都能连接你的 Supabase 项目。',
          ],
          explain: 'Supabase（和 Firebase 一样）让你不必从零编写服务器：数据库、登录、文件。而网站本身通常部署在 Vercel 或 Netlify 这样的托管平台上——这是不同的角色。',
        },
      ],
    },
    'u4-2': {
      title: '像 Supabase 那样的数据表',
      ex: [
        {
          title: '行与列',
          prompt: 'tasks 表有 id、title、done 三列。用户添加了两个任务。表是什么样子？',
          input: '我打开 tasks 表。',
          outcomes: [
            { label: '一个任务一行', lines: { 1: '1  | 买牛奶         | false', 2: '2  | 给妈妈打电话   | true' } },
            { label: '所有任务在同一行', lines: { 1: '1  | 买牛奶, 给妈妈打电话          | false' } },
            { label: '每个任务是新的一列', lines: { 0: '买牛奶        | 给妈妈打电话' } },
          ],
          explain: '数据表就像 Excel 工作表：列是字段（存什么），行是记录（具体的任务）。每一行都有自己的 id——主键。',
        },
        {
          title: '笔记表',
          prompt: '表名 → 列 → 与用户的关联 → 访问规则。强化这个提示词。',
          base: '创建一个笔记表。',
          chips: [
            { tag: '位置', text: '在 Supabase 中，表名 notes。' },
            { tag: '列', text: '列：id（主键）、user_id、text、created_at（timestamptz）。' },
            { tag: '关联', text: 'user_id 引用 auth.users 中的用户。' },
            { tag: '访问', text: '开启 RLS：每个人只能查看和修改自己的笔记。' },
            { tag: '访问', text: '让所有人都能看到所有内容，这样简单。', trap: '笔记是私人的。没有访问规则，任何拿到公开密钥的人都能读到别人的记录。' },
            { tag: '结构', text: '不需要主键。', trap: '主键唯一标识一行：靠它来查找、更新和删除某条具体记录。' },
          ],
          explain: '表名 → 带类型的列 → 与用户的关联 → 访问规则。根据这样的提示词，AI 会同时生成 SQL 和安全策略。',
        },
        {
          title: '别人的任务',
          prompt: '查询应该只显示当前用户的任务，却显示了所有人的任务。bug 在哪？',
          code: { 0: '-- 当前用户的任务' },
          explain: '条件 user_id = user_id 是拿列和它自己比较，永远为真。应该和当前用户的 id 比较——在 Supabase 中是 auth.uid()，通常写在 RLS 策略里。',
        },
        {
          title: '列的类型',
          situation: '你要给表加一个 done 字段——“已完成 / 未完成”。选什么类型？',
          options: ['boolean（true/false）', 'text（字符串）', 'timestamptz（日期和时间）'],
          explain: '每一列都有类型：text 是字符串，int8 是数字，boolean 是是/否，timestamptz 是带时区的日期时间（Supabase 默认就这样创建 created_at）。',
        },
        {
          title: 'AI 写的迁移',
          prompt: 'AI 准备了一个 SQL 迁移。接受安全的，拒绝危险的。',
          request: '给 tasks 表加一个 priority 列（优先级 0 到 3）。',
          hunks: {
            1: { harmful: 'AI 重建了这张表——所有用户的任务都会被删除。' },
            2: { harmful: '关闭 RLS 会把所有用户的任务暴露给任何拿到公开密钥的人。' },
          },
          explain: '加一列只需要一条 alter table 命令——不会丢数据。drop table 会抹掉一切，而关闭 RLS 会撤掉保护。AI 写的 SQL 要格外仔细地读：它操作的是线上数据。',
        },
      ],
    },
    'u4-3': {
      title: '登录与注册',
      ex: [
        {
          title: '怎么做登录',
          prompt: '需要用邮箱和密码登录。哪个提示词更安全？',
          sides: [
            { prompt: '做注册功能：把邮箱和密码存进 users 表。', result: { label: '自己写的存密码的表' } },
            {
              prompt: '接入 Supabase Auth：支持邮箱和 Google 登录、“忘记密码？”页面，登录后跳转到个人中心。',
              result: { label: '现成的认证', lines: { 3: '// 密码由 Supabase Auth 以哈希形式保存' } },
            },
          ],
          reasons: [
            '现成的认证以哈希形式保存密码，还支持找回密码和 Google 登录',
            '自己的 users 表运行得更慢',
            'Supabase Auth 不需要联网',
            '它的功能更多，而越多越好',
          ],
          explain: '自己写的登录是安全漏洞的常见来源。现成的服务已经以哈希形式保存密码、支持找回访问权限和 Google 登录。',
        },
        {
          title: '危险的一行',
          prompt: 'AI 用自己的 users 表写了注册功能。哪一行很危险？',
          explain: '密码以明文保存：一旦数据库泄露，所有人都能看到。密码只能以哈希形式保存（Argon2id、bcrypt），最好交给现成的认证服务处理。',
        },
        {
          title: '没有保护的表',
          prompt: 'AI 用 SQL 语句建好了表，正高兴着呢。你怎么回复？',
          chat: [
            { text: '创建一个存放私人笔记的 notes 表。' },
            { text: '完成！我执行了这段 SQL：' },
          ],
          options: [
            '这张表是用 SQL 语句建的——在上面开启 RLS，再加一条策略：每个人只能看到自己的笔记（(select auth.uid()) = user_id）。',
            '太好了，我把它接入应用！',
            '把表设成公开的，保证能用。',
            '再多建五张表备用。',
          ],
          explain: 'public 模式下没有 RLS 的表，任何拿到公开密钥的人都能读取和修改。通过 Table Editor 建表会自动开启 RLS，而用 SQL 语句建的表要手动开启。',
        },
        {
          title: '认证还是授权？',
          situation: '文档里出现了两个词：认证（authentication）和授权（authorization）。它们有什么区别？',
          options: [
            '认证是确认你是谁（登录），授权是决定你能做什么（权限）',
            '它们是一回事',
            '授权是注册，认证是退出登录',
          ],
          explain: '系统先识别用户（登录），然后决定他能访问什么（例如只能访问自己的笔记）。',
        },
        {
          title: '登录流程',
          prompt: '用户登录一个使用 Supabase Auth 的应用时会发生什么？按步骤排列。',
          steps: ['用户输入邮箱和密码', 'Supabase Auth 校验信息', '应用获得会话', '跳转到个人中心'],
          extra: ['密码被保存到 localStorage'],
          explain: '密码由认证服务校验，应用拿到会话（令牌）并以此识别用户。密码本身不会保存在浏览器里。',
        },
      ],
    },
    'u4-4': {
      title: '密钥与机密',
      ex: [
        {
          title: '前端里的密钥',
          prompt: 'AI 把支付服务的私密密钥写进了前端代码。任何访客在 DevTools 里会看到什么？',
          input: '我在浏览器里打开网站的源代码。',
          outcomes: [
            { label: '完整的密钥，明文显示' },
            { label: '用星号代替密钥' },
            { label: '什么也看不到：代码被压缩了，找不到密钥', lines: { 1: '（文件已加密）' } },
          ],
          explain: '进入前端的一切，任何访客都能看到——压缩代码并不能隐藏密钥。机密只存在于服务器上的环境变量里，.env 文件要加进 .gitignore。',
        },
        {
          title: 'VITE_ 前缀',
          prompt: '一个 Vite 项目。.env 里哪一行会把机密暴露给网站的所有访客？',
          code: { 0: '# 公开配置', 3: '# 机密' },
          explain: 'Vite 会把带 VITE_ 前缀的变量嵌入网站代码，任何人都能看到。Supabase 的公开密钥本来就是为此设计的，而 Stripe 的私密密钥必须只放在服务器上，并且不能带 VITE_ 前缀。',
        },
        {
          title: '发布之前',
          prompt: 'AI 正在准备把项目发布到 GitHub。其中一处修改很危险。',
          request: '准备好把项目发布到 GitHub。',
          hunks: [
            { lines: { 0: '+# 氛围笔记', 1: '+运行：npm install && npm run dev' } },
            { lines: { 3: '+# .env 不再需要被忽略' }, harmful: 'AI 把 .env 从 .gitignore 里删掉了——下次提交时密钥就会被推到 GitHub。' },
            {},
          ],
          explain: '.gitignore 列出 git 不跟踪的文件：存有密钥的 .env 必须在里面（Vite 默认模板只忽略 *.local，所以 .env 这一行要自己检查）。而只包含变量名、不含值的 .env.example 正适合提交。',
        },
        {
          title: '密钥泄露了',
          prompt: 'AI 在安慰你。它说得对吗？',
          chat: [
            { text: '我不小心把私密密钥贴到了论坛的公开帖子里。帖子已经删了。' },
            { text: '删掉就好！现在一切都没问题了 👍' },
          ],
          options: [
            '光删除不够：密钥可能已经被复制。告诉我怎么在服务后台吊销它、生成新密钥并在服务器上更新。',
            '太好了，躲过一劫！',
            '那我把论坛设成私密的。',
            '我把代码里的变量改个名就行了。',
          ],
          explain: '机器人几分钟内就能找到泄露的密钥。泄露的密钥应视为已失陷：吊销（revoke）它，并换上新的。',
        },
        {
          title: 'Supabase 的密钥',
          situation: 'Supabase 有公开密钥（publishable，旧称 anon）和私密密钥（secret，旧称 service_role）。前端里可以用哪个？',
          options: ['只能用公开密钥——而且必须开启 RLS', '私密密钥——它权限更大', '两个都行，没区别'],
          explain: '公开密钥（sb_publishable_…）所有人可见，所以访问由 RLS 策略来限制。私密密钥（sb_secret_…）会绕过 RLS，只能在服务器上使用；Supabase 正在逐步淘汰旧的 anon 和 service_role 密钥。',
        },
        {
          title: '安全的提示词',
          prompt: '你需要帮忙接入支付。AI 本身并不需要密钥。',
          base: '帮我接入 Stripe。',
          chips: [
            { tag: '密钥在哪', text: '我会在服务器上从 process.env.STRIPE_SECRET_KEY 读取密钥。' },
            { tag: '需求', text: '需要通过 Stripe Checkout 做一次性支付。' },
            { tag: '格式', text: '给出服务器代码，以及前端需要加什么。' },
            { tag: '上下文', text: '这是我的密钥 sk_live_51H…，把它写进代码。', trap: '代码里的机密，任何能访问仓库或网站的人都能看到。' },
            { tag: '上下文', text: '这是我的密钥 sk_live_51H…，只要放进 .env 就行。', trap: '贴进聊天的机密已经离开了你的电脑——即使之后它被放进了 .env。' },
          ],
          explain: 'AI 不需要密钥本身——环境变量的名字就够了。这样代码是正确的，机密也不会泄露到任何地方。',
        },
      ],
    },
    'u4-5': {
      title: '能保存数据的表单',
      ex: [
        {
          title: '报名表单',
          prompt: '字段 → 校验 → 存到哪里 → 用户看到什么。强化这个提示词。',
          base: '做一个报名表单。',
          chips: [
            { tag: '字段', text: '字段：姓名和电话。' },
            { tag: '校验', text: '提交前检查字段是否已填写。' },
            { tag: '存储', text: '把报名信息存到 Supabase 的 leads 表里。' },
            { tag: '反馈', text: '提交后显示“谢谢！”并清空字段。' },
            { tag: '速度', text: '不用校验字段——这样更快。', trap: '没有校验，数据库里会涌入空白和垃圾报名。' },
            { tag: '存储', text: '用 alert 显示报名信息，而不是保存。', trap: 'alert 什么也不保存：用户一关窗口，报名信息就没了。' },
          ],
          explain: '字段 → 校验 → 存到哪里 → 用户看到什么。没有最后一步，用户就不知道报名是否提交成功。',
        },
        {
          title: '显示“谢谢！”，表里却是空的',
          prompt: '表单显示“谢谢！”，但表里是空的。bug 在哪？',
          code: { 4: "  setStatus('谢谢！');" },
          explain: '缺少 await：supabase-js 的请求只有在 await（或 .then）时才会发出，所以这一行没保存，error 也是空的。应该写：const { error } = await supabase…',
        },
        {
          title: '双击',
          prompt: '“提交”按钮在请求期间没有被禁用。用户快速点了两次。表里会出现什么？',
          input: '双击之后我查看 leads 表。',
          outcomes: [
            { label: '两条一模一样的报名', lines: { 1: '41 | 小林 | +86 138 0000 0102', 2: '42 | 小林 | +86 138 0000 0102' } },
            { label: '一条报名', lines: { 1: '41 | 小林 | +86 138 0000 0102' } },
            { label: '报错，一条报名也没有' },
          ],
          explain: '每次点击都会发出一个单独的请求——于是出现重复。标准做法是加载状态（loading）：在服务器响应之前，按钮处于禁用状态并显示“提交中…”。',
        },
        {
          title: '邮箱校验',
          prompt: 'AI 加上了邮箱校验。修改里的每一处都合理吗？',
          request: '给反馈表单加上邮箱校验。',
          hunks: [
            { lines: { 1: "+  return setError('请检查邮箱')" } },
            { harmful: 'AI 以“现在表单会校验”为由删掉了服务器端校验。浏览器里的校验很容易被绕过——服务器端校验不能删。' },
            {},
          ],
          explain: '前端校验是为了方便用户。防护要放在服务器端：服务器代码、列约束、RLS 策略。它们必须协同工作。',
        },
        {
          title: '网断了',
          prompt: 'AI 按自己的方式加了错误处理。怎么改进？',
          chat: [
            { text: '如果网断了，报名会悄无声息地丢失。' },
            { text: '我加上了错误输出：' },
          ],
          options: [
            '显示易懂的文字：“提交失败。请检查网络后重试”——并且不要清空已经填写的内容。',
            '好，就这样吧。',
            '那还不如什么都不显示。',
            '用英文显示错误，看起来更专业。',
          ],
          explain: '技术性的堆栈跟踪对用户毫无意义。友好的提示加上保留的数据——用户只需再点一次“提交”。',
        },
      ],
    },
    'u4-6': {
      title: '后端宝箱',
      ex: [
        {
          title: '开了 RLS，却没有数据',
          prompt: 'reviews 表开启了 RLS，但没有任何策略。浏览器用公开密钥发出的请求会返回什么？',
          tool: '浏览器控制台',
          input: '我在应用里请求评价数据。',
          outcomes: [
            { label: '空列表，没有报错' },
            { label: '表里的所有行' },
            { label: '“表已删除”错误' },
          ],
          explain: '开启了 RLS 却没有策略，就会把一切都挡住——这是“数据不见了”的常见原因。此时在 SQL 编辑器里仍能看到这些行（它以所有者身份运行），而应用需要一条策略，比如允许所有人读取。',
        },
        {
          title: '安全的接入方案',
          prompt: '排出把数据库接入应用的步骤。其中一张卡片很危险。',
          steps: ['创建表', '开启 RLS', '添加访问策略', '在前端使用公开密钥'],
          extra: ['把私密密钥写进代码'],
          explain: '先防护，再接入。私密密钥（secret 或旧的 service_role）永远不能进入前端。',
        },
        {
          title: '读懂 RLS 策略',
          prompt: 'notes 里有三条笔记：两条是 Aida 的，一条是 Timur 的。Aida 登录后请求所有笔记。她会得到几行？',
          tool: 'RLS 策略',
          input: 'Aida 登录后执行 select * from notes。',
          code: { 0: 'create policy "自己的笔记" on notes' },
          outcomes: [
            { label: '2 行——只有自己的', lines: { 1: '1  | aida    | 本周计划', 2: '3  | aida    | 落地页点子' } },
            { label: '3 行——所有笔记', lines: { 1: '1  | aida    | 本周计划', 2: '2  | timur   | 购物清单', 3: '3  | aida    | 落地页点子' } },
            { label: '0 行', lines: ['（空）'] },
          ],
          explain: 'auth.uid() 返回发出请求者的 id，策略就像一个看不见的 WHERE：每个人只能看到自己的行。如果用户没有登录，auth.uid() 返回 null，就不会有任何行。',
        },
        {
          title: '绕过 RLS',
          prompt: '哪一行会绕过 RLS、开放对所有数据的访问？',
          explain: '带 VITE_ 前缀的密钥会进入网站代码，而私密密钥（sb_secret_…，和旧的 service_role 一样）会绕过 RLS。前端只能用公开密钥：publishable 或旧的 anon。',
        },
        {
          title: '图片存在哪里？',
          situation: '用户会上传头像。正确的存储方式是什么？',
          options: [
            '文件放在存储服务里（例如 Supabase Storage），表里只存文件路径',
            '直接存进表里，把图片转换成很长的 base64 字符串',
            '存在用户浏览器的 localStorage 里',
          ],
          explain: '数据表是为字符串和数字设计的，文件则有专门的存储服务。Supabase Storage 中文件的访问权限同样通过策略配置，就像表的 RLS 一样。',
        },
        {
          title: '下一次提交就删了',
          prompt: 'AI 认为问题已经解决。回复它。',
          chat: [
            { text: '我把带密钥的 .env 提交到了公开仓库，又在下一次提交里删除了这个文件。' },
            { text: '太好了，仓库里已经没有这个文件了——问题解决！' },
          ],
          options: [
            '不对：密钥还留在 git 历史里。帮我在服务后台吊销它并生成新密钥，历史记录之后再清理。',
            '我把仓库设成私有的，这样就行了。',
            '谢谢，松了一口气！',
            '顺便把 README 也删了。',
          ],
          explain: '删除的文件仍留在提交历史里，而机器人一直在扫描 GitHub。泄露的密钥应视为已失陷：要更换它——清理历史并不能代替更换密钥。',
        },
      ],
    },
  },
}
