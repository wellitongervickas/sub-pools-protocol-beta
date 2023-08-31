import { expect } from 'chai'
import { ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { getLogArgs } from '../helpers/logs'

export const DEFAULT_SUPPLY_A = '1000000000000000000000000'
export const DEFAULT_NAME_A = 'Wrapped Bitcoin'
export const DEFAULT_SYMBOL_A = 'WBTC'
export const DEFAULT_DECIMALS_A = 18

export const DEFAULT_SUPPLY_B = '1000000000000000000000000'
export const DEFAULT_NAME_B = 'Wrapped Ether'
export const DEFAULT_SYMBOL_B = 'WETH'
export const DEFAULT_DECIMALS_B = 18

describe('UseCase: Decrease Position', () => {
  it('should decrease position in adapter', async function () {
    const [owner] = await ethers.getSigners()
    const depositAmount = '1000000000000000000'
    const depositTotal = '2000000000000000000'

    // Deploy Token A
    const TokenA = await ethers.getContractFactory('Token')
    const tokenAContract = await TokenA.deploy(DEFAULT_SUPPLY_A, DEFAULT_NAME_A, DEFAULT_SYMBOL_A, DEFAULT_DECIMALS_A)
    const tokenAAddress = await tokenAContract.getAddress()

    // Deploy Token B
    const TokenB = await ethers.getContractFactory('Token')
    const tokenBContract = await TokenB.deploy(DEFAULT_SUPPLY_B, DEFAULT_NAME_B, DEFAULT_SYMBOL_B, DEFAULT_DECIMALS_B)
    const tokenBAddress = await tokenBContract.getAddress()

    // Deploy Example Target
    const ExampleTarget = await ethers.getContractFactory('ExampleTarget')
    const exampleTargetContract = await ExampleTarget.deploy([tokenAAddress, tokenBAddress])
    const exampleTargetAddress = await exampleTargetContract.getAddress()

    // Deploy Vault A
    const VaultA = await ethers.getContractFactory('Vault')
    const vaultAContract = await VaultA.deploy(tokenAAddress, DEFAULT_NAME_A, DEFAULT_SYMBOL_A)
    const vaultAAddress = await vaultAContract.getAddress()

    // Deploy Vault B
    const VaultB = await ethers.getContractFactory('Vault')
    const vaultBContract = await VaultB.deploy(tokenBAddress, DEFAULT_NAME_B, DEFAULT_SYMBOL_B)
    const vaultBAddress = await vaultBContract.getAddress()

    // Deposit shares Vault A using Token A
    await tokenAContract.approve(vaultAAddress, depositTotal)
    await vaultAContract.deposit(depositTotal, owner.address)

    // Deposit shares Vault B using Token B
    await tokenBContract.approve(vaultBAddress, depositTotal)
    await vaultBContract.deposit(depositTotal, owner.address)

    // Deploy router
    const Router = await ethers.getContractFactory('Router')
    const routerContract = await Router.deploy()
    const routerAddress = await routerContract.getAddress()

    // Create adapter
    const adapterSettings = {
      targetAddress: exampleTargetAddress,
      vaultsIn: [vaultAAddress, vaultBAddress],
      vaultsOut: [vaultAAddress, vaultBAddress],
      depositFunctionSignature: ExampleTarget.interface.getFunction('deposit')?.selector,
      decreasePositionFunctionSignature: ExampleTarget.interface.getFunction('withdraw')?.selector,
    }
    const tx = await routerContract.createAdapter(
      adapterSettings.targetAddress,
      adapterSettings.vaultsIn,
      adapterSettings.vaultsOut,
      adapterSettings.depositFunctionSignature,
      adapterSettings.decreasePositionFunctionSignature
    )

    const receipt = await tx.wait()
    const [adapterId] = receipt.logs[0].args

    // Approve vault A,B to router
    await vaultAContract.approve(routerAddress, depositTotal)
    await vaultBContract.approve(routerAddress, depositTotal)

    // Position settings
    const amounts = [depositAmount, depositAmount]
    const decreaseAmounts = [depositTotal, depositTotal]

    const adapterDataDeposit = coderUtils.encode([amounts], ['uint256[]'])
    const adapterDataWithdraw = coderUtils.encode([decreaseAmounts], ['uint256[]'])

    // Open position using router
    const tx1 = await routerContract.openPosition(adapterId, amounts, adapterDataDeposit)
    const receipt1 = await tx1.wait()
    const [nodeAddress] = getLogArgs(receipt1.logs)

    // Increase position using router
    await routerContract.increasePosition(nodeAddress, amounts, adapterDataDeposit)

    // Decrease position using router
    await routerContract.decreasePosition(nodeAddress, decreaseAmounts, adapterDataWithdraw)

    expect(await tokenAContract.balanceOf(exampleTargetAddress)).to.equal(0)
    expect(await tokenBContract.balanceOf(exampleTargetAddress)).to.equal(0)
  })
})
