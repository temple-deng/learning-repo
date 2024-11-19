# Glossary

<!-- TOC -->

- [Glossary](#glossary)
  - [Asset](#asset)
  - [Bundle](#bundle)
  - [Bundle Spliting](#bundle-spliting)
  - [Chunk](#chunk)

<!-- /TOC -->

## Asset

泛指页面中使用图片、字体、媒体以及其他类型调度文件。这些资源通常都是输出目录中的一个独立的文件，
但是也可以通常一些 loader 内联到代码中。    

## Bundle

由一系列不同的模块生成的，bundle 包含编译过的最终的生成的代码。    

## Bundle Spliting

对单一应用生成多个打包文件。     

## Chunk

webpack 特定术语，用来内部管理打包流程。bundle 是由 chunks 组成的，chunks 可能分为多种
类型。通常来说，chunks 和输出的 bundles 是一一对应的，但是可以通过配置来解耦这种一对一的关系。    

Last Update: 2018-11-08
