import { memo } from 'react'
import styled from 'styled-components'
import inputLeft from 'assets/images/gui/input_left.png'
import inputMiddle from 'assets/images/gui/input_middle.png'
import inputRight from 'assets/images/gui/input_right.png'
import { escapeRegExp } from '../../../../../utils'

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text5)};
  position: relative;
  font-weight: 500;
  outline: none;
  border: 0px;
  flex: 1 1 auto;
  background-color: transparent;
  font-size: 20px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px 30px;
  height: 58px;
  width: 100%;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: #c6906c;
  }
`

const StyledLabel = styled.label`
  position: relative;
  display: block;
  height: 58px;
  width: 100%;
  max-width: 300px;
  background-image: url(${inputMiddle});
  background-repeat: repeat-x;
  background-position: top center;
  margin: 0 auto 10px;

  &:before {
    content: '';
    display: block;
    position: absolute;
    width: calc(100% + 4px);
    height: 100%;
    left: -2px;
    top: 0px;
    background-image: url(${inputLeft}), url(${inputRight});
    background-repeat: no-repeat;
    background-position: top left, top right;
  }
`

const inputRegex = RegExp(`^.*$`) // match escaped "." characters via in a non-capturing group

export const Input = memo(function InnerInput({
  value,
  onUserInput,
  placeholder,
  ...rest
}: {
  value: string | number
  onUserInput: (input: string) => void
  error?: boolean
  fontSize?: string
  align?: 'right' | 'left'
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) {
  const enforcer = (nextUserInput: string) => {
    if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
      onUserInput(nextUserInput)
    }
  }

  return (
    <StyledLabel>
      <StyledInput
        {...rest}
        value={value}
        onChange={event => {
          enforcer(event.target.value)
        }}
        // universal input options
        title="Profile Name"
        autoComplete="off"
        autoCorrect="off"
        // text-specific options
        type="text"
        pattern="^.*$"
        placeholder={placeholder || 'Enter Name Here'}
        minLength={3}
        maxLength={16}
        spellCheck="false"
      />
    </StyledLabel>
  )
})

export default Input

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
