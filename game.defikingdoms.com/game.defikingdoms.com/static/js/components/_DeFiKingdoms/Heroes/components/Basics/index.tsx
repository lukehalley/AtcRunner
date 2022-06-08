import { useState, useEffect, ChangeEvent, memo } from 'react'
import { Box, TextField } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormLabel from '@material-ui/core/FormLabel'
import MaterialSlider from '@material-ui/core/Slider'
import { makeStyles } from '@material-ui/core/styles'
import { ListType } from 'features/heroHub/types'
import { defaultHeroFilters, genMarks, levelMarks, rarityMarks, summonsMarks } from 'features/heroes/constants'
import { setHeroFilters } from 'features/heroes/state'
import { useDispatch, useSelector } from 'features/hooks'
import { getClickCursorFull } from 'features/preferences/utils'
import CheckboxFilters from '../CheckboxFilters'
import RangeInput from '../RangeInput'

interface BasicsProps {
  basicFilters?: any
  setBasicFilters?: any
  listType: ListType
  defaultFilters?: any
  allFilters?: any
  setAllFilters?: any
}

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',

    '& .MuiTextField-root': {
      width: '100%'
    }
  },
  formControl: {
    margin: theme.spacing(0, 1)
  },
  slider: {
    marginLeft: '.5rem',
    marginRight: '.5rem',
    maxWidth: 'calc(100% - 1rem)',
    '& .MuiSlider-markLabel': {
      fontSize: '10px'
    }
  }
}))

interface Mark {
  label: string
  value: number
}
enum ValueLabelDisplay {
  on = 'on',
  off = 'off',
  auto = 'auto'
}
interface SliderProps {
  onChange: Function
  value: number[]
  className?: string
  style?: any
  valueLabelDisplay: ValueLabelDisplay
  ['aria-labelledby']?: string
  defaultValue: number[]
  marks?: Mark[]
  max: number
  min: number
}
// Wrapper for slider for performance...it was pretty bad
const Slider = ({ onChange, defaultValue, style, ...props }: SliderProps) => {
  const [state, setState] = useState(defaultValue)
  const [changeCommitted, setChangeCommitted] = useState(false)
  const { resetEventTriggered } = useSelector(s => s.heroes)

  useEffect(() => {
    if (changeCommitted) {
      onChange(state)
      setChangeCommitted(false)
    }
  }, [changeCommitted])

  useEffect(() => {
    setState(defaultValue)
  }, [resetEventTriggered])

  return (
    <MaterialSlider
      {...props}
      onChange={(e: any, v: any) => {
        setState(v)
      }}
      onChangeCommitted={() => {
        setChangeCommitted(true)
      }}
      value={[...state]}
      style={style}
    />
  )
}

/* exported component */
const Basics: React.FC<BasicsProps> = ({ listType }: BasicsProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { heroFilters } = useSelector(s => s.heroes)

  // const handleCheckboxChange = (category: string, event: any) => {
  //   dispatch(
  //     setHeroFilters({
  //       filterType: 'basic',
  //       filterSubType: category,
  //       filterObject: {
  //         [event.target.name]: event.target.checked
  //       }
  //     })
  //   )
  // }

  function handleBasicsChange(e: ChangeEvent<HTMLInputElement>, filterType: string) {
    if (e.target.name === 'all') {
      dispatch(
        setHeroFilters({
          filterType: 'basic',
          filterSubType: filterType,
          filterObject: {
            ...((defaultHeroFilters.basic as any)[filterType] || {})
          }
        })
      )
    } else {
      dispatch(
        setHeroFilters({
          filterType: 'basic',
          filterSubType: filterType,
          filterObject: {
            all: false,
            [e.target.name]: e.target.checked
          }
        })
      )
    }
  }

  function handleValueChange(event: any, category: string) {
    const value = event.target.value
    dispatch(
      setHeroFilters({
        filterType: 'basic',
        filterSubType: category,
        filterObject: value
      })
    )
  }

  function handlePriceChange(value: number[]) {
    dispatch(
      setHeroFilters({
        filterType: 'basic',
        filterSubType: 'price',
        filterObject: [...value]
      })
    )
  }

  function handleHeroStatusChange(e: ChangeEvent<HTMLInputElement>) {
    handleBasicsChange(e, 'status')
  }

  function handleHeroShinyChange(e: ChangeEvent<HTMLInputElement>) {
    handleBasicsChange(e, 'shiny')
  }

  function handleHeroGenderChange(e: ChangeEvent<HTMLInputElement>) {
    handleBasicsChange(e, 'gender')
  }

  function handleHeroClassChange(e: ChangeEvent<HTMLInputElement>) {
    handleBasicsChange(e, 'heroClasses')
  }

  function handleHeroSubClassChange(e: ChangeEvent<HTMLInputElement>) {
    handleBasicsChange(e, 'heroSubClasses')
  }

  const handleSliderChange = (value: number[], category: string) => {
    dispatch(
      setHeroFilters({
        filterType: 'basic',
        filterSubType: category,
        filterObject: [...value]
      })
    )
  }

  return (
    <div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        {listType === 'owned' || listType === 'catalog' || listType === 'available' ? (
          <Box sx={{ minWidth: '100%' }}>
            <TextField
              id={`hero-id-search`}
              variant="outlined"
              value={heroFilters.basic.id}
              placeholder="Search by Hero ID"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              onChange={e => handleValueChange(e, 'id')}
            />
          </Box>
        ) : null}

        {listType === 'owned' ? (
          <CheckboxFilters title="Status" values={heroFilters.basic.status} onChange={handleHeroStatusChange} />
        ) : listType === 'catalog' ? null : (
          <RangeInput
            label="price"
            value={heroFilters.basic.price}
            onChange={handlePriceChange}
            onBlur={handlePriceChange}
          />
        )}

        <CheckboxFilters
          title="Gender"
          width={'33%'}
          values={heroFilters.basic.gender}
          onChange={handleHeroGenderChange}
        />
        <CheckboxFilters
          title="Shiny"
          width={'33%'}
          values={heroFilters.basic.shiny}
          onChange={handleHeroShinyChange}
        />
        <CheckboxFilters title="Class" values={heroFilters.basic.heroClasses} onChange={handleHeroClassChange} />
        <CheckboxFilters
          title="Sub Class"
          values={heroFilters.basic.heroSubClasses}
          onChange={handleHeroSubClassChange}
        />
        <FormGroup>
          <FormLabel component="label" id="summons-slider">
            Summons Remaining
          </FormLabel>
          <Slider
            className={classes.slider}
            value={[...heroFilters.basic.summonsRemaining]}
            style={{ cursor: getClickCursorFull() }}
            onChange={(v: number[]) => handleSliderChange(v, 'summonsRemaining')}
            valueLabelDisplay={ValueLabelDisplay.off}
            aria-labelledby="summons-slider"
            defaultValue={[...heroFilters.basic.summonsRemaining]}
            marks={summonsMarks}
            max={10}
            min={0}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel component="label" id="rarity-slider">
            Rarity
          </FormLabel>
          <Slider
            className={classes.slider}
            value={[...heroFilters.basic.rarity]}
            style={{ cursor: getClickCursorFull() }}
            onChange={(v: number[]) => handleSliderChange(v, 'rarity')}
            valueLabelDisplay={ValueLabelDisplay.off}
            aria-labelledby="rarity-slider"
            defaultValue={[...heroFilters.basic.rarity]}
            marks={rarityMarks}
            max={4}
            min={0}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel component="label" id="generation-slider">
            Generation
          </FormLabel>
          <Slider
            className={classes.slider}
            value={[...heroFilters.basic.generation]}
            style={{ cursor: getClickCursorFull() }}
            onChange={(v: number[]) => handleSliderChange(v, 'generation')}
            valueLabelDisplay={ValueLabelDisplay.off}
            aria-labelledby="generation-slider"
            defaultValue={[...heroFilters.basic.generation]}
            marks={genMarks}
            max={11}
            min={0}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel component="label" id="level-slider">
            Level
          </FormLabel>
          <Slider
            className={classes.slider}
            value={[...heroFilters.basic.level]}
            style={{ cursor: getClickCursorFull() }}
            onChange={(v: number[]) => handleSliderChange(v, 'level')}
            valueLabelDisplay={ValueLabelDisplay.auto}
            aria-labelledby="level-slider"
            defaultValue={[...heroFilters.basic.level]}
            marks={levelMarks}
            max={100}
            min={1}
          />
        </FormGroup>
      </FormControl>
    </div>
  )
}

export default memo(Basics)
