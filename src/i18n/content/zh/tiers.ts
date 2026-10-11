import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: '入门', outcome: '清楚地给 AI 布置任务，做出你的第一个落地页', skills: ['五要素提示词', '一晚做完落地页', '通过补充说明修改'] },
    mid: { name: '进阶', outcome: '和 AI 一起修 bug，并为应用接入数据库', skills: ['根据报错调试', '数据表与表单', '密钥保密'] },
    pro: { name: '高级', outcome: '把项目发布上线，做出移动应用，并在产品中接入 AI 功能和智能体', skills: ['部署与自己的域名', '设计与移动应用', 'AI 功能与智能体'] },
  },
  soon: ['在自己的应用里收款和订阅', '自己的 SaaS：从想法到第一笔收入'],
}
