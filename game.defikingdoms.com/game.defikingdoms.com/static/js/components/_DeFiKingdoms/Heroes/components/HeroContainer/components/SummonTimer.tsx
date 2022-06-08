import Countdown from 'react-countdown'
import moment from 'moment'
import styled from 'styled-components/macro'

interface SummonTimerProps {
  children: React.ReactElement
  countDownTime: Date
}

const SummonTimer = ({ children, countDownTime }: SummonTimerProps) => {
  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      // Render a complete state
      return children
    } else {
      // Render a countdown
      return (
        <SummonTimerStyled>
          <span>
            {days.toString().split('').length <= 1 ? `0${days}` : days}:
            {hours.toString().split('').length <= 1 ? `0${hours}` : hours}:
            {minutes.toString().split('').length <= 1 ? `0${minutes}` : minutes}:
            {seconds.toString().split('').length <= 1 ? `0${seconds}` : seconds}
          </span>
        </SummonTimerStyled>
      )
    }
  }

  return <Countdown date={moment(countDownTime).toDate()} renderer={renderer} />
}

export default SummonTimer

const SummonTimerStyled = styled.div`
  text-align: center;
  span {
    display: inline-block;
    color: red;
    background: #100f21;
    margin: 10px 0px;
    padding: 3px 10px;
    border: 1px solid red;
    border-radius: 6px;
    font-weight: bold;
    font-size: 12px;
  }
`
