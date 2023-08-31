import { expect } from 'chai'
import { ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { getLogArgs } from '../helpers/logs'

export const DEFAULT_SUPPLY = '1000000000000000000000000'
export const DEFAULT_NAME = 'Meme Coin'
export const DEFAULT_SYMBOL = 'MMCN'
export const DEFAULT_DECIMALS = 18

export const DEFAULT_SUPPLY_A = '1000000000000000000000000'
export const DEFAULT_NAME_A = 'Wrapped Bitcoin'
export const DEFAULT_SYMBOL_A = 'WBTC'
export const DEFAULT_DECIMALS_A = 18

export const DEFAULT_SUPPLY_B = '1000000000000000000000000'
export const DEFAULT_NAME_B = 'Wrapped Ether'
export const DEFAULT_SYMBOL_B = 'WETH'
export const DEFAULT_DECIMALS_B = 18

describe('UseCase: Harvest Position', () => {
  it('should harvest position in adapter', async function () {
    const [owner] = await ethers.getSigners()
    const depositAmount = '1000000000000000000'
    const depositTotal = '2000000000000000000'
    const harvestTotal = '1000000000000000000'

    // Deploy Token Output
    const Token = await ethers.getContractFactory('Token')
    const tokenContract = await Token.deploy(DEFAULT_SUPPLY, DEFAULT_NAME, DEFAULT_SYMBOL, DEFAULT_DECIMALS)
    const tokenAddress = await tokenContract.getAddress()

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
    const exampleTargetContract = await ExampleTarget.deploy([tokenAAddress, tokenBAddress], tokenAddress)
    const exampleTargetAddress = await exampleTargetContract.getAddress()

    // Deploy Vault
    const Vault = await ethers.getContractFactory('Vault')
    const vaultContract = await Vault.deploy(tokenAddress, DEFAULT_NAME, DEFAULT_SYMBOL)
    const vaultAddress = await vaultContract.getAddress()

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
      vaultsProfit: [vaultAddress],
      depositFunctionSignature: ExampleTarget.interface.getFunction('deposit')?.selector,
      withdrawFunctionSignature: ExampleTarget.interface.getFunction('withdraw')?.selector,
      harvestFunctionSignature: ExampleTarget.interface.getFunction('harvest')?.selector,
    }
    const tx = await routerContract.createAdapter(
      adapterSettings.targetAddress,
      adapterSettings.vaultsIn,
      adapterSettings.vaultsOut,
      adapterSettings.vaultsProfit,
      adapterSettings.depositFunctionSignature,
      adapterSettings.withdrawFunctionSignature,
      adapterSettings.harvestFunctionSignature
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
    await tokenContract.transfer(exampleTargetAddress, harvestTotal)
    await routerContract.harvest(nodeAddress)

    expect(await vaultContract.balanceOf(owner.address)).to.equal(harvestTotal)
  })
})
