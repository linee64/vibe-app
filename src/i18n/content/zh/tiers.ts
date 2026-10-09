import type { TiersTr } from '../types'

export const tiers: TiersTr = {
  tiers: {
    novice: { name: '入门', outcome: '清楚地给 AI 布置任务，做出你的第一个落地页', skills: ['五要素提示词', '一晚做完落地页', '通过补充说明修改'] },
    mid: { name: '进阶', outcome: '和 AI 一起修 bug，并为应用接入数据库', skills: ['根据报错调试', '数据表与表单', '密钥保密'] },
    pro: { name: '高级', outcome: '用自己的域名把项目发布上线，并找到第一批用户', skills: ['GitHub 与部署', '自己的域名', '数据分析'] },
  },
  soon: ['AI 智能体', '在自己的应用里收款'],
}
