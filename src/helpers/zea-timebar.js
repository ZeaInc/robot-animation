const { MathFunctions } = window.zeaEngine
const { RemoveKeyChange } = window.zeaKinematics
const { UndoRedoManager } = window.zeaUx

export class ZeaTimeBar extends HTMLElement {
  constructor() {
    super()

    const shadowRoot = this.attachShadow({ mode: 'open' })

    this.timeline = document.createElement('div')
    this.timeline.id = 'timeline'
    shadowRoot.appendChild(this.timeline)

    this.keysContainer = document.createElement('div')
    this.keysContainer.id = 'keys'
    this.timeline.appendChild(this.keysContainer)
    this.keys = []

    this.timebar = document.createElement('div')
    this.timebar.id = 'timebar'
    this.timeline.appendChild(this.timebar)

    const prevKeyBtn = document.createElement('i')
    prevKeyBtn.id = 'prevKey'
    prevKeyBtn.classList.add('fas')
    prevKeyBtn.classList.add('fa-chevron-circle-right')
    prevKeyBtn.textContent = '<'
    shadowRoot.appendChild(prevKeyBtn)

    const nextKeyBtn = document.createElement('i')
    nextKeyBtn.id = 'nextKey'
    nextKeyBtn.classList.add('fas')
    nextKeyBtn.classList.add('fa-chevron-circle-left')
    nextKeyBtn.textContent = '>'
    shadowRoot.appendChild(nextKeyBtn)

    let playingId = false
    this.play = () => {
      let time = Math.round(this.__timeParam.getValue())
      const range = this.__timeParam.getRange()
      if (!playingId) {
        playingId = setInterval(() => {
          time += 20
          this.__timeParam.setValue(Math.round(time))
          if (time > range[1]) time = range[0]
        }, 20)
      }
    }
    this.stop = () => {
      clearInterval(playingId)
      playingId = null
    }
    this.setTime = (time) => {
      this.__timeParam.setValue(Math.round(time))
    }

    let mouseIsOver = false
    this.onmouseover = function () {
      mouseIsOver = TrustedScriptURL
    }
    this.onmouseout = function () {
      mouseIsOver = false
    }

    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Space':
          if (playingId) this.stop()
          else this.play()
          break
        case 'Delete': {
          if (!mouseIsOver) return
          const time = Math.round(this.__timeParam.getValue())
          const keyAndLerp = this.__track.findKeyAndLerp(time)
          if (keyAndLerp.lerp == 0.0) {
            // this.__track.removeKey(keyAndLerp.keyIndex)
            const removeKeyChange = new RemoveKeyChange(
              this.__track,
              keyAndLerp.keyIndex
            )
            UndoRedoManager.getInstance().addChange(removeKeyChange)
          }
          break
        }
      }
    })

    this.timeline.addEventListener('mousedown', (event) => {
      if (playingId) this.stop()
      dragTimeBar(event)
      document.addEventListener('mousemove', dragTimeBar)
      document.addEventListener('mouseup', endDragTimeBar)
      event.stopPropagation()
      event.preventDefault()
    })

    const dragTimeBar = (event) => {
      const range = this.__timeParam.getRange()
      const time = ((event.clientX - 5) / this.timeline.offsetWidth) * range[1]
      this.setTime(time)
      event.stopPropagation()
      event.preventDefault()
    }

    const endDragTimeBar = (event) => {
      document.removeEventListener('mousemove', dragTimeBar)
      document.removeEventListener('mouseup', endDragTimeBar)
    }

    prevKeyBtn.addEventListener('mousedown', (event) => {
      event.stopPropagation()
      event.preventDefault()
      if (playingId) this.stop()
      const time = Math.round(this.__timeParam.getValue())
      const keyAndLerp = this.__track.findKeyAndLerp(time)
      if (keyAndLerp.lerp > 0.0) {
        const time = this.__track.getKeyTime(keyAndLerp.keyIndex)
        this.__timeParam.setValue(time)
      } else if (keyAndLerp.keyIndex > 0) {
        const time = this.__track.getKeyTime(keyAndLerp.keyIndex - 1)
        this.__timeParam.setValue(time)
      } else {
        const time = this.__track.getKeyTime(this.__track.getNumKeys() - 1)
        this.__timeParam.setValue(time)
      }
    })

    nextKeyBtn.addEventListener('mousedown', (event) => {
      event.stopPropagation()
      event.preventDefault()
      if (playingId) this.stop()
      const time = Math.round(this.__timeParam.getValue())
      const keyAndLerp = this.__track.findKeyAndLerp(time)
      if (keyAndLerp.keyIndex < this.__track.getNumKeys() - 1) {
        const time = this.__track.getKeyTime(keyAndLerp.keyIndex + 1)
        this.__timeParam.setValue(time)
      } else {
        const time = this.__track.getKeyTime(0)
        this.__timeParam.setValue(time)
      }
    })

    const styleTag = document.createElement('style')
    styleTag.appendChild(
      document.createTextNode(`

      #timecontrols {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
      }
      #timecontrols > * {
        position: absolute;
      }

      #timeline {
        width: 100%;
        height: 100%;
        width: calc(100% - 70px);
        bottom: 0px;
        margin: 0;
        padding: 0;
        border: #545454;
        border-style: solid;
        border-width: 1px;
      }

      #timebar {
        position: absolute;
        height: calc(100% - 2px);
        width: 10px;
        bottom: 1px;
        background-color: rgb(255,0,0,0.5);
      }

      .key {
        position: absolute;
        height: calc(100% - 4px);
        width: 2px;
        bottom: 2px;
        background-color: #F9CE03;
      }

      #prevKey {
        position: absolute;
        height: 100%;
        width: 30px;
        right: 30px;
        bottom: 0px;
        /* background-color: burlywood; */
        border: #545454;
        border-style: solid;
        border-width: 1px;
      }

      #nextKey {
        position: absolute;
        height: 100%;
        width: 30px;
        right: 0px;
        bottom: 0px;
        /* background-color: burlywood; */
        border: #545454;
        border-style: solid;
        border-width: 1px;
      }

`)
    )
    shadowRoot.appendChild(styleTag)
  }

  set timeParam(timeParam) {
    this.__timeParam = timeParam
    this.__timeParam.on('valueChanged', () => {
      const range = this.__timeParam.getRange()
      const time = MathFunctions.clamp(
        this.__timeParam.getValue(),
        range[0],
        range[1]
      )
      this.timebar.style.left = `${
        (time / range[1]) * this.timeline.offsetWidth -
        this.timebar.offsetWidth * 0.5
      }px`
    })
  }

  updateKey(index) {
    const key = this.keys[index]
    const time = this.__track.getKeyTime(index)
    const range = this.__timeParam.getRange()
    key.style.left = `${
      (time / range[1]) * this.timeline.offsetWidth - key.offsetWidth * 0.5
    }px`
  }

  removeKey(index) {
    const key = this.keys[index]
    this.keysContainer.removeChild(key)
    this.keys.splice(index, 1)
  }

  addKey(index) {
    const key = document.createElement('div')
    key.classList.add('key')

    const time = this.__track.getKeyTime(index)
    const range = this.__timeParam.getRange()
    key.style.left = `${
      (time / range[1]) * this.timeline.offsetWidth - key.offsetWidth * 0.5
    }px`

    this.keysContainer.appendChild(key)

    this.keys.splice(index, 0, key)
  }

  displayTrackKeys() {
    this.keys.forEach((key, index) => {
      this.removeKey(index)
    })
    this.__track.keys.forEach((key, index) => {
      this.addKey(index)
    })
  }

  set track(track) {
    this.__track = track
    this.__track.on('keyChanged', (event) => {
      this.updateKey(event.index)
    })
    this.__track.on('keyRemoved', (event) => {
      const { index } = event
      this.removeKey(index)
    })
    this.__track.on('keyAdded', (event) => {
      const { index } = event
      this.addKey(index)
    })
    this.__track.on('loaded', (event) => {
      this.displayTrackKeys()
    })

    this.displayTrackKeys()
  }
}

customElements.define('zea-timebar', ZeaTimeBar)
