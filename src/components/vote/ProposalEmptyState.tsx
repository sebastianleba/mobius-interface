import React from 'react'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'

const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const Sub = styled.i`
  align-items: center;
  display: flex;
  justify-content: center;
  text-align: center;
`
interface EmptyStateProps {
  HeaderContent: () => JSX.Element
  SubHeaderContent: () => JSX.Element
}
const EmptyState = ({ HeaderContent, SubHeaderContent }: EmptyStateProps) => (
  <EmptyProposals>
    <TYPE.body style={{ marginBottom: '8px' }}>
      <HeaderContent />
    </TYPE.body>
    <TYPE.subHeader>
      <Sub>
        <SubHeaderContent />
      </Sub>
    </TYPE.subHeader>
  </EmptyProposals>
)

export default function ProposalEmptyState() {
  return (
    <EmptyState
      HeaderContent={() => <TYPE.mediumHeader>No proposals found.</TYPE.mediumHeader>}
      SubHeaderContent={() => (
        <TYPE.mediumHeader>Proposals submitted by community members will appear here.</TYPE.mediumHeader>
      )}
    />
  )
}
