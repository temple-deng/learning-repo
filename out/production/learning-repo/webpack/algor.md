# Chunk Algorithm

<!-- TOC -->

- [Chunk Algorithm](#chunk-algorithm)
  - [1. Chunk graph algorithm](#1-chunk-graph-algorithm)
    - [1.1 Step1: The module graph](#11-step1-the-module-graph)
    - [1.2 Step2: Entrypoints](#12-step2-entrypoints)
    - [1.3 Step3: Chunk graph from modules](#13-step3-chunk-graph-from-modules)
    - [1.4 Step4: Parent-Child relationship for Chunks](#14-step4-parent-child-relationship-for-chunks)
- [2. Chunk Group](#2-chunk-group)

<!-- /TOC -->

## 1. Chunk graph algorithm

![chunk-graph](https://raw.githubusercontent.com/temple-deng/markdown-images/master/uncategorized/chunk-graph.png)    

### 1.1 Step1: The module graph

首先假设所有模块都已被加载，这些模块的依赖也都被导出（Parser 处理）。所有蓝色的条目和连接线（
Module, AsyncDepBlock, Dependency 以及它们之间的连接）都画在了图中。    

一个模块可能通过 `require`, `import` 包含一系列依赖。同时也可以通过 `require.ensure()`,
`import()` 包含一系列异步依赖块 AsyncDepBlocks，这些异步依赖块可能还包含着它自身的依赖，
异步依赖块可以通过 `require.ensure()` 继续包含异步依赖块，但不能通过 `import()` 包含。   

模块中的同步依赖，和模块属于同一个 chunk。异步依赖会形成一个新的 chunk，或者可能通过 name 重用
已经存在的 chunk。    

### 1.2 Step2: Entrypoints

下一步，`entry` 配置项的 entrypoints 和 chunks 被创建。因此我们为每个入口创建一个新的 chunk，
并将第一个模块添加进去，即 `entryModule`。    

### 1.3 Step3: Chunk graph from modules

上一步中创建的 chunks 和 entry modules 插入到第一步的 chunk graph 算法中。这时，算法会
遍历每一个模块，依赖和异步依赖，将模块和异步依赖使用 chunks 连接起来（同步依赖在第一步中已经
划分到模块 chunk 中了）。     

当遍历一个模块时：添加模块到当前的 chunk。遍历所有同步和异步依赖。    

遍历同步依赖时：遍历被引用的模块。   

遍历异步模块时：创建新 chunk，或者根据 name 搜索已经存在的 chunk。遍历所有的同步和异步依赖。   

### 1.4 Step4: Parent-Child relationship for Chunks

在必要的时候为 chunks 添加父子。父级意味着：当加载这个 chunk 时，至少其父级之一已经被加载了。
这个信息在优化时很重要，例如，如果一个模块已经被所有父级包含了，那就可以从一个 chunk 中移除。   

# 2. Chunk Group

webpack4 引入了 ChunkGroup 对象，一个 ChunkGroup 可以包含 Chunks。    

在一个入口点或者一个异步分割点，会引用一个 ChunkGroup，意味着所有被包含的 Chunks 都是并行
加载的。一个 Chunk 可能被多个 ChunkGroups 引用。    

Chunks 之间不再存在父子关系，相反现在是 ChunkGroups 之前存在父子关系。    

Last Update: 2018-11-08
