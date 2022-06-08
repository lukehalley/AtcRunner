import { Box } from '@material-ui/core'
import { TextField } from '@material-ui/core'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import { makeStyles } from '@material-ui/core/styles'
import styled from 'styled-components'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    flexDirection: 'row',
    '& .MuiFormLabel-root': {
      width: '100%',
      marginRight: 0,
      marginBottom: '3px'
    },
    '& .MuiFormControlLabel-root': {
      width: '100%',

      '& .MuiSvgIcon-root': {
        color: 'orange'
      }
    },
    '& .MuiTextField-root .MuiFormLabel-root': {
      position: 'absolute',
      top: '-9px',
      left: '-7px',
      fontSize: '10px',
      fontFamily: 'OpenSans',
      margin: 0,
      padding: 0,
      width: 'auto',
      color: 'orange'
    },
    '& .MuiOutlinedInput-input': {
      padding: '6px 8px 6px 35px'
    }
  }
}))

const StatWrapper = styled.div.attrs(() => ({
  className: 'stat-wrapper'
}))`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
`

interface RangeInputProps {
  label: string
  value: number[]
  onChange: Function
  onBlur: Function
  formLabelClass?: string | undefined
  step?: number
}
const RangeInput = ({ label, value, onChange, onBlur, step, formLabelClass = '' }: RangeInputProps) => {
  const classes = useStyles()
  const fixMinMax = (val: number[]) => {
    const skillMin = val[0]
    const skillMax = val[1]

    if (skillMin > skillMax) {
      return [skillMax, skillMin]
    }
    return [skillMin, skillMax]
  }
  return (
    <FormGroup key={label} className={classes.root}>
      <FormLabel component="label" id={label} className={formLabelClass}>
        {label
          .toLowerCase()
          .split(' ')
          .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
          .join(' ')}
      </FormLabel>
      <StatWrapper>
        <Box sx={{ maxWidth: '48%' }}>
          <TextField
            label="Min:"
            id={`min-stat-${label}`}
            variant="outlined"
            value={Number(value[0]).toString()}
            type="number"
            InputProps={{ inputProps: { min: 0, step: step } }}
            InputLabelProps={{ shrink: false }}
            onChange={(e: any) => {
              const newRange = [Number(e.target.value), value[1]]
              onChange(newRange, label, true)
            }}
            onBlur={() => onBlur(fixMinMax(value), label, true)}
          />
        </Box>

        <Box sx={{ maxWidth: '48%' }}>
          <TextField
            label="Max:"
            id={`max-stat-${label}`}
            variant="outlined"
            value={Number(value[1]).toString()}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            InputLabelProps={{ shrink: false }}
            onChange={(e: any) => {
              const newRange = [value[0], Number(e.target.value)]
              onChange(newRange, label, false)
            }}
            onBlur={() => onBlur(fixMinMax(value), label, false)}
          />
        </Box>
      </StatWrapper>
    </FormGroup>
  )
}

export default RangeInput
