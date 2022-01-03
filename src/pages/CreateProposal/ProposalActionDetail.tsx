import { Token } from '@ubeswap/sdk'
import AddressInputPanel from 'components/AddressInputPanel'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import React from 'react'
import styled from 'styled-components/macro'
import { TYPE } from 'theme'

import { ProposalAction } from './ProposalActionSelector'

enum ProposalActionDetailField {
  ADDRESS,
  CURRENCY,
}

const ProposalActionDetailContainer = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 10px;
`

export const ProposalActionDetail = ({
  className,
  proposalAction,
  currency,
  amount,
  toAddress,
  onCurrencySelect,
  onAmountInput,
  onToAddressInput,
}: {
  className?: string
  proposalAction: ProposalAction
  currency: Token | undefined
  amount: string
  toAddress: string
  onCurrencySelect: (currency: Token) => void
  onAmountInput: (amount: string) => void
  onToAddressInput: (address: string) => void
}) => {
  const proposalActionsData = {
    [ProposalAction.TRANSFER_TOKEN]: [
      {
        type: ProposalActionDetailField.ADDRESS,
        label: <TYPE.main>To</TYPE.main>,
      },
      {
        type: ProposalActionDetailField.CURRENCY,
      },
    ],
    [ProposalAction.APPROVE_TOKEN]: [
      {
        type: ProposalActionDetailField.ADDRESS,
        label: <TYPE.main>To</TYPE.main>,
      },
      {
        type: ProposalActionDetailField.CURRENCY,
      },
    ],
  }

  return (
    <ProposalActionDetailContainer className={className}>
      {proposalActionsData[proposalAction].map((field, i) =>
        field.type === ProposalActionDetailField.ADDRESS ? (
          <AddressInputPanel key={i} value={toAddress} onChange={onToAddressInput} />
        ) : field.type === ProposalActionDetailField.CURRENCY ? (
          <CurrencyInputPanel
            key={i}
            value={amount}
            currency={currency}
            onUserInput={(amount: string) => onAmountInput(amount)}
            onCurrencySelect={(currency: Token) => onCurrencySelect(currency)}
            showMaxButton={false}
            showCommonBases={false}
            hideBalance={true}
            disableCurrencySelect={true}
            id="currency-input"
          />
        ) : null
      )}
    </ProposalActionDetailContainer>
  )
}
