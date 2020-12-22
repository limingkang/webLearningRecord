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






































