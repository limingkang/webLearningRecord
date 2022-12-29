const slidebar = require('./router')

module.exports = {
  title: '前端学习',
  port: 7997,
  base: '/webLearningRecord/',
  // dest: '../../../docs/dist/',
  description: '努力学习',
  themeConfig: {
    nav: [{ text: 'gitHub', link: 'https://github.com/limingkang' }],
    sidebar: slidebar
  }
}
