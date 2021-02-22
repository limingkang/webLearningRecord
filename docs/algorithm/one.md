## 组合总和
一个不重复的数组，其内部数字求和为target，内部数字可以重复多次，输出其所有组合例如：
`[2,4,6] ===> [ [2,2,2], [2,4], [6], ]`
使用回溯加减枝可以解决，我们优先深度遍历(dfs)，可以先画出二叉树的图方便理解
``` js
const algorithm = function(array, target) {
  let sum = 0;
  const res = [];
  function dfs(start, temp) {
    if(sum>= target) {
      if(sum === target) {
        res.push(temp.slice());
      }
      return;
    }
    for(var i = start; i<array.length; i++) {
      temp.push(array[i]);
      sum+=array[i];
      dfs(i,temp);
      sum-=array[i];
      temp.pop();
    }
  }
  dfs(0, []);
  return res;
}
```

## 排序
``` js
// 二分法
var quicksort = function(arr){
  if(arr.length <= 1){
    return arr;
  }
  var pivotIndex = Math.floor(arr.length / 2);
  var pivot = arr.splice(pivotIndex,1)[0];
  var left = [];
  var right = [];
  for(var i = 0;i < arr.length;i++){
    if(arr[i] < pivot){
      left.push(arr[i]);
    }else{
      right.push(arr[i]);
    }
  }
  return quicksort(left).concat([pivot],quicksort(right));
};

var array = [8,7,0,7,5,2,5,3,1];
quicksort(array); //[0,1,2,3,5,5,7,7,8]

// 冒泡
//两层for循环，假如每一次if条件都满足，就是需要执行 n * (n-1) * 3 次， 取最高次项后常数系数变为1之后可以得到时间复杂度为O(n^2)
/**
* @param {Array} arr 待排序数组
* @returns {Array}
*/
function bubbleSort(arr) {
  for (var i = 0, len = arr.length; i < len;  i++) {
    for (var j = i + 1;  j < len;  j++) {
      if (arr[i] > arr[j]) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    }
  }
  return arr;
}

```

## 数字千分位处理
```  js
function formatNum(str,digit){
  // 要保留的小数位数默认两位
  var digit_number=digit||2;
  //对字符串或者数字进行保留两位四舍五入处理
  str=parseFloat(str).toFixed(digit_number).toString();  
  var iffloat=str.indexOf(".")+1;
  var right=str.substr(iffloat);
  var left=str.substring(0,iffloat);
  left=left.replace(/(\d{3}(?!\.))/g,'$1,');
  return left+right;
}
```

## 整数逆序后的字符串
用 JavaScript 写一个函数，输入 int 型，返回整数逆序后的字符串。如：输入整型 1234，返回字符串“4321”。要求必须使用递
归函数调用，不能用全局变量，输入函数必须只有一个参数传入，必须返回字符串
``` js
function fun(num){
  let num1 = num / 10;
  let num2 = num % 10;
  if(num1<1){
    return num;
  }else{
    num1 = Math.floor(num1)
    return `${num2}${fun(num1)}`
  }
}
var a = fun(12345)
console.log(a)
console.log(typeof a)

const numToReverseStr_0 = num => {
    return num.toString().split('').reverse().join('');
}
```

## 获取随机数
考虑到性能问题，如何快速从一个巨大的数组中随机获取部分元素
``` js
var arr =[1,2,3,4...,1000];
var result = [];
var randomNum = 100;
for(var i = 0,i < randomNum,i++) {
   var luckyDog = Math.floor(Math.random() * (arr.length - i));
   result.push(arr[luckyDog]);
   // 当前元素替换成最后一个元素
   arr[luckyDog] = arr[arr.length - i - 1];
}
```

## z字形变换
将一个给定字符串根据给定的行数，以从上往下、从左到右进行 Z 字形排列，比如输入字符串为 "LEETCODEISHIRING" 行数为 3 时，排列如下
``` js
L   C   I   R
E T O E S I I G
E   D   H   N
```
之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如："LCIRETOESIIGEDHN"

- 以 V 字型为一个循环, 循环周期为 n = (2 * numRows - 2) （2倍行数 - 头尾2个）
- 对于字符串索引值i，计算 x = i % n 确定在循环周期中的位置
- 则行号 `y = min(x, n - x)`

``` js
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function(s, numRows) {
    if (numRows === 1) return s;
    const rows = new Array(numRows).fill("");
    const n = 2 * numRows - 2;
    for(let i = 0; i < s.length; i++) {
        const x = i % n;
        rows[Math.min(x, n - x)] += s[i];
    }
    return rows.join("");
};
```

## 整数和罗马数互转
罗马数字包含以下七种字符： I， V， X， L，C，D 和 M;通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例
如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表
示为 IX。这个特殊的规则只适用于以下六种情况：
- I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9
- X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90
- C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900

给定一个整数，将其转为罗马数字。输入确保在 1 到 3999 的范围内？例如：

输入: 1994
输出: "MCMXCIV"
解释: M = 1000, CM = 900, XC = 90, IV = 4

输入: 58
输出: "LVIII"
解释: L = 50, V = 5, III = 3.

``` js
var intToRoman = function(num) {
  let nums=[1000,900,500,400,100,90,50,40,10,9,5,4,1],
      chars=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result='';
  while(num){
      if(num>=nums[0]){
          result+=chars[0];
          num-=nums[0];
      }else{
          nums.shift();
          chars.shift();
      }
  }
  return result;
};
var romanToInt = function(s) {
  let o = {
    'I':1,
    'V':5,
    'X':10,
    'L':50,
    'C':100,
    'D':500,
    'M':1000
  },
  n = 0;
  for(let i=0,len=s.length; i<len; i++){
      const temp = o[s[i]]
      if( i < len - 1 &&  temp < o[s[i+1]] ){
          n -= temp
      }else{
          n += temp
      }
  }
  return n
};
```

## 两个日期中的有效日期
``` js
function rangeDate(startDate, endDate) {
  let start_ = new Date(startDate).getTime();
  let end_ = new Date(endDate).getTime();
  let day = 24 * 60 * 60 * 1000;
  let arr = [];
  for (let i = start_; i <= end_; i += day) {
    arr.push(i);
  }
  return arr.map(item => {
    let date = new Date(item);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let day = date.getDate();
    return `${year}-${month}-${day}`;
  });
}
console.log(rangeDate("2015-2-8", "2015-3-3"));
```

## 最长公共前缀
``` js
function long(params) {
  let start = params.shift();
  start = start.split('');
  let str = '';
  let res = '';
  for (let i = 0 ; i< start.length; i++) {
    str += start[i];
    let flag = true;
    for (let j = 0 ; j< params.length; j++) {
      if(params[j].indexOf(str) === -1) {
        flag = false;
        break;
      }
    }
    if (!flag) {
      str = str.substring(1);
    } else {
      if (str.length > res.length) {
        res = str;
      }
    }
  }
  return res;
}
```

## 电话号码的字母数字组合
如同老式的电话一样，一个数字对应几个字母，找出一串数字对应的所有字母排列可能
``` js
// 回溯法dfs
const letterCombinations = (digits) => {
  if (digits.length == 0) return [];
  const res = [];
  const map = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };

  const dfs = (curStr, i) => {      // curStr是当前字符串，i是扫描的指针
    if (i > digits.length - 1) {    // 指针越界，递归的出口
      res.push(curStr);             // 将解推入res
      return;                       // 结束当前递归分支，进入另一个递归分支
    }
    const letters = map[digits[i]]; // 当前数字对应有哪些字母
    for (const l of letters) {      // 不同的字母选择代表不同的递归分支
      dfs(curStr + l, i + 1);       // 生成新字符串，i指针右移，递归
    }
  };
  dfs('', 0); // 递归的入口，初始字符串为''，指针为0
  return res;
};
```

## 四数之和
给定一个包含 n 个整数的数组 nums 和一个目标值 target，判断 nums 中是否存在四个元素 a，b，c 和 d ，使得
a + b + c + d 的值与 target 相等？找出所有满足条件且不重复的四元组
``` js
const algorithm = function(array, target) {
  let sum = 0;
  const res = [];
  array.sort((a, b) => a - b);
  function dfs(start, temp) {
    if(sum === target && temp.length === 4) {
      res.push(temp.slice());
      return;
    }
    let r;
    for(var i = start; i<array.length; i++) {
      if(r === array[i]) continue;
      r = array[i];
      temp.push(array[i]);
      sum+=array[i];
      dfs(i+1,temp);
      sum-=array[i];
      temp.pop();
    }
  }
  dfs(0, []);
  return res;
}
```

## 有效的括号
给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串，判断字符串是否有效。有效字符串需满足：
- 左括号必须用相同类型的右括号闭合
- 左括号必须以正确的顺序闭合
- 注意空字符串可被认为是有效字符串
``` js
var isValid = function (s) {
  if (!s) return true
  const stack = []
  const JoinMap = {
    '{': '}',
    '(': ')',
    '[': ']',
  }
  for (let i = 0; i < s.length; i++) {
    let val = s[i]
    let tmp
    if (tmp = JoinMap[val]) {
      stack.push(tmp)
    } else {
      if (val !== stack.pop()) {
          return false
      }
    }
  }
  return !stack.length
};
```

## 括号生成
数字 n 代表生成括号的对数，请你设计一个函数，用于能够生成所有可能的并且 有效的 括号组合
``` js
// 例如输入：n = 3
// 输出：[
//   "((()))",
//   "(()())",
//   "(())()",
//   "()(())",
//   "()()()"
// ]
// 使用回溯加剪枝
var generateParenthesis = function (n) {
  const res = [];

  const dfs = (lRemain, rRemain, str) => { // 左右括号所剩的数量，str是当前构建的字符串
    if (str.length == 2 * n) { // 字符串构建完成
      res.push(str);           // 加入解集
      return;                  // 结束当前递归分支
    }
    if (lRemain > 0) {         // 只要左括号有剩，就可以选它，然后继续做选择（递归）
      dfs(lRemain - 1, rRemain, str + "(");
    }
    if (lRemain < rRemain) {   // 右括号比左括号剩的多，才能选右括号
      dfs(lRemain, rRemain - 1, str + ")"); // 然后继续做选择（递归）
    }
  };

  dfs(n, n, ""); // 递归的入口，剩余数量都是n，初始字符串是空串
  return res;
};
```
回溯，死抓三个要点
- 回溯，死抓三个要点
  - 每次最多两个选择，要么左括号，要么右括号，“选择” 会展开出一棵解的空间树
  - 用 DFS 的方式遍历这棵树，找出所有的解，这个过程叫回溯
- 约束条件
  - 什么情况可以选左括号，什么情况下可以选右括号，是约束条件
  - 利用约束做“剪枝”，即，去掉不会产生解的选项，即，剪去不会通往合法解的分支
``` js
// 比如()，现在左右括号各剩一个，再选)就成了())，这是错的选择，通过判断不让它成为选项（不让它落入递归）：
if (right > left) { // 右括号剩的比较多，才能选右括号
  dfs(str + ')', left, right - 1);
}
```
- 目标
  - 构建出一个用尽 n 对括号的合法括号串
  - 意味着，当构建的长度达到 2*n，就可以结束递归（不用继续选了）

经过了充分的剪枝，所有不会通往合法解的选项，都被干掉，只要往下递归，都通向合法解。即，只要递归到：当构建的字符串的长度
达 2*n 时，一个合法解就生成了，直接加入解集即可


## 两两交换链表中节点
给定一个链表，两两交换其中相邻的节点，并返回交换后的链表。你不能只是单纯的改变节点内部的值，而是需要实际的进行节点交换，
链表对于js就是对象中有个next指向下一个节点
``` js
var swapPairs = function(head) {
    if (head === null|| head.next === null) {
        return head;
    }
    const newHead = head.next;
    head.next = swapPairs(newHead.next);
    newHead.next = head;
    return newHead;
};
```

## 串联所有单词的子串
给定一个字符串 s 和一些长度相同的单词 words。找出 s 中恰好可以由 words 中所有单词串联形成的子串的起始位置。注意子串
要与 words 中的单词完全匹配，中间不能有其他字符，但不需要考虑 words 中单词串联的顺序，
``` js
// 输入：
//   s = "barfoothefoobarman",
//   words = ["foo","bar"]
// 输出：[0,9]
// 从索引 0 和 9 开始的子串分别是 "barfoo" 和 "foobar"，输出的顺序不重要, [9,0] 也是有效答案
/**
 * @param {string} s
 * @param {string[]} words
 * @return {number[]}
 */
var findSubstring = function(s, words) {
  const wordSize = words[0].length
  const substringLen = wordSize * words.length
  const wordsCount = {}
  words.forEach(w => (wordsCount[w] = (wordsCount[w] || 0) + 1))
  const res = []
  for (let i = 0; i <= s.length - substringLen; i++) {
    const tempCount = {...wordsCount}
    let count = words.length
    for (let j = i; j < i + substringLen; j += wordSize) {
      const word = s.slice(j, j + wordSize)
      if (!(word in tempCount) || tempCount[word] <= 0) break
      tempCount[word]--
      count--
    }
    if (count === 0) res.push(i)
  }
  return res
};
```

## 排序数组中找元素第一和最后一个位置
直观的思路肯定是从前往后遍历一遍。用两个变量记录第一次和最后一次遇见 \textit{target}target 的下标，但这个方法的时间
复杂度为 O(n)，没有利用到数组升序排列的条件。由于数组已经排序，因此整个数组是单调递增的，我们可以利用二分法来加速查找的
过程。考虑target开始和结束位置，其实我们要找的就是数组中「第一个等于target 的位置」（记为leftIdx）和「第一个大于target
的位置减一1」（记为rightIdx）

二分查找中，两者的判断条件不同，为了代码的复用，我们定义binarySearch(nums, target, lower) 表示在nums 数组中二分查
找target 的位置，如果lower为true，则查找第一个大于等于target 的下标，否则查找第一个大于target 的下标

最后，因为target 可能不存在数组中，因此我们需要重新校验我们得到的两个下标leftIdx和rightIdx，看是否符合条件，如果符合
条件就返回`[leftIdx,rightIdx]`，不符合就返回`[−1,−1]`
``` js
const binarySearch = (nums, target, lower) => {
  let left = 0, right = nums.length - 1, ans = nums.length;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] > target || (lower && nums[mid] >= target)) {
      right = mid - 1;
      ans = mid;
    } else {
      left = mid + 1;
    }
  }
  return ans;
}
var searchRange = function(nums, target) {
  let ans = [-1, -1];
  const leftIdx = binarySearch(nums, target, true);
  const rightIdx = binarySearch(nums, target, false) - 1;
  if (leftIdx <= rightIdx && rightIdx < nums.length && nums[leftIdx] === target && nums[rightIdx] === target) {
    ans = [leftIdx, rightIdx];
  } 
  return ans;
};
```

## 广度优先深度优先遍历
对于算法来说 无非就是时间换空间 空间换时间
- 深度优先不需要记住所有的节点, 所以占用空间小, 而广度优先需要先记录所有的节点占用空间大
- 深度优先有回溯的操作(没有路走了需要回头)所以相对而言时间会长一点
- 深度优先采用的是堆栈的形式, 即先进后出
- 广度优先则采用的是队列的形式, 即先进先出
``` js
const data = [
    {
        name: 'a',
        children: [
            { name: 'b', children: [{ name: 'e' }] },
            { name: 'c', children: [{ name: 'f' }] },
            { name: 'd', children: [{ name: 'g' }] },
        ],
    },
    {
        name: 'a2',
        children: [
            { name: 'b2', children: [{ name: 'e2' }] },
            { name: 'c2', children: [{ name: 'f2' }] },
            { name: 'd2', children: [{ name: 'g2' }] },
        ],
    }
]
// 深度遍历, 使用递归
function getName(data) {
    const result = [];
    data.forEach(item => {
        const map = data => {
            result.push(data.name);
            data.children && data.children.forEach(child => map(child));
        }
        map(item);
    })
    return result.join(',');
}
// 广度遍历, 创建一个执行队列, 当队列为空的时候则结束
function getName2(data) {
    let result = [];
    let queue = data;
    while (queue.length > 0) {
        [...queue].forEach(child => {
            queue.shift();
            result.push(child.name);
            child.children && (queue.push(...child.children));
        });
    }
    return result.join(',');
}
console.log(getName(data))
console.log(getName2(data))
//a,b,e,c,f,d,g,a2,b2,e2,c2,f2,d2,g2
// a,a2,b,c,d,b2,c2,d2,e,f,g,e2,f2,g2 
```


[leetcode](https://leetcode-cn.com/problemset/all/);









