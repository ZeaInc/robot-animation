const {
  Vec3,
  Xfo,
  Color,
  NumberParameter,
  Material,
  Cuboid,
  GeomItem,
  MathFunctions,
} = window.zeaEngine
const {
  XfoTrack,
  TrackSampler,
  XfoTrackDisplay,
  AttachmentConstraint,
  RemoveKeyChange,
} = window.zeaKinematics
const { UndoRedoManager } = window.zeaUx

const setupAnimation = (treeItem) => {
  const timeParam = new NumberParameter('time', 0)
  timeParam.setRange([0, 7000])
  treeItem.addParameter(timeParam)

  const xfoTrack = new XfoTrack('XfoTrack')

  ///////////////////////////////////////////////////
  // Setup the time bar

  const timecontrols = document.getElementById('timecontrols')
  timecontrols.timeParam = timeParam
  timecontrols.track = xfoTrack

  const saveTrack = () => {
    const json = xfoTrack.toJSON()
    download('XfoTrack.json', JSON.stringify(json, undefined, ' '))
  }
  document.addEventListener('keydown', (event) => {
    const key = String.fromCharCode(event.keyCode).toLowerCase()
    switch (key) {
      case ' ':
      case 's':
        if (event.ctrlKey) saveTrack()
        break
    }
  })

  ///////////////////////////////////////

  const target = treeItem.getChildByName('target')
  const asset = treeItem.getChildByName('MC700_ASSY')

  const makePlate = () => {
    const plateMaterial = new Material('plateMaterial', 'SimpleSurfaceShader')
    plateMaterial.getParameter('BaseColor').setValue(new Color(0, 0, 1))
    const plateItem = new GeomItem(
      'plate',
      new Cuboid(1.0, 2.0, 0.02),
      plateMaterial
    )
    treeItem.addChild(plateItem)
    const xfo = new Xfo()
    xfo.tr.set(2.9, -1.0, 0.5)
    xfo.ori.setFromAxisAndAngle(new Vec3(0, 1, 0), Math.PI * 0.5)
    plateItem.getParameter('GlobalXfo').setValue(xfo)
    return plateItem
  }
  const plateItem = makePlate()

  const makeStamper = () => {
    const stamperMaterial = new Material(
      'stamperMaterial',
      'SimpleSurfaceShader'
    )
    stamperMaterial.getParameter('BaseColor').setValue(new Color(0, 1, 1))
    const stamperItem = new GeomItem(
      'stamper',
      new Cuboid(1.0, 2.0, 0.5, true),
      stamperMaterial
    )
    treeItem.addChild(stamperItem)

    const xfo = new Xfo()
    xfo.tr.set(0.0, 2.5, 0.0)
    xfo.ori.setFromAxisAndAngle(new Vec3(0, 0, 1), Math.PI * 0.5)
    stamperItem.getParameter('GlobalXfo').setValue(xfo)
    return stamperItem
  }
  const stamperItem = makeStamper()

  asset.on('loaded', () => {
    const xfoTrackSampler = new TrackSampler('XfoTrack', xfoTrack)
    xfoTrackSampler.getInput('Time').setParam(timeParam)
    xfoTrackSampler
      .getOutput('Output')
      .setParam(target.getParameter('GlobalXfo'))

    const urlParams = new URLSearchParams(window.location.search)
    if (!urlParams.has('nokeys')) {
      fetch('data/XfoTrack.json')
        .then((response) => response.json())
        .then((json) => {
          xfoTrack.fromJSON(json)
          setTimeout(timecontrols.play, 1500)
        })

      /////////////////////////////////////////////////
      // Robot Head

      const robotHead = asset.getChildByName('NAUO15')
      const sttachmentConstraint = new AttachmentConstraint('PlateAttach')
      sttachmentConstraint.getInput('Time').setParam(timeParam)
      sttachmentConstraint
        .getOutput('Attached')
        .setParam(plateItem.getParameter('GlobalXfo'))
      sttachmentConstraint.addAttachTarget(
        robotHead.getParameter('GlobalXfo'),
        2600
      )
      sttachmentConstraint.addAttachTarget(
        stamperItem.getParameter('GlobalXfo'),
        5400
      )

      /////////////////////////////////////////////////
    }

    const TrackDisplay = new XfoTrackDisplay(xfoTrack)
    treeItem.addChild(TrackDisplay)
  })
}

export default setupAnimation
