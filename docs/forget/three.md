## 文本溢出
多行文本溢出,有兼容问题ie8什么的会换行
``` css
{
  overflow: hidden; 
  text-overflow: ellipsis; 
  display: box; 
  display: -webkit-box; 
  line-clamp: 2; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
}
```
单行文本溢出
``` css
{
  overflow: hidden; 
  text-overflow: ellipsis; 
  display: block;
  white-space:nowrap;
}
```

## 三条杆效果
``` css
{
  .contain {
      width:120px;
      height:20px;
      border-top:20px double;
      border-bottom:20px solid;
  }
}
```

## 加号点击更多
实现加号点击更多的效果,以及移动上去颜色渐变的效果，注意border-color的颜色默认继承color的颜色
``` css
.add {
  color:#333;
  transition:color .25s;
  border:1px solid;
}
.add:before {
  border-top:10px solid;
}
.add:after {
  border-left:10px solid;
}
.add:hover {
  color:#06c;
}
```

## 三角形
各种斜的三角等，写上相应的部分transparent即可,当宽高不是0的时候实际上是梯形,实际使用的时候最好使用
before和after等伪元素来插入一个节点，可减少html结构
``` css
.triangle {
  width:0px;
  height:0px;
  border:100px solid;
  border-color:red green black yellow;
}
```

## 提交中点点点效果
`<a href="javascript:" class="grebtn">订单提交中<span class="dotting"></span></a>`
``` css
.dotting {
    display: inline-block; width: 10px; min-height: 2px;
    padding-right: 2px;
    border-left: 2px solid currentColor; border-right: 2px solid currentColor;
    background-color: currentColor; background-clip: content-box;
    box-sizing: border-box;
    -webkit-animation: dot 4s infinite step-start both;
    animation: dot 4s infinite step-start both;
    *zoom: expression(this.innerHTML = '...'); /* IE7 */
}
.dotting:before { content: '...'; } /* IE8 */
.dotting::before { content: ''; }
:root .dotting { margin-left: 2px; padding-left: 2px; } /* IE9+ */
@-webkit-keyframes dot {
    25% { border-color: transparent; background-color: transparent; }
    50% { border-right-color: transparent; background-color: transparent; }
    75% { border-right-color: transparent; }
}
@keyframes dot {
    25% { border-color: transparent; background-color: transparent; }
    50% { border-right-color: transparent; background-color: transparent; }
    75% { border-right-color: transparent; }
}
```

[css trick](https://css-tricks.com/archives/);
[创意库](https://www.ideacool.net/);
[behance](https://www.behance.net/search?search=web%20design);
















