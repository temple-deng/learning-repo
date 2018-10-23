# WebAPKs on Android

在 Android 上使用 A2HS 不仅仅是将 PWA 添加到用户主屏。Chrome 会自动生成并安装一个
特殊的我们 app 的 APK。有时也将其称为 **WebAPK**。在通过 APK 安装后，我们的 app 就会
出现在应用的启动器中，以及 Android 的应用配置的种，并注册一系列的 intent 过滤器。   

无论何时 app manifest 做了修改，Chrome 都会重新生成一个新的 APK。   

## Android intent filters

当在 Andriod 上安装了 PWA 后，会为 app 范围内的所有 URLs 注册一系列 intent 过滤器。
当用户在 app 的范围内点击一个链接时，app 会自动打开，而不是打开一个浏览器 tab 页。   

考虑以下的部分 `manifest.json` 文件，当从 app launcher 启动时，会加载 `https://example.com/`
并作为一个独立的 app 运行。   

```json
{
  "start_url": "/",
  "display": "standalone"
}
```    

WebAPK 会包含以下的 intent fileters:   

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https:"
    android:host="example.com"
    android:pathPrefix="/"
  />
</intent-filter>
```    

如果用户点击 app 内的一个链接到 `https://example.com/read`，会被 intent 捕获并在 PWA
内打开。    

如果不希望我们的 PWA 处理我们站点内的所有 URLs，可以在 manifest 中添加 `scope` 属性。
`scope` 属性告诉 Android 只有在 URL 与 `origin` + `scope` 匹配的时候在 web app 中
打开，其他不匹配的 URL 都在浏览器中打开。    

## 权限管理

权限必须在运行时请求，而不能在安装时请求。通常来说 Android 在安装 app 的时候会弹出提示
框要求用户授权，但是通过 WebAPK 安装的 app 不会这么做。    

## 常见问题

