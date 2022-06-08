const colors = {
  green: `#589740`,
  cloudGrey: `#9497a8`,
  skyGrey: `#ACCFD2`,
  deepGrey: `#292929`,
  darkGrey: `#131313`,
  boxBgGradient: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 1))`,
  boxBgGradientHover: `linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(92, 75, 45, .9))`,
  profileBgGradient: `linear-gradient(to bottom, rgba(92, 75, 45, 1), rgba(0, 0, 0, 1))`,
  profileBgGradientHover: `linear-gradient(to bottom, rgba(250, 192, 93, 1), rgba(0, 0, 0, 1))`,
  gold: `#fac05d`,
  goldLight: `#fbeb74`,
  goldDark: `#fba307`,
  goldDim: `#5c4b2d`,
  deepBrown: `#0f0603`,
  brown: `#3e1f05`,
  brownLight: `#4c3e23`,
  grassGreen: `#6aa441`,
  marketGreen: `rgba(140,169,66,1)`,
  red: `#FD4040`,
  redTag: `#4d2b22`,
  greenTag: `#235535`,
  purpleTag: `#462b69`,
  forestGreen: `#009c44`,
  deepBlue: `#100f21`,
  waterBlue: `#2694bb`,
  white: `#e6e6e6`,
  parchment: `#ffe0b7`
}

export const marketGreen = 'rgba(140,169,66,1)'
export const brown = '#3e1f05'
export const brownLight = '#4c3e23'
export const parchment = '#ffe0b7'
export const cloudGrey = '#9497a8'
export const white = '#fff'
export const darkGrey = '#131313'
export const fancyBrown = '#744e45'
export const red = '#FD4040'

// shamefully stolen from https://gist.github.com/danieliser/b4b24c9f772066bcf0a6
export const convertHexToRGBA = (hexCode: string, opacity: number) => {
  let hex = hexCode.replace('#', '')

  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r},${g},${b},${opacity / 100})`
}

export default colors
