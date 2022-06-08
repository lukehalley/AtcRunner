import { memo } from 'react'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import { makeStyles } from '@material-ui/core/styles'
import { setHeroFilters } from 'features/heroes/state'
import { useSelector, useDispatch } from 'features/hooks'
import RangeInput from '../RangeInput'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    '& .section-header': {
      color: '#14c25a',
      fontSize: '12px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: 700,
      fontFamily: 'Poppins, Arial, sans-serif',
      margin: '1.5em 0 -.5em'
    }
  },
  formControl: {
    margin: theme.spacing(0, 1),
    width: '100%'
  }
}))

type StatOptions =
  | 'agility'
  | 'dexterity'
  | 'endurance'
  | 'hp'
  | 'intelligence'
  | 'luck'
  | 'mp'
  | 'stamina'
  | 'strength'
  | 'vitality'
  | 'wisdom'
  | 'fishing'
  | 'foraging'
  | 'gardening'
  | 'mining'

/* exported component */
const Stats = () => {
  const classes = useStyles()
  const { heroFilters } = useSelector(s => s.heroes)
  const dispatch = useDispatch()

  const setStats = (category: string, stats: number[], type: string) => {
    dispatch(
      setHeroFilters({
        filterType: type,
        filterSubType: category,
        filterObject: [...stats]
      })
    )
  }

  const mapInputs = (type: string) => {
    const items = Object.keys(heroFilters.stats[type])

    return items.map((value: any) => {
      let classnames = ''

      if (value === 'hp' || value === 'mp') {
        classnames = classnames + ' ' + 'all-caps'
      }
      return (
        <RangeInput
          key={value}
          label={value}
          value={heroFilters.stats[type][value as StatOptions]}
          onChange={(value: number[], key: StatOptions) => setStats(key, value, type)}
          onBlur={(value: number[], key: StatOptions) => setStats(key, value, type)}
          formLabelClass={classnames}
          step={type === 'stats' ? 1 : 0.1}
        />
      )
    })
  }

  return (
    <div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="label" className="section-header">
          Skills
        </FormLabel>
        {mapInputs('skills')}

        <FormLabel component="label" className="section-header">
          Stats
        </FormLabel>
        {mapInputs('stats')}
      </FormControl>
    </div>
  )
}

export default memo(Stats)
