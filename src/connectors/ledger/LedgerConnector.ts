// Largely based off of CeloVote
// https://github.com/zviadm/celovote-app/blob/main/src/ledger.ts

import { ContractKit, newKit } from '@celo/contractkit'
import { AddressValidation, LedgerWallet, newLedgerWalletWithSetup } from '@celo/wallet-ledger'
import { Mainnet } from '@celo-tools/use-contractkit'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { ConnectorUpdate } from '@web3-react/types'
import { DevNetworks, MainnetNetworks, networkInfo } from 'constants/NetworkInfo'
import { MultiChainIds } from 'constants/Optics'

import { NETWORK_CHAIN_ID } from '../'

export class LedgerKit {
  private closed = false
  private constructor(public chainId: MultiChainIds, public kit: ContractKit, public wallet: LedgerWallet) {}

  public static async init(chainId: MultiChainIds, idxs: number[]) {
    const transport = await TransportWebUSB.create()
    try {
      const wallet = await newLedgerWalletWithSetup(transport, idxs, undefined, AddressValidation.never)
      const kit = newKit(networkInfo[chainId].rpcUrl, wallet)
      return new LedgerKit(chainId, kit, wallet)
    } catch (e) {
      transport.close()
      throw e
    }
  }

  close = () => {
    if (this.closed) {
      return
    }
    this.closed = true
    this.wallet.transport.close()
    this.kit.stop()
  }
}

export class LedgerConnector extends AbstractConnector {
  private kit: LedgerKit | null = null
  private index: number | null = null
  private chainId: MultiChainIds = NETWORK_CHAIN_ID === Mainnet.chainId ? MultiChainIds.CELO : MultiChainIds.ALFAJORES

  constructor(connectedKit?: { kit: LedgerKit; index: number }) {
    super({
      supportedChainIds: (NETWORK_CHAIN_ID === Mainnet.chainId ? MainnetNetworks : DevNetworks).map(
        ({ chainId }) => chainId
      ),
    })
    if (connectedKit) {
      this.kit = connectedKit.kit
      this.index = connectedKit.index
    }
  }

  public setChainId(chainId: MultiChainIds) {
    this.chainId = chainId
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (this.kit && this.index !== null) {
      return {
        provider: this.kit.kit.web3.currentProvider,
        chainId: this.chainId,
        account: this.kit.wallet.getAccounts()[this.index],
      }
    }
    const idxs = [0, 1, 2, 3, 4]
    const ledgerKit = await LedgerKit.init(NETWORK_CHAIN_ID, idxs)
    this.kit = ledgerKit
    return {
      provider: ledgerKit.kit.web3.currentProvider,
      chainId: this.chainId,
      account: ledgerKit.wallet.getAccounts()[0],
    }
  }

  public async getProvider(): Promise<any> {
    return this.kit?.kit.web3.currentProvider ?? null
  }

  public async getChainId(): Promise<number> {
    return this.chainId
  }

  public async getAccount(): Promise<string | null> {
    return this.kit?.wallet.getAccounts()?.[0] ?? null
  }

  public deactivate() {
    this.kit?.close()
  }

  async close() {
    this.kit?.close()
    this.kit = null
    this.emitDeactivate()
  }
}
