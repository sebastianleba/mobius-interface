import { AbiCoder } from '@ethersproject/abi'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { ButtonConfirmed } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'
import { Coins } from 'constants/StablePools'
import { useActiveContractKit } from 'hooks'
import { useGovernanceContract } from 'hooks/useContract'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TYPE } from 'theme'

import { STATIC_POOL_INFO } from '../../constants/StablePools'

export const burnerAddresses: { [c in Coins]: string } = {
  [Coins.USD]: '0x13bCDEB0947200Dd2F1933c2dC47a01157aA9414',
  [Coins.Bitcoin]: '0x2f0e18532b18Ac3D67f055e652C87Ed78560A556',
  [Coins.Celo]: '0xbA270ceb17621CEb240A1A62dE43B37D148d2774',
  [Coins.Ether]: '0xf14A820565010d95bD7ebda754e32811325394a4',
  [Coins.Eur]: '0xe26b9d9C77ac382222D9473d029b6ffaE1aa13Ca',
}

const blackList: Set<string> = new Set([
  '0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941',
  '0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE',
  '0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4',
  '0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D',
  '0x93DB49bE12B864019dA9Cb147ba75cDC0506190e',
  '0xd7Bf6946b740930c60131044bD2F08787e1DdBd4',
])

export default function SubmitProposal() {
  const { chainId } = useActiveContractKit()
  const abi = new AbiCoder()
  const governance = useGovernanceContract()
  const POOL_PROXY = '0x1bc2DbB8c4d04AaCF4A7fefcDB060766964B5237'
  const [submitting, setSubmitting] = useState<boolean>(false)
  const submitTxn = useTransactionAdder()

  const tokenSeen: Set<string> = new Set<string>()
  const tokens = STATIC_POOL_INFO[chainId]
    .flatMap((el) => el.tokens.map((tok) => [tok.name, tok.address, el.coin, burnerAddresses[el.coin]]))
    .filter((el) => {
      if (tokenSeen.has(el[1])) return false
      tokenSeen.add(el[1])
      return !blackList.has(el[1])
    })
  const lpTokens = tokens.map((el) => el[1])
  const burners = tokens.map((el) => el[3])
  const signature = ['set_many_burners(address[20],address[20])']
  const data = [abi.encode(['address[20]', 'address[20]'], [lpTokens, burners])]
  const value = [0]
  const target = [POOL_PROXY]

  const description = `# Add Buyback mechanism
  ## TLDR: Use trade fees to buy Mobi and redistribute to current stakers
  Swaps on Mobius are currently charged a 0.2% fee, 50% paid to LPs and 50% paid to an admin wallet. \n

  I propose the 50% admin fee gets redirected to MobiusBurner contracts, which will then trade those fee tokens on Ubeswap to buy MOBI.  The Mobi will then be sent to a FeeDistributor contract, which will disitribute MOBI to all veMobi stakers based on  voting power ratio.
  For some context, Mobius has processed almost $200M in volume since launch, which would have translated to near $200k in MOBI buy-backs (assuming 0.2% trade fee and 50% admin split from day 1). 
  
  The founding team never claimed any fees personally, so there is currently ~$70K worth of fees that can be used to buy mobi and distribute to stakers.
  
  ## Buyback Process:
  1. PoolProxy claims admin fees from a swap contract
  2. Anybody can call 'burn(address)' on the Proxy to trigger a trade from that token to Mobi
  3. The burner contract transfers MOBI to a FeeDistributor contract
  4. The FeeDistributor receives a checkpoint from a community member, and the stakers can claim their share of fees from that week.
  
  ## Contracts:
  - USD Burner: 0x13bCDEB0947200Dd2F1933c2dC47a01157aA9414
  - BTC Burner: 0x2f0e18532b18Ac3D67f055e652C87Ed78560A556
  - Celo Burner: 0xbA270ceb17621CEb240A1A62dE43B37D148d2774
  - Ether burner: 0xf14A820565010d95bD7ebda754e32811325394a4
  - Eur Burner: 0xe26b9d9C77ac382222D9473d029b6ffaE1aa13Ca
  `

  const onSubmit = async () => {
    setSubmitting(true)
    const txn = await governance
      ?.propose(target, value, signature, data, description, { gasLimit: 8500000 })
      .then((resp: TransactionResponse) => submitTxn(resp, { summary: 'Submitted buyback proposal!' }))
      .catch((e) => console.log(e))
      .finally(() => setSubmitting(false))
  }
  return (
    <AutoColumn>
      <TYPE.largeHeader>The following burners will be submitted:</TYPE.largeHeader>
      <RowBetween>
        <TYPE.mediumHeader>Token</TYPE.mediumHeader>
        <TYPE.main>Burner Address</TYPE.main>
      </RowBetween>
      {tokens.map(([name, address, coin, burner]) => (
        <RowBetween key={`submit-txn-${address}`}>
          <TYPE.mediumHeader>{name}</TYPE.mediumHeader>
          <TYPE.main>{burner}</TYPE.main>
        </RowBetween>
      ))}
      <TYPE.mediumHeader>Proposal Description: </TYPE.mediumHeader>
      <TYPE.main width={900} wrap>
        <ReactMarkdown>{description}</ReactMarkdown>
      </TYPE.main>
      <ButtonConfirmed onClick={submitting ? () => null : onSubmit}>
        {submitting ? <Loader /> : 'Submit Proposal'}
      </ButtonConfirmed>
    </AutoColumn>
  )
}
