# 1. 这里总结一下证书的相关内容


<!-- TOC -->

- [1. 这里总结一下证书的相关内容](#1-这里总结一下证书的相关内容)
  - [1.1. 证书的分类](#11-证书的分类)
  - [1.2. PKI 系统和数字证书结构](#12-pki-系统和数字证书结构)
    - [1.2.1. PKI](#121-pki)
    - [1.2.2. CA 机构](#122-ca-机构)
    - [1.2.3. X.509 标准](#123-x509-标准)
  - [1.3. X509 证书格式](#13-x509-证书格式)

<!-- /TOC -->
## 1.1. 证书的分类

证书有很多类型，首先分为三种认证级别：    

+ **域名认证**(Domain Validation)：最低级别认证，可以确认申请人拥有这个域名。对于这种证书，
浏览器会在地址栏显示一把锁。
+ **公司认证**(Company Validation)：确认域名所有人是哪一家公司，证书里面会包含公司信息。
+ **扩展认证**(Extended Validation)：最高级别的认证，浏览器地址栏会显示公司名。    

还分为三种覆盖范围：   

+ 单域名证书：只能用于单一域名，foo.com的证书不能用于www.foo.com
+ 通配符证书：可以用于某个域名及其所有一级子域名，比如*.foo.com的证书可以用于foo.com，也可以用于www.foo.com
+ 多域名证书：可以用于多个域名，比如foo.com和bar.com     

## 1.2. PKI 系统和数字证书结构

> 这一部分摘于 http://enkichen.com/2016/04/12/certification-and-pki/   

### 1.2.1. PKI

PKI(Public Key Infrastructure) 是一个标准，它包括一些基本的组件，不同的组件提供不同的服务，
主要由以下几个组件构成：   

1. **认证中心CA（证书签发）**：CA机构，又称为证书授证 (Certificate Authority) 中心，是PKI
的”核心”，即数字证书的申请及签发机关，CA必须具备权威性的特征，它负责管理PKI结构下的所有用户
(包括各种应用程序)的证书，把用户的公钥和用户的其他信息捆绑在一起，在网上验证用户的身份，CA还要
负责用户证书的黑名单登记和黑名单发布。
2. **X.500 目录服务器（证书保存）**：X.500目录服务器用于”发布”用户的证书和黑名单信息，用户可
通过标准的LDAP协议查询自己或其他人的证书和下载黑名单信息。
3. 具有高强度密码算法(SSL)的安全WWW服务器(即配置了HTTPS的apache)
4. Web(安全通信平台)
5. 自开发安全应用系统    

### 1.2.2. CA 机构

CA 实现了 PKI 中一些很重要的功能：   

1. 接收验证用户数字证书的申请
2. 确定是否接受用户数字证书的申请 —— 证书的审批
3. 向申请者颁发、拒绝颁发数字证书 —— 证书的发放
4. 接收、处理最终用户的数字证书更新请求 —— 证书的更新
5. 接收用户数字证书的查询、撤销啊
6. 产生和发布证书废止列表（CRL）
7. 数字证书的归档
8. 密钥归档
9. 历史数据归档    

### 1.2.3. X.509 标准

X.509是一种非常通用的证书格式。所有的证书都符合ITU-T X.509国际标准。在一份证书中，必须证明公钥
及其所有者的姓名是一致的。对X.509证书来说，认证者总是 CA或由CA指定的人，一份X.509证书是一些
标准字段的集合，这些字段包含有关用户或设备及其相应公钥的信息。X.509标准定义了证书中应该包含哪些
信息，并描述了这些信息是如何编码的(即数据格式)，所有的X.509证书包含以下数据。    

+ **版本号**：指出证书使用了哪种版本的 X.509 标准（版本1、版本2或是版本3），版本号会影响证书
中的一些特定信息，目前的版本为 3
+ **序列号**：标识证书的唯一整数，由证书颁发者分配给本证书的唯一标识符
+ **签名算法标识符**：用于签证书的算法标识，由对象标识符加上相关的参数组成，用户说明本证书所用
的数字签名算法。
+ **认证机构的数字签名**：使用发布者私钥生成的签名，以确保这个证书在发放之后没有被篡改过
+ **认证机构**：证书颁发者的可识别名（DN），是签发该证书的实体的唯一的 CA X.500 名字
+ **有效期限**：证书起始日期及时间以及终止日期及时间
+ **主题信息**：证书持有人唯一的标识符
+ **公钥信息**：包括证书持有人的公钥、算法的标识符和其他相关的密钥参数    

## 1.3. X509 证书格式

一个X.509证书(简称SSL证书)实际上就是一个经过编码的ASN.1(Abstract Syntax Notation One,抽象
语法表示法/1)格式的电子文档。ASN.1既是一个标准,也是一种表示法,它描述了表示电信以及计算机网络数
据的规则和结构。     

X.509证书可以使用多种格式编码,其中一种编码格式是BER(Basic Encoding Rules,基本编码规则)。
BER格式指定了一种自解释并且自定义的格式用于对ASN.1数据结构进行编码,而DER格式则是BER的一个子
集。DER只提供了一种编码ASN.1值的方法,这种方法被广泛地应用于密码学当中,尤其是对X.509证书进行加
密。      

SSL证书可以以多种不同的格式保存,其中一种是PEM(Privacy Enhanced Email,隐私增强邮件)格
式,这种格式会对DER格式的X.509证书实施Base64编码,并且这种格式的文件都以-----BEGIN
CERTIFICATE-----开头,以-----END	 CERTIFICATE-----结尾。    

Last Update: 2018-11-10
