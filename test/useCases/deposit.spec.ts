import { expect } from 'chai'
import { ethers } from '../fixtures'
import coderUtils from '../helpers/coder'

export const DEFAULT_SUPPLY_A = '1000000000000000000000000'
export const DEFAULT_NAME_A = 'Wrapped Bitcoin'
export const DEFAULT_SYMBOL_A = 'WBTC'
export const DEFAULT_DECIMALS_A = 18

describe('UseCase: Deposit', () => {
  it('should deposit to adapter target', async function () {
    const [owner] = await ethers.getSigners()
    const depositAmount = '1000000000000000000'

    // Deploy Registry
    const Registry = await ethers.getContractFactory('Registry')
    const registryContract = await Registry.deploy()

    // Deploy Token 1
    const Token = await ethers.getContractFactory('Token')
    const tokenContract = await Token.deploy(DEFAULT_SUPPLY_A, DEFAULT_NAME_A, DEFAULT_SYMBOL_A, DEFAULT_DECIMALS_A)
    const tokenAddress = await tokenContract.getAddress()

    //Deploy Fake Pool
    const FakePool = await ethers.getContractFactory('FakePool')
    const fakePoolContract = await FakePool.deploy(tokenAddress)
    const fakePoolAddress = await fakePoolContract.getAddress()

    // return
    const GenericAdapter = await ethers.getContractFactory('GenericAdapter')

    const genericAdapterContract = await GenericAdapter.deploy(
      fakePoolAddress,
      [tokenAddress],
      FakePool.interface.getFunction('openPosition')?.selector
    )

    const genericAdapterAddress = await genericAdapterContract.getAddress()

    //  1 - Create vault
    const vaultAName = 'v' + DEFAULT_NAME_A
    const vaultASymbol = 'v' + DEFAULT_SYMBOL_A
    const vaultTx = await registryContract.createVault(tokenAddress, vaultAName, vaultASymbol)
    const vaultTxReceipt = await vaultTx.wait()
    const [vaultAddress] = vaultTxReceipt.logs[0].args

    //  2- Create adapter
    const adapterTx = await registryContract.createAdapter(genericAdapterAddress)
    const adapterTxReceipt = await adapterTx.wait()
    const [adapterId] = adapterTxReceipt.logs[0].args

    const adapterTarget = await registryContract.getAdapter(adapterId)

    // 3 - Create Node
    const nodeTx = await registryContract.createNode(adapterTarget)
    const nodeTxReceipt = await nodeTx.wait()
    const [nodeAddress] = nodeTxReceipt.logs[0].args

    // contract instances
    const vaultContract = await ethers.getContractAt('Vault', vaultAddress)
    const nodeContract = await ethers.getContractAt('Node', nodeAddress)

    // =========================== Starts here =============================

    // 4 - Deposit to vault
    await tokenContract.approve(vaultAddress, depositAmount)
    await vaultContract.deposit(depositAmount, owner.address)

    // 5 - Deposit to node
    await vaultContract.approve(nodeAddress, depositAmount)

    // payload to target
    const adapterData = coderUtils.encode([depositAmount, true], ['uint256', 'bool'])

    const encodedPayload = coderUtils.encode(
      [[depositAmount], owner.address, adapterData],
      ['uint256[]', 'address', 'bytes']
    )

    await nodeContract.deposit(encodedPayload)

    expect(await tokenContract.balanceOf(fakePoolAddress)).to.equal(depositAmount)
  })
})
