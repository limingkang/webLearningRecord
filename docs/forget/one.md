## js相等运算符==规则
`x == y`
- 如果x或者y不是正常值（比如抛出一个错误），中断执行
- 如果Type(x)与Type(y)相同，执行严格相等运算x === y
- undefined == null，返回true
- 如果是数字和字符串比较，则将字符串转换为数字之后进行比较(空字符串和"0"转化为数字时候都是0)
- 如果x和y其中有一个是布尔值，则把布尔值转换为数字，之后比较x == ToNumber(y)的结果
- 如果只有其中一个是对象，那就将对象转换为原始值之后进行比较x == ToPrimitive(y)

原始值转化规则为调用toString方法对于数组[],[0]都是变为"0"而[1,2,3]变为"1,2,3"，如果是对象则会转换为"[object Object]"
``` js
false==[]   //true
true==!![]   //true
alert(typeof NaN);   //弹出 'Number'
alert(NaN === NaN);  //为 false
```

## 正则表达式功能

正常情况下就是贪婪模式，就是直接按最多次匹配,如果在量词后面加上?就表示非贪婪模式，对应匹配到最小个数的值
``` js
'12345678'.replace(/\d{3,6}/g,'X')       //output: "X78"
'12345678'.replace(/\d{3,6}?/g,'X')       //output: "XX78"
'123456789'.match(/\d{3,5}?/g)       //output: ["123","456","789"]

'a1b2c3d4'.replace(/([a-z]\d){3}/g,"X")   //output: "Xd4"
// 量词最大作用是要给括号分组，这里没有括号的话就表示3个数字了
```

正则中或|的使用
``` js
'byroncasper'.replace(/byron|casper/g,"X")   //output:"XX"
'byronsperbyrcasper'.replace(/byr(on|ca)sper/g,"X")   //output:"XX"
```

分组中的反向引用
``` js
//没有括号的时候就表示$1这样的直接的字符串，有括号的时候就是会被捕获就是值，但是我们也可以在分组后面加?:就可以不被捕获
'2015-12-25'.replace(/(\d{4})-(\d{2})-(\d{2})/g,'$2/$3/$1')   //output:12/25/2015
'2015-12-25'.replace(/(?:\d{4})-(\d{2})-(\d{2})/g,'$2/$3/$1')  // output:25/$3/12
```

正向匹配?=和负向匹配?!
``` js
'a2cc'.replace(/\w(?=\d)/g,'X')     //output:'X2cc'
// 满足是字母而且后面是一个数字的情况，注意括号里面的不参与匹配，只有在前一个符合情况下才看匹配的那个后面是否符合

/^(?!\d+$)(?![a-zA-Z]+$)(?![!@#\$%\^\&\*+-]+$)[\w!@#\$%\^\&\*+-]{6,18}$/g
//开头结尾不全是数字出现一次多次,不全是字母出现一次多次,不全是特殊字符出现多次,且以字母数字特殊字符开头结尾的6到18位
```

lastIndex返回每次匹配的最后一个字符的下一位，以便下一次匹配（非全局模式下始终为0），最后没了的时候又重置为0.
所以为了使结果一样有时候这样写每一次都实例化一个正则，但是这耗内存(/\W/g).test('ab'),但是test只是为了检测用，所以
用这个方法的时候我们一般不用全局匹配
``` js
var reg1=/\w/;
var reg2=/\w/g;   //注意lastIndex是正则的属性
reg1.test('ab');  //无论执行多少次都是true,因为lastIndex值始终为0
console.log(reg1.lastIndex);      // 0
console.log(reg2.lastIndex);      // 0
console.log(reg2.test('ab'));     // true
console.log(reg2.lastIndex);      // 1
console.log(reg2.test('ab'));     // true
console.log(reg2.lastIndex);      // 2
console.log(reg2.test('ab'));     // false
console.log(reg2.lastIndex);      // 0
console.log(reg2.test('ab'));     // true
console.log(reg2.lastIndex);      // 1
console.log(reg2.test('ab'));     // true
console.log(reg2.lastIndex);      // 2
console.log(reg2.test('ab'));     // false
console.log(reg2.lastIndex);      // 0
while(reg2.test('ab')){
    console.log(reg2.lastIndex);   // 1 2
}
```

exec的用法
``` js
var reg3=/\d(\w)(\w)\d/;
var reg4=/\d(\w)(\w)\d/g;
var ts='$1ab2bb3cy4dd5ee';
var ret=reg3.exec(ts);
console.log(ret);             //["1ab2", "a", "b", index: 1, input: "$1ab2bb3cy4dd5ee"]
console.log(ret.index);       // 1
console.log(ret[0]);          // "1ab2"
console.log(ret.toString());  //"1ab2,a,b"    这是一个字符串
// 其中ret是一个对象数组，第一个表示匹配到的值，后面是对应的分组匹配到的值，有几个分组，就有几个这个值，index值对应
// 匹配到的字符串的开始位置，input对应你要查询的原字符串

while(reg4.exec(ts)){
    console.log(reg4.lastIndex + ret.index + ret.toString());
}
//"5 1 1ab2,a,b"     "11 7 3cy4,c,y"     注意全局模式下贪婪匹配到最后一个
```

search方法
``` js
'a1b2c3d1'.search('1')     //output:1
// search方法用于查找返回匹配到的字符串的开始位置没找到就返回-1,这个方法忽略/g标志
// 实际上对于字符串的像split,replace等方法最终都是隐式转换为正则表达式的
'a,b,c,d'.split(',')会被转换为'a,b,c,d'.split(/,/g)输出['a','b','c','d']
'a1b2c3d4'.split(/\d/g)以数字为分隔符输出数组['a','b','c','d']
```

match方法
``` js
var reg3=/\d(\w)\d/;
var reg4=/\d(\w)\d/g;
var ts='$1a2b3c4d5e';
var ret=ts.match(reg3);
console.log(ret);             //["1a2", "3c4",index: 1, input: "$1a2b3c4d5e"]
console.log(ret.index);       //  1
console.log(ret[0]);          // "1a2"
console.log(ret.toString());  //"1a2,3c4"    这是一个字符串
// match方法非全局模式下返回值和exec一样，没有匹配到的时候返回null
var ret2=ts.match(reg4);
console.log(ret2);             //["1a2", "3c4"]
console.log(ret2.index);       //  undefined
console.log(ret2[0]);          // "1a2"
// 全局模式下只是返回匹配值的对象数组，没有就返回null，这个功能比exec弱一些，但是速度快一些

// match代表匹配到的项，所以依次输出"1b2"  "3d4",最终返回的字符串是"a12c345e"
// group1,group2,group3代表匹配下的分组，没有分组的时候就没有几个分组值的参数
// index代表匹配到的开始位置，origin代表原始字符串
'a1b2c3d45e'.replace(/(\d)(\w)(\d)/g,function(match,group1,group2,group3,index,origin){
    console.log(match);
    return group1+group3;
})
```

## 杂物
undefined 在 ES5 中已经是全局对象的一个只读（read - only）属性了，它不能被重写。但是在局部作用域中，还是可以被重写的；
void 运算符能对给定的表达式进行求值，然后返回 undefined。也就是说，void 后面你随便跟上一个表达式，返回的都是 undefined，
如 void (2), void (‘hello’) 。并且void是不能被重写的。但为什么是void 0 呢，void 0 是表达式中最短的。用 void 0 代
替 undefined 能节省字节。不少 JavaScript压缩工具在压缩过程中，正是将 undefined 用 void 0 代替掉了










