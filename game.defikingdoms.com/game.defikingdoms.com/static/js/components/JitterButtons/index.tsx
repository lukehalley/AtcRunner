import { ChevronDown } from 'react-feather'
import { darken, lighten } from 'polished'
import { Button as RebassButton, ButtonProps } from 'rebass/styled-components'
import styled from 'styled-components'
import colors from 'utils/colors'
import { RowBetween } from '../Row'

const { forestGreen, deepBlue, goldDark, goldLight } = colors

const Base = styled(RebassButton)<{
  padding?: string
  width?: string
  borderRadius?: string
  altDisabledStyle?: boolean
}>`
  padding: ${({ padding }) => (padding ? padding : '10px')};
  width: ${({ width }) => (width ? width : '100%')};
  border-radius: 5px;
  color: white;
  background: ${forestGreen};
  text-transform: uppercase;
  text-align: center;
  font-size: 13px;
  display: inline-block;
  letter-spacing: 1px;
  margin: 10px 0px;
  cursor: pointer;
  position: relative;
  transform: translateY(0);
  box-shadow: 0px 0px 0px ${goldDark};
  transition: all 0.1s ease-in-out;
  &:hover:enabled {
    background: ${goldLight};
    color: ${deepBlue};
    box-shadow: 0px 3px 0px ${goldDark};
    transform: translateY(-3px);
  }
  &:disabled {
    cursor: auto;
    opacity: 0.5;
  }

  > * {
    user-select: none;
  }
`

export const ButtonPrimary = styled(Base)`
  color: white;
`

export const ButtonGhost = styled(Base)`
  border: 1px solid #fac05d;
  color: #fac05d;
  border-radius: 8px;
  opacity: 1;
  background-image: none;
  background-color: transparent;
  padding: 5px 20px;
  width: auto;

  font: normal normal 300 12px/18px Poppins;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  opacity: 1;
`

export const ButtonGhostWhite = styled(Base)`
  border: 1px solid #fff;
  color: #fff;
  border-radius: 8px;
  background-image: none;
  background-color: transparent;
  padding: 5px 20px;
  width: auto;

  font: normal normal 300 12px/18px Poppins;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  opacity: 0.8;

  &:enabled:hover {
    color: white;
    border-color: white;
    opacity: 1;
  }
`

export const ButtonLight = styled(Base)`
  color: ${({ theme }) => theme.primary1};
  font-weight: 500;
`

export const ButtonGray = styled(Base)`
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
`

export const ButtonSmall = styled(Base)`
  background: #100f21;
  letter-spacing: 1px;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(112, 112, 112, 0.3);
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  transition: all 0.2s ease-in-out;
  width: inherit;
  :hover {
    color: white;
    border-color: #f0b859;
  }
`

export const ButtonSecondary = styled(Base)`
  color: ${({ theme }) => theme.primary1};
  padding: ${({ padding }) => (padding ? padding : '10px')};
`

export const ButtonOutlined = styled(Base)`
  border-color: ${({ theme }) => theme.bg2};
  background-color: transparent;
  color: ${({ theme }) => theme.text1};

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:active {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.bg4};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonClaim = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  font-size: 16px;
  margin: 15px auto 0;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonEmpty = styled(Base)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary1};
  display: flex;
  justify-content: center;
  align-items: center;

  &:focus {
    text-decoration: underline;
  }
  &:hover {
    text-decoration: none;
  }
  &:active {
    text-decoration: none;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const ButtonWhite = styled(Base)`
  border: 3px solid #edeef2;
  background-color: ${({ theme }) => theme.bg1};
  color: black;

  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    box-shadow: 0 0 0 1pt ${darken(0.05, '#edeef2')};
  }
  &:hover {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonConfirmedStyle = styled(Base)`
  background-color: ${({ theme }) => lighten(0.5, theme.green1)};
  color: ${({ theme }) => theme.green1};
  border-color: ${({ theme }) => theme.green1};

  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const ButtonErrorStyle = styled(Base)`
  background-color: ${({ theme }) => theme.red1};
  border-color: ${({ theme }) => theme.red1};

  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.red1)};
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.red1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.red1)};
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    box-shadow: none;
    background-color: ${({ theme }) => theme.red1};
    border-color: ${({ theme }) => theme.red1};
  }
`

export const CustomButtonWhite = styled(Base)`
  border: 3px solid #edeef2;
  background-color: #fff;
  color: black;

  &:focus {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    box-shadow: 0 0 0 1pt ${darken(0.05, '#edeef2')};
  }
  &:hover {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${darken(0.1, '#edeef2')};
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

export const GreenButton = styled(Base)`
  border-radius: 5px;
  color: white;
  background: ${forestGreen};
  text-transform: uppercase;
  text-align: center;
  font-size: 13px;
  display: inline-block;
  letter-spacing: 1px;
  padding: 10px 30px;
  margin: 10px 0px;
  cursor: pointer;
  position: relative;
  top: 0;
  box-shadow: 0px 0px 0px ${goldDark};
  transition: all 0.1s ease-in-out;
  &:hover {
    background: ${goldLight};
    color: ${deepBlue};
    box-shadow: 0px 3px 0px ${goldDark};
    transform: translateY(-3px);
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
    &:hover {
      background: ${forestGreen};
      color: white;
      box-shadow: 0px 0 0px ${goldDark};
      transform: translateY(0);
    }
  }
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownGrey({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonGray {...rest} disabled={disabled} style={{ borderRadius: '20px' }}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonGray>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}
