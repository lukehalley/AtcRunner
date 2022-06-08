import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { RefreshCcw } from 'react-feather'
import { faChevronUp, faChevronDown, faSlidersH } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box } from '@material-ui/core'
import { FormControl } from '@material-ui/core'
import { Select } from '@material-ui/core'
import { MenuItem } from '@material-ui/core'
import { Button } from 'components/Buttons'
import Loader from 'components/Loader'
import Pagination from 'components/Pagination'
import { setAllAnimated, setAllFlipped, setShowHeroHub } from 'features/heroHub/state'
import { ActiveModalType, ListType } from 'features/heroHub/types'
import {
  defaultHeroFilters,
  shiny,
  gendersValues,
  availableClasses,
  professionsValues,
  elementsValues,
  backgroundsValues,
  statBonusValues,
  CARDS_PER_PAGE
} from 'features/heroes/constants'
import {
  fetchHeroCatalog,
  fetchUserHeroes,
  fetchForSaleHeroes,
  fetchHirableHeroes,
  setHeroFilters
} from 'features/heroes/state'
import { getHeroStatByKey } from 'features/heroes/utils'
import { useSelector, useDispatch } from 'features/hooks'
import { calculateRequiredXp } from 'features/leveling/utils'
import { getClickCursorFull } from 'features/preferences/utils'
import { QuestType } from 'features/quests/types'
import { useActiveWeb3React } from 'hooks'
import orderBy from 'lodash/orderBy'
import uniq from 'lodash/uniq'
import { DateTime } from 'luxon'
import styled from 'styled-components/macro'
import themeColors from 'utils/colors'
import { Hero } from 'utils/dfkTypes'
import { DKModal } from '../DKModal'
import Filters from '../Heroes/components/Filters'
import HeroList from '../Heroes/components/HeroList'
import sortByValues, { sortByValuesOwned, sortByValuesCatalog, sortByValuesHiring } from '../Heroes/utils/sortby'
import styles from './index.module.scss'

interface Filters {
  [index: string]: {
    [index: string]: any
  }
}

const HeroHub = () => {
  const { account, chainId } = useActiveWeb3React()
  const dispatch = useDispatch()
  const {
    forSaleHeroes,
    heroCatalog,
    heroFilters,
    hirableHeroes,
    loading,
    totalForSaleHeroes,
    totalHeroCatalog,
    totalHirableHeroes,
    totalUserHeroes,
    userHeroes,
    userHeroesLoading
  } = useSelector(s => s.heroes)
  const { activeModalType, allAnimated, allFlipped, heroHubTitle, listType, showHeroHub } = useSelector(s => s.heroHub)
  const { questData, selectedHeroes } = useSelector(s => s.quests)
  const { activeJourneyModalType } = useSelector(s => s.journey)
  const journeyHeroes = useSelector(s => s.journey.selectedHeroes)
  const { rerollHeroes, totalRerollHeroes } = useSelector(s => s.reroll)
  // const bridgeHeroes = useSelector(s => s.bridge.selectedHeroes)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersShown, setFiltersShown] = useState(isMobile ? false : true)
  const [sortBy, setSortBy] = useState(
    listType === ListType.available && activeModalType === ActiveModalType.hire
      ? 'assistingprice'
      : listType === ListType.available
      ? 'saleprice'
      : listType === ListType.catalog
      ? 'id'
      : activeModalType === ActiveModalType.quest
      ? 'current_stamina'
      : activeModalType === ActiveModalType.level
      ? 'xp'
      : 'generation'
  )

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    activeModalType === ActiveModalType.level ||
      activeModalType === ActiveModalType.quest ||
      (activeModalType === ActiveModalType.journey && activeJourneyModalType === 'journeyStandard')
      ? 'desc'
      : 'asc'
  )

  const heroData =
    activeModalType === ActiveModalType.hire
      ? hirableHeroes
      : activeModalType === ActiveModalType.buy
      ? forSaleHeroes
      : listType === ListType.catalog
      ? heroCatalog
      : userHeroes

  const isUserHeroView =
    activeModalType === ActiveModalType.view ||
    activeModalType === ActiveModalType.portal ||
    activeModalType === ActiveModalType.sell ||
    activeModalType === ActiveModalType.rent ||
    activeModalType === ActiveModalType.quest ||
    activeModalType === ActiveModalType.level ||
    activeModalType === ActiveModalType.send ||
    activeModalType === ActiveModalType.applyItem ||
    activeModalType === ActiveModalType.bridge ||
    activeModalType === ActiveModalType.journey ||
    activeModalType === ActiveModalType.journeyChance ||
    activeModalType === ActiveModalType.dead ||
    activeModalType === ActiveModalType.reroll

  const handleFilterToggle = () => {
    setFiltersShown(!filtersShown)
  }

  const toggleAnimation = () => {
    dispatch(setAllAnimated(!allAnimated))
  }

  const toggleFlipped = () => {
    dispatch(setAllFlipped(!allFlipped))
  }

  const fetchNewHeroes = (
    pageIndex: number,
    initialLoad?: boolean,
    newSortBy?: string,
    newSortDirection?: 'asc' | 'desc'
  ) => {
    const sortByFinal = newSortBy || sortBy
    const sortDirectionFinal = newSortDirection || sortDirection
    const offset = (pageIndex - 1) * CARDS_PER_PAGE

    // If opening the hero catalog, fetch all heroes
    if (listType === ListType.catalog) {
      dispatch(
        fetchHeroCatalog({
          chainId,
          offset,
          order: { by: sortByFinal, dir: sortDirectionFinal }
        })
      )
    }

    // For player's hero view, portal, or sell/rent hero views, fetch user heroes
    if (isUserHeroView && !initialLoad && listType !== ListType.catalog) {
      dispatch(
        fetchUserHeroes({
          account,
          offset,
          order: { by: sortByFinal, dir: sortDirectionFinal },
          chainId
        })
      )
    }

    // For hire hero view, fetch hirable heroes
    if (activeModalType === ActiveModalType.hire) {
      document.querySelector('.hero-modal .dk-modal--body')?.scrollTo(0, 0)
      dispatch(
        fetchHirableHeroes({
          chainId,
          offset,
          order: { by: sortByFinal, dir: sortDirectionFinal }
        })
      )
    }

    // For buy hero view, fetch for sale heroes
    if (activeModalType === ActiveModalType.buy) {
      document.querySelector('.hero-modal .dk-modal--body')?.scrollTo(0, 0)
      dispatch(
        fetchForSaleHeroes({
          account,
          chainId,
          offset,
          order: { by: sortByFinal, dir: sortDirectionFinal }
        })
      )
    }
  }

  const handleSortChange = (e: any) => {
    setSortBy(e.target.value)
    fetchNewHeroes(currentPage, false, e.target.value)
  }

  const handleSortDirectionChange = (e: any) => {
    setSortDirection(e.target.value)
    fetchNewHeroes(currentPage, false, sortBy, e.target.value)
  }

  const handleSetNewPage = (pageIndex: number) => {
    // Run a new query with page number
    setCurrentPage(pageIndex)
    fetchNewHeroes(pageIndex)
  }

  useEffect(() => {
    fetchNewHeroes(1, true)
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [heroFilters, sortBy, sortDirection])

  function isAllCheckedFilters(filterGroup: string, filterType: string, value: boolean) {
    return function (filter: string) {
      return heroFilters[filterGroup][filterType][filter] === value
    }
  }

  function setFilterCheckboxAllHandler(filterGroup: string, filterType: string, dataSrc: string[]) {
    if (
      dataSrc.every(isAllCheckedFilters(filterGroup, filterType, true)) ||
      (dataSrc.every(isAllCheckedFilters(filterGroup, filterType, false)) &&
        heroFilters[filterGroup][filterType].all === false)
    ) {
      dispatch(
        setHeroFilters({
          filterType: filterGroup,
          filterSubType: filterType,
          filterObject: { ...(defaultHeroFilters as any)[filterGroup][filterType] }
        })
      )
    }
  }

  useEffect(() => {
    setFilterCheckboxAllHandler('basic', 'shiny', shiny)
    setFilterCheckboxAllHandler('basic', 'gender', gendersValues)
    setFilterCheckboxAllHandler('basic', 'heroClasses', availableClasses)
    setFilterCheckboxAllHandler('basic', 'heroSubClasses', availableClasses)
    setFilterCheckboxAllHandler('attributes', 'elements', elementsValues)
    setFilterCheckboxAllHandler('attributes', 'backgrounds', backgroundsValues)
    setFilterCheckboxAllHandler('attributes', 'professions', professionsValues)
    setFilterCheckboxAllHandler('attributes', 'statBoost1', statBonusValues)
    setFilterCheckboxAllHandler('attributes', 'statBoost2', statBonusValues)
  }, [heroFilters.basic, heroFilters.attributes])

  let filteredHeroData = uniq(heroData)

  // Start Filters
  if (heroFilters?.basic?.status) {
    const forSaleChecked = heroFilters.basic.status['for_sale' as any]
    const forHireChecked = heroFilters.basic.status['for_hire' as any]
    const questingChecked = heroFilters.basic.status['on_a_quest' as any]

    filteredHeroData =
      filteredHeroData &&
      filteredHeroData.filter((hero: any) => {
        return (
          (!forSaleChecked && !forHireChecked && !questingChecked) ||
          (forSaleChecked && hero.price > 0) ||
          (forHireChecked && hero.summoningPrice > 0) ||
          (questingChecked && hero.isQuesting)
        )
      })
  }
  // End Filters

  // Filter out user's For Sale heroes or heroes that have a next summon time in the future.
  if (activeModalType === ActiveModalType.buy) {
    filteredHeroData =
      filteredHeroData &&
      (filteredHeroData as Hero[]).filter(hero => account?.toLowerCase() !== hero.owner.owner.toLowerCase())
  }

  if (activeModalType === ActiveModalType.hire) {
    // Filter out user's For Hire heroes or heroes that have a next summon time in the future.
    filteredHeroData =
      filteredHeroData &&
      (filteredHeroData as Hero[]).filter(
        hero =>
          account?.toLowerCase() !== hero.owner.owner.toLowerCase() &&
          hero?.nextSummonTime <= DateTime.now() &&
          hero.summonsRemaining > 0
      )
  }

  let sortedHeroData = filteredHeroData

  // Sort user's heroes client-side based on sorting
  if (isUserHeroView) {
    sortedHeroData = orderBy(sortedHeroData, [sortBy], [sortDirection])
  }

  if (sortBy === 'saleprice') {
    sortedHeroData = orderBy(sortedHeroData, ['price'], [sortDirection])
  }

  if (sortBy === 'rarity') {
    sortedHeroData = orderBy(sortedHeroData, ['rarityNum'], [sortDirection])
  }

  // If training questing modal, sort highest primary stat to top
  if (
    activeModalType === ActiveModalType.quest &&
    questData.type === QuestType.AttemptBasedTraining &&
    questData.trainingStat
  ) {
    sortedHeroData = orderBy(sortedHeroData, [(hero: Hero) => getHeroStatByKey(hero, questData.trainingStat)], ['desc'])
  }

  if (sortBy === 'current_stamina') {
    sortedHeroData = orderBy(sortedHeroData, ['currentStamina'], [sortDirection])
  }

  // If profession questing modal, sort selected quest profession first
  if (activeModalType === ActiveModalType.quest && questData.type !== QuestType.AttemptBasedTraining) {
    sortedHeroData = orderBy(
      sortedHeroData,
      [(hero: Hero) => hero.statGenes.profession === questData.proficiencyType],
      ['desc']
    )
  }

  // on leveling modal, drop heroes without full XP to the bottom.
  if (activeModalType === ActiveModalType.level) {
    sortedHeroData = orderBy(sortedHeroData, [(hero: Hero) => hero.xp >= calculateRequiredXp(hero.level)], ['desc'])
  }

  // drop questing heroes to the bottom.
  if (activeModalType === ActiveModalType.quest) {
    sortedHeroData = orderBy(sortedHeroData, ['isQuesting'], ['asc'])
  }

  // Sort Private Sales first
  sortedHeroData = orderBy(sortedHeroData, ['winner'], ['asc'])

  if (activeModalType === ActiveModalType.reroll) {
    sortedHeroData = rerollHeroes
  }

  let filterClasses = 'toggle-text'

  if (!filtersShown) {
    filterClasses = 'toggle-text hidden'
  }

  const isHireAHero = listType === ListType.available && activeModalType === ActiveModalType.hire
  const availableSortValues = isHireAHero
    ? sortByValuesHiring
    : listType !== ListType.owned && listType !== ListType.catalog
    ? sortByValues
    : listType === ListType.catalog
    ? sortByValuesCatalog
    : sortByValuesOwned
  const totalHeroLength =
    activeModalType === ActiveModalType.hire
      ? totalHirableHeroes
      : activeModalType === ActiveModalType.buy
      ? totalForSaleHeroes
      : listType === ListType.catalog
      ? totalHeroCatalog
      : activeModalType === ActiveModalType.reroll
      ? totalRerollHeroes
      : totalUserHeroes

  let filtersOutput = (
    <Filters activeModalType={activeModalType} listType={listType} applyFiltersAndFetch={fetchNewHeroes} />
  )

  if (!filtersShown) {
    filtersOutput = (
      <HideFilters>
        <Filters activeModalType={activeModalType} listType={listType} applyFiltersAndFetch={fetchNewHeroes} />
      </HideFilters>
    )
  }

  return (
    <DKModal
      className="hero-modal"
      title={heroHubTitle}
      showModal={showHeroHub}
      setShowModal={() => dispatch(setShowHeroHub(false))}
      maxWidth={2000}
    >
      <Wrapper>
        <FilterWrapper className={filtersShown ? 'filters-open' : 'filters-collapsed'}>
          <FilterToggle onClick={handleFilterToggle}>
            <div className={filterClasses}>Filter</div>
            <div>
              <div className="toggle-arrow">
                {filtersShown ? (
                  <FontAwesomeIcon icon={faChevronUp} />
                ) : (
                  <SliderToggle>
                    <span className="mobile">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </span>
                    <span className="desktop">
                      <FontAwesomeIcon icon={faSlidersH} />
                    </span>
                  </SliderToggle>
                )}
              </div>
            </div>
          </FilterToggle>
          {filtersOutput}
        </FilterWrapper>

        <HeroListWrapper>
          <ListHeader>
            <div className="list-count">
              <div>
                {totalHeroLength >= CARDS_PER_PAGE
                  ? `Showing ${CARDS_PER_PAGE} Heroes`
                  : `Showing ${sortedHeroData.length} Heroes`}
              </div>

              <SwitchWrapper>
                <div className="refresh-button">
                  <label className="switch">
                    <RefreshButton onClick={() => fetchNewHeroes(currentPage)}>
                      <RefreshCcw size={'16px'} />
                      <span className="switch-text" style={{ fontWeight: 400 }}>
                        Refresh
                      </span>
                    </RefreshButton>
                  </label>
                </div>
                <div>
                  <label className="switch" style={{ cursor: getClickCursorFull() }}>
                    <input type="checkbox" defaultChecked={allAnimated} onChange={toggleAnimation} />
                    <div>
                      <span></span>
                    </div>
                    <span className="switch-text">Animations</span>
                  </label>
                </div>

                <div>
                  <label className="switch" style={{ cursor: getClickCursorFull() }}>
                    <input type="checkbox" defaultChecked={allFlipped} onChange={toggleFlipped} />
                    <div>
                      <span></span>
                    </div>
                    <span className="switch-text">Flip All</span>
                  </label>
                </div>
              </SwitchWrapper>
            </div>

            <SortWrapper>
              <span>Sort by:</span>
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <Select
                    id="sort-list"
                    value={sortBy}
                    label={sortBy}
                    onChange={e => handleSortChange(e)}
                    SelectDisplayProps={{
                      style: { cursor: getClickCursorFull() }
                    }}
                  >
                    {availableSortValues.map((item: any) => {
                      return (
                        <MenuItem key={item.value} value={item.value} style={{ cursor: getClickCursorFull() }}>
                          {item.label}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <Select
                    id="sort-list-direction"
                    value={sortDirection}
                    label={sortDirection}
                    onChange={e => handleSortDirectionChange(e)}
                    SelectDisplayProps={{
                      style: { cursor: getClickCursorFull() }
                    }}
                  >
                    <MenuItem style={{ cursor: getClickCursorFull() }} value={'asc'}>
                      Ascending
                    </MenuItem>
                    <MenuItem style={{ cursor: getClickCursorFull() }} value={'desc'}>
                      Descending
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </SortWrapper>
          </ListHeader>
          {(isUserHeroView && !userHeroesLoading) || (!isUserHeroView && !loading) ? (
            sortedHeroData.length > 0 ? (
              <ListWrapper className={activeModalType}>
                <HeroList list={sortedHeroData} />
              </ListWrapper>
            ) : (
              <EmptyHeroMessage>
                <p>No heroes match the currently selected criteria</p>
              </EmptyHeroMessage>
            )
          ) : (
            <LoadWrapper>
              <Loader size="50px" stroke="#fff" />
            </LoadWrapper>
          )}
          {(totalHeroLength >= CARDS_PER_PAGE || currentPage > 1) && (
            <Pagination
              currentPage={currentPage}
              setCurrentPage={handleSetNewPage}
              hasMorePages={totalHeroLength >= CARDS_PER_PAGE}
              loading={false}
            />
          )}
          {totalHeroLength == 0 && (
            <XfinityWhitelistWrapper>
              <p style={{ textAlign: 'center' }}>
                Don’t see your heroes? Use Xfinity internet? Click below to whitelist the API. <br />
                (This will open another page, and then display an error message; Not to worry! That’s expected
                behaviour.)
              </p>
              <div>
                <Button
                  onClick={() => {
                    window.open('https://us-central1-defi-kingdoms-api.cloudfunctions.net', '_blank')
                  }}
                >
                  Whitelist DFK API
                </Button>
              </div>
            </XfinityWhitelistWrapper>
          )}
        </HeroListWrapper>
        {activeModalType === ActiveModalType.quest && questData.maxHeroes > 1 && (
          <Button containerClassName={styles.continueButtonWrapper} onClick={() => dispatch(setShowHeroHub(false))}>
            <p>
              Continue with {selectedHeroes.length} of {questData.maxHeroes} Heroes
            </p>
          </Button>
        )}
        {activeModalType === ActiveModalType.journey && (
          <Button containerClassName={styles.continueButtonWrapper} onClick={() => dispatch(setShowHeroHub(false))}>
            <p>Continue with {journeyHeroes.length} of 6 Heroes</p>
          </Button>
        )}
        {/* {activeModalType === ActiveModalType.bridge && (
          <Button containerClassName={styles.continueButtonWrapper} onClick={() => dispatch(setShowHeroHub(false))}>
            <p>Continue with {bridgeHeroes.length} of 6 Heroes</p>
          </Button>
        )} */}
      </Wrapper>
    </DKModal>
  )
}

export default HeroHub

const LoadWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 250px;
  align-items: center;
  justify-content: center;
`

const Wrapper = styled.div.attrs(props => ({
  className: 'buy-heroes-wrapper'
}))`
  color: #fff;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: row wrap;
  `};
`

const HideFilters = styled.div.attrs(props => ({
  className: 'filters-hidden'
}))`
  opacity: 0;
  visibility: hidden;
  display: none;
`

const FilterToggle = styled.div.attrs(props => ({
  className: 'filter-toggle'
}))`
  max-width: 100%;
  min-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${themeColors.brownLight};

  .toggle-text {
    display: block;
    padding: 1em;

    &.hidden {
      display: none;
    }
  }

  .toggle-arrow {
    transform: rotate(-90deg);
    width: 45px;
    height: 45px;
    padding: 0.75em 1em;
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
    min-width: 100%;

    .toggle-arrow {
      transform: rotate(0deg);
      width: auto;
      height: auto;
    }

    .toggle-text {
      &.hidden {
        display: block;
      }
    }
  `};
`

const FilterWrapper = styled.div`
  max-width: 300px;
  min-width: 300px;
  border: 1px solid ${themeColors.brownLight};
  position: sticky;
  align-self: self-start;
  top: 0;
  left: 0;
  height: calc(100vh - 195px);
  overflow: hidden;

  &.filters-collapsed {
    max-width: 45px;
    min-width: 45px;
    border: 0;

    .toggle-arrow {
      transform: rotate(0deg);
    }

    .filter-toggle {
      border: 0;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 100%;
    min-width: 100%;
    margin-bottom: 1rem;
    position: relative;
    height: 400px;

    &.filters-collapsed {
    max-width: 100%;
    min-width: 100%;
    max-height: 59px;
    border: 1px solid ${themeColors.brownLight};
  }
  `};
`

const RefreshButton = styled.button`
  line-height: 1;
  border: 0;
  background: transparent;
  color: white;
  cursor: pointer;

  svg {
    opacity: 0.8;
  }

  &:hover {
    svg {
      opacity: 1;
      color: #009c44;
    }
  }
`

const EmptyHeroMessage = styled.div`
  margin-top: 60px;
  text-align: center;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

const HeroListWrapper = styled.div.attrs(props => ({
  className: 'buy-heroes-list-wrapper'
}))`
  margin-left: 1.5rem;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 0;
    max-width: 100%;
    min-width: 100%;
  `};
`

const ListHeader = styled.div.attrs(props => ({
  className: 'hero-list-wrapper'
}))`
  padding-bottom: 1rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: row wrap;
    justify-content: center;

    .list-count {
      width: 100%;
      justify-content: center;
      text-align: center;
    }
  `};
`

const SortWrapper = styled.div.attrs(props => ({
  className: 'sort-wrapper'
}))`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 0.8em;
    display: inline-block;
    margin-right: 0.5em;
  }

  .MuiBox-root {
    margin-left: 0.5em;
  }
`

type ListWrapperProps = {
  className: string
}

const ListWrapper = styled.div.attrs(props => ({
  className: props.className
}))<ListWrapperProps>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(334px, 1fr));
  grid-gap: 20px;
  place-items: flex-start;
  width: 100%;
  overflow-y: auto;

  &.quest {
    padding-bottom: 60px;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-left: 0;
    max-width: 100%;
    min-width: 100%;
    place-items: center;
  `};
`

const SwitchWrapper = styled.div.attrs(props => ({
  className: 'switch-wrapper'
}))`
  display: flex;

  > div {
    margin-right: 1.25em;

    &:last-child {
      margin-right: 0;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    > div {
      &.refresh-button {
        margin-bottom: .5em;
      }
    }
  `};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: row wrap;
    align-items: center;
    justify-content: center;

    > div {
      margin: .25em 1.5em .25em 0;
    }
  `};
`

const SliderToggle = styled.div`
  .mobile {
    display: none;
  }

  .desktop {
    display: block;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    .mobile {
      display: block;
    }
    .desktop {
      display: none;
    }
  `};
`

const XfinityWhitelistWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
`
