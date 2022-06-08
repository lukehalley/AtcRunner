import { ArrowLeft } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { AppDispatch } from 'features'
import { resetMintState } from 'features/mint/actions'
import { darken } from 'polished'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import Settings from '../Settings'

const Tabs = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  color: ${({ theme }) => theme.text3};
  font-size: 16px;

  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text1};
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.1, theme.text1)};
  }
`

const ActiveText = styled.div`
  font-weight: 500;
  font-size: 16px;
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.text1};
`

export function SwapPoolTabs({ active }: { active: 'swap' | 'pool' }) {
  const { t } = useTranslation()

  return (
    <Tabs style={{ marginBottom: '20px', display: 'none' }}>
      <StyledNavLink
        id={`swap-nav-link`}
        to={'/swap'}
        className={({ isActive }: { isActive: boolean }) => (active === 'swap' ? 'is-active' : undefined) as string}
      >
        {t('swap')}
      </StyledNavLink>
      <StyledNavLink
        id={`pool-nav-link`}
        to={'/pool'}
        className={({ isActive }: { isActive: boolean }) => (active === 'pool' ? 'is-active' : undefined) as string}
      >
        {t('pool')}
      </StyledNavLink>
    </Tabs>
  )
}

export function FindPoolTabs() {
  const navigate = useNavigate()

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <a onClick={() => navigate(-1)}>
          <StyledArrowLeft />
        </a>
        <ActiveText>Import Pool</ActiveText>
        <Settings />
      </RowBetween>
    </Tabs>
  )
}

export function AddRemoveTabs({ adding, creating }: { adding: boolean; creating: boolean }) {
  // reset states on back
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <a
          onClick={() => {
            adding && dispatch(resetMintState())
            navigate(-1)
          }}
        >
          <StyledArrowLeft />
        </a>
        <ActiveText style={{ fontSize: '18px' }}>
          {creating ? 'Create a Liquidity Seed' : adding ? 'Add Seeds' : 'Split Seeds'}
        </ActiveText>
        <Settings />
      </RowBetween>
    </Tabs>
  )
}
