import { Contract } from '@ethersproject/contracts'
import IUniswapV2PairABI from '@ubeswap/core/build/abi/IUniswapV2Pair.json'
import { ChainId } from '@ubeswap/sdk'
import { useWeb3React } from '@web3-react/core'
import { MOBIUS_MINTER_ADDRESS } from 'constants/StablePools'
import { ReleaseUbe } from 'generated/ReleaseUbe'
import { useMemo } from 'react'

import BRIDGE_ROUTER from '../constants/abis/BridgeRouter.json'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ERC20_ABI, { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_MOBI from '../constants/abis/ERC20MOBI.json'
import GAUGE_CONTROLLER from '../constants/abis/GaugeController.json'
import LIQUIDITY_GAUGE_V3 from '../constants/abis/LiquidityGaugeV3.json'
import LP from '../constants/abis/LPToken.json'
import MINTER from '../constants/abis/Minter.json'
import MOBIUS_STRIP from '../constants/abis/MobiusStrip.json'
import DUAL_REWARDS_ABI from '../constants/abis/moola/MoolaStakingRewards.json'
import POOL_MANAGER_ABI from '../constants/abis/pool-manager.json'
import RELEASE_UBE_ABI from '../constants/abis/ReleaseUbe.json'
import STAKING_REWARDS_ABI from '../constants/abis/StakingRewards.json'
import STABLE_SWAP from '../constants/abis/Swap.json'
import VESTING_ABI from '../constants/abis/VestingEscrow.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import {
  BridgeRouter,
  Erc20,
  ERC20MOBI,
  GaugeController,
  LiquidityGaugeV3,
  Minter,
  MobiusStrip,
  MoolaStakingRewards,
  PoolManager,
  StakingRewards,
  Swap,
  VestingEscrow,
} from '../generated'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'
import { useMobi } from './Tokens'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Erc20 | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible) as Erc20 | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  // TODO(igm): find CELO equivalent of ENS
  return null
}

export function useLiquidityGaugeContract(address?: string, withSignerIfPossible?: boolean): LiquidityGaugeV3 | null {
  return useContract(address, LIQUIDITY_GAUGE_V3.abi, withSignerIfPossible) as LiquidityGaugeV3
}

export function useBridgeRouterContract(address?: string, withSignerIfPossible?: boolean): BridgeRouter | null {
  return useContract(address, BRIDGE_ROUTER.abi, withSignerIfPossible) as BridgeRouter
}

export function useMobiContract(address?: string, withSignerIfPossible?: boolean): ERC20MOBI | null {
  const mobi = useMobi()
  return useContract(address ?? mobi?.address, ERC20_MOBI.abi, withSignerIfPossible) as ERC20MOBI
}

export function useMobiMinterContract(address?: string, withSignerIfPossible?: boolean): Minter | null {
  const { chainId } = useActiveWeb3React()

  return useContract(address ?? MOBIUS_MINTER_ADDRESS[chainId], MINTER.abi, withSignerIfPossible) as Minter
}

export function useGaugeControllerContract(address?: string, withSignerIfPossible?: boolean): GaugeController | null {
  const { chainId } = useActiveWeb3React()
  const fallBackAddress =
    chainId === ChainId.MAINNET
      ? '0x7530E03056D3a8eD0323e61091ea2f17a1aC5C25'
      : '0x5F4d3EF2b872AEcbbD1703ce80f29A9303F63A79'
  return useContract(address ?? fallBackAddress, GAUGE_CONTROLLER.abi, withSignerIfPossible) as GaugeController
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useMobiusStripContract(address?: string, withSignerIfPossible?: boolean): MobiusStrip | null {
  return useContract(address, MOBIUS_STRIP.abi, withSignerIfPossible) as MobiusStrip
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useStableSwapContract(swapAddress?: string, withSignerIfPossible?: boolean): Swap | null {
  return useContract(swapAddress, STABLE_SWAP.abi, withSignerIfPossible) as Swap | null
}

export function useLpTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Erc20 | null {
  return useContract(tokenAddress, LP.abi, withSignerIfPossible) as Erc20 | null
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MULTICALL_NETWORKS[chainId] : undefined, MULTICALL_ABI, false)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): StakingRewards | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible) as StakingRewards | null
}

export function usePoolManagerContract(
  poolManagerAddress?: string,
  withSignerIfPossible?: boolean
): PoolManager | null {
  return useContract(poolManagerAddress, POOL_MANAGER_ABI, withSignerIfPossible) as PoolManager | null
}

export function useReleaseUbeContract(withSignerIfPossible?: boolean): ReleaseUbe | null {
  return useContract(
    '0x5Ed248077bD07eE9B530f7C40BE0c1dAE4c131C0',
    RELEASE_UBE_ABI,
    withSignerIfPossible
  ) as ReleaseUbe | null
}

export function useDualStakingContract(
  stakingAddress?: string,
  withSignerIfPossible?: boolean
): MoolaStakingRewards | null {
  return useContract(stakingAddress, DUAL_REWARDS_ABI, withSignerIfPossible) as MoolaStakingRewards | null
}

export function useVestingContract(address?: string, withSignerIfPossible?: boolean): VestingEscrow | null {
  return useContract(
    address ?? '0x9ff6d45F5900D7aCBdCb6d79fFFf22C9F63dF040',
    VESTING_ABI.abi,
    withSignerIfPossible
  ) as VestingEscrow | null
}
