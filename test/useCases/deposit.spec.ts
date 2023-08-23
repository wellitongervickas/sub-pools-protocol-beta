import { expect } from 'chai'
import { ethers } from '../fixtures'
import coderUtils from '../helpers/coder'

export const DEFAULT_SUPPLY_A = '1000000000000000000000000'
export const DEFAULT_NAME_A = 'Wrapped Bitcoin'
export const DEFAULT_SYMBOL_A = 'WBTC'
export const DEFAULT_DECIMALS_A = 18

describe('UseCase: Deposit', () => {
  describe('Deposit using one asset', () => {
    it('should deposit to adapter target', async function () {
      const [owner] = await ethers.getSigners()
      const target = ethers.Wallet.createRandom()
      const depositAmount = '1000000000000000000'

      // Deploy Token 1
      const Token = await ethers.getContractFactory('Token')
      const tokenContract = await Token.deploy(DEFAULT_SUPPLY_A, DEFAULT_NAME_A, DEFAULT_SYMBOL_A, DEFAULT_DECIMALS_A)
      const tokenAddress = await tokenContract.getAddress()

      //Deploy Fake Pool
      const FakePool = await ethers.getContractFactory('FakePool')
      const fakePoolContract = await FakePool.deploy(tokenAddress)
      const fakePoolAddress = await fakePoolContract.getAddress()

      // Deploy Fake Pool Adapter
      const FakePoolAdapter = await ethers.getContractFactory('FakePoolAdapter')
      const fakePoolAdapterContract = await FakePoolAdapter.deploy(fakePoolAddress)
      const fakePoolAdapterAddress = await fakePoolAdapterContract.getAddress()

      // Deploy Registry
      const Registry = await ethers.getContractFactory('Registry')
      const registryContract = await Registry.deploy()
      // const registryAddress = await registryContract.getAddress()

      //  1 - Create vault
      const vaultAName = 'v' + DEFAULT_NAME_A
      const vaultASymbol = 'v' + DEFAULT_SYMBOL_A
      const vaultTx = await registryContract.createVault(tokenAddress, vaultAName, vaultASymbol)
      const vaultTxReceipt = await vaultTx.wait()
      const [vaultAddress] = vaultTxReceipt.logs[0].args

      //  2- Create adapter
      const adapterTx = await registryContract.createAdapter(fakePoolAdapterAddress)
      const adapterTxReceipt = await adapterTx.wait()
      const [adapterId] = adapterTxReceipt.logs[0].args

      const adapterTarget = await registryContract.getAdapter(adapterId)

      // 3 - Create Node
      const nodeTx = await registryContract.createNode(adapterTarget)
      const nodeTxReceipt = await nodeTx.wait()
      const [nodeAddress] = nodeTxReceipt.logs[0].args

      const vaultContract = await ethers.getContractAt('Vault', vaultAddress)
      const nodeContract = await ethers.getContractAt('Node', nodeAddress)

      // 4 - Deposit to vault
      await tokenContract.approve(vaultAddress, depositAmount)
      await vaultContract.deposit(depositAmount, owner.address)

      // 5 - Deposit to node
      await vaultContract.approve(nodeAddress, depositAmount)
      const encodedPayload = coderUtils.encode([[depositAmount], owner.address], ['uint256[]', 'address'])
      await nodeContract.deposit(encodedPayload)

      expect(await tokenContract.balanceOf(fakePoolAddress)).to.equal(depositAmount)
    })
  })
})
