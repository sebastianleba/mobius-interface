import { TransactionResponse } from '@ethersproject/providers'
import { ButtonPrimary } from 'components/Button'
import { useMobiContract } from 'hooks/useContract'
import React from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { TYPE } from '../../theme'

const PageWrapper = styled.div`
  max-width: 420px;
  width: 100%;
  margin-top: 3rem;
  gap: 10;
`

const ApproveCard = styled(AutoColumn)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  gap: 1rem;
  border-radius: 20px;
  width: 100%;
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.bg1};
  color: ${({ theme }) => theme.text1};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  max-width: 420px;
`}
`

export default function Reset() {
  const addTransaction = useTransactionAdder()
  const mobi = useMobiContract()
  async function onApprove(address: string) {
    if (mobi) {
      await mobi
        .approve(address, 0)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Set approval for ${address} to 0`,
          })
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }

  return (
    <PageWrapper>
      <ApproveCard>
        <TYPE.black fontSize={24} fontWeight={800}>
          Unapprove Ubeswap Router
        </TYPE.black>
        <ButtonPrimary onClick={() => onApprove('0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121')}>Approve</ButtonPrimary>
      </ApproveCard>
      <ApproveCard>
        <TYPE.black fontSize={24} fontWeight={800}>
          Unapprove Ubeswap-Moola Router
        </TYPE.black>
        <ButtonPrimary onClick={() => onApprove('0x7d28570135a2b1930f331c507f65039d4937f66c')}>Approve</ButtonPrimary>
      </ApproveCard>
    </PageWrapper>
  )
}
