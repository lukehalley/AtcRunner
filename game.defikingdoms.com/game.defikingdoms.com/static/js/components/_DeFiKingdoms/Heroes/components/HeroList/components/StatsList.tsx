import { stats } from 'features/heroes/constants'
import styled from 'styled-components/macro'
import GrowthStat from '../../GrowthStat'
import styles from '../../HeroCard/styles.module.css'

interface StatsListProps {
  hero: any
}

const StatsList = ({ hero }: StatsListProps) => {
  return (
    <HeroStatsList className={styles.heroStatsList}>
      <div className={styles.heroStats} style={{ width: '100%', background: 'transparent', padding: '0px' }}>
        <div className={styles.col}>
          <h3>Stats</h3>
          <div className={styles.statList}>
            {stats.map(stat => {
              return (
                <div key={stat.abbr}>
                  <div className={styles.statName}>
                    {stat.abbr === hero.statGenes.statBoost1 && stat.abbr === hero.statGenes.statBoost2 ? (
                      <>
                        <span className={styles.statBoostDouble}>{stat.label}</span>
                        <span className={styles.tooltip}>
                          <span className={styles.statBoost}>+2</span> &amp;
                          <span className={styles.statBoost2}> +2 P%, +4 S%</span>
                        </span>
                      </>
                    ) : stat.abbr === hero.statGenes.statBoost1 ? (
                      <>
                        <span className={styles.statBoost}>{stat.label}</span>
                        <span className={`${styles.tooltip} ${styles.statBoost}`}>+2</span>
                      </>
                    ) : stat.abbr === hero.statGenes.statBoost2 ? (
                      <>
                        <span className={styles.statBoost2}>{stat.label}</span>
                        <span className={`${styles.tooltip} ${styles.statBoost2}`}>+2 P%, +4 S%</span>
                      </>
                    ) : (
                      stat.label
                    )}
                  </div>
                  <div className={styles.statPoint}>{hero.stats[stat.value]}</div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.col}>
          <h3 style={{ marginTop: '20px' }}>Professions</h3>
          <div className={styles.skillList}>
            <div className={`${styles.skillName} ${hero.statGenes.profession == 'mining' ? styles.chosen : ''}`}>
              Mining
              <span className={styles.tooltip}>Main</span>
            </div>
            <div className={styles.skillLevel}>{hero.skills.mining.toFixed(1)}</div>
            <div className={`${styles.skillName} ${hero.statGenes.profession == 'gardening' ? styles.chosen : ''}`}>
              Gardening
              <span className={styles.tooltip}>Main</span>
            </div>
            <div className={styles.skillLevel}>{hero.skills.gardening.toFixed(1)}</div>
            <div className={`${styles.skillName} ${hero.statGenes.profession == 'fishing' ? styles.chosen : ''}`}>
              Fishing
              <span className={styles.tooltip}>Main</span>
            </div>
            <div className={styles.skillLevel}>{hero.skills.fishing.toFixed(1)}</div>
            <div className={`${styles.skillName} ${hero.statGenes.profession == 'foraging' ? styles.chosen : ''}`}>
              Foraging
              <span className={styles.tooltip}>Main</span>
            </div>
            <div className={styles.skillLevel}>{hero.skills.foraging.toFixed(1)}</div>
          </div>
        </div>
        <div className={styles.col}>
          <h3 style={{ marginTop: '20px' }}>Stat Growth</h3>
          <h4>Primary</h4>
          <div className={styles.statList}>
            {stats.map(stat => {
              return <GrowthStat key={stat.abbr} hero={hero} stat={stat} position={'primary'} labelType="full" />
            })}
          </div>
          <h4>Secondary</h4>
          <div className={styles.statList}>
            {stats.map(stat => {
              return <GrowthStat key={stat.abbr} hero={hero} stat={stat} position={'secondary'} labelType="full" />
            })}
          </div>
        </div>
      </div>
    </HeroStatsList>
  )
}

export default StatsList

const HeroStatsList = styled.div`
  font-size: 20px !important;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`
