import React from 'react'
import styled, { DefaultTheme } from 'styled-components/macro'
import { TYPE } from 'theme'

import { ProposalState } from '../../state/governance/hooks'

const handleColorType = (status: ProposalState, theme: DefaultTheme) => {
  switch (status) {
    case ProposalState.PENDING:
    case ProposalState.ACTIVE:
      return theme.blue1
    case ProposalState.SUCCEEDED:
    case ProposalState.EXECUTED:
      return theme.green1
    case ProposalState.DEFEATED:
      return theme.red1
    case ProposalState.QUEUED:
    case ProposalState.CANCELED:
    case ProposalState.EXPIRED:
    default:
      return theme.text3
  }
}

function StatusText({ status }: { status: ProposalState }) {
  switch (status) {
    case ProposalState.PENDING:
      return <TYPE.main>Pending</TYPE.main>
    case ProposalState.ACTIVE:
      return <TYPE.main>Active</TYPE.main>
    case ProposalState.SUCCEEDED:
      return <TYPE.main>Succeeded</TYPE.main>
    case ProposalState.EXECUTED:
      return <TYPE.main>Executed</TYPE.main>
    case ProposalState.DEFEATED:
      return <TYPE.main>Defeated</TYPE.main>
    case ProposalState.QUEUED:
      return <TYPE.main>Queued</TYPE.main>
    case ProposalState.CANCELED:
      return <TYPE.main>Canceled</TYPE.main>
    case ProposalState.EXPIRED:
      return <TYPE.main>Expired</TYPE.main>
    default:
      return <TYPE.main>Undetermined</TYPE.main>
  }
}

const StyledProposalContainer = styled.span<{ status: ProposalState }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
`

export function ProposalStatus({ status }: { status: ProposalState }) {
  return (
    <StyledProposalContainer status={status}>
      <StatusText status={status} />
    </StyledProposalContainer>
  )
}
