import styled from 'styled-components/macro'
import warningIcon from 'assets/images/warning.svg'

interface WarningBlockProps {
  backgroundColor?: string
  children: React.ReactElement | React.ReactNode
  style?: Object
}

const WarningBlock = ({ backgroundColor, style, children }: WarningBlockProps) => {
  return (
    <WarningBlockStyled style={style} backgroundColor={backgroundColor}>
      <img src={warningIcon} alt="" />
      {children}
    </WarningBlockStyled>
  )
}

export default WarningBlock

const WarningBlockStyled = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  margin: 10px 0;
  gap: 10px;
  background-color: ${props => (props.backgroundColor ? props.backgroundColor : 'rgba(255, 108, 0, .65)')};

  img {
    width: 18px;
    margin-right: 8px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
`
