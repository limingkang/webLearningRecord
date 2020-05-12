## PortalSDK

由于我自己项目本身原因，方便快速接入，只是做了简单处理，各种全局数据直接挂载window对象上，首先我们需要先写一个
可以注册保存模块到全局变量等方法的sdk，最后打包成npm包供所有项目使用
``` js
export default {
  // 是否为主入口模块
  get isPortal() {
    return window.admin_global_env === 'portal';
  },

  // 注册app
  register({
    appName,
    $bootstrap,
    $destroy,
  }) {
    window.admin_global_registers = window.admin_global_registers || {};
    window.admin_global_registers[appName] = {
      $bootstrap,
      $destroy,
    };
  },

  // 获取用户信息
  get userInfo() {
    return window.admin_global_userInfo || {};
  },

  // 获取用户权限
  get authorities() {
    return window.admin_global_authorities || [];
  },

  // 校验权限
  checkAction(actionId) {
    return this.authorities.indexOf(actionId) > -1;
  },

  // 全局eventBus
  // 当不存在时暂时使用一个mock的eventBus
  get eventBus() {
    return window.admin_global_eventBus || {
      $emit() {},
      $on() {},
      $once() {},
    };
  },

  initEventBus(eventBus) {
    if (window.admin_global_eventBus) {
      // eslint-disable-next-line
      console.warn('[PORTAL-SDK] 当前已经存在全局eventBus', window.admin_global_eventBus);
    }
    // 可以在主入口模块中初始化事件监控系统, 方便子项目和入口主项目之间通信，例如通知菜单改变什么的
    window.admin_global_eventBus = eventBus;
  },
};
```

## 主项目改造
此项目使用vuex、vue-router、vue、page.js开发，main.js中直接上代码
``` js
// 声明这是主项目
window.admin_global_env = 'portal';

// 直接使用vue的事件监控方法, 并调用上面的sdk保存到全局，供子项目间相互通信
// 可以去发布订阅一些事件window.admin_global_eventBus.$emit('envChanged', env);
// window.admin_global_eventBus.$on('envChanged', (data)=>{);
import portalSdk from 'portal-sdk';
import Vue from 'vue';
const eventBus = new Vue();
portalSdk.initEventBus(eventBus);
initEventBus = () => {
  window.admin_global_eventBus = eventBus;
};
initEventBus();

// 使用vuex，方便子项目模块使用
// const globalStore = new Vuex.Store({
//   state: initialState,
//   getters,
//   mutations,
//   actions,
//   modules,
// });
const initVuex = () => {
  window.admin_global_store = globalStore; // 主项目全局store

  const moduleNames = {};

  const registerModule = (store, moduleConfig) => {
    const { name, module } = moduleConfig;
    moduleNames[name] = 1;
    store.registerModule(name, module);
  };

  window.admin_global_registerModule = (store, moduleConfig) => {
    if (!moduleConfig) return;
    if (Array.isArray(moduleConfig) && moduleConfig.length) {
      moduleConfig.forEach(p => registerModule(store, p));
    } else {
      registerModule(store, moduleConfig);
    }
  };

  window.admin_global_unregisterModule = (store, moduleNamespace) => {
    const reg = new RegExp(`^${moduleNamespace}`);
    Object.keys(moduleNames).filter(p => reg.test(p)).forEach((p) => {
      store.unregisterModule(p);
      delete moduleNames[p];
    });
  };
};
initVuex();

// 最后做一些初始化init方法，后面详细分析每个方法
const apps = await loadConfigs();
const globalVue = new Vue({
  el: '#navbar',
  render: h => h(navbar),
  store: globalStore,
});
setRouter(apps);
```

## 加载子项目配置文件
上文中的`loadConfigs`方法就是加载子项目配置的方法，我们的子项目中最终的打包编译后的代码中必须有个appConfig.json
配置文件(后面介绍)，代码如下
``` js
// appConfig是所有子项目对应环境的地址例如
// const appConfig = {};
// if (process.env.NODE_ENV === 'pro') {
//   Object.assign(appConfig, {
//     项目1: 'https://xxx1.com',
//     项目2: 'https://xxx2.com',
//   });
// }
const loadConfigs = async () => {
  const res = await Promise.all(Object
    .values(appConfig)
    .map(async (url) => {
      const item = await loader(`${url}appConfig.json?${Math.random()}`);
      if (!item) return null;
      const {
        menus, appName, dependencies, boostrapElement
      } = item;

      return {
        menus, // 配置中有菜单
        appName,
        dependencies, // 依赖的静态资源
        boostrapElement,
        appRoot: url, // 提前加载的静态资源的base
      };
    }));
  list = res.filter(p => p);
  // 针对符合权限的菜单排序,做些权限菜单过滤等
  // 同时我们在这里需要先遍历把所有的路径中的路由对应的app和其配置保存到全局
  // window.admin_global_urlAppMap = {
  //   "/#/core/test1/": 对应每个appConfig的值
  // };
  return list;
};
```

## 载入路由和映射
上面我们已经加载了各个子项目的配置文件，接下来我们要`setRouter`方法，这里我们使用page.js来做路由
其中page.js, 是基于快速路由器的微客户端端路由器，具体不做介绍，可以[查看文档](https://github.com/visionmedia/page.js)

``` js
// 寻找相应配置中的钩子
const execAppMethods = (appName, method, ...args) => {
  const register = window.admin_global_registers &&
    window.admin_global_registers[appName];
  if (register && register[method]) {
    register[method].apply(null, args);
  }
};
const portalApp = document.querySelector('#my-portal');
const appContainerList = {};
const portalContainer = document.querySelector('.my-portal');
// apps就是上面loadConfig的返回值
apps.forEach((app) => {
  const appContainer = document.createElement('div');
  appContainer.style.display = 'block';
  appContainer.style.width = '100%';
  appContainer.style.height = '100%';
  appContainer.$$instance = app;
  appContainerList[app.appName] = appContainer;
});

page('/notfound', () => {
  portalContainer.innerHTML = require('@/view/404.html');
});

page('*', async (ctx) => {
  const realHash = ctx.hash.split('?')[0];
  const app = appsStore.getAppByUrl(realHash);
  if (app) {
    const appContainer = appContainerList[app.appName];

    // 是否未切换应用
    if (window.currentAppContainer === appContainer) {
      return;
    }
    // 销毁当前存在在页面上的应用
    // const destroyCurrentApp = () => {
    //   if (window.currentAppContainer) {
    //     const { appName } = window.currentAppContainer.$$instance;
    //     const { firstChild } = window.currentAppContainer;
    //     execAppMethods(appName, '$destroy', firstChild);
    //     removeChildren(window.currentAppContainer);
    //     window.currentAppContainer = null;
    //   }
    // };
    destroyCurrentApp();

    window.currentAppContainer = appContainer;

    // 更改当前app中chunk的publicPath
    window.resourceBaseUrl = app.appRoot;

    // 展示当前appContainer，隐藏其他appContainer
    toggleChildren(portalApp, appContainer);

    // 准备好用于初始化应用代码的容器
    // 创建app容器
    // const createAppComponent = (appContainer, app) => {
    //   const appComponent = document.createElement('app');
    //   appComponent.id = app.boostrapElement;
    //   appContainer.appendChild(appComponent);
    // };
    createAppComponent(appContainer, app);

    if (!portalApp.contains(appContainer)) {
      portalApp.appendChild(appContainer);
    }

    // 加载app所需的css和js
    appsStore.isLoadingApp = true;

    const { dependencies: deps } = app;
    setTimeout(() => {
      Promise.all([
        // 加载配置中的静态资源
        ...loadStaticList(deps.css, app.appRoot, 'link'),
        ...loadStaticList(deps.js, app.appRoot, 'script'),
      ]).then(() => Promise.all([
        ...loadStaticList(deps.noCacheJs, app.appRoot, 'script', true),
      ])).then(() => {
        window.admin_global_eventBus.$emit('envChanged', getEnv());

        // 延缓到下一次宏任务执行
        setTimeout(() => {
          // 初始化app,触发对应项目的钩子
          execAppMethods(app.appName, '$boostrap', appContainer.firstChild);
          appsStore.isLoadingApp = false;
        }, 0);
      });
    }, 0);
  }
});
page();
```

## 子项目appConfig配置
首先每个接入的项目必须声明一个appConfig.json文件（建议由webpack自动生成），放置于根目录。其配置如下：
``` js
{
  // app版本号
  "version": "1.1.0",
  // 必需，App项目名，需要和package.json的name一致
  "appName" : "webA",
  // 必需，app本身的依赖，相对路径
  "dependencies": {
    // 每次渲染app都需要重新加载的js，默认"main."开头的js会重新加载
    "noCacheJs": [],
    // 只在app挂载时加载的js
    "js": [],
    // 只在app挂载时加载的css
    "css": []
  },
  // 必需，菜单
  "menus": [{
    "displayName": "test",
    "iconClass": "weba-lock",
    "url": "/#/core/test/",
    "actionId": "wea.1"  // 权限ID
  }],
  // 应用所有的路由配置树
  // 非必须
  // menus的优先级高于router，router可以作为补充路由，例如一些不存在于menus中的页面
  "router": [{
    "url": "/#/core/test1"
  }]
}
```
我们也可以自定义webpack plugin、使用plugin，来自动生成,需要注意的是为了确保路由不会冲突，每个项目的路由
必须有一个统一个一级路由作为命名空间（例如webA为/weba/page1, webB为/webB/page1）
``` js
const fs = require('fs');
const pkg = require('../package.json');

const TEMPLATE = {
  boostrapElement: 'weba',
  version: pkg.version,
  appName: pkg.name,
  dependencies: {},
  menus: [{
    displayName: '消息通道',
    iconClass: 'weba-text',
    menus,
  }],
};
function getPkgTemplate(assets) {
  const _tmp = Object.assign({}, TEMPLATE);
  _tmp.dependencies = {
    js: assets.js,
    css: assets.css,
  };
  return JSON.stringify(_tmp);
}
async function addFileToAssets(
    compilation,
    htmlPluginData,
) {
    const filepath = '../appConfig.json';
    try {
      fs.writeFileSync(filepath, getPkgTemplate(htmlPluginData.assets), {
        flag: 'w'
      });

      const addedFilename = await htmlPluginData.plugin.addFileToAssets(
        filepath,
        compilation,
      );

      compilation.assets[`${filepath}`] =
        compilation.assets[addedFilename];

      fs.unlinkSync(filepath);
    } catch (e) {
        // console.error('=========>exception', JSON.stringify(e));
    }
}
function bundleReaderPlugin() { }
bundleReaderPlugin.prototype.apply = compiler => {
    compiler.hooks.compilation.tap('bundleReaderPlugin', compilation => {
        compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync('bundleReaderPlugin',
          async (htmlPluginData, callback) => {
            await addFileToAssets(compilation, htmlPluginData);
            callback(null, htmlPluginData);
        });
    });
};
module.exports = bundleReaderPlugin;

// 使用的时候只需要加入webpack的plugin即可
const plugins = [
  new BundleReaderPlugin(),
];
```
## 子项目主文件配置
子项目main.js文件接入
``` js
// 支持运行时修改public_path
if (window.resourceBaseUrl) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.resourceBaseUrl;
}

import portal from 'portal-sdk';
import pkg from '../package.json';

const init = async (dom) => {
  if (!portal.isPortal) {
    // 如果不是接入的子项目可以做些权限认证等....
  }
  const vueConfig = {
    el: dom,
    router,
    render: h => h(App)
  };
  // const store = [{
  //   name: `${NAMESPACE}`,
  //   module: {
  //     namespaced: true,
  //     state,
  //     getters,
  //     mutations,
  //     actions,
  //   }
  // },
  // {
  //   name: `${NAMESPACE}test`,
  //   module: test
  // }];
  // 可以在全局主项目vuex再次注册相应模块
  if (window.admin_global_store && window.admin_global_registerModule) {
    window.admin_global_registerModule(window.admin_global_store, store);
    vueConfig.store = window.admin_global_store;
  }
  return new Vue(vueConfig);
};
// 也可以通过eventBus和其他项目交流，如果想用自己的eventBus，可以重新new vue()一个eventBus
portal.eventBus.$on('envChanged', (env) => {
  // empty
});
let vmPromise;
if (portal.isPortal) {
  // 注册app
  portal.register({
    appName: pkg.name,
    $bootstrap: (dom) => {
      vmPromise = init(dom);
    },
    $destroy: async () => {
      const vm = await vmPromise;
      vm.$destroy();
    },
  });
} else {
  // 正常初始化，用于本地测试
  init('#app');
}
```
注意一点要配置下webpack异步加载时候的方法webpackJsonp的名字，因为都是挂载全局对象上多个项目会冲突
webpackJsonp变量名可以通过output.jsonpFunction进行配置
``` js
import pkg from './package.json';
output: {
  jsonpFunction: `${pkg.name}_jsonp`,
},
```

### 以上的接入是在微前端还不火的时候自己写的，现在已经很很多成型的微前端框架，例如qiankun是一个基于single-spa的微前端实现库
[qiankun接入](https://juejin.im/post/5ea55417e51d4546e347fda9)

[qiankun源码解析](https://mp.weixin.qq.com/s/o7L_Sxl1s0uKywRy-Ao5fg)

