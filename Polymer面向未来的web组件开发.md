# Polymer面向未来的web组件开发

标签（空格分隔）： 读书笔记 

---

### 1.基础知识
```javascript
    
//控件生命周期的一个示例
    //禁用或启用元素
    function disable($el, disabled){
    	this.$el[disabled ? 'addClass' : 'removeClass']('disabled')
    		.find('input, textarea, select, button')
    		.prop('disabled', disabled);
    }

    //创建控件实例的构造函数
    function WidgetName(options){
    	this.options = $.extend({}, this.defaults, options);
    	//初始化控件
    	this.init();
    	//返回控件的实例
    	return this;
    }

    //默认配置项
    WidgetName.prototype.defaults = {
    	width: 200
    };


    //控件初始化逻辑
    WidgetName.prototype.init = function(){
    	this.$el = $(options.$el);
    	this.bind();
    };

    //控件渲染逻辑
    WidgetName.prototype.render = function(){
    	this.$el.trigger('rendered', [this]);
    	return this;
    }

    //使用声明和命名空间绑定事件
    WidgetName.prototype.bind = function(){
    	this.$el.on('click.cmp-name', function(e){});
    	return this;
    }

    //解绑事件
    WidgetName.prototype.unbind = function(){
    	this.$el.off('click.cmp-name');
    };


    //关闭控件
    WidgetName.prototype.disable = function(){
    	disable(this.$el, true);
    	return this;
    };

    //开启控件
    WidgetName.prototype.enable = function(){
    	disable(this.$el, false);
    	return this;
    }

    //添加自定义销毁逻辑
    WidgetName.prototype.destory = function(){
    	this.unbind();
    	this.$el.remove();
    }

```


### 2.z-index
默认堆叠次序和z-index值生效的前提条件是，这些元素是某个祖先元素的后代元素，而且这个元素创建了一个堆叠上下文。
页面的根元素html创建了默认的堆叠上下文。对于其他元素，创建堆叠上下文的条件是：成为定位元素且具有非auto的z-index值，或者元素具有小于1的opacity属性值




