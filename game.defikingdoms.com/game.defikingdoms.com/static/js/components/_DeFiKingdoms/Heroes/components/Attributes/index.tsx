import { ChangeEvent, memo } from 'react'
import FormControl from '@material-ui/core/FormControl'
import { makeStyles } from '@material-ui/core/styles'
import { defaultHeroFilters } from 'features/heroes/constants'
import { setHeroFilters } from 'features/heroes/state'
import { useDispatch, useSelector } from 'features/hooks'
import CheckboxFilters from '../CheckboxFilters'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex'
  },
  formControl: {
    margin: theme.spacing(0, 1)
  },
  formGroup: {
    width: '100%',
    flexDirection: 'row',
    '& .MuiFormLabel-root': {
      width: '100%'
    },
    '& .MuiFormControlLabel-root': {
      width: '50%',
      marginRight: 0,
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

/* exported component */
const Attributes = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { heroFilters } = useSelector(s => s.heroes)

  function handleAttributesChange(e: ChangeEvent<HTMLInputElement>, filterType: string) {
    if (e.target.name === 'all') {
      dispatch(
        setHeroFilters({
          filterType: 'attributes',
          filterSubType: filterType,
          filterObject: {
            ...((defaultHeroFilters.attributes as any)[filterType] || {})
          }
        })
      )
    } else {
      dispatch(
        setHeroFilters({
          filterType: 'attributes',
          filterSubType: filterType,
          filterObject: {
            all: false,
            [e.target.name]: e.target.checked
          }
        })
      )
    }
  }

  function handleBackgroundsChange(e: ChangeEvent<HTMLInputElement>) {
    handleAttributesChange(e, 'backgrounds')
  }

  function handleElementsChange(e: ChangeEvent<HTMLInputElement>) {
    handleAttributesChange(e, 'elements')
  }

  const handleCheckboxChange = (category: string, event: any) => {
    if (event.target.name === 'all') {
      dispatch(
        setHeroFilters({
          filterType: 'attributes',
          filterSubType: category,
          filterObject: {
            ...((defaultHeroFilters.attributes as any)[category] || {})
          }
        })
      )
    } else {
      dispatch(
        setHeroFilters({
          filterType: 'attributes',
          filterSubType: category,
          filterObject: {
            all: false,
            [event.target.name]: event.target.checked
          }
        })
      )
    }
  }

  return (
    <div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        <CheckboxFilters
          title="Professions"
          values={heroFilters.attributes.professions}
          onChange={(e: any) => handleCheckboxChange('professions', e)}
        />
        <CheckboxFilters
          title="Stat Bonus"
          values={heroFilters.attributes.statBoost1}
          onChange={(e: any) => handleCheckboxChange('statBoost1', e)}
        />
        <CheckboxFilters
          title="Stat Growth Bonus"
          values={heroFilters.attributes.statBoost2}
          onChange={(e: any) => handleCheckboxChange('statBoost2', e)}
        />
        <CheckboxFilters title="Elements" values={heroFilters.attributes.elements} onChange={handleElementsChange} />
        <CheckboxFilters
          title="Backgrounds"
          values={heroFilters.attributes.backgrounds}
          onChange={handleBackgroundsChange}
        />
      </FormControl>
    </div>
  )
}

export default memo(Attributes)
