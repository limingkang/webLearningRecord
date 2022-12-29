## 防抖函数
``` js
function bound(fn, time = 300) {
  let cleartimer;
  return function(...arguments) {
    if (cleartimer) {
      clearTimeout(cleartimer)
    }
    cleartime = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
}
```

## 节流函数
``` js
function throtte(fn, time=300) {
  let can = true;
  return function(...args) {
    if (!can) return;
    can = false;
    setTimeout(() => {
      can = true;
      fn.apply(this, args);
    }, time)
  }
}
```

## new
``` js
function myNew() {
  const obj = {};
  const constructFn = [].shift.call(arguments);
  obj.__proto__ = constructFn.prototype;
  const parmas = arguments;
  const res = constructFn.apply(obj, params);
  return res instanceOf Object ? res : obj;
}
```

## const实现原理
``` js
var __const = function __const (data, value) {
  window.data = value // 把要定义的data挂载到window下，并赋值value
  // 利用Object.defineProperty的能力劫持当前对象，并修改其属性描述符
  Object.defineProperty(window, data, {
    enumerable: false,
    configurable: false,
    get: function () {
      return value
    },
    set: function (data) {
      if (data !== value) { // 当要对当前属性进行赋值时，则抛出错误！
        throw new TypeError('Assignment to constant variable.')
      } else {
        return value
      }
    }
  })
}
__const('a', 10)
console.log(a)
delete a
console.log(a)
// 因为const定义的属性在global下也是不存在的，所以用到了enumerable: false来模拟这一功能
for (let item in window) {
  if (item === 'a') { // 因为不可枚举，所以不执行
    console.log(window[item])
  }
}
a = 20 // 报错
```

## bind函数实现
``` js
Function.prototype.selfBind = function(that, ...arg) {
  const fn = this;
  const newFn = function(...parmas) {
    // bind返回后的函数还能用来new 此时会忽略传给bind的this
    if (this instanceof newFn) {
      fn.apply(this, arg.concat.parmas);
    } else {
      fn.apply(that, arg.concat.parmas);
    }
  }
  newFn.prototype = Object.create(fn.prototype);
  return newFn;
}
```

## call函数实现
``` js
Function.prototype.selfCall = function(that, ...args) {
  const fn = this;
  const key = Symbol('key');
  that[key] = fn;
  const res = that[key](...args);
  delete that[key];
  return res;
}
```

## apply函数实现
``` js
Function.prototype.selfApply = function(that, args) {
  const fn = this;
  const key = Symbol('key');
  that[key] = fn;
  let res;
  if (args && args.length > 0) {
    res = that[key](...args);
  } else {
    res = that[key]();
  }
  delete that[key];
  return res;
}
```

## deepCopy
JSON.parse(JSON.stringify(obj))我们一般用来深拷贝的问题
- 如果obj里面有时间对象，则JSON.stringify后再JSON.parse的结果，时间将只是字符串的形式。而不是时间对象
- 如果obj里有RegExp、Error对象，则序列化的结果将只得到空对象
- 如果obj里有函数，undefined，则序列化的结果会把函数或 undefined丢失
- 如果obj里有NaN、Infinity和-Infinity，则序列化的结果会变成null
- JSON.stringify()只能序列化对象的可枚举的自有属性，例如 如果obj中的对象是有构造函数生成的， 则使用JSON.parse(JSON.stringify(obj))深拷贝后，会丢弃对象的constructor
``` js
function deepCopy(obj, cache = new WeakMap) {
  if (!obj instanceof Object) return obj
  // 防止循环引用
  if (cache.get(obj)) return cache.get(obj)
  // 支持函数
  if (obj instanceof Function) {
    return function () {
      return obj.apply(this, arguments)
    }
  }
  // 支持日期
  if (obj instanceof Date) return new Date(obj)
  // 支持正则对象
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags)
  // 还可以增加其他对象，比如：Map, Set等，根据情况判断增加即可，面试点到为止就可以了
  // 数组是 key 为数字素银的特殊对象
  const res = Array.isArray(obj) ? [] : {}
  // 缓存 copy 的对象，用于处理循环引用的情况
  cache.set(obj, res)
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Object) {
      res[key] = deepCopy(obj[key], cache)
    } else {
      res[key] = obj[key]
    }
  });
  return res
}
```

## 发布订阅模式
``` js
class EventEmitter {
  constructor() {
    this.cache = {}
  }
  on(name, fn) {
    if (this.cache[name]) {
      this.cache[name].push(fn)
    } else {
      this.cache[name] = [fn]
    }
  }
  off(name, fn) {
    const tasks = this.cache[name]
    if (tasks) {
      const index = tasks.findIndex((f) => f === fn || f.callback === fn)
      if (index >= 0) {
        tasks.splice(index, 1)
      }
    }
  }
  emit(name) {
    if (this.cache[name]) {
      // 创建副本，如果回调函数内继续注册相同事件，会造成死循环
      const tasks = this.cache[name].slice()
      for (let fn of tasks) {
        fn();
      }
    }
  }
  emit(name, once = false) {
    if (this.cache[name]) {
      // 创建副本，如果回调函数内继续注册相同事件，会造成死循环
      const tasks = this.cache[name].slice()
      for (let fn of tasks) {
        fn();
      }
      if (once) {
        delete this.cache[name]
      }
    }
  }
}
```

## 函数柯里化与反柯里化
``` js
function curry(func) {
  return function curried(...args) {
    // 关键知识点：function.length 用来获取函数的形参个数
    // 补充：arguments.length 获取的是实参个数
    if (args.length >= func.length) {
      return func.apply(this, args)
    }
    return function (...args2) {
      return curried.apply(this, args.concat(args2))
    }
  }
}

// 测试
function sum (a, b, c) {
  return a + b + c
}
const curriedSum = curry(sum)
console.log(curriedSum(1, 2, 3))
console.log(curriedSum(1)(2,3))
console.log(curriedSum(1)(2)(3))
```
反柯里化,使得this指针泛化
``` js
Function.prototype.unCurrying = function () {
  var f = this;
  return function () {
    var a = arguments;
    return f.apply(a[0], [].slice.call(a, 1));
  };
};
var push = Array.prototype.push.unCurrying(),
obj = {};
push(obj, 'first', 'two');
console.log(obj);            /*obj {0 : "first",1 : "two"}*/
(function(){
  push(arguments,4);
  console.log(arguments)     //[1,2,3,4]
})(1,2,3)
```

## es5实现继承
首先我们得知道es6中class的super表示父类构造函数，super()相当于a.prototype.constructor.call(this)
``` js
class ac{
 	constructor(){
		this.x = 1 
	}
	cout(){ 
		console.log(this.x);
	 }
}
class bc extends ac{
	constructor(){
		super();
		this.c = 2 
	}
	bd(){
		super.cout();
	}
}

var c = new bc();  
console.log(c);

// 最终会生成以下对象
{
  x: 1,
  c: 2,
  __proto__ : {
    bd: ƒ bd()
    constructor: class bc
    __proto__ : {
      cout: ƒ cout()
      constructor: class ac
      __proto__: {}
    }
  }
}
```
通过上面我们可以知道class的继承最终都是通过原型继承的d
``` js
function creat(params) {
  let f = function() {};
  f.prototype = params;
  return new f();
}
function parent(xx) {
  this.x = xx;
}
parent.prototype.myown = function() {};
function child(name, xx) {
  parent.call(this, xx);
  this.b = name;
}
child.prototype = creat(parent.prototype);
child.prototype.constructor = child;
child.prototype.sayAge = function () {
  console.log(this.name)
}
let a = new child(1,2);
```

## instanceOf
``` js
function isInstanceOf(instance, klass) {
  let proto = instance.__proto__
  let prototype = klass.prototype
  while (true) {
    if (proto === null) return false
    if (proto === prototype) return true
    proto = proto.__proto__
  }
}
```

## 异步的串行和并行实现
``` js
function asyncAdd(a, b, callback) {
  setTimeout(function () {
    callback(null, a + b);
  }, 500);
}
// 解决方案
// 1. promisify
const promiseAdd = (a, b) => new Promise((resolve, reject) => {
  asyncAdd(a, b, (err, res) => {
    if (err) {
      reject(err)
    } else {
      resolve(res)
    }
  })
})
// 2. 串行处理
async function serialSum(...args) {
  return args.reduce((task, now) => task.then(res => promiseAdd(res, now)), Promise.resolve(0))
}
// 3. 并行处理
async function parallelSum(...args) {
  if (args.length === 1) return args[0]
  const tasks = []
  for (let i = 0; i < args.length; i += 2) {
    tasks.push(promiseAdd(args[i], args[i + 1] || 0))
  }
  const results = await Promise.all(tasks)
  return parallelSum(...results)
}
// 测试
(async () => {
  console.log('Running...');
  const res1 = await serialSum(1, 2, 3, 4, 5, 8, 9, 10, 11, 12)
  console.log(res1)
  const res2 = await parallelSum(1, 2, 3, 4, 5, 8, 9, 10, 11, 12)
  console.log(res2)
  console.log('Done');
})()
```

## vue reactive
``` js
// Dep module
class Dep {
  static stack = []
  static target = null
  deps = null
  
  constructor() {
    this.deps = new Set()
  }

  depend() {
    if (Dep.target) {
      this.deps.add(Dep.target)
    }
  }

  notify() {
    this.deps.forEach(w => w.update())
  }

  static pushTarget(t) {
    if (this.target) {
      this.stack.push(this.target)
    }
    this.target = t
  }

  static popTarget() {
    this.target = this.stack.pop()
  }
}

// reactive
function reactive(o) {
  if (o && typeof o === 'object') {
    Object.keys(o).forEach(k => {
      defineReactive(o, k, o[k])
    })
  }
  return o
}

function defineReactive(obj, k, val) {
  let dep = new Dep()
  Object.defineProperty(obj, k, {
    get() {
      dep.depend()
      return val
    },
    set(newVal) {
      val = newVal
      dep.notify()
    }
  })
  if (val && typeof val === 'object') {
    reactive(val)
  }
}

// watcher
class Watcher {
  constructor(effect) {
    this.effect = effect
    this.update()
  }

  update() {
    Dep.pushTarget(this)
    this.value = this.effect()
    Dep.popTarget()
    return this.value
  }
}

// 测试代码
const data = reactive({
  msg: 'aaa'
})

new Watcher(() => {
  console.log('===> effect', data.msg);
})

setTimeout(() => {
  data.msg = 'hello'
}, 1000)
```

## 数组扁平化
``` js
// 方案 1
function recursionFlat(ary = []) {
  const res = []
  ary.forEach(item => {
    if (Array.isArray(item)) {
      res.push(...recursionFlat(item))
    } else {
      res.push(item)
    }
  })
  return res
}
// 方案 2
function reduceFlat(ary = []) {
  return ary.reduce((res, item) => res.concat(Array.isArray(item) ? reduceFlat(item) : item), [])
}
```

## 对象扁平化
``` js
function objectFlat(obj = {}) {
  const res = {}
  function flat(item, preKey = '') {
    Object.entries(item).forEach(([key, val]) => {
      const newKey = preKey ? `${preKey}.${key}` : key
      if (val && typeof val === 'object') {
        flat(val, newKey)
      } else {
        res[newKey] = val
      }
    })
  }
  flat(obj)
  return res
}
```

## 图片懒加载
``` js
// <img src="default.png" data-src="https://xxxx/real.png">
function isVisible(el) {
  const position = el.getBoundingClientRect()
  const windowHeight = document.documentElement.clientHeight
  // 顶部边缘可见
  const topVisible = position.top > 0 && position.top < windowHeight;
  // 底部边缘可见
  const bottomVisible = position.bottom < windowHeight && position.bottom > 0;
  return topVisible || bottomVisible;
}
function imageLazyLoad() {
  const images = document.querySelectorAll('img')
  for (let img of images) {
    const realSrc = img.dataset.src
    if (!realSrc) continue
    if (isVisible(img)) {
      img.src = realSrc
      img.dataset.src = ''
    }
  }
}
// 测试
window.addEventListener('load', imageLazyLoad)
window.addEventListener('scroll', imageLazyLoad)
// or
window.addEventListener('scroll', throttle(imageLazyLoad, 1000))
```

## 大文件分段上传
``` js
var bytesPerPiece = 1024 * 1024; // 每个文件切片大小定为1MB .
var totalPieces;
//发送请求
function upload() {
  var blob = document.getElementById("file").files[0];
  var start = 0;
  var end;
  var index = 0;
  var filesize = blob.size;
  var filename = blob.name;

  //计算文件切片总数
  totalPieces = Math.ceil(filesize / bytesPerPiece);
  while(start < filesize) {
    end = start + bytesPerPiece;
    if(end > filesize) {
        end = filesize;
    }
    var chunk = blob.slice(start,end);//切割文件    
    var sliceIndex= blob.name + index;
    var formData = new FormData();
    formData.append("file", chunk, filename);
    $.ajax({
        url: 'http://localhost:9999/test.php',
        type: 'POST',
        cache: false,
        data: formData,
        processData: false,
        contentType: false,
    }).done(function(res){ 
      // empty
    }).fail(function(res) {
      // empty
    });
    start = end;
    index++;
  }
}
```

## 模拟实现koa中间件
``` js
// 注意其中的compose函数，这个函数是实现中间件洋葱模型的关键
// 场景模拟
// 异步 promise 模拟
const delay = async () => {
 return new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve();
  }, 2000);
 });
}
// 中间间模拟
const fn1 = async (ctx, next) => {
 console.log(1);
 await next();
 console.log(2);
}
const fn2 = async (ctx, next) => {
 console.log(3);
 await delay();
 await next();
 console.log(4);
}
const fn3 = async (ctx, next) => {
 console.log(5);
}
const middlewares = [fn1, fn2, fn3];
// compose 实现洋葱模型
const compose = (middlewares, ctx) => {
 const dispatch = (i) => {
 let fn = middlewares[i];
 if(!fn){ return Promise.resolve() }
  return Promise.resolve(fn(ctx, () => {
    return dispatch(i+1);
  }));
 }
 return dispatch(0);
}
compose(middlewares, 1);
```




















