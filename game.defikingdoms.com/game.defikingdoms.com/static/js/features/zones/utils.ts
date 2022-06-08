export function getSceneConfig(bgSize: [number, number], frameThickness = 10) {
  const bgWidth = window.innerWidth
  const bgHeight = bgWidth * (bgSize[1] / bgSize[0])
  const differenceRatio = [bgWidth / bgSize[0], bgHeight / bgSize[1]]
  const frameWidth = bgSize[0] + frameThickness
  const frameHeight = bgSize[1] + frameThickness
  return { bgSize, bgWidth, bgHeight, frameWidth, frameHeight, frameThickness, differenceRatio }
}

export function getWindowSizeAndRatio(ratio = 1.3) {
  const smallWindow = window.innerWidth <= 720
  const widthRatio = (window.innerHeight / window.innerWidth) * ratio
  return { smallWindow, widthRatio }
}
