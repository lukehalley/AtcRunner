import { useState, useEffect, memo } from 'react'
import { useDispatch } from 'react-redux'
import AppBar from '@material-ui/core/AppBar'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import { Button } from 'components/Buttons'
import { resetHeroFilters, setResetEventTriggered } from 'features/heroes/state'
import styled from 'styled-components'
import Attributes from '../Attributes'
import Basics from '../Basics'
import Stats from '../Stats'

interface FiltersProps {
  activeModalType: any
  applyFiltersAndFetch: Function
  listType: any
}

const a11yProps = (index: number) => {
  return {
    id: `filter-tab-${index}`,
    'aria-controls': `filters-panel-${index}`
  }
}

const FilterWrapper = styled.div.attrs(props => ({
  className: 'buy-heroes-filters-overflow'
}))`
  padding: 1rem;
  max-height: calc(100% - 140px);
  overflow-y: auto;
  max-width: 100%;
  min-width: 100%;
`

const ApplyWrapper = styled.div`
  display: flex;
  button {
    width: 100%;
    max-width: 250px;
  }
`

const TabPanel = ({ children, value, index, ...other }: any) => {
  return (
    <FilterWrapper
      role="tabpanel"
      hidden={value !== index}
      id={`filters-panel-${index}`}
      aria-labelledby={`filter-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </FilterWrapper>
  )
}

/* exported component */
const Filters: React.FC<FiltersProps> = ({ applyFiltersAndFetch, listType }: FiltersProps) => {
  const dispatch = useDispatch()
  const [tab, setTab] = useState(0)
  const [hasReset, setHasReset] = useState(false)
  useEffect(() => {
    if (hasReset) {
      applyFiltersAndFetch()
      setHasReset(false)
    }
  }, [setHasReset, hasReset, resetHeroFilters])

  const handleChange = (event: any, value: React.SetStateAction<number>) => {
    setTab(value)
  }

  return (
    <>
      <AppBar position="static">
        <Tabs value={tab} onChange={handleChange} aria-label="tabs" indicatorColor="primary" textColor="primary">
          <Tab label="Basics" {...a11yProps(0)} disableRipple />
          <Tab label="Attributes" {...a11yProps(1)} disableRipple />
          <Tab label="Stats" {...a11yProps(2)} disableRipple />
        </Tabs>
      </AppBar>
      <ApplyWrapper>
        <Button
          type="ghost"
          onClick={() => applyFiltersAndFetch()}
          containerStyle={{ margin: '10px', width: 'calc(100% - 20px)', textAlign: 'center' }}
        >
          Apply
        </Button>
        <Button
          type="ghost"
          onClick={() => {
            dispatch(resetHeroFilters())
            dispatch(setResetEventTriggered())
            setHasReset(true)
          }}
          containerStyle={{ margin: '10px', width: 'calc(100% - 20px)', textAlign: 'center' }}
        >
          Reset
        </Button>
      </ApplyWrapper>
      <TabPanel value={tab} index={0}>
        <Basics listType={listType} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <Attributes />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Stats />
      </TabPanel>
    </>
  )
}

export default memo(Filters)
