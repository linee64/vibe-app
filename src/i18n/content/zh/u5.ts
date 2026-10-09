import type { UnitTr } from '../types'

export const u5: UnitTr = {
  title: '上线',
  subtitle: '把项目发布到互联网上',
  description: 'GitHub、部署、域名、数据分析和第一批用户',
  lessons: {
    'u5-1': {
      title: 'Git 与 GitHub',
      ex: [
        {
          title: 'Git 与 GitHub',
          situation: '朋友坚信 git 和 GitHub 是一回事。你怎么解释它们的区别？',
          options: [
            'Git 在你的电脑上保存项目的版本历史，GitHub 是在云端存放仓库副本的网站',
            '它们是一回事，只是名字不同',
            'Git 是写代码的 AI 模型，GitHub 是它的网站',
          ],
          explain: 'Git 保存项目的“快照”（提交），让你可以回滚——对氛围编程者来说这就是保险。GitHub（以及 GitLab、Bitbucket）在线保存仓库副本，从那里部署项目也很方便。',
        },
        {
          title: '推送到 GitHub',
          prompt: '保存修改并推送到 GitHub。按顺序排列命令。',
          steps: ['git add .', 'git commit -m "添加表单"', 'git push'],
          explain: 'add 选择修改，commit 保存带说明的快照，push 把提交推送到 GitHub。第一次 push 通常是 git push -u origin main。git 里没有 upload 和 deploy 命令。',
        },
        {
          title: '提交信息',
          prompt: '你让 AI 写提交信息。哪个请求得到了清楚的说明？',
          sides: [
            { prompt: '想一个提交信息。', result: { label: '空洞的“update”' } },
            {
              prompt: '看看修改（git diff），写一条提交信息：一行，说明改了什么、为什么改。',
              result: { label: '具体的说明', lines: { 1: 'a1f3c2e 添加报名表单并保存到 Supabase' } },
            },
          ],
          reasons: [
            'AI 拿到了修改内容和格式要求——所以说明很具体',
            '禁止用英文写提交信息',
            '长的提交信息总比短的好',
            'git log 只接受 AI 写的信息',
          ],
          explain: '一个月后，看提交说明就应该知道改了什么。AI 编辑器在看到 diff 时，能自己给出这样的说明。',
        },
        {
          title: '能用了——接下来呢？',
          prompt: '新功能可以用了。AI 急着往下做。你怎么做？',
          chat: [
            { text: '深色模式能用了，我全都检查过了！' },
            { text: '太棒了！我们继续：加上购物车、支付和个人资料？' },
          ],
          options: [
            '先提交：“添加深色模式”。然后再做购物车，一次只做一个功能。',
            '购物车、支付和个人资料一起做吧。',
            '等月底全部做完再提交。',
            '先把旧提交删了，免得碍事。',
          ],
          explain: '频繁提交就是有很多存档点。如果 AI 弄坏了什么，你只需回退五分钟，而不是一周。',
        },
        {
          title: '没提交就 push',
          prompt: '你改了文件，但忘了 git add 和 git commit。git push 会返回什么？',
          tool: '终端',
          input: '我运行 git push。',
          outcomes: [
            { label: '“Everything up-to-date”——没有可推送的内容' },
            { label: '修改推送到了 GitHub' },
            { label: 'Git 自动做了提交', lines: { 1: '[auto-commit] 已保存修改' } },
          ],
          explain: 'push 推送的是提交，而不是文件。修改没有提交之前，就没有可推送的内容——托管平台上的网站也不会更新。',
        },
      ],
    },
    'u5-2': {
      title: '部署到 Vercel',
      ex: [
        {
          title: '什么是部署？',
          situation: '你给朋友发了链接 http://localhost:5173——他那边什么也打不开。',
          options: [
            'localhost 就是你自己的电脑；要让所有人都能打开网站，需要部署到托管平台',
            '朋友需要安装和你一样的浏览器',
            '需要用 --share 参数重新运行 npm run dev',
          ],
          explain: 'npm run dev 在 localhost 上运行项目——只有你能看到。部署就是把项目放到服务器上：之后项目会有一个公开地址，比如 my-app.vercel.app。',
        },
        {
          title: '第一次部署',
          prompt: '排出第一次部署到 Vercel 的步骤。',
          steps: ['把项目推送到 GitHub', '把仓库导入 Vercel', '添加环境变量', '点击 Deploy'],
          extra: ['把密钥发到聊天里'],
          explain: 'Vercel 连接 GitHub，自动识别框架（例如 Vite）并构建项目。.env 里的密钥要填写在项目设置中：.env 文件本身不会进入 git。',
        },
        {
          title: '提交了但没 push',
          prompt: '项目通过 GitHub 连接到了 Vercel。你在本地做了提交，但没有 push。网站会怎样？',
          input: '本地提交后我打开自己的网站。',
          outcomes: [
            { label: '什么都没变', ui: { blocks: { 0: { text: '旧版本' }, 1: { text: '上次部署：昨天' } } } },
            { label: '网站已经更新了', ui: { blocks: { 0: { text: '新版本' }, 1: { text: '部署：刚刚' } } } },
            { label: '出现了预览链接' },
          ],
          explain: 'Vercel 只能看到推送到 GitHub 的内容：没有 push 的本地提交不会发布任何东西。push 到 main 会触发新的生产部署，push 到其他分支则会生成带独立链接的预览部署。',
        },
        {
          title: '部署一直不结束',
          prompt: '托管平台上的部署卡住了，一直不结束。package.json 里哪一行是罪魁祸首？',
          explain: '托管平台会运行 npm run build，而这里它是一个永远运行的开发服务器。需要的是 "vite build" 命令：它把网站构建到 dist 文件夹后就会结束。',
        },
        {
          title: 'Build failed',
          prompt: '部署失败了，AI 却建议“再试一次就好”。你怎么做？',
          chat: [
            { text: 'Vercel 上的部署失败了：“Build failed”。' },
            { text: '试试点 Redeploy——有时候管用。' },
          ],
          options: [
            "这是构建日志：“src/App.tsx(12,7): error TS2322: Type 'string' is not assignable to type 'number'”。本地运行 npm run build 也是同样的报错。该改什么？",
            '一直点 Redeploy，直到碰上运气。',
            '删掉 Vercel 上的项目，重新创建。',
            '关掉类型检查，免得碍事。',
          ],
          explain: '构建日志就是服务器上的控制台。在自己电脑上运行 npm run build 很有用：报错通常会复现，有了报错文本，AI 就能修复根因。',
        },
      ],
    },
    'u5-3': {
      title: '自己的域名',
      ex: [
        {
          title: '什么是域名？',
          situation: '咖啡馆的网站地址是 zerno-coffee-x7k2.vercel.app。你想要一个更短、更正式的地址。',
          options: [
            '购买一个域名（比如 zerno-coffee.com），并绑定到托管平台上的项目',
            '把电脑上的项目文件夹改个名',
            '让 AI 在网站代码里把地址缩短',
          ],
          explain: '域名是网站易记的地址。可以在注册商（Namecheap、Cloudflare、GoDaddy 等）或直接在 Vercel 购买，通常按年付费，然后绑定到托管平台。',
        },
        {
          title: '要配哪些 DNS 记录？',
          prompt: 'AI 推荐了错误的记录。纠正它。',
          chat: [
            { text: '我买了 zerno-coffee.com，并在 Vercel 里添加了这个域名。注册商那边要怎么配置？' },
            { text: '给根域名和 www 各添加一条 MX 记录，值填 vercel.com。' },
          ],
          options: [
            'MX 是邮件用的记录。根域名 zerno-coffee.com 需要 A 记录，www 需要 CNAME，具体的值我去 Vercel 的域名设置里看。对吗？',
            '好的，我添加 MX。',
            '把注册商那边的记录全删了，干净点。',
            '再买一个域名，说不定这个坏了。',
          ],
          explain: 'DNS 是互联网的“电话簿”。对于根域名，Vercel 要求 A 记录，子域名（www）要求 CNAME，具体的值会显示在域名设置里。AI 可能会搞混记录类型——以托管平台的提示为准。',
        },
        {
          title: '域名打不开',
          situation: '你 10 分钟前添加了 DNS 记录，可通过域名还是打不开网站。',
          options: [
            '检查记录是否和 Vercel 的提示一致，然后等待：DNS 更新通常需要几分钟到几小时，有时长达 48 小时',
            '再买一个域名',
            '删掉所有记录，从头开始',
          ],
          explain: 'DNS 服务器会在一段时间内记住旧记录。如果全部配置正确，剩下的就是等待：最慢的是更换 NS 服务器（最长 48 小时）。',
        },
        {
          title: '一步步绑定自己的域名',
          prompt: '把自己的域名绑定到 Vercel 上的网站。排出步骤。',
          steps: ['在注册商处购买域名', '在 Vercel 项目设置中添加域名', '在注册商处配置 DNS 记录', '等待验证和 HTTPS 证书'],
          extra: ['为新域名重写网站'],
          explain: '托管平台会提示需要的记录，你在注册商处添加，验证通过后域名就能用了——还附带免费的 HTTPS。不需要重写网站。',
        },
        {
          title: '浏览器里的小锁',
          prompt: 'AI 在讲解 HTTPS。找出不实的说法。',
          file: 'AI 的回复',
          code: [
            '绑定域名后，Vercel 会自动签发 HTTPS 证书。',
            '没有 HTTPS，浏览器会显示“不安全”警告。',
            '证书每年至少 1000 美元，需要单独购买。',
            'HTTPS 会加密访客与网站之间的数据。',
          ],
          explain: '域名一绑定，Vercel 和 Netlify 就会免费自动签发证书。普通网站不需要花几千美元。',
        },
      ],
    },
    'u5-4': {
      title: '数据分析',
      ex: [
        {
          title: '统计什么',
          prompt: '你想知道有多少人点击了主按钮。哪个提示词能做到？',
          sides: [
            { prompt: '接入数据分析。', result: { label: '只有页面浏览量', ui: { blocks: { 0: { text: '数据分析' }, 1: { items: [['访客', '1,000'], ['浏览量', '2,340']] }, 2: { text: '未追踪按钮' } } } } },
            {
              prompt: '接入数据分析，并在点击“报名”时发送 cta_click 事件。不要传个人数据。',
              result: { label: '能看到核心行动', ui: { blocks: { 0: { text: '数据分析' }, 1: { items: [['访客', '1,000'], ['cta_click', '30'], ['转化率', '3%']] } } } },
            },
          ],
          reasons: [
            '它说明了要统计哪个行动——能看到主按钮的转化率',
            '没有事件，数据分析连访客都不显示',
            'AI 会自动追踪“报名”这个词',
            '它更长',
          ],
          explain: '事件（events）记录的是行动：点击、注册、付款。没有事件，只能看到来了多少人，看不到他们做了什么。个人数据不能发送到数据分析中。',
        },
        {
          title: '算一算转化率',
          prompt: '1000 名访客中有 30 人报名了课程。数据分析的“转化率”一栏会显示什么？',
          tool: '数据分析面板',
          input: '我打开本周报告：1000 名访客，30 人报名。',
          outcomes: [
            { ui: { blocks: { 0: { text: '转化率：3%' }, 1: { text: '1,000 人中 30 人' } } } },
            { ui: { blocks: { 0: { text: '转化率：30%' }, 1: { text: '1,000 人中 30 人' } } } },
            { label: '0.3%', ui: { blocks: { 0: { text: '转化率：0.3%' }, 1: { text: '1,000 人中 30 人' } } } },
          ],
          explain: '转化率 = 完成行动的人数 / 全部访客。30 / 1000 = 3%。要在修改前后进行对比。',
        },
        {
          title: '数据分析里的多余内容',
          prompt: '哪一行侵犯了用户隐私？',
          explain: '密码和其他敏感数据绝不能发送到数据分析中。统计注册量，有事件名称和套餐就够了。',
        },
        {
          title: '变好了吗？',
          prompt: '你改了主按钮的文字。AI 确信效果更好。你怎么做？',
          chat: [
            { text: '我把按钮文字从“提交”改成了“报名体验课”。变好了吗？' },
            { text: '新文字听起来有说服力多了——肯定变好了！' },
          ],
          options: [
            '用数据验证吧：对比修改前一周和修改后一周的报名转化率。更可靠的是做 A/B 测试。',
            '太好了，我信你！',
            '我去问问朋友喜不喜欢这个颜色。',
            '保险起见，再改一次。',
          ],
          explain: '决策要用数据验证：在访客足够多的情况下，对比修改前后的转化率。更可靠的是 A/B 测试，即同时向不同的人展示旧版和新版。AI 的看法不是数据。',
        },
        {
          title: '为什么需要数据分析？',
          situation: '落地页上线了。你在犹豫要不要接入数据分析——“反正看得出来一切正常”。',
          options: [
            '接入：它能显示来了多少人、从哪里来、在网站上做了什么',
            '不需要：数据分析只是为了让网站加载更快',
            '不需要：AI 本来就知道人们喜欢什么',
          ],
          explain: '没有数据分析，你就是在猜。Plausible、Google Analytics、PostHog 或 Vercel Analytics 这类服务能展示真实情况。',
        },
      ],
    },
    'u5-5': {
      title: '第一批用户',
      ex: [
        {
          title: '什么时候给人看？',
          situation: '你的应用解决了核心问题，但还不完美：有几个按钮歪歪扭扭，也没有深色模式。',
          options: ['现在就给第一批用户看，收集反馈', '再等半年，直到一切完美', '谁也不给看'],
          explain: 'MVP（Minimum Viable Product，最小可行产品）是已经能带来价值的最小版本。借助氛围编程，一个周末就能做出来，而早期反馈能省下几个月花在没人需要的功能上的工夫。',
        },
        {
          title: '去哪里找第一批用户',
          prompt: 'AI 给出了寻找第一批用户的建议。有一条是危险信号。',
          file: 'AI 的回复',
          code: [
            '从目标受众中的朋友和熟人开始。',
            '在相关主题的群聊和社区里介绍你的项目。',
            '买一个 10 000 个邮箱的名单群发邮件——这是最快的办法。',
            '等有东西可以展示了，就在 Product Hunt 上发布项目。',
          ],
          explain: '从真正有你所解决问题的人开始。向购买来的名单群发邮件就是垃圾邮件：既损害声誉，又违反邮件营销的规则和法律。',
        },
        {
          title: '问题对决',
          prompt: '你向测试者询问第一印象。哪个问题得到了有用的回答？',
          sides: [
            { prompt: '你挺喜欢的吧？', result: { label: '客气的“是”', text: '是啊，很棒！👍' } },
            { prompt: '你第一次使用这个应用时，有哪些地方让你困惑或觉得不方便？', result: { label: '具体问题', text: '我没能马上找到在哪添加任务，也不知道它有没有保存——没有任何提示。' } },
          ],
          reasons: [
            '不暗示答案的开放式问题，能得到具体的问题',
            '它更长，所以显得更认真',
            '测试者只会如实回答带有“不方便”一词的问题',
            '第一个问题太客气了',
          ],
          explain: '开放式问题能得到具体内容。“你挺喜欢的吧？”会把人推向客气的“是”，对该修什么毫无帮助。',
        },
        {
          title: '增长循环',
          prompt: '怎样处理用户反馈？组建这个循环。',
          steps: ['收集反馈', '选出最主要的问题', '用 AI 修复它', '发布更新并再次验证'],
          extra: ['一次加上十个新功能'],
          explain: '和写提示词是同一个循环：小步前进，在真实用户身上检验结果。',
        },
        {
          title: '用 AI 分析反馈',
          prompt: '你有 12 条测试者的反馈。请 AI 帮你得出结论，而不是说好话。',
          base: '这是测试者的反馈。该怎么办？',
          chips: [
            { tag: '数据', text: '下面是 12 条反馈，每行一条。' },
            { tag: '任务', text: '按问题分组，并统计每个问题出现了几次。' },
            { tag: '格式', text: '用表格回答：问题、出现次数、引用示例。' },
            { tag: '重点', text: '提出本周最重要的一项修改。' },
            { tag: '语气', text: '就说一切都很好，我需要动力。', trap: '这样 AI 会掩盖问题。你需要的是结论，而不是恭维。' },
            { tag: '数据', text: '再编 20 条反馈，让数据多一点。', trap: '编造的反馈会扭曲真实情况：你的决策将针对根本不存在的人。' },
          ],
          explain: '数据 → 任务 → 格式 → 重点。AI 擅长归类和统计重复出现的问题，而一项核心修改能让你不分散精力。',
        },
      ],
    },
    'u5-6': {
      title: '终章：项目上线',
      ex: [
        {
          title: '上线之路',
          prompt: '排出项目上线的各个阶段。',
          steps: ['把代码推送到 GitHub', '部署', '绑定域名', '接入数据分析', '邀请第一批用户'],
          extra: ['向购买的名单群发垃圾邮件'],
          explain: '保存代码 → 发布 → 给一个好记的地址 → 接入数据分析 → 引来用户并倾听他们。数据分析要在第一批用户到来之前接入，否则最早的数据就丢了。',
        },
        {
          title: '托管平台上的密钥',
          prompt: 'Vercel 上的网站读不到 Supabase 密钥，可本地一切正常。AI 建议……',
          chat: [
            { text: '在 Vercel 上网站读不到 VITE_SUPABASE_URL，但本地一切正常。' },
            { text: '直接把 .env 文件提交到 GitHub——Vercel 会自动读取。' },
          ],
          options: [
            '不行，.env 不能放进 git。我会在 Vercel 项目设置（Environment Variables）里添加变量，然后重新部署。',
            '好，我提交 .env。',
            '我把密钥直接写进代码。',
            '等等看，它自己会好的。',
          ],
          explain: '.env 不会进入 git，所以托管平台并不知道它。变量要在托管平台的控制台里设置，而且只对新的部署生效。',
        },
        {
          title: '分支里的修改',
          prompt: '你在 feature/menu 分支做了修改并推送到 GitHub。Vercel 会做什么？',
          outcomes: [
            { label: '生成带独立链接的预览部署', ui: { blocks: { 2: { text: '主站没有变化' } } } },
            { label: '立即更新主站', ui: { blocks: { 1: { text: 'vibe-app.vercel.app 已更新' } } } },
            { label: '什么也不做：Vercel 看不到分支', ui: { blocks: { 0: { text: '暂无部署' } } } },
          ],
          explain: 'push 到 main 会更新主站，而 push 到其他分支会生成带独立链接的预览部署。这样就能在用户看到之前检查 AI 的修改。',
        },
        {
          title: '暗藏陷阱的 .gitignore',
          prompt: 'git push 之后，私密密钥跑到了 GitHub 上。.gitignore 里哪一行写错了？',
          code: { 0: '# 依赖', 2: '# 构建产物', 4: '# 机密' },
          explain: '被忽略的是模板文件 .env.example，而真正的 .env 没有被忽略。应该写 .env 这一行，而不含机密的 .env.example 正适合提交，这样大家能看到需要哪些变量。',
        },
        {
          title: '转化率',
          situation: '方案 A：1000 名访客，30 人报名。方案 B：400 名访客，20 人报名。哪个方案的转化率更高？',
          options: ['B：5% 对 3%', 'A：它的报名人数更多', '一样'],
          explain: '转化率是比例，而不是数量：20 / 400 = 5%，30 / 1000 = 3%。A 的报名人数多，只是因为它的访客多。',
        },
        {
          title: '找不到按钮',
          prompt: '五名测试者中有三人没找到注册按钮。AI 做了修改——检查一下。',
          request: '让注册按钮更显眼，并在数据分析中添加点击事件。',
          hunks: [
            { lines: ['-<a className="text-sm text-gray-400">注册</a>', '+<button className="btn btn-coral">立即注册</button>'] },
            {},
            { harmful: '邮箱和电话属于个人数据，不能发送到数据分析中。统计点击次数，有事件名称就够了。' },
          ],
          explain: '醒目的按钮和点击事件，正是在新用户身上验证修复效果所需要的。而把个人数据发到数据分析中，则侵犯了隐私。',
        },
      ],
    },
  },
}
