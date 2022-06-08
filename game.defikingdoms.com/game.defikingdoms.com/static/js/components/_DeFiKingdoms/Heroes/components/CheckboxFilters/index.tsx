import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import { makeStyles } from '@material-ui/core/styles'
import { getClickCursorFull } from 'features/preferences/utils'

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    flexDirection: 'row',
    '& .MuiFormLabel-root': {
      width: '100%'
    },
    '& .statBonus': {
      color: '#50B467'
    },
    '& .statGrowth': {
      color: '#5EBEE8'
    },
    '& .MuiFormControlLabel-root': {
      width: '50%',
      marginRight: 0,
      marginLeft: 0,
      '& .MuiSvgIcon-root': {
        color: 'orange',
        width: '18px',
        height: '18px'
      },
      '& .MuiTypography-root': {
        fontSize: '14px'
      }
    }
  }
}))

interface CheckboxFiltersProps {
  title: string
  values: { [key: string]: boolean }
  width?: string
  onChange: Function
}
const CheckboxFilters = ({ title, values, width, onChange }: CheckboxFiltersProps) => {
  const classes = useStyles()
  return (
    <FormGroup className={classes.root}>
      <FormLabel
        className={title === 'Stat Bonus' ? 'statBonus' : title === 'Stat Growth Bonus' ? 'statGrowth' : undefined}
        component="label"
      >
        {title}
      </FormLabel>
      {Object.keys(values).map(key => {
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={values[key]}
                onChange={e => onChange(e)}
                name={key}
                style={{ cursor: getClickCursorFull() }}
              />
            }
            style={{ width, cursor: getClickCursorFull() }}
            label={key
              .toLowerCase()
              .split(' ')
              .map(s => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ')
              .split('_') // convert underscore separated for_hire and for_sale values
              .map(s => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ')}
          />
        )
      })}
    </FormGroup>
  )
}

export default CheckboxFilters
