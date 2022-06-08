import { useState } from 'react'
import { BarChart2, Book, Code, BookOpen } from 'react-feather'
import { NavLink } from 'react-router-dom'
import {
  faRedditAlien,
  faTelegramPlane,
  faTwitter,
  faDiscord,
  faYoutube,
  faInstagram
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ClickAwayListener } from '@material-ui/core'
import { useBlockPropagation } from 'components/Phaser/utils'
import styled from 'styled-components'
import colors from 'utils/colors'
import hand from 'assets/images/gui/hand-pointer.png'
import menuIcon from 'assets/images/gui/menu-icon.png'
import { Route, RouteWithSubRoutes } from './Route'

const { boxBgGradient, boxBgGradientHover, gold } = colors

interface HamburgerMenuProps {
  navigation: RouteWithSubRoutes[]
}

const HamburgerMenu = ({ navigation }: HamburgerMenuProps) => {
  useBlockPropagation('.menu-wrapper')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAbout, setShowAbout] = useState(true)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    setShowAbout(false)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setShowAbout(false)
  }

  const activeStyle = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : undefined) as string
  return (
    <ClickAwayListener onClickAway={closeMenu}>
      <MenuWrapper>
        <MenuButtonContainer onClick={toggleMenu}>
          <MenuButtonText>Menu</MenuButtonText>
        </MenuButtonContainer>

        {menuOpen && (
          <MenuContainer>
            <NavLink className={activeStyle} to="/" onClick={toggleMenu}>
              Map
            </NavLink>
            <span className="divider" />
            {navigation.map(route => (
              <Route key={route.label} route={route} setMenuOpen={setMenuOpen} setShowAbout={setShowAbout} />
            ))}
            <span className="divider" />
            <a onClick={() => setShowAbout(!showAbout)}>{showAbout ? 'About -' : 'About +'}</a>
            {showAbout && (
              <span className="subnav">
                <a href="https://dexscreener.com/harmony/defikingdoms" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <BarChart2 />
                    Charts
                  </span>
                </a>
                <a href="https://github.com/DefiKingdoms" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <Code />
                    Code
                  </span>
                </a>
                <a href="https://docs.defikingdoms.com" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <Book />
                    Docs
                  </span>
                </a>
                <a href="https://defikingdoms.com/tutorial.html" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <BookOpen />
                    Tutorial
                  </span>
                </a>
                <span className="divider" />
                <a href="https://discord.gg/kARBQuMAhS" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faDiscord} />
                    Discord
                  </span>
                </a>
                <a href="https://www.instagram.com/defikingdoms/" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faInstagram} />
                    Instagram
                  </span>
                </a>
                <a href="https://www.reddit.com/r/DefiKingdoms/" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faRedditAlien} />
                    Reddit
                  </span>
                </a>
                <a href="https://t.me/defikingdoms" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faTelegramPlane} />
                    Telegram
                  </span>
                </a>
                <a href="https://twitter.com/DefiKingdoms" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faTwitter} />
                    Twitter
                  </span>
                </a>
                <a href="https://www.youtube.com/c/defikingdoms" target="_blank" rel="noreferrer">
                  <span className="icon">
                    <FontAwesomeIcon icon={faYoutube} />
                    YouTube
                  </span>
                </a>
              </span>
            )}
          </MenuContainer>
        )}
      </MenuWrapper>
    </ClickAwayListener>
  )
}

export default HamburgerMenu

const MenuWrapper = styled.div.attrs(props => ({
  className: 'menu-wrapper'
}))`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-end;
`

const MenuButtonContainer = styled.button.attrs(props => ({
  className: 'menu-button-container'
}))`
  position: relative;
  background-image: ${boxBgGradient};
  padding: 62px 0 0;
  background-color: transparent;
  border: 0;
  width: 92px;
  height: 91px;
  transition: all 0.2s ease;

  &:before {
    content: '';
    background-image: url(${menuIcon});
    background-size: 100%;
    width: 96px;
    height: 95px;
    position: absolute;
    top: -1px;
    left: -1px;
  }

  &:hover {
    background-image: ${boxBgGradientHover};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 58px;
    height: 58px;
    padding-top: 36px;

    &:before {
      width: 61px;
      height: 60px;
    }
  `};
`

const MenuButtonText = styled.div.attrs(props => ({
  className: 'menu-button-text'
}))`
  font-size: 14px;
  text-align: center;
  font-family: 'Lora', serif;
  color: ${gold};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

const MenuContainer = styled.div.attrs(props => ({
  className: 'menu-container'
}))`
  position: relative;
  background-image: ${boxBgGradient};
  margin-top: 2px;
  max-height: calc(100vh - 150px);
  overflow-y: auto;

  a {
    color: #fff;
    text-decoration: none;
    display: block;
    padding: 0.4em 1em 0.4em 2.5em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.125);
    cursor: pointer;
    font-size: 14px;

    &.is-active,
    &.is-active:hover {
      background: url(${hand}) 0.6em 60% no-repeat;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.125);
    }

    .icon {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      svg {
        width: 16px;
        margin-right: 6px;
      }
    }
  }

  .subnav {
    padding-left: 5px;
    display: block;

    a {
      font-size: 0.875em;
      opacity: 0.75;
      padding: 0.35em 1em 0.35em 2.5em;

      &:hover,
      &:focus {
        opacity: 1;
      }
    }

    .divider {
      border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    }
  }

  .divider {
    display: block;
    height: 1px;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  }
`
