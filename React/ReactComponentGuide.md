# React 组件规范

摘自 https://segmentfault.com/a/1190000010832044。     

1.  有状态组件只有render方法才能返回JSX，因为JSX中的虚拟DOM有一个\_owner属性，这与它与组件实例进行绑定。如果其他方法里使用了JSX，_owner就没有与组件实例进行绑定。   
2.  render方法里面应该以<开头，不应该存在if else分支，视情况返回不同的JSX。相同的组件应该返回相同的顶级元素容器。   
3. 不要在componentWillUpdate/componentDidUpdate/render中执行setState, 可能异致死循环。
4. 不要在JSX中使用bind方法绑定组件实例


