Node.js让JavaScript运行在服务器端的开发平台，它让JavaScript的触角伸到了服务器端，可以与PHP、JSP、Python、Ruby平
起平坐。但Node似乎有点不同：
- Node.js不是一种独立的语言，与PHP、JSP、Python、Perl、Ruby的“既是语言，也是平台”不同，Node.js的使用JavaScript
进行编程，运行在JavaScript引擎上（V8）
- 与PHP、JSP等相比，Node.js跳过了Apache、Naginx、IIS等HTTP服务器，它自己不用建设在任何服务器软件之上。Node.js的
许多设计理念与经典架构（LAMP）有着很大的不同，可以提供强大的伸缩能力

Node.js自身哲学，是花最小的硬件成本，追求更高的并发，更高的处理性能。为了实现这个目标追求，Node.js的创建者Ryan Dahl鬼
才般的使用单线程、非阻塞I/O（non-blocking I/O）、事件驱动这三个方法

## 单线程单进程
严格来说，node并不是单线程的。node中存在着多种线程，包括：
- js引擎执行的线程
- 定时器线程(setTimeout, setInterval)
- 异步http线程(ajax)

我们平时所说的单线程是指node中只有一个js引擎在主线程上运行。其他异步IO和事件驱动相关的线程通过libuv来实现内部的线程池
和线程调度。libv中存在了一个Event Loop，通过Event Loop来切换实现类似于多线程的效果。简单的来讲Event Loop就是维持
一个执行栈和一个事件队列，当前执行栈中的如果发现异步IO以及定时器等函数，就会把这些异步回调函数放入到事件队列中。当前执
行栈执行完成后，从事件队列中，按照一定的顺序执行事件队列中的异步回调函数

就是说node中的单线程是指js引擎只在唯一的主线程上运行，其他的异步操作，也是有独立的线程去执行，通过libv的Event Loop实
现了类似于多线程的上下文切换以及线程池调度。线程是最小的进程，因此node也是单进程的

## 实现node多进程
node是单进程的，必然存在一个问题，就是无法充分利用cpu等资源。node提供了child_process模块来实现子进程，从而实现一个广
义上的多进程的模式。通过child_process模块，可以实现1个主进程，多个子进程的模式，主进程称为master进程，子进程又称工作
进程。在子进程中不仅可以调用其他node程序，也可以执行非node程序以及shell命令等等，执行完子进程后，以流或者回调的形式返回

在child_process模块中提供了四个创建子进程的方法，区别如下：
- spawn：子进程中执行的是**非node程序**，提供一组参数后，执行的**结果以流的形式返回**
- execFile：子进程中执行的是**非node程序**，提供一组参数后，执行的**结果以回调的形式返回**
- exec：子进程中执行的是**非node程序**，提供一组「shell命令」，执行的**结果以回调的形式返回**
- fork：子进程中执行的是**node程序**，提供一组参数后，执行的**结果以流的形式返回**

cluster模块意为集成，集成了两个方面，第一个方面就是集成了child_process.fork方法创建node子进程的方式，第二个方面
就是集成了根据多核CPU创建子进程后，自动控制负载均衡的方式
``` js
// 看下官网的例子
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接。
  // 在本例子中，共享的是一个 HTTP 服务器。
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('你好世界\n');
  }).listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}

//最后输出的结果为：
$ node server.js
主进程 3596 正在运行
工作进程 4324 已启动
工作进程 4520 已启动
工作进程 6056 已启动
工作进程 5644 已启动
```
我们将master称为主进程，而worker进程称为工作进程，利用cluster模块，使用node封装好的API、IPC通道和调度机可以非常简
单的创建包括一个master进程下HTTP代理服务器 + 多个worker进程多个HTTP应用服务器的架构


## node实现多线程
worker_threads模块允许使用并行地执行JavaScript的线程。注意worker_threads相对于I/O密集型操作是没有太大的帮助的，因
为异步的I/O操作比worker线程更有效率，但对于CPU密集型操作的性能会提升很大，线程间的通信方式有：
- **共享内存**线程之间可以共享内存，使用ArrayBuffer或SharedArrayBuffer
- **parentPort**主要用于父子线程通信，通过经典的on('message')，postMessage形式
- **MessageChannel**创建自定义的消息传递通道

与 Web 工作线程和 cluster 模块一样，可以通过线程间的消息传递来实现双向通信。在内部，一个 Worker 具有一对内置的 
MessagePort，在创建该 Worker 时它们已经相互关联。虽然父端的 MessagePort 对象没有直接公开，但其功能是通过父线
程的 Worker 对象上的 worker.postMessage() 和 worker.on('message') 事件公开的。

要创建自定义的消息传递通道（建议使用默认的全局通道，因为这样可以促进关联点的分离），用户可以在任一线程上创建一个MessageChannel
对象，并将该 MessageChannel 上的 MessagePort 中的一个通过预先存在的通道传给另一个线程，例如全局的通道


## Buffer模块
Buffer 类是作为 Node.js API 的一部分引入的，用于在 TCP 流、文件系统操作、以及其他上下文中与八位字节流进行交互。这
是来自 Node.js 官网的一段描述，比较晦涩难懂，总结起来一句话 Node.js 可以用来处理二进制流数据或者与之进行交互。Buffer 
用于读取或操作二进制数据流，做为 Node.js API 的一部分使用时无需 require，用于操作网络协议、数据库、图片和文件 I/O 
等一些需要大量二进制数据的场景。Buffer 在创建时大小已经被确定且是无法调整的，在内存分配这块 Buffer 是由 C++ 层面提供而不是 V8

- 通常，数据的移动是为了处理或者读取它，并根据它进行决策。伴随着时间的推移，每一个过程都会有一个最小或最大数据量。如果数
据到达的速度比进程消耗的速度快，那么少数早到达的数据会处于等待区等候被处理。反之，如果数据到达的速度比进程消耗的数据慢，
那么早先到达的数据需要等待一定量的数据到达之后才能被处理。这里的等待区就指的缓冲区（Buffer），它是计算机中的一个小物
理单位，通常位于计算机的 RAM 中(随机存取存储器)

- 在上面例子中的等待区公共汽车站，对应到我们的 Node.js 中也就是缓冲区（Buffer），另外乘客到达的速度是我们不能控制的，
我们能控制的也只有何时发车，对应到我们的程序中就是我们无法控制数据流到达的时间，可以做的是能决定何时发送数据

- Node.js 的垃圾回收中主要使用 V8 来管理,由于 Buffer 需要处理的是大量的二进制数据，假如用一点就向系统去申请，则会造
成频繁的向系统申请内存调用，所以 Buffer 所占用的内存不再由 V8 分配，而是在 Node.js 的 C++ 层面完成申请，在 Java 中
进行内存分配。因此，这部分内存我们称之为堆外内存

- 为了高效的使用申请来的内存，Node采用了slab分配机制(预先申请、事后分配)。slab是一种动态的内存管理机制。Node以8kb为
界限来来区分Buffer为大对象还是小对象，如果是小于8kb就是小Buffer，大于8kb就是大Buffer

- 例如第一次分配一个1024字节的Buffer，Buffer.alloc(1024),那么这次分配就会用到一个slab，接着如果继续Buffer.alloc(1024),
那么上一次用的slab的空间还没有用完，因为总共是8kb，1024+1024 = 2048个字节，没有8kb，所以就继续用这个slab给Buffer分配
空间。如果超过8bk，那么直接用C++底层地宫的SlowBuffer来给Buffer对象提供空间

### 使用Buffer的性能对比
``` js
//使用纯字符串返回给客户端
const http = require('http');
let hello = ''
for (var i = 0; i < 10240; i++) {
  hello += "a";
}
console.log(`Hello：${hello.length}`)
// hello = Buffer.from(hello);
http.createServer((req, res) => {
  res.writeHead(200);
  res.end(hello);
}).listen(8001);
```
mac下, 使用ab命令进行web性能测试,使用`ab -c 200 -t 100 http://127.0.0.1:8001/`命令来进行性能测试，发起200个
并发客户端,使用字符串，QPS可以达到4019.70，传输率为40491.45KB每秒
``` js
//使用Buffer。将字符串转换为Buffer对象，再发给客户端
const http = require('http');
let hello = ''
for (var i = 0; i < 10240; i++) {
  hello += "a";
}
console.log(`Hello：${hello.length}`)
hello = Buffer.from(hello);
http.createServer((req, res) => {
  res.writeHead(200);
  res.end(hello);
}).listen(8001);
```
同样使用`ab -c 200 -t 100 http://127.0.0.1:8001/`测试，同样发起200个并发客户端,使用Buffer，QPS达到7130.05，传
输率为71822.74KB每秒。性能是原来的177%，极大的节省了服务器资源

道理其实很简单，在NodeJS中，进行http传输时，若返回的类型为string，则会将string类型的参数，转换为Buffer，通过NodeJS
中的Stream流，一点点的返回给客户端。如果我们直接返回Buffer类型，就没有了转换操作，直接返回，减少了CPU的重复使用率。
这一部分逻辑见Node源码
- 在上面性能对比示例中，返回string时，每次请求都需要将string装换成Buffer返回；而直接返回Buffer时，这个Buffer是我
们启动服务时就存放在内存中的，每次请求直接返回内存中的Buffer即可，因此Buffer使用前后QPS提升了很多。
- 我们在写业务代码时，部分资源可以预先转换为Buffer类型（如js、css等静态资源文件），直接返回buffer给客户端，再比如一
些文件转发的场景，将获取到的内容储存为Buffer直接转发，避免额外的转换操作

### buffer常用api
1. Buffer.from(array)： 返回一个被 array 的值初始化的新的 Buffer 实例（传入的 array 的元素只能是数字，不
然就会自动被 0 覆盖）

2. Buffer.alloc返回一个已初始化的 Buffer，可以保证新创建的 Buffer 永远不会包含旧数据

3. Buffer.allocUnsafe创建一个大小为 size 字节的新的未初始化的 Buffer，由于 Buffer 是未初始化的，因此分配的内存
片段可能包含敏感的旧数据。在 Buffer 内容可读情况下，则可能会泄露它的旧数据，这个是不安全的，使用时要谨慎

例如一个份文件test.md里的内容如下：床前明月光，疑是地上霜，举头望明月，低头思故乡;我们这样读取就会出现乱码：
``` js
var rs = require('fs').createReadStream('test.md', {highWaterMark: 11});
// 床前明???光，疑???地上霜，举头???明月，???头思故乡
```
一般情况下，只需要设置rs.setEncoding('utf8')即可解决乱码问题,多字节编码的 Unicode 字符。许多网页和其他文档格式都使用 UTF-8


## 模块导出和加载
require的模块加载机制如下
1. Node.js模块分为核心模块和文件模块；核心模块是Node.js标准API中提供的模块，可以直接通过require获取；文件模块是存
储为单独的文件的模块，可以是javascript代码、Json或编译好的C/C++代码；

2. 核心模块拥有最高的加载优先级，如果有模块与其明明冲突，Node.js总是加载核心模块；

3. 文件模块如果不显式指定文件模块扩展名，则会按照.js、.json、.node的顺序加上扩展名；

4. 文件模块的加载有两种方式，一种是按路径加载，一种是查找node_modules文件夹；

5. 文件模块按路径加载又分为按相对路径加载和按绝对路径加载两种；

6. 既不是核心模块，又不是以路径形式表示的模块，则首先在当前目录的node_modules目录中查找该模块是否存在，若不存在，则
继续在其父目录的node_modules目录中查找，反复执行这一过程，直到根目录为止

nodejs通过require加载模块，require里面分为相对路径和非相对路径，不同的表示方法，node的寻找机制是不同的，相对路径时，
node是直接查找的，如：在`/root/src/moduleA.js`下，我们要依赖模块`var var x = require("./moduleB");`nodejs通过以下步骤找到模块

- 作为文件找/root/src/moduleB.js如果存在

- 作为目录找/root/src/moduleB，如果目录包含package.json并且标明了main。如在
`/root/src/moduleB/package.json中包含{ "main": "lib/mainModule.js" }`则其找寻/root/src/moduleB/lib/mainModule.js

- 做为目录如果在/root/src/moduleB下有index.js则加载/root/src/moduleB/index.js

- 当以‘/’开头加载的时候是文件的绝对路径。如`require('/home/marco/foo.js')`将加载`/home/marco/foo.js`

对于非相对的模块导入，node将会在node_modules中找，如在`/root/src/moduleA.js`中我们依赖模块`var x = require("moduleB");`
node将会通过下面步骤找寻moduleB

- /root/src/node_modules/moduleB.js

- /root/src/node_modules/moduleB/package.json
(if it specifies a "main"property)

- /root/src/node_modules/moduleB/index.js

- /root/node_modules/moduleB.js

- /root/node_modules/moduleB/package.json
(if it specifies a "main"property)

- /root/node_modules/moduleB/index.js

- /node_modules/moduleB.js

- /node_modules/moduleB/package.json
(if it specifies a "main"property)

- /node_modules/moduleB/index.js


### 模块加载的实现方法
Node中，每个文件模块都是一个对象，它的定义如下：
``` js
function Module(id, parent) {
 this.id = id;
 this.exports = {};
 this.parent = parent;
 this.filename = null;
 this.loaded = false;
 this.children = [];
}
var module = new Module(filename, parent);
module.exports = Module;
```
``` js
// require 其实内部调用 Module._load 方法
Module._load = function(request, parent, isMain) {
   // 计算绝对路径
   var filename = Module._resolveFilename(request, parent);
 
   // 第一步：如果有缓存，取出缓存
   var cachedModule = Module._cache[filename];
   if (cachedModule)  return cachedModule.exports;
 
     // 第二步：是否为内置模块
    if (NativeModule.exists(filename)) {
       return NativeModule.require(filename);
    }
  
    /********************************这里注意了**************************/
    // 第三步：生成模块实例，存入缓存
    // 这里的Module就是我们上面的1.1定义的Module
    var module = new Module(filename, parent);
    Module._cache[filename] = module;
 
    /********************************这里注意了**************************/
   // 第四步：加载模块
   // 下面的module.load实际上是Module原型上有一个方法叫Module.prototype.load
   try {
     module.load(filename);
     hadException = false;
   } finally {
     if (hadException) {
     delete Module._cache[filename];
   }
   // 第五步：输出模块的exports属性
   return module.exports;
}
```
为什么每个模块都有__dirname,__filename属性呢，new Module的时候我们看到1.1部分没有这两个属性的，那么这两个属性是从哪里来的
``` js
// 上面(1.2部分)的第四步module.load(filename)
// 这一步，module模块相当于被包装了，包装形式如下
// 加载js模块，相当于下面的代码（加载node模块和json模块逻辑不一样）
(function (exports, require, module, __filename, __dirname) {
 // 模块源码
 // 假如模块代码如下
 var math = require('math');
 exports.area = function(radius){
  return Math.PI * radius * radius
 }
});
//也就是说，每个module里面都会传入__filename, __dirname参数，这两个参数并不是module本身就有的，是外界传入的
```

### 模块输出
module.exports vs exports很多时候，你会看到，在Node环境中，有两种方法可以在一个模块中输出变量：
``` js
// hello.js
function hello() {
 console.log('Hello, world!');
}
function greet(name) {
 console.log('Hello, ' + name + '!');
}
// 第一种
module.exports = {
 hello: hello,
 greet: greet
};
// 第二种
exports.hello = hello;
exports.greet = greet;
// 但是如果这样，代码可以执行，但是模块并没有输出任何变量
exports = {
 hello: hello,
 greet: greet
};
```
首先，我们分析下Node会把整个待加载的hello.js文件放入一个包装函数load中执行。在执行这个load()函数前，Node准备好了module变量
``` js
var module = {
 id: 'hello',
 exports: {}
};
load()函数最终返回module.exports：
var load = function (exports, module) {
 // hello.js的文件内容
 ...
 // load函数返回:
 return module.exports;
};
var exported = load(module.exports, module);
```
也就是说，默认情况下，Node准备的exports变量和module.exports变量实际上是同一个变量，并且初始化为空对象{}，
`module.exports = function () { return 'foo'; };`给exports赋值是无效的，因为赋值后，module.exports仍然是空对象{}。

## 循环引入
如果被问到“CommonJS和ES Module的差异”，大概每个前端都都背出几条：一个是导出值的拷贝，一个是导出值的引用；一个是运行时加载，一个是静态编译....

``` js
//index.js
var a = require('./a')
console.log('入口模块引用a模块：',a)

// a.js
exports.a = '原始值-a模块内变量'
var b = require('./b')
console.log('a模块引用b模块：',b)
exports.a = '修改值-a模块内变量'

// b.js
exports.b ='原始值-b模块内变量'
var a = require('./a')
console.log('b模块引用a模块',a)
exports.b = '修改值-b模块内变量'

// 输出结果
// b模块引用a模块 { a: '原始值-a模块内变量' }
// b模块引用a模块 { b: '修改值-b模块内变量' }
// 入口模块引用a模块：{ a: '修改值-a模块内变量' }
```
循环引用无非是要解决两个问题，怎么避免死循环以及输出的值是什么。CommonJS通过模块缓存来解决：每一个模块都先加入缓存再执行，每次遇到require都先检查
缓存，这样就不会出现死循环；借助缓存，输出的值也很简单就能找到了
![An image](./images/1.png)

### 多次引入
同样由于缓存，一个模块不会被多次执行，来看下面这个例子：入口模块引用了a、b两个模块，a、b这两个模块又分别引用了c模块，此时并不存在循环引用，但
是c模块被引用了两次
``` js
//index.js
var a = require('./a')
var b= require('./b')

// a.js
module.exports.a = '原始值-a模块内变量'
console.log('a模块执行')
var c = require('./c')

// b.js
module.exports.b = '原始值-b模块内变量'
console.log('b模块执行')
var c = require('./c')

// c.js
module.exports.c = '原始值-c模块内变量'
console.log('c模块执行')

// 执行结果如下：a模块执行 c模块执行 b模块执行
```
可以看到，c模块只被执行了一次，当第二次引用c模块时，发现已经有缓存，则直接读取，而不会再去执行一次

### commonjs、es module导出变量的区别
``` js
// b.mjs
export let count = 1;
export function add() {
  count++;
}
export function get() {
  return count;
}

// a.mjs
import { count, add, get } from './b.mjs';
console.log(count);    // 1
add();
console.log(count);    // 2
console.log(get());    // 2
```
如果用commonjs实现的话
``` js
// a.js
let count = 1;
module.exports = {
  count,
  add() {
    count++;
  },
  get() {
    return count;
  }
};

// index.js
const { count, add, get } = require('./a.js');
console.log(count);    // 1
add();
console.log(count);    // 1
console.log(get());    // 2
```

## 包安装机制
当我们发出npm install命令，先查询node_modules目录之中是否已经存在指定模块，若存在，不再重新安装，若不存在：npm 向
registry 查询模块压缩包的网址;下载压缩包，存放在根目录下的.npm目录里;解压压缩包到当前项目的node_modules目录

输入 npm install 命令并敲下回车后，会经历如下几个阶段（以 npm 5.5.1 为例）：

- 执行工程自身 preinstall，如果当前 npm 工程如果定义了 preinstall 钩子此时会被执行

- 首先需要做的是确定工程中的首层依赖，也就是 dependencies 和 devDependencies 属性中直接指定的模块（假设此时没有
添加 npm install 参数）;工程本身是整棵依赖树的根节点，每个首层依赖模块都是根节点下面的一棵子树，npm 会开启多进程从
每个首层依赖模块开始逐步寻找更深层级的节点;

- 获取模块是一个递归的过程，分为以下几步：
1. 获取模块信息。在下载一个模块之前，首先要确定其版本，这是因为 package.json 中往往是 semantic version（semver，语
义化版本）。此时如果版本描述文件（npm-shrinkwrap.json 或 package-lock.json）中有该模块信息直接拿即可，如果没有则从
仓库获取。如 packaeg.json 中某个包的版本是 ^1.1.0，npm 就会去仓库中获取符合 1.x.x 形式的最新版本
2. 获取模块实体。上一步会获取到模块的压缩包地址（resolved 字段），npm 会用此地址检查本地缓存，缓存中有就直接拿，如果没有则从仓库下载
3. 查找该模块依赖，如果有依赖则回到第1步，如果没有则停止

- 模块扁平化（dedupe）上一步获取到的是一棵完整的依赖树，其中可能包含大量重复模块。比如 A 模块依赖于 loadsh，B 模块同
样依赖于 lodash。在 npm3 以前会严格按照依赖树的结构进行安装，因此会造成模块冗余。从 npm3 开始默认加入了一个 dedupe 的
过程。它会遍历所有节点，逐个将模块放在根节点下面，也就是 node-modules 的第一层。当发现有重复模块时，则将其丢弃。这里需要
对重复模块进行一个定义，它指的是模块名相同且 semver 兼容。每个 semver 都对应一段版本允许范围，如果两个模块的版本允许范
围存在交集，那么就可以得到一个兼容版本，而不必版本号完全一致，这可以使更多冗余模块在 dedupe 过程中被去掉

``` js
//举个例子，假设一个依赖树原本是这样：
node_modules
-- foo
---- lodash@version1

-- bar
---- lodash@version2

//假设 version1 和 version2 是兼容版本，则经过 dedupe 会成为下面的形式：
node_modules
-- foo

-- bar

-- lodash（保留的版本为兼容版本）

// 假设 version1 和 version2 为非兼容版本，则后面的版本保留在依赖树中：
node_modules
-- foo
-- lodash@version1

-- bar
---- lodash@version2
```
- 当前 npm 工程如果定义了钩子此时会被执行（按照 install、postinstall、prepublish、prepare 的顺序）。最后一步是生成或更新版本描述文件，npm install 过程完成



