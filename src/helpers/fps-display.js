export class FPSDisplay extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })

    this.div = document.createElement('div')
    this.div.classList.add('fps-display')
    shadowRoot.appendChild(this.div)

    const styleTag = document.createElement('style')
    styleTag.appendChild(
      document.createTextNode(`
      .fps-display {
        position: fixed;
        bottom: 40px;
        right: 20px;
        color: var(--color-warning-2);
      }
    `)
    )
    shadowRoot.appendChild(styleTag)
  }

  set renderer(renderer) {
    let frameCounter = 0
    let fps = 0
    renderer.on('redrawOccurred', () => {
      frameCounter++
    })

    setInterval(() => {
      if (fps != frameCounter * 2) {
        fps = frameCounter * 2
        this.div.textContent = `Fps: ${fps}`
      }
      frameCounter = 0
    }, 500)
  }
}

customElements.define('fps-display', FPSDisplay)