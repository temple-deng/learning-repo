# EventListener

注意 `addEventListener` 函数第二个参数事件监听函数，除了可以是一个函数以外，还可以是一个实现了
`EventListener` 接口的对象，这个对象需要实现一个 `handleEvent` 方法，这个方法会在事件触发时被调用，
参数即 `event` 对象。   