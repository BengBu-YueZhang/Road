# Road

React上传组件, 基于axios, 也使用了antd的图标 😊

## 参数

```js

Rpload.propTypes = {
  onEnter: PropTypes.func, // 上传前的钩子
  onLeave: PropTypes.func, // 上传成功的钩子
  onError: PropTypes.func, // 上次失败的钩子
  url: PropTypes.string.isRequired, // 上传地址
  cq: PropTypes.number, // 并发上传数
  multiple: PropTypes.bool, // 是否支持多选
  maxSize: PropTypes.number, // 文件大小
  maxLength: PropTypes.number, // 文件数量
  suffixs: PropTypes.array // 后缀名
}

```

## 感谢

1. [@后知后觉](https://www.justdodo.cn/#/index/maze)提供的上传接口, 供我测试
2. [OSVALDAS VALUTIS](https://css-tricks.com/drag-and-drop-file-uploading/)博客对我的帮助




