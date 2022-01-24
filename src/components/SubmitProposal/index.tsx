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

  const description = `# Add Buyback Mechanism
  ## TLDR: Use 50% of trade fees to buy MOBI and redistribute to stakers.

  ### Proposal Summary
  Swaps on Mobius are currently charged a 0.2% fee, 50% paid to LPs and 50% paid to an admin wallet. I propose that the 50% admin fee gets redirected to veMOBI stakers via MOBI tokens. 
  This will require the community to approve the addition of a burner contract for each liquidity pool. If this proposal is passed, anyone will be able to initiate a MOBI buyback at any time
  by calling the burn(address) method on the PoolProxy contract.  

  ### Why I Think It Should Pass
  The value of MOBI plays a crucial role in the resilience of Mobius. Currently, MOBI derives its value in two ways: 
  staking to get boosted LP rewards and staking to vote for a specific pool to receive rewards. However, both of these 
  use cases depend on the assumption that MOBI has a reasonable market value.

  This proposal provides two ways to increase MOBI's inherent value. (1) The MOBI buyback provides positive price pressure 
  for the token by providing consistent buying. (2) The MOBI dividend to stakers provides an incentive to stake long-term by 
  receiving liquid MOBI relative to your voting power. Staking removes selling pressure by temporarily locking tokens / removing 
  them from the open market. For some context, Mobius has processed almost $200M in volume since launch, which would translate to 
  nearly $200k in MOBI buybacks (assuming 0.2% trade fee and 50% admin split from day 1). The founding team never claimed any fees 
  personally, so there is currently ~$70K worth of fees that can be used to buy MOBI and distribute to stakers at a 
  rate of ~0.2 MOBI / veMOBI.

  Moreover, staking is crucial for securing the Mobius protocol. The more people that stake, the more decentralized and censorship resistant 
  the protocol becomes (the more people participating in governance). Incentivizing this may help Mobius remain open, permissionless, and 
  under community control.

  ### How It Works:
  A portion of the swap fee (50%) will be redirected to MobiusBurner contracts, which will then trade those fee tokens on Mobius and Ubeswap 
  to buy MOBI. The MOBI will then be sent to a FeeDistributor contract, which will distribute MOBI to all veMOBI stakers based on their 
  voting power ratio. Outlined below is a summary of the buyback process:

      1. PoolProxy claims admin fees from a swap contract
      2. Anybody can call 'burn(address)' on the Proxy to trigger a trade from that token to Mobi
      3. The burner contract transfers MOBI to a FeeDistributor contract
      4. The FeeDistributor receives a checkpoint from a community member, and the stakers can claim 
         their share of fees from that week.
  

  ### Mobius Burner Contracts:
      * USD Burner: 0x13bCDEB0947200Dd2F1933c2dC47a01157aA9414
      * BTC Burner: 0x2f0e18532b18Ac3D67f055e652C87Ed78560A556
      * Celo Burner: 0xbA270ceb17621CEb240A1A62dE43B37D148d2774
      * Ether burner: 0xf14A820565010d95bD7ebda754e32811325394a4
      * Eur Burner: 0xe26b9d9C77ac382222D9473d029b6ffaE1aa13Ca

  ### Other Contracts:
      * PoolProxy: 0x1bc2DbB8c4d04AaCF4A7fefcDB060766964B5237
      * FeeDistributor: 0xeF4788e8C79c5B2dc1d70484C86161102879b0cc

  ### Potential Risks
  This proposal requires changes to how Mobius swap fees are distributed. Any change to the protocol proposes risks, specifically bugs in the 
  code or flawed designs. However, I have worked closely with engineers on the core-team and in the community to make sure the new burner contracts 
  were properly tested before mainnet deployment. The burner contracts are also verified, so anyone can perform their own audit. 

  In addition, the DAO Timelock contract is set as the recovery recipient for the FeeDistributor as well as every burner listed above.  This means in the event
  that at any point, the DAO can vote to enter the FeeDistributor into recovery, and transfer all funds held to the DAO Timelock.  The only other wallets the FeeDistributor
  can transfer funds to are stakers.

  Some people may argue this disincentivizes providing liquidity to Mobius. However, this does not remove any swap fees from current liquidity 
  providers, only the admin wallet. Moreover, LPs are already incentivized with heavy MOBI rewards via farming, currently receiving 30%+ APR without 
  staking. If anything, this will help increase the price of MOBI, which will increase APRs and make it even more attractive to be an LP on Mobius.

  ### Who is Proposing?
  People in the community know me as TQT. I am the community admin and help everyone with any problem they have with Mobius (if you need help, join our [Discord](https://discord.gg/e4qYT6cZeM)!). 
  I worked closely with the core-team at Mobius to make this proposal happen, along with feedback from the entire community. 
  `

  const onSubmit = async () => {
    setSubmitting(true)
    const txn = await governance
      ?.propose(target, value, signature, data, description, { gasLimit: 10000000 })
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
