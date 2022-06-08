import { faAngleLeft, faAngleRight, faAngleDoubleLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Loader from 'components/Loader'
import styled from 'styled-components/macro'
import themeColors from 'utils/colors'

const { goldDim, deepGrey, gold } = themeColors

interface PaginationProps {
  currentPage: number
  hasMorePages: boolean
  loading?: boolean
  setCurrentPage: Function
}

const Pagination = ({ currentPage, hasMorePages, loading, setCurrentPage }: PaginationProps) => {
  return (
    <PaginationWrapper>
      <NavButton onClick={() => setCurrentPage(1)} disabled={currentPage < 2}>
        <FontAwesomeIcon icon={faAngleDoubleLeft} size="1x" />
      </NavButton>
      <NavButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}>
        <FontAwesomeIcon icon={faAngleLeft} size="1x" />
      </NavButton>
      <NavButton onClick={() => setCurrentPage(currentPage + 1)} disabled={!hasMorePages}>
        <FontAwesomeIcon icon={faAngleRight} size="1x" />
      </NavButton>
      <LoaderWrapper>{loading && <Loader stroke="#fac05d" size="16px" />}</LoaderWrapper>
    </PaginationWrapper>
  )
}

export default Pagination

const PaginationWrapper = styled.div`
  width: 100%;
  margin: 20px auto 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NavButton = styled.button`
  font-size: 14px;
  font-weight: 600;
  margin: 0 5px;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 6px;
  color: ${gold};
  border: 1px solid ${goldDim};
  background: ${deepGrey};
  transition: all 0.1s ease-in-out;
  &:disabled {
    opacity: 0.4;
    cursor: auto;
  }
  &:enabled:hover {
    background: ${gold};
    color: ${deepGrey};
  }
`

const LoaderWrapper = styled.div`
  display: flex;
  padding-left: 6px;
  min-width: 43px;
`
