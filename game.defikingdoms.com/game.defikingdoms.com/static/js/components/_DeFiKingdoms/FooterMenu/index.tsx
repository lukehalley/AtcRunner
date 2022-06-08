import { Link } from 'react-router-dom'
import PlayCutsceneButton from 'features/cutscenes/components/PlayCutsceneButton'
import styled from 'styled-components'
import hand from 'assets/images/gui/hand-pointer.png'

const FooterNavPosition = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToSmall`
      bottom: .5rem;
      left: .5rem;
    `};
`

const MenuContainer = styled.div.attrs(props => ({
  className: 'menu-container'
}))`
  position: relative;

  a {
    color: #fff;
    text-decoration: none;
    display: block;
    padding: 0em 0.6em 0em 2.1em;

    &.is-active,
    &.is-active:hover {
      background: url(${hand}) 0.4em 60% no-repeat;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.125);
    }
  }
`

const FooterMenu = () => {
  return (
    <FooterNavPosition>
      <MenuContainer>
        <PlayCutsceneButton />
        <div className="bordered-box-thin">
          <Link className="is-active" to="/">
            World Map
          </Link>
        </div>
      </MenuContainer>
    </FooterNavPosition>
  )
}

export default FooterMenu
