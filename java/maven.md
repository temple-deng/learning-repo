# maven

## 配置

- settings.xml 全局配置文件
- pom.xml 项目配置

### settings.xml

```xml
<?xml version="1.0"?>

<settings>
    <localRepository>/Users/dengbo/.m2/repository</localRepository>
    <servers>
        <server>
            <id>snapshots</id>
            <username>snapshotsAdmin</username>
            <password>123456</password>
        </server>
        <server>
            <id>releases</id>
            <username>admin</username>
            <password>screct</password>
        </server>
    </servers>

    <!-- ======================================================================== -->
    <!--  mirror settings                                                         -->
    <!-- ======================================================================== -->
    <mirrors>
        <mirror>
            <id>tbmirror-all</id>
            <mirrorOf>*</mirrorOf>
            <name>taobao mirror</name>
            <url>http://xxx.yyyy.com/mvn/repository</url>
        </mirror>
    </mirrors>

    <profiles>
        <profile>
            <id>nexus</id>
            <repositories>
                <repository>
                    <id>central</id>
                    <url>http://xxx.yyyy.com/mvn/repository</url>
                </repository>
            </repositories>
            <pluginRepositories>
                <pluginRepository>
                    <id>central</id>
                    <url>http://xxx.yyyy.com/mvn/repository</url>
                </pluginRepository>
            </pluginRepositories>
        </profile>
    </profiles>

    <pluginGroups>
        <pluginGroup>com.alibaba.org.apache.maven.plugins</pluginGroup>
        <pluginGroup>com.alibaba.maven.plugins</pluginGroup>
    </pluginGroups>

    <activeProfiles>
        <!-- 这里应该是可以动态切换 profiles 中的配置项，选择启用哪组配置 -->
        <activeProfile>nexus</activeProfile>
    </activeProfiles>
</settings>
```

配置项

- localRepository: 本地仓库
- interactiveMode: 是否交互模式
- userPluginRegistry: 是否通过一个独立的文件配置插件
- offline: 离线模式
- pluginGroups: 插件 groupId 未提供的时候，是否自动提供
- servers: 远程服务器的身份认证信息
- mirrors: 远程仓库的镜像
- proxies
- profiles：构建的一些配置
- activeProfiles
- activation
- properties：有点类似自定义变量
- repositories
- pluginRepositories

### pom.xml

- 基础信息
- 构建环境
- 仓库管理
- 依赖管理
- 报表信息
- 部署分发

```xml
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.aliyun.xxx</groupId>
  <artifactId>xxx-yyy-pom</artifactId>
  <version>1.0.10</version>
  <name>dsfsf</name>

  <parent>
      <groupId>com.aliyun.xxx</groupId>
      <artifactId>xxx-xxx-pom</artifactId>
      <version>1.0.10</version>
  </parent>
```

- build: 构建的配置
- dependencyManagement：看起来一般是多项目一个库的时候，这个属于一个整体性的依赖配置，估计是可以解决不同项目间的依赖冲突吧
- 子项目直接配 dependencies 就行

## gav

- groupId
- artifactId
- version

## maven 命令

- mvn clean: 清理 target 目录
- mvn compile: 编译到 target
- mvn package：打包 jar 或者 war 等文件
- mvn tomcat:run
- mvn test
- mvn site：生成报表数据
- mvn dependency:tree
- mvn install：打包好的 jar/war 添加到本地仓库中
- mvn deploy：将本地仓库的 jar/war 包发布到远程服务器

## 声明周期

- clean lifecycle: 项目构建之前的清理环节
- default lifecycle: 项目编译和打包环境
- site lifecycle：项目报告、站点信息、发布环节

- clean
  - pre-clean
  - clean
  - post-clean
- site
  - pre-site
  - site
  - post-site
  - site-deploy

## 构建

命令构建项目 `mvn archetype:generate`

- `-DgroupId=`
- `-DartifactId=`
- `-DpackageName=`
- `-DarchetypeArtifactId=maven-archetype-quickstart`

## 依赖范围

依赖的 jar 包的作用范围，compile, provided, runtime, test, system

- complie: 编译、运行、测试、打包都依赖的 jar
- provided: 只在编译和运行时有效，打包不会包含这个的 jar 包，相当于 peerDependency?
- runtime: 只在运行时生效
- test
- system：本地 jar 包，和 provided 一致，但必须配合 systemPath 使用。

默认是 compile。

## 父子项目

父项目打包方式必须是 pom。`<packaging>pom</packaging>`。

子项目通过 parent 继承。

使用父项目依赖管理器中的依赖，可以不写版本号。

## 聚合项目

父项目的 modules 中包含子项目。

## 依赖冲突

```xml
<dependency>
  <groupId>commons-beanutils</groupId>
  <artifactId>common-beanutils</artifactId>
  <version>1.9.5</version>
  <!-- 把冲突的依赖排除掉 -->
  <exclusions>
    <exclusion>
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```
