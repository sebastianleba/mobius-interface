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
      return <TYPE.subHeader fontWeight={600}>Pending</TYPE.subHeader>
    case ProposalState.ACTIVE:
      return <TYPE.subHeader fontWeight={600}>Active</TYPE.subHeader>
    case ProposalState.SUCCEEDED:
      return <TYPE.subHeader fontWeight={600}>Succeeded</TYPE.subHeader>
    case ProposalState.EXECUTED:
      return <TYPE.subHeader fontWeight={600}>Executed</TYPE.subHeader>
    case ProposalState.DEFEATED:
      return <TYPE.subHeader fontWeight={600}>Defeated</TYPE.subHeader>
    case ProposalState.QUEUED:
      return <TYPE.subHeader fontWeight={600}>Queued</TYPE.subHeader>
    case ProposalState.CANCELED:
      return <TYPE.subHeader fontWeight={600}>Canceled</TYPE.subHeader>
    case ProposalState.EXPIRED:
      return <TYPE.subHeader fontWeight={600}>Expired</TYPE.subHeader>
    default:
      return <TYPE.subHeader fontWeight={600}>Undetermined</TYPE.subHeader>
  }
}

const StyledProposalContainer = styled.span<{ status: ProposalState }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 2px solid ${({ status, theme }) => handleColorType(status, theme)};
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
