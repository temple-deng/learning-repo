# Web Animation 文档 2020.08.18 版本

## 1 Introduction

Web Animation 模型的目的是为了给 CSS Transitions, CSS Animations 和 SVG 动画提供支撑。
因此理论上 Web Animation API 是可以访问到这三种变化的。    

## 3 Web Animations model overview

两个模型的角色如下：    

- Timing model: 接受一个时刻的时间然后将其转换为一次动画迭代中的一个比例距离，即迭代的进度
iteration progress。与此同时还有一个迭代的索引值生成 iteration index，因为可能每次动画不是
简单的重复。    
- Animation model：接受 Timing model 生成的迭代进度和迭代索引做参数，将其转换为一系列值，
将这些值应用到目标属性上    

即以时间为输入交给 timing moel 处理，然后生成一个动画的当前进度和索引，然后将这两个值再交给
animation model 处理，生成应用值。   

例如有一个这样的动画：   

- 3s 后开始
- 执行两次
- 每次执行 2s
- 将矩形的宽度从 50px 变化到 100px    

前3个数据都是 timing model 的输入，在 6s 后，计算出一个 0.5 的进度，然后 animation model 
用这个 0.5 去计算宽度。   

## 4 Timing model

### 4.1 Timing model overview

可以用两个词来形容 timing model: stateless 和 hierarchical（分层的）。   

stateless：有点类似于无副作用的函数，接受一个时间做输入，输出一个迭代进度。   

hierarchical：意思是每个动画都有一系列的步骤，在每一步上，时间可以前后移动、缩放、反转、暂停
和重复。    

### 4.2 Time values

Timing 基于时间节点间的级联关系。父节点会以 time values 的形式向子节点提供 timing 信息。   

time values 是一个从某个时间点开始的一个时间值，ms 单位。    

### 4.3 Timelines

timeline 提供了用于同步的源 time value 值。   

timeline 可能处于以下的4种阶段之一：   

1. inactive
2. before
3. active
4. after    

卧槽，太难了，读不懂