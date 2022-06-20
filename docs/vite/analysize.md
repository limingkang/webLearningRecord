## 骨架梳理
学不动了啊。。。。。。。。。。。
> `Vite` 是一种新型的前端构建工具，能够显著提升前端开发体验。

总结起来`vite` 通过 `connect` 库提供开发服务器，通过中间件机制实现多项开发服务器配置。而 `vite` 在本地开发时没有借助 `webpack` 或是 `rollup` 这样的
打包工具，而是通过调度内部 `plugin` 实现了文件的转译，从而达到小而快的效果

本文阅读的 `Vite` 源码版本是 `2.8.0-beta.3`，如果你想要和我一起阅读的话，你可以在这个地址下载 [Vite 源码](https://github.com/vitejs/vite)。

我们先来看看 `Vite` 这个包的项目目录
![image](./images/eight.jpeg)

这是一个集成管理的项目，其核心就是在 `packages` 里面的几个包（如下）

| 包名             | 作用                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| `vite`           | `Vite` 主库，负责 `Vite` 项目的本地开发（插件调度）和生产产物构建（Rollup 调度） |
| `create-vite`    | 用于创建新的 `Vite` 项目，内部存放了多个框架（如 `react、vue`）的初始化模板      |
| `plugin-vue`     | `Vite` 官方插件，用于提供 Vue 3 单文件组件支持                                   |
| `plugin-vue-jsx` | `Vite` 官方插件，用于提供 Vue 3 JSX 支持（通过 专用的 Babel 转换插件）。         |
| `plugin-react`   | `Vite` 官方插件，用于提供完整的 React 支持                                       |
| `plugin-legacy`  | `Vite` 官方插件，用于为打包后的文件提供传统浏览器兼容性支持                      |
| `playground`     | `Vite` 内置的一些测试用例及 Demo                                                 |

重点说下 `vite` 本地开发服务命令 —— `vite / vite dev / vite serve`。

### vite dev
`vite dev` 调用了内部的 `createServer` 方法创建了一个服务，这个服务利用中间件（第三方）支持了多种能力（如 
`跨域`、`静态文件服务器`等），并且内部创建了 `watcher` 持续监听着文件的变更，进行实时编译和热重载;而 `createServer` 做的
事情就是我们需要关注的核心逻辑

在 `createServer` 方法中，首先进行了对配置的收集工作 —— `resolveConfig`,可以直接参照 
[Vite 官方文档](https://cn.vitejs.dev/config/#root)查看支持的配置项

`resolveConfig` 的第一步就是加载项目目录的配置文件，如果没有指定配置文件位置，会自动在根目录下寻找 `vite.config.js`、
`vite.config.mjs`、`vite.config.ts`、`vite.config.cjs`,如果没有找到配置文件，则直接会中止程序

> `vite` 项目初始化时，会在项目根目录下自动生成 `vite.config.js` 配置文件。

在读取配置文件后，会将配置文件和初始化配置（优先级更高，有部分配置来自于命令行参数）进行合并，然后得到一份配置。（如下图）
![image](./images/nine.jpeg)

### 配置收集 - `resolveConfig`
在 `createServer` 的开头，调用了 `resolveConfig` 函数，进行配置收集

- 首先`resolveConfig` 内部处理了插件排序规则，对应下面的排序规则
![image](./images/ten.png)
在后续处理的过程中，插件将按照对应的排序规则先后执行，这样能够让插件更好地工作在各个生命周期节点

#### 合并插件配置
在插件排序完成后，`vite` 的 `插件` 暴露了一个配置 `config` 字段，可以通过设置该属性，使插件能够新增或改写 `vite` 的一
些配置。（如下图）
![image](./images/11.png)

#### 处理 alias
然后，`resolveConfig` 内部处理了 `alias` 的逻辑，将指定的 `alias` 替换成对应的路径。
![image](./images/12.png)

#### 读取环境变量配置
接下来，`resolveConfig` 内部找到 `env` 的配置目录（默认为根目录），然后在目录中读取对应的 `env` 环境变量配置文件。我们可以
看看内部的读取规则优先级（如下图）
![image](./images/13.png)
可以看出，读取的优先级分别是 `.env.[mode].local`、`.env.[mode]`。如果不存在对应 `mode` 的配置文件，则会尝试去寻
找 `.env.local`、`.env` 配置文件，读取到配置文件后，使用 `doteenv` 将环境变量写入到项目中；如果这些环境变量配置文
件都不存在的话，则会返回一个空对象,该环境变量配置文件并不影响项目运行，所以不配置也没有什么影响。

#### 导出配置
接下来，`vite` 初始化了构建配置，也就是文档中的 `build` 属性，详情可以参照
[构建选项文档](https://cn.vitejs.dev/config/#build-target)
![image](./images/14.png)
最后，`resolveConfig` 处理了一些 `publicDir`、`cacheDir` 目录后，导出了下面这份配置。
```ts
const resolved: ResolvedConfig = {
    ...config,
    configFile: configFile ? normalizePath(configFile) : undefined,
    configFileDependencies,
    inlineConfig,
    root: resolvedRoot,
    base: BASE_URL,
    resolve: resolveOptions,
    publicDir: resolvedPublicDir,
    cacheDir,
    command,
    mode,
    isProduction,
    plugins: userPlugins,
    server,
    build: resolvedBuildOptions,
    preview: resolvePreviewOptions(config.preview, server),
    env: {
      ...userEnv,
      BASE_URL,
      MODE: mode,
      DEV: !isProduction,
      PROD: isProduction
    },
    assetsInclude(file: string) {
      return DEFAULT_ASSETS_RE.test(file) || assetsFilter(file)
    },
    logger,
    packageCache: new Map(),
    createResolver,
    optimizeDeps: {
      ...config.optimizeDeps,
      esbuildOptions: {
        keepNames: config.optimizeDeps?.keepNames,
        preserveSymlinks: config.resolve?.preserveSymlinks,
        ...config.optimizeDeps?.esbuildOptions
      }
    },
    worker: resolvedWorkerOptions
  }
```
![image](./images/15.png)
`resolveConfig` 内部还有一些额外的工作处理，主要是收集内部插件集合（如下图），还有配置一些废弃选项警告信息

### 本地开发服务 - `createServer`
回到 `createServer` 方法，该方法通过 `resolveConfig` 拿到配置后，第一时间处理了 `ssr`（服务端渲染）的逻辑。
如果使用了服务端渲染，则会通过别的方式进行本地开发调试;如果不是服务端渲染，则会创建一个 `http server` 用于本地开发
调试，同时创建一个 `websocket` 服务用于热重载。（如下图）
![image](./images/16.png)

#### 文件监听 + 热重载
然后，`vite` 创建了一个 `FSWatcher` 对象，用于监听本地项目文件的变动。（这里使用的是 `chokidar` 库）
```ts
  const watcher = chokidar.watch(path.resolve(root), {
    ignored: [
      // 忽略 node_modules 目录的文件变更
      '**/node_modules/**',
      // 忽略 .git 目录的文件变更
      '**/.git/**',
      // 忽略用户传入的 `ignore` 目录文件的变更
      ...(Array.isArray(ignored) ? ignored : [ignored])
    ],
    ignoreInitial: true,
    ignorePermissionErrors: true,
    disableGlobbing: true,
    ...watchOptions
  }) as FSWatcher
```
然后，`vite` 将多个属性和方法组织成了一个 `server` 对象，该对象负责启动本地开发服务，也负责服务后续的开发热重载。

接下来，我们看看 `watcher` 是如何做页面热重载的吧，原理就是监听到文件变更后，重新触发插件编译，然后将更新消息发送给客户端。（如下图）
![image](./images/17.png)

#### 插件容器
接下来，`vite` 创建了插件容器（`pluginContainer`），用于在构建的各个阶段调用插件的钩子。（如下图）
![image](./images/18.png)
> 实际上插件容器是在热重载之前创建的，为了方便阅读，文章将热重载的内容都放在了一起。

#### 中间件机制
接下来是一些内部中间件的处理，当配置开发服务器选项时，`vite` 内部通过 `connect` 框架的中间件能力来提供支持。（如下图）
![image](./images/19.png)
其中，对 `public` 目录、公共路径等多项配置都是通过 `connect` + 中间件实现的，充分地利用了第三方库的能力，而没有重复造轮子。

#### 预构建依赖
接下来，`vite` 内部对项目中使用到的依赖进行的预构建，一来是为了兼容不同的 ES 模块规范，二来是为了提升加载性能。（如下图）
![image](./images/20.png)
准备工作就绪后，`vite` 内部调用 `startServer` 启动本地开发服务器。（如下）
```ts
// ...
httpServer.listen(port, host, () => {
  httpServer.removeListener('error', onError)
  resolve(port)
})
```
可以看出，在本地开发时，`vite` 主要依赖 `插件 + 中间件体系` 来提供能力支持。因为本地开发时只涉及到少量编译工作，所以非常的快。只
有在构建生产产物时，`vite` 才用到了 `rollup` 进行构建。

我们用一张流程图来最后梳理一遍 `vite 本地开发服务` 内部的工作流程吧
![image](./images/21.png)

[vite build请参考这里](https://blog.csdn.net/qq_34621851/article/details/123130837)



































