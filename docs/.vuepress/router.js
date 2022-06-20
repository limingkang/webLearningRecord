module.exports = [
  {
    title: '浏览器工作原理和实践',
    path: '/',
    collapsable: false,
    children: [
      ['/browser-theory/chromeConstruct', 'chrome架构'],
      ['/browser-theory/other', '缓存和安全']
    ]
  },
  {
    title: '微前端架构',
    path: '/',
    collapsable: false,
    children: [
      ['/web-consttruct/singleSpa', 'single-spa方式实现'],
      ['/web-consttruct/mySingleSpa', '自己实现一个微前端']
    ]
  },
  {
    title: '前端性能监控',
    path: '/',
    collapsable: false,
    children: [
      ['/web-observe/web-observe', '构建前端性能监控']
    ]
  },
  {
    title: 'vue2源码分析',
    path: '/',
    collapsable: false,
    children: [
      ['/vue-analyze/vue2', '初始化过程'],
      ['/vue-analyze/components', '组件化'],
      ['/vue-analyze/reactive', '响应式原理']
    ]
  },
  {
    title: 'rollup',
    path: '/',
    collapsable: false,
    children: [
      ['/rollup/analysize', 'basic']
    ]
  },
  {
    title: 'vite',
    path: '/',
    collapsable: false,
    children: [
      ['/vite/prelearn', '基础知识'],
      ['/vite/analysize', '源码分析']
    ]
  },
  {
    title: 'react浅析',
    path: '/',
    collapsable: false,
    children: [
      ['/react/react', 'react初探'],
      ['/react/two', 'react架构实现'],
    ]
  },
  {
    title: '经常忘记',
    path: '/',
    collapsable: false,
    children: [
      ['/forget/one', 'JavaScript'],
      ['/forget/two', 'TypeScript'],
      ['/forget/three', 'CSS'],
      ['/forget/four', 'Node'],
      ['/forget/five', '经常使用'],
    ]
  },
  {
    title: '笔试题',
    path: '/',
    collapsable: false,
    children: [
      ['/algorithm/one', '算法'],
      ['/algorithm/two', '手写函数']
    ]
  },
]
