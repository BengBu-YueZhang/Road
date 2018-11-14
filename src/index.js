import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import style from './style.scss'
import { Icon, notification } from 'antd'

function guid () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

class Rpload extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // 上传的文件列表, 无论上传还是失败，success字段会表示文件是否上传成功
      files: [],
      isDragover: false
    }
    // 等待上传的文件队列
    this.queue = []
    // 需要上传的队列
    this.uploadQueue = []
    // 正在上传的队列, 无论上传成功还是上传失败都不会从该队列移除, 避免死循环
    this.uploadingQueue = []
    this.inputRef = React.createRef()
  }

  handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  hanldeDragStart = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragover: true })
  }

  handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragover: true })
  }

  handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragover: false })
  }

  handleDragEnd = (event) => {
    event.preventDefault()
    event.stopPropagation()
    this.setState({ isDragover: false })
  }

  handleDrop = (event) => {
    const { maxLength } = this.props
    event.preventDefault()
    event.stopPropagation()
    let files = event.dataTransfer.files
    if (this.state.files + files.length > maxLength) {
      notification.error({ message: `超过最大上传文件数` })
      return
    }
    for (let i = 0; i < files.length; i++) {
      const errMsg = this.check(files[i])
      if (errMsg) {
        notification.error({ message: errMsg })
      } else {
        files[i].guid = guid()
        this.addQueue(files[i])
      }
    }
  }

  handleFileChange = (event) => {
    const { maxLength } = this.props
    event.preventDefault()
    event.stopPropagation()
    let files = this.inputRef.current.files
    if (this.state.files + files.length > maxLength) {
      notification.error({ message: `超过最大上传文件数` })
      return
    }
    for (let i = 0; i < files.length; i++) {
      const errMsg = this.check(files[i])
      if (errMsg) {
        notification.error({ message: errMsg })
      } else {
        files[i].guid = guid()
        this.addQueue(files[i])
      }
    }
  }

  sumbit = async () => {
    const { onLeave, onError, url } = this.props
    for (let i = 0; i < this.uploadQueue.length; i++) {
      // 避免重复的上传
      let current = this.uploadQueue[i]
      let guids = this.uploadingQueue.map(f => f.guid)
      if (guids.indexOf(current.guid) < 0) {
        this.uploadingQueue = [...this.uploadingQueue, current]
        let uploadFile = new FormData()
        uploadFile.append('file', current)
        axios.post(
          url,
          uploadFile
        ).then(_ => {
          this.setState(prevState => {
            current.success = true
            return {
              files: [...prevState.files, current]
            }
          }, () => {
            notification.success({ message: `${current.name}, 上传成功` })
            onLeave(_)
            this.uploadQueue = this.uploadQueue.filter(f => f.guid !== current.guid)
            this.processQueue()
          })
        }).catch(_ => {
          this.setState(prevState => {
            current.success = false
            return {
              files: [...prevState.files, current]
            }
          }, () => {
            notification.error({ message: `${current.name}, 上传失败` })
            onError(_)
            this.uploadQueue = this.uploadQueue.filter(f => f.guid !== current.guid)
          })
        })
      }
    }
  }

  addQueue = (file) => {
    this.queue = [...this.queue, file]
    this.processQueue()
  }

  processQueue = () => {
    const { cq, onEnter } = this.props
    if (this.uploadQueue.length < cq && this.queue.length > 0) {
      let uploadFile = this.queue.shift()
      if (onEnter(uploadFile)) {
        this.uploadQueue = [...this.uploadQueue, uploadFile]
        this.sumbit()
      }
    }
  }

  check = (file) => {
    const { maxSize, suffixs } = this.props
    if (file.size > maxSize * 1024) return `${file.name}超过文件大小限制`
    if (suffixs && suffixs.length && suffixs.indexOf(this.getSuffixName(file.name)) < 0) return `${file.name}文件格式不支持`
    return undefined
  }

  getSuffixName = (name) => {
    let names = name.split('.')
    return names[names.length - 1]
  }

  handleCloseClick = (guid) => {
    this.setState(prevState => {
      return {
        files: prevState.files.filter(f => f.guid !== guid)
      }
    })
  }

  render () {
    const { multiple } = this.props
    return (
      <div className={style.wrapper}>
        <div className={style.root}>
          <form
            className={style.form}
            method="post"
            action=""
            encType="multipart/form-data"
            onDrag={this.handleDrag}
            onDragStart={this.hanldeDragStart}
            onDragEnd={this.handleDragEnd}
            onDragOver={this.handleDragOver}
            onDragEnter={this.handleDragEnter}
            onDragLeave={this.handleDragLeave}
            onDrop={this.handleDrop}
          >
            <input
              ref={this.inputRef}
              onChange={this.handleFileChange}
              style={{'display': 'none'}}
              type="file"
              id="file"
              multiple={multiple}
            />
            <label
              className={style.content}
              htmlFor="file">
              <Icon
                className={style.icon}
                type="plus"
              />
              <p>
                <strong>选择文件</strong>
                <span>或拖拽文件到这里</span>
              </p>
            </label>
          </form> 
        </div>
        {/* 上传列表 */}
        {
          this.state.files.map(file => {
            return (
              <div key={file.guid}>
                <div className={style.uploadlist}>
                  <div className={style.left}>
                    { 
                      file.success ? <Icon type="check-circle" className={style['success-icon']} /> : <Icon type="exclamation-circle" className={style['error-icon']} />
                    }
                    <p className={style.text}>{ file.name }</p>
                  </div>
                  <div className={style.right}>
                    <Icon type="close" onClick={this.handleCloseClick.bind(this, file.guid)} />
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

Rpload.propTypes = {
  onEnter: PropTypes.func,
  onLeave: PropTypes.func,
  onError: PropTypes.func,
  url: PropTypes.string.isRequired,
  cq: PropTypes.number,
  multiple: PropTypes.bool,
  maxSize: PropTypes.number,
  maxLength: PropTypes.number,
  suffixs: PropTypes.array
}

Rpload.defaultProps = {
  onEnter: () => { return true },
  onLeave: () => { return true },
  onError: () => { return true },
  cq: 3,
  multiple: false,
  maxSize: 1024,
  maxLength: 5,
  suffixs: []
}



export default Rpload
