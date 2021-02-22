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

## BFC
BFC 就是块级格式上下文，是页面盒模型布局中的一种 CSS 渲染模式，相当于一个独立的容器，里面的元素和外部的元素相互不影响。创建 BFC 的方式有：
- html 根元素
- float 浮动
- 绝对定位
- overflow 不为 visiable
- display 为表格布局或者弹性布局

BFC 主要的作用是：
- 清除浮动
- 防止同一 BFC 容器中的相邻元素间的外边距重叠问题

**FFC（Flex formatting contexts）:自适应格式上下文**display值为flex或者inline-flex的元素将会生成自适应容器（flex container），
可惜这个牛逼的属性只有谷歌和火狐支持，不过在移动端也足够了，至少safari和chrome还是OK的，毕竟这俩在移动端才是王道。Flex Box 由
伸缩容器和伸缩项目组成。通过设置元素的 display 属性为 flex 或 inline-flex 可以得到一个伸缩容器。设置为 flex 的容器被渲染为一个
块级元素，而设置为 inline-flex 的容器则渲染为一个行内元素。伸缩容器中的每一个子元素都是一个伸缩项目。伸缩项目可以是任意数量的。伸
缩容器外和伸缩项目内的一切元素都不受影响。简单地说，Flexbox 定义了伸缩容器内伸缩项目该如何布局


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
















