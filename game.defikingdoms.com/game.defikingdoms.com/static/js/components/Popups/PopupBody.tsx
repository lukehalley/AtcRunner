import styled from 'styled-components'
import { TYPE } from 'theme'
import { ExternalLink } from 'theme/components'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

interface PopupBodyProps {
  message: string
  Icon: React.ElementType
  link?: string
  linkText?: string
}
export default function PopupBody({ message, Icon, link, linkText }: PopupBodyProps) {
  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        <Icon />
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{message}</TYPE.body>
        {link && linkText && <ExternalLink href={link}>{linkText}</ExternalLink>}
      </AutoColumn>
    </RowNoFlex>
  )
}
