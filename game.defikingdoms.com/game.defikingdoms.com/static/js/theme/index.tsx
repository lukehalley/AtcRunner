import { useMemo } from 'react'
import { Blockchain } from 'constants/sdk-extra'
import { useIsDarkMode } from 'features/user/hooks'
import useBlockchain from 'hooks/useBlockchain'
import { Text, TextProps } from 'rebass'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme
} from 'styled-components'
import themeColors from 'utils/colors'
import borderHero from 'assets/images/gui/border-hero.png'
import borderMain from 'assets/images/gui/border-main.png'
import borderModal from 'assets/images/gui/border-modal.png'
import hand from 'assets/images/gui/uncommon-gem-2.gif'
import bgimage from 'assets/images/kingdom_background.png'
import { Colors } from './styled'

export * from './components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

// export function defaultColors(darkMode: boolean): Colors {
//   return {
//     // base
//     white,
//     black,

//     // text
//     text1: darkMode ? '#FFFFFF' : '#000000',
//     text2: darkMode ? '#C3C5CB' : '#565A69',
//     text3: darkMode ? '#6C7284' : '#888D9B',
//     text4: darkMode ? '#565A69' : '#C3C5CB',
//     text5: darkMode ? '#2C2F36' : '#EDEEF2',

//     // backgrounds / greys
//     bg1: darkMode ? '#212429' : '#FFFFFF',
//     bg2: darkMode ? '#2C2F36' : '#F7F8FA',
//     bg3: darkMode ? '#40444F' : '#EDEEF2',
//     bg4: darkMode ? '#565A69' : '#CED0D9',
//     bg5: darkMode ? '#6C7284' : '#888D9B',

//     //specialty colors
//     modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
//     advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

//     //primary colors
//     primary1: darkMode ? '#2172E5' : '#ff007a',
//     primary2: darkMode ? '#3680E7' : '#FF8CC3',
//     primary3: darkMode ? '#4D8FEA' : '#FF99C9',
//     primary4: darkMode ? '#376bad70' : '#F6DDE8',
//     primary5: darkMode ? '#153d6f70' : '#FDEAF1',

//     // color text
//     primaryText1: darkMode ? '#6da8ff' : '#ff007a',

//     // secondary colors
//     secondary1: darkMode ? '#2172E5' : '#ff007a',
//     secondary2: darkMode ? '#17000b26' : '#F6DDE8',
//     secondary3: darkMode ? '#17000b26' : '#FDEAF1',

//     // other
//     red1: '#FD4040',
//     red2: '#F82D3A',
//     red3: '#D60000',
//     green1: '#27AE60',
//     yellow1: '#FFE270',
//     yellow2: '#F3841E',
//     blue1: '#2172E5',

//     // dont wanna forget these blue yet
//     // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
//     // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

//     // Added:
//     tokenButtonGradientStart: '#909ae2',
//     tokenButtonGradientEnd: '#1f3bc3',
//     customCardGradientStart: '#909ae2',
//     customCardGradientEnd: '#1f3bc3'
//   }
// }

export function defiKingdomsColors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: '#FFFFFF',
    text2: '#C3C5CB',
    text3: '#6C7284',
    text4: '#565A69',
    text5: '#2C2F36',

    // backgrounds / greys
    bg0: 'rgba(0, 0, 0, .85)',
    bg1: '#212429',
    bg2: '#2C2F36',
    bg3: '#40444F',
    bg4: '#565A69',
    bg5: '#6C7284',

    //specialty colors
    modalBG: 'rgba(30, 30, 30, .5)',
    advancedBG: 'rgba(0,0,0,0.1)',

    //primary colors
    primary1: '#14c25a',
    primary2: '#16d362',
    primary3: '#17e168',
    primary4: '#376bad70',
    primary5: '#153d6f70',

    // color text
    primaryText1: '#669999',

    // secondary colors
    secondary1: '#2172E5',
    secondary2: '#17000b26',
    secondary3: '#17000b26',

    // other
    red1: '#FD4040',
    red2: '#F82D3A',
    red3: '#D60000',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

    // Added:
    tokenButtonGradientStart: '#909ae2',
    tokenButtonGradientEnd: '#1f3bc3',
    customCardGradientStart: '#222',
    customCardGradientEnd: '#333'
  }
}

// export function bscColors(darkMode: boolean): Colors {
//   return {
//     // base
//     white,
//     black,

//     // text
//     text1: darkMode ? '#FFFFFF' : '#000000',
//     text2: darkMode ? '#C3C5CB' : '#565A69',
//     text3: darkMode ? '#6C7284' : '#888D9B',
//     text4: darkMode ? '#565A69' : '#C3C5CB',
//     text5: darkMode ? '#2C2F36' : '#EDEEF2',

//     // backgrounds / greys
//     bg1: darkMode ? '#212429' : '#FFFFFF',
//     bg2: darkMode ? '#2C2F36' : '#F7F8FA',
//     bg3: darkMode ? '#40444F' : '#EDEEF2',
//     bg4: darkMode ? '#565A69' : '#CED0D9',
//     bg5: darkMode ? '#565A69' : '#888D9B',

//     //specialty colors
//     modalBG: darkMode ? 'rgba(0,0,0,42.5)' : 'rgba(0,0,0,0.3)',
//     advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

//     //primary colors
//     primary1: darkMode ? '#2172E5' : '#ffad00',
//     primary2: darkMode ? '#3680E7' : '#FFE08C',
//     primary3: darkMode ? '#4D8FEA' : '#F2CB61',
//     primary4: darkMode ? '#376bad70' : '#FFE08C',
//     primary5: darkMode ? '#153d6f70' : '#FAECC5',

//     // color text
//     primaryText1: darkMode ? '#6da8ff' : '#ffad00',

//     // secondary colors
//     secondary1: darkMode ? '#2172E5' : '#ffad00',
//     secondary2: darkMode ? '#17000b26' : '#FFE08C',
//     secondary3: darkMode ? '#17000b26' : '#FAECC5',

//     // other
//     red1: '#FF6871',
//     red2: '#F82D3A',
//     red3: '#D60000',
//     green1: '#27AE60',
//     yellow1: '#FFE270',
//     yellow2: '#F3841E',
//     blue1: '#2172E5',

//     // dont wanna forget these blue yet
//     // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
//     // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

//     // Added:
//     tokenButtonGradientStart: '#909ae2',
//     tokenButtonGradientEnd: '#1f3bc3',
//     customCardGradientStart: '#909ae2',
//     customCardGradientEnd: '#1f3bc3'
//   }
// }

// export function harmonyColors(darkMode: boolean): Colors {
//   return {
//     // base
//     white,
//     black,

//     // text
//     text1: darkMode ? '#FFFFFF' : '#000000',
//     text2: darkMode ? '#C3C5CB' : '#565A69',
//     text3: darkMode ? '#6C7284' : '#888D9B',
//     text4: darkMode ? '#565A69' : '#C3C5CB',
//     text5: darkMode ? '#2C2F36' : '#EDEEF2',

//     // backgrounds / greys
//     bg1: darkMode ? '#212429' : '#FFFFFF',
//     bg2: darkMode ? '#2C2F36' : '#F7F8FA',
//     bg3: darkMode ? '#40444F' : '#EDEEF2',
//     bg4: darkMode ? '#565A69' : '#CED0D9',
//     bg5: darkMode ? '#6C7284' : '#888D9B',

//     //specialty colors
//     modalBG: darkMode ? 'rgba(0,0,0,.425)' : 'rgba(0,0,0,0.3)',
//     advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

//     //primary colors
//     primary1: darkMode ? '#2172E5' : '#00AEE9',
//     primary2: darkMode ? '#3680E7' : '#69FABD',
//     primary3: darkMode ? '#4D8FEA' : '#00c5eb',
//     primary4: darkMode ? '#376bad70' : '#bcecfd',
//     primary5: darkMode ? '#153d6f70' : '#d9f4fd',

//     // color text
//     primaryText1: darkMode ? '#6da8ff' : '#00AEE9',

//     // secondary colors
//     secondary1: darkMode ? '#2172E5' : '#00AEE9',
//     secondary2: darkMode ? '#17000b26' : '#F6DDE8',
//     secondary3: darkMode ? '#17000b26' : '#FDEAF1',

//     // other
//     red1: '#FD4040',
//     red2: '#F82D3A',
//     red3: '#D60000',
//     green1: '#27AE60',
//     yellow1: '#FFE270',
//     yellow2: '#F3841E',
//     blue1: '#2172E5',

//     // dont wanna forget these blue yet
//     // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
//     // blue5: darkMode ? '#153d6f70' : '#EBF4FF',

//     // Added:
//     tokenButtonGradientStart: '#909ae2',
//     tokenButtonGradientEnd: '#1f3bc3',
//     customCardGradientStart: '#909ae2',
//     customCardGradientEnd: '#1f3bc3'
//   }
// }

export function colors(blockchain: Blockchain, darkMode: boolean): Colors {
  // switch (blockchain) {
  //   case Blockchain.BINANCE_SMART_CHAIN:
  //     return bscColors(darkMode)
  //   case Blockchain.HARMONY:
  //     return harmonyColors(darkMode)
  //   default:
  //     return defiKingdomsColors(darkMode)
  // }
  return defiKingdomsColors(darkMode)
}

export function theme(blockchain: Blockchain, darkMode: boolean): DefaultTheme {
  return {
    ...colors(blockchain, darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()
  const blockchain = useBlockchain()

  const themeObject = useMemo(() => theme(blockchain, darkMode), [blockchain, darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text2'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={17} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={16} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  }
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'Poppins';
  font-display: fallback;
}

@supports (font-variation-settings: normal) {
  html, input, textarea, button, div, body {
    font-family: 'Poppins';
    font-size: 16px;
  }
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: 'Poppins';
}

a {
  color: ${colors(Blockchain.ETHEREUM, false).blue1};
}

* {
  box-sizing: border-box;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background-color: #100f21;
}

::-webkit-scrollbar-thumb {
  border-radius: 20px;
  background-color: rgba(255,255,255,.1);
}

/* HIDE ARROWS FOR NUMBER INPUTS */

/* Chrome, Safari, Edge, Opera */
.hideArrows input::-webkit-outer-spin-button,
.hideArrows input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.hideArrows input[type=number] {
  -moz-appearance: textfield;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;

}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg2};
}

body {
  min-height: 100vh;
}

body::after {
  content: "";
  background-size: cover;
  background-image: url(${bgimage});
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: fixed;
  z-index: -1;
}

.align-right {
  text-align: right;
}

.align-center {
  text-align: center;
}

.all-caps {
  text-transform: uppercase !important;
}

.strong {
  font-weight: 700 !important;
}

.sans-serif {
  font-family: 'Poppins' !important;
}

.size-reset {
  font-size: 1rem !important;
}

.smaller {
  font-size: .8em !important;
}

.secondary {
  opacity: .5;
}

.gold {
  color: ${themeColors.gold};
  font-family: 'Lora', serif;
}

.mt {
  margin-top: 20px;
}

.mb {
  margin-bottom: 20px;
}

.pt {
  padding-top: 20px;
}

.pb {
  padding-bottom: 20px;
}

.grid2-auto {
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 6px;
}

#hero-view-id {
  text-align: center;
}

/* Refresh Button */
.refresh-button {
  button {
    padding: 0;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    padding-left: 1.5em;
    margin-bottom: .5em;

    button {
      border: 1px solid ${themeColors.brownLight};
      border-radius: 5px;
      padding: .25em .5em 0;
    }
  `};
}

/* Toggle Button */
.switch {
  --line: #505162;
  --dot: ${themeColors.forestGreen};
  --circle: #9EA0BE;
  --duration: .3s;
  --text: #9EA0BE;
  display: block;
  height: 16px;
  input {
      display: none;
      & + div {
          position: relative;
          display: inline-block;
          &:before,
          &:after {
              --s: 1;
              content: '';
              position: absolute;
              height: 3px;
              top: 6px;
              width: 18px;
              background: var(--line);
              transform: scaleX(var(--s));
              transition: all var(--duration) ease;
          }
          &:before {
              --s: 0;
              left: 0;
              transform-origin: 0 50%;
              border-radius: 2px 0 0 2px;
          }
          &:after {
              left: 20px;
              transform-origin: 100% 50%;
              border-radius: 0 2px 2px 0;
          }
          span {
              padding-left: 40px;
              line-height: 16px;
              color: var(--text);
              display: block;
              height: 16px;
              &:before {
                  --x: 0;
                  --b: var(--circle);
                  --s: 3px;
                  content: '';
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  box-shadow: inset 0 0 0 var(--s) var(--b);
                  transform: translateX(var(--x));
                  transition: all var(--duration) ease;
              }
              &:not(:empty) {
                  padding-left: 64px;
              }
          }
      }
      &:checked {
          & + div {
              &:before {
                  --s: 1;
              }
              &:after {
                  --s: 0;
              }
              span {
                  &:before {
                      --x: 22px;
                      --s: 12px;
                      --b: var(--dot);
                  }
              }
          }
      }
  }
  .switch-text {
    font-size: .8em;
    font-weight: 100;
    padding-left: 6px;
    position: relative;
    top: -4px;
  }
}

@keyframes simpleZoom {
  from {
    transform: scale(.2);
  }
  to {
    transform: scale(1);
  }
}

@keyframes sunburstSpin {
  from {transform:rotate(0deg);}
  to {transform:rotate(360deg);}
}

.chosen {
  .stat-name {
    color: #14C25A !important;
    &:after {
      content: 'Main Profession';
      display: block;
      font-family: 'Poppins', sans-serif;
      font-size: 11px;
      color: white;
      opacity: .5;
    }
  }
}

.dk-modal {
  position: relative;
  border: 1px solid ${themeColors.brownLight};

  &.buy-hero-modal,
  &.hire-hero-modal,
  &.hero-catalog-modal,
  &.hero-modal {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100vw;
      height: 100vh;
      max-height: none;

      .dk-modal--body {
        max-height: none;
      }
    `};
  }
}

.dk-modal--header {
  font-family: "Lora";
  color: #fff;
  padding: 1rem 3.5rem;
  justify-content: space-between;
  width: 100%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 4;
  text-align:center;

  h4 {
    font-family: "Lora";
    margin: 0;
    font-weight: 500;
    font-size: 2rem;
    line-height: 1.2;
    text-transform: capitalize;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 24px;
    `};

  }

  svg {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1rem;
    width: 62px;
    height: 62px;
  }
}

.dk-modal--body {
  padding: 5.5rem 2rem 2rem;
  max-height: 90vh;
  width: 100%;
  position: relative;

  &.scrollable {
    overflow-y: auto;
    height: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 5rem 1rem 1rem;
  `};

  h4 {
    font-family: "Lora";
    margin-top: 0;
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 1.2;
  }
}

.dk-modal--npc-text {
  h4 {
    font-family: "Lora";
    margin-top: 0;
    font-weight: 400;
    font-size: 1.3em;
  }

  line-height: 1.6;
  font-size: 1em;
  padding: .5em 1em;
  color: #e6e6e6;

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }
}

.dk-modal--informational {
  font-family: "Lora";
  margin-top: 0;
  font-weight: 400;
  font-size: 1em;
  font-style: italic;
  text-align: center;
  padding: 1rem 0rem 1rem;
}

.dk-modal--important {
  margin-top: 0;
  font-weight: 600;
  font-size: 1.1em;
  text-transform: uppercase;
}

.bordered-box-thin {
  position: relative;
  border: 1px solid ${themeColors.brownLight};
  padding: 1rem;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5));
}

.bordered-box-thin-cv {
  position: relative;
  padding: 1rem;
  background: transparent linear-gradient(148deg, #100F21CC 0%, #100F21E8 100%) 0% 0% no-repeat padding-box;
}

.bordered-box {
  position: relative;
  image-rendering: -moz-crisp-edges;
  image-rendering: pixelated;
  border: 4px solid ${themeColors.gold};
  border-image-source: url(${borderMain});
  border-image-slice: 4;
  border-image-width: 4px;
  border-image-outset: 0;
  border-image-repeat: round round;
  padding: 1rem;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.5));

  &.bordered-box-hero {
    border-image-source: url(${borderHero});
    border-image-slice:16;
    border-image-width:12px;
    border-image-outset:3px;
  };
  &.bordered-box-modal {
    border-image-source: url(${borderModal});
    border-image-slice:16;
    border-image-width:12px;
    border-image-outset:3px;
  }
}

.dialog-flex {
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  overflow-y: auto;
  margin-bottom: 1rem;

  .bordered-box-thin {
    h4 {
      margin: 0 0 1rem;
      font-size: 22px;
      font-weight: 400;
    }

    p {
      margin: 0 0 1rem;
    }
  }

  .flex {
    flex: 1;
  }

  > div {
    flex: auto;

    &:last-child {
      margin-left: 1rem;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: row wrap;

    > div {

      &:last-child {
        margin-left: 0;
        margin-top: -4px;
      }
    }
  `};
}

.dialog-menu {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 18px;

  li {
    margin: 0;
    padding: 0;

    a, button {
      padding: .25em .5em .25em 1.75em;
      cursor: pointer;
      text-shadow: 1px 1px 0 rgba(0,0,0,.5);
      white-space: nowrap;
      display: block;
      text-decoration: none;
      color: #fff;
      width: 100%;
      text-align: left;
      border: 0;
      background: none;
      outline: none;
      border-radius: 0;

      &.is-active,
      &.is-active:hover,
      &.is-active:focus,
      &.is-active:focus-visible {
      }
      &.is-active-large,
      &.is-active-large:hover,
      &.is-active-large:focus,
      &.is-active-large:focus-visible {
        background: url(${hand}) 0.2em 60% / 35.2px 24px no-repeat;
        color: ${themeColors.gold};
      }
      &.is-active-large,
      &.is-active-large:hover,
      &.is-active-large:focus,
      &.is-active-large:focus-visible {
        background: url(${hand}) 0.2em 60% / 35.2px 24px no-repeat;
        color: ${themeColors.gold};
      }
      &.is-active,
      &:hover,
      &:focus-visible {
        background: url(${hand}) 0em 40% no-repeat;
        background-size: 25px 20px;
        color: ${themeColors.gold};
        border: 0;
        transition: .5s ease;
      }

      &.cancel {
        &:hover,
        &:focus,
        &:focus-visible {
          color: ${themeColors.red};
        }
      }
    }
  }
}

.dialog-wrapper {
  position: absolute;
  width: 100%;
  overflow: auto;
  z-index: 2;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  flex-flow: column wrap;
  padding: 4.5rem 25% 7rem;

  .cancel-button {
    width: 36px;
    height: 36px;
    position: absolute;
    top: -15px;
    right: -15px;
    cursor: pointer;
    border-radius: 36px;

    a {
      border-radius: 36px;
      color: ${themeColors.gold};
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      font-weight: 700;
      font-size: 16px;
      border: 4px solid ${themeColors.gold};
      cursor: pointer;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    padding-top: 13rem;
    padding: 3.8rem 9rem 7rem 260px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem 1rem 7rem;
    max-widht: none;
    padding: 7rem .5rem 7rem;

    .bordered-box {
      padding: 1rem;
    }
  `};
}

.page-fade-enter {
  opacity: 0;
}
.page-fade-enter-active {
  opacity: 1;
  position: absolute !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition: opacity 1000ms ease-in;
}
.page-fade-exit {
  opacity: 1;
}
.page-fade-exit-active {
  opacity: 0;
  position: absolute !important;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition: opacity 1000ms ease-out;
}
.page-fade-exit-done {
  opacity: 0;
  position: relative !important;
}

.pricing {
  font-size: 13px;
  font-family: 'Lora', serif;
  span {
    opacity: .65;
  }
}
.price {
  font-size: 20px;
  font-weight: bold;
  font-family: 'Poppins' sans-serif;
}
`
