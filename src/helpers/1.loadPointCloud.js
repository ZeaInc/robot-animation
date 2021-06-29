const { Vec3, PassType } = window.zeaEngine
const { PointCloudAsset, GLPointCloudPass } = window.zeaPotree

const loadPointCloud = (appData) => {
  const pointCloudPass = new GLPointCloudPass()
  appData.renderer.addPass(pointCloudPass, PassType.OPAQUE)
  // Force a fix for the recent regression.
  pointCloudPass.__passIndex = pointCloudPass.passIndex

  const pointCloud = new PointCloudAsset('PointCloud')
  const pointCloudUrl =
    'https://storage.googleapis.com/visualive-tmp/NavVisHQ/cloud.js'
  pointCloud.getParameter('Point Size').setValue(0.5)
  pointCloud.getParameter('Point Size Attenuation').setValue(0.5)
  pointCloud.loadPointCloud(pointCloudUrl, 'PointCloud').then((e) => {
    const xfoParam = pointCloud.getParameter('GlobalXfo')
    const xfo = xfoParam.getValue()
    console.log(xfo.toString())
    xfo.tr.addInPlace(new Vec3(17, 15, 0))
    xfoParam.setValue(xfo)
  })

  pointCloud.setName('PointCloud')

  return pointCloud
}

export default loadPointCloud
