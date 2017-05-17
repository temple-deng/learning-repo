# webpack加载的分析
```javascript

//bundle.js文件大致是这样的结构
	(function(modules){      //modules是入口脚本需要加载的模块数组，第一个元素可以认为是主模块，其他的元素都是需要同步加载的模块
	//后面的模块函数调用后主要是向主模块暴露出对象
    /*...*/
	})([function(module, exports,__webpack_require__){/*....*/}, 
		function(module, exports){/*....*/}]);

	//加载函数的最后部分, 加载并执行主模块
	return __webpack_require__(0);
	
	//__webpack_require__函数， 加载模块的函数（应该是加载同步模块的函数），执行加载的模块并暴露出对象
	//__webpack_require__.e  加载code.spliting出来的chunk的函数

	//installedModules 已经加载的模块对象
	installedModules = {
			0 :{
				exports: obj,   //模块最终的暴露对象
				id:0,           //模块id
				loaded:false   //模块是否加载完成
		}



/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	var parentJsonpFunction = window["webpackJsonp"];
/******/ 	window["webpackJsonp"] = function webpackJsonpCallback(chunkIds, moreModules) {
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, callbacks = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(installedChunks[chunkId])
/******/ 				callbacks.push.apply(callbacks, installedChunks[chunkId]);
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(chunkIds, moreModules);
/******/ 		while(callbacks.length)
/******/ 			callbacks.shift().call(null, __webpack_require__);

/******/ 	};

/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// object to store loaded and loading chunks
/******/ 	// "0" means "already loaded"
/******/ 	// Array means "loading", array contains callbacks
/******/ 	var installedChunks = {
/******/ 		0:0
/******/ 	};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache，如果已经加载过，直接从缓存中取得暴露的对象
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function，执行模块函数
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module，返回暴露的对象给模块
/******/ 		return module.exports;
/******/ 	}

/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId, callback) {
/******/ 		// "0" is the signal for "already loaded"
/******/ 		if(installedChunks[chunkId] === 0)
/******/ 			return callback.call(null, __webpack_require__);

/******/ 		// an array means "currently loading".
/******/ 		if(installedChunks[chunkId] !== undefined) {
/******/ 			installedChunks[chunkId].push(callback);
/******/ 		} else {
/******/ 			// start chunk loading
/******/ 			installedChunks[chunkId] = [callback];
/******/ 			var head = document.getElementsByTagName('head')[0];
/******/ 			var script = document.createElement('script');
/******/ 			script.type = 'text/javascript';
/******/ 			script.charset = 'utf-8';
/******/ 			script.async = true;

/******/ 			script.src = __webpack_require__.p + "" + ({}[chunkId]||chunkId) + "." + "afec395ed5c10884b15a" + ".js";
/******/ 			head.appendChild(script);
/******/ 		}
/******/ 	};

/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:63342/webpack/demo2/assets/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	window.onload=  function(){
	    __webpack_require__.e/* nsure */(1, function(require){
	            console.log("This is main module");
	            var b = __webpack_require__(3);
	            b();
	            var a = __webpack_require__(2);
	            a();
	    });

	    var e = __webpack_require__(1);
	    __webpack_require__.e/* require */(2, function(__webpack_require__) { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(4), __webpack_require__(5)]; (function(){
	        console.log("This is main module too");
	        var c = __webpack_require__(4);
	        c();
	        var d = __webpack_require__(5);
	        d();
	    }.apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));})
	};

/***/ },
/* 1 */
/***/ function(module, exports) {


	module.exports = function(){
	    console.log('This is in module E');
	};

/***/ }
/******/ ]);


```

