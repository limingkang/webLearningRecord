
## 前言
本来打算学习[lerna](https://lerna.js.org/docs/introduction)的，但是考虑到停止维护一段时间了其对workspace的支持不行，而且各大主流框架开始弃用了，可以看下babel的解释：
- 不再支持在保持版本同步的同时只发布更改的包
- Yarn workspaces are way faster than lerna bootstrap in this repository
- We needed to use Yarn's workspace: protocol, but lerna doesn't support it
- We were using a very small subset of Lerna's features

当然随着nx收购了lerna之后新出来的lerna5已经投入使用，解决了部分问题，但是以目前项目来说，只要使用pnpm来管理多个包已经够了，上回
已经介绍了pnpm的大概原理，这次将实际介绍pnpm如何在项目中使用来解决多个js包的问题

[pnpm](https://pnpm.io/installation)可以去官网查下相应基础知识

## 子包需要启动服务
所谓子包全是服务，其实就是子包中每个都是一个项目端口，这比较适用于微前端时候，我们首先新建一个文件夹，名为 `vue3-pnpm-monorepo`，进
入 `vue3-pnpm-monorepo` 文件夹，初始化一个默认的 `package.json` 文件，执行命令：
```shell
## npm install -g pnpm 全局安装pnpm
pnpm init -y
```
这时 `package.json` 的文件内部应该是这样的：
```json
{
  "name": "vue3-pnpm-monorepo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```
先将一些没用的配置项删掉，再新增以下配置：
```json
{
  "private": true
}
```

- `"private": true`：私有的，不会被发布，是管理整个项目，与要发布的 npm 包解耦。详细可参考[这里](https://github.com/stereobooster/package.json#private)。

配置完成之后是是这个样子：

```json
{
  "name": "vue3-pnpm-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {},
  "license": "ISC"
}
```
接下来再新建 `packages` 文件夹，来存放项目。进入 `packages` 目录，我直接初始化三个 `vue3 + ts` 的项目进行演示：
为了保持大家和我的代码同步，创建命令如下：
```shell
npm init vite vue-demo1
npm init vite vue-demo2
npm init vite vue-demo3
```
目前项目结构如下
```
├── packages
|  ├── vue-demo1
|  ├── vue-demo2
|  └── vue-demo3
├── package.json
```
接下来进入到刚才创建的项目中，项目内部结构应该是这样的：
```
├── packages
|  ├── vue-demo1
|  |  ├── .vscode
|  |  ├── public
|  |  ├── src
|  |  ├── .gitignore
|  |  ├── index.html
|  |  ├── package.json
|  |  ├── README.md
|  |  ├── tsconfig.json
|  |  ├── tsconfig.node.json
|  |  └── vite.config.ts
|  ├── vue-demo2
|  └── vue-demo3
├── package.json
```
进入到项目的目录下，打开 `package.json` 文件，是这样的：
```json
{
  "name": "vue-demo1",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.2.25"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^2.2.0",
    "typescript": "^4.5.4",
    "vite": "^2.8.0",
    "vue-tsc": "^0.29.8"
  }
}
```
我们要知道，目前这三个项目是完全一样的，需要的依赖也是完全一样的，所以这些依赖项就可以直接抽离出来，变成公共的依赖项，添加上版本号，另外调试的话也不需要在这里进行调试，也直接删掉，稍加修改这个文件，最后变成这样：

```json
{
  "name": "vue-demo1",
  "private": true,
  "version": "1.0.0"
}
```
将三个项目都按照上面的方式进行修改即可,接下来就需要将三个公共的依赖项，进行配置到根目录，使用全局的依赖包提供这三个项目使用：
在 根目录下的 `package.json` 新增之前抽离出来的公共配置项，都添加到公共的配置文件中：
```json
{
  "name": "vue3-pnpm-monorepo",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "vue": "^3.2.25"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^2.2.0",
    "typescript": "^4.5.4",
    "vite": "^2.8.0",
    "vue-tsc": "^0.29.8"
  },
  "license": "ISC"
}
```
那么现在还没有调试的方式，可以新增调试的命令，一般启动项目可以使用 `dev:项目名` 来进行分别启动项目，后面跟上需要启动的路径即可
```json
{
  "name": "vue3-pnpm-monorepo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev:vue-demo1": "vite packages/vue-demo1",
    "dev:vue-demo2": "vite packages/vue-demo2",
    "dev:vue-demo3": "vite packages/vue-demo3"
  },
  "dependencies": {
    "vue": "^3.2.25"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^2.2.0",
    "typescript": "^4.5.4",
    "vite": "^2.8.0",
    "vue-tsc": "^0.29.8"
  },
  "license": "ISC"
}
```
这样配置之后，就可以根据不同的命令，来启动不同的项目了。接下来就是需要安装依赖进行测试了，不过安装前还需要配置一个特殊的文件 `pnpm-workspace.yaml`，这个文件可以帮
助我们在安装公共依赖的情况下，也将 `packages` 下的项目所需要的依赖也同时进行安装。

在根目录创建 `pnpm-workspace.yaml` 文件，内容为：
```yaml
packages:
  - 'packages/*'
```
配置好之后，就可以在根目录执行：
```shell
pnpm i
```
来安装依赖，安装好了之后，我们就会发现，在项目的根目录和分别每个项目中，都会有了 `node_modules` 文件夹。通过命令启动一下项目：
```shell
pnpm run dev:vue-demo1
pnpm run dev:vue-demo2
pnpm run dev:vue-demo3
```

局部安装依赖项比如说，我的 `vue-demo1` 的项目中需要安装 `tyh-ui`，而其它的两个项目是不需要的，那么这样的话，就可以将 `tyh-ui` 单独安装
到 `vue-demo1` 的项目中，而另外两个项目是不需要的，所以就没必要安装到全局，直接安装到 `vue-demo1` 内部，安装的方式有两种：
- 进入到指定目录去安装

可以直接进入到指定需要安装的目录进行安装，那么进入到 `packages/vue-demo1` 中，执行：
```shell
npm i tyh-ui2
```
完成安装，这样 `vue-demo1` 中就会单独多出一个依赖项进行使用了。

- `--filter` 安装

使用 `--filter` 修饰符可以实现在根目录指定某个目录进行安装，具体命令为：

```shell
pnpm i tyh-ui2 --filter vue-demo1
```

添加全局的依赖项的时候，需要在命令后面加上 `-W`,比如所有的组件都需要使用到 `lodash`，就可以执行：
```shell
pnpm i lodash -W
```

## 子包是依赖的js
很多比较著名的包，例如vue3,babel等都是采用该方式，这里给个大概的使用方法，先安装一些依赖
``` shell
# 源码采用 typescript 编写
pnpm add  -D -w typescript
# 构建工具，命令行参数解析工具
pnpm add -D -w esbuild rollup rollup-plugin-typescript2 @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-commonjs minimist execa 
```
- -D：作为开发依赖安装
- -w：pnpm 将依赖安装到 workspace-root，也就是项目的根目录

初始化Typescript
``` shell
pnpm tsc --init
# pnpm 的使用基本和 npm 一致。这里的用法就相当于 npm 中的 npx：
npx tsc --init
```
意思是，去 node_modules 下的 .bin 目录中找到tsc 命令，并执行它。执行完该命令，会在项目根目录生成一个 tsconfig.json 文件，进行一些配置：
``` js
{
  "compilerOptions": {
    "outDir": "dist", // 输出的目录
    "sourceMap": true, // 开启 sourcemap
    "target": "es2016", // 转译的目标语法
    "module": "esnext", // 模块格式
    "moduleResolution": "node", // 模块解析方式
    "strict": false, // 关闭严格模式，就能使用 any 了
    "resolveJsonModule": true, // 解析 json 模块
    "esModuleInterop": true, // 允许通过 es6 语法引入 commonjs 模块
    "jsx": "preserve", // jsx 不转义
    "lib": ["esnext", "dom"], // 支持的类库 esnext及dom
    "baseUrl": ".",  // 当前目录，即项目根目录作为基础目录
    "paths": { // 路径别名配置
      "@my-vue/*": ["packages/*/src"]  // 当引入 @my-vue/时，去 packages/*/src中找
    },
  }
}
```
然后在根目录下新建pnpm-workspace.yaml文件,用于告诉pnpm需要打包的路径,例如下面代码所示,表示 pnpm 打包的文件的位置在根目录下的 packages 下
``` js
packages:
  - 'packages/*'
```
我们先在 packages 目录下新建两个模块，分别是 reactivity 响应式模块 和 shared 工具库模块。然后编写构建脚本进行第一次的开发调试

在 shared 文件中初始化 shared 项目,但是 package.json有一点不一样,因为 shared 作为一个引入对象,不需要再浏览器中使用,所以不需要打包成global
``` js
{
  "name": "@vue/shared",
  "version": "1.0.0",

  "description": "",
  "main": "index.js",
  "buildOptions":{
    "formats":[
      "cjs",
      "esm-boundler"
    ]
  }
}

// 编写该模块的入口文件： src/index.ts
/**
 * 判断对象
 */
export const isObject = (value) =>{
    return typeof value === 'object' && value !== null
}
/**
 * 判断函数
 */
export const isFunction= (value) =>{
    return typeof value === 'function'
}
/**
 * 判断字符串
 */
export const isString = (value) => {
    return typeof value === 'string'
}
/**
 * 判断数字
 */
export const isNumber =(value)=>{
    return typeof value === 'number'
}
/**
 * 判断数组
 */
export const isArray = Array.isArray
```

然后进入 reactivity 目录,pnpm 项目,生成 package.json文件,然后修改 package.json文件
``` js
{
  "name": "@vue/reactivity", //项目的名称
  "version": "1.0.0",

  "description": "",
  "main": "index.js",
  "buildOptions":{ //自定义属性
    "name":"VueReactivity", //打包的名称,
    "formats":[ //打包的格式
      "global", //浏览器中使用
      "cjs",
      "esm-boundler"
    ]
  }
}
```
编写该模块的入口文件：
``` js
// src/index.ts
import { isObject } from '@my-vue/shared'
const obj = {name: 'Vue3'}
console.log(isObject(obj))
```
在 reactivity 包中用到了另一个包 shared ，需要安装才能使用：
``` shell
pnpm add @my-vue/shared@workspace --filter @my-vue/reactivity
```
意思是，将本地 workspace 内的 @my-vue/shared 包，安装到 @my-vue/reactivity包中去。此时，查看 reactivity 包的依赖信息：
``` js
"dependencies": {
   "@my-vue/shared": "workspace:^1.0.0"
}
```
编写构建脚本,在根目录下新建 scripts 目录，存放项目构建的脚本。新建 dev.js，作为开发阶段的构建脚本
``` js
// scripts/dev.js
// 使用 minimist 解析命令行参数
const args = require('minimist')(process.argv.slice(2))
const path = require('path')
// 使用 esbuild 作为构建工具
const { build } = require('esbuild')
// 需要打包的模块。默认打包 reactivity 模块
const target = args._[0] || 'reactivity'
// 打包的格式。默认为 global，即打包成 IIFE 格式，在浏览器中使用
const format = args.f || 'global'
// 打包的入口文件。每个模块的 src/index.ts 作为该模块的入口文件
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`)
// 打包文件的输出格式
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
// 文件输出路径。输出到模块目录下的 dist 目录下，并以各自的模块规范为后缀名作为区分
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)
// 读取模块的 package.json，它包含了一些打包时需要用到的配置信息
const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`))
// buildOptions.name 是模块打包为 IIFE 格式时的全局变量名字
const pgkGlobalName = pkg?.buildOptions?.name
console.log('模块信息：\n', entry, '\n', format, '\n', outputFormat, '\n', outfile)
// 使用 esbuild 打包
build({
  // 打包入口文件，是一个数组或者对象
  entryPoints: [entry], 
  // 输入文件路径
  outfile, 
  // 将依赖的文件递归的打包到一个文件中，默认不会进行打包
  bundle: true, 
  // 开启 sourceMap
  sourcemap: true,
  // 打包文件的输出格式，值有三种：iife、cjs 和 esm
  format: outputFormat, 
  // 如果输出格式为 IIFE，需要为其指定一个全局变量名字
  globalName: pgkGlobalName, 
  // 默认情况下，esbuild 构建会生成用于浏览器的代码。如果打包的文件是在 node 环境运行，需要将平台设置为node
  platform: format === 'cjs' ? 'node' : 'browser',
  // 监听文件变化，进行重新构建
  watch: {
   onRebuild (error, result) {
       if (error) {
           console.error('build 失败：', error)
       } else {
           console.log('build 成功:', result) 
       }
    }
  }
}).then(() => {
  console.log('watching ...')
})
```
使用该脚本，会使用 esbuild 对 packages 下的包进行构建，打包的结果放到各个包的 dist 目录下。在开发阶段，我们默认打包成 IIFE 格式，方便在浏览器中使用 html 文件进行
测试。在生产阶段，会分别打包成 CommonJS，ES Module 和 IIFE 的格式。完成第一次调试给项目增加一条 scripts 命令：
``` js
// package.json
"scripts": {
    "dev": "node scripts/dev.js reactivity -f global"
}
```
意思是，以 IIFE 的格式，打包 reactivity 模块，打包后的文件可以运行在浏览器中。在终端中执行：`pnpm dev`会生成dist文件，我们建立个html文件进行测试
``` html
// packages/reactivity/test/index.html
<body>
    <div id="app"></div>
    <script src="../dist/reactivity.global.js"></script>
</body>
```



