# defer 和 async

script脚本不设置任何属性。HTML文档解析过程中，遇到script文档时，会停止解析HTML文档，发送请求获取script文档（如果是外部文档的话）。脚本执行后，才恢复HTMl文档解析。设置async属性后，在HTML解析的同时，下载script文档。script文档下载完成后，HTMl解析会暂停，来执行script文档。设置defer属性后，在HTML解析的同时，下载script脚本。但只有在HTML解析完成后，才执行script文档。同时，defer属性保证脚本按照其在文档中出现的顺序执行。   

**注意：**根据HTML5的规范定义：defer属性仅当src属性声明时才生效。如果script标签同时有defer和async属性，浏览器会遵从async属性并忽略defer属性。
　
