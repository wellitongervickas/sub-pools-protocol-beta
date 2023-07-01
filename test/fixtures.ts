import { ethers } from 'hardhat'
import { loadFixture, time } from '@nomicfoundation/hardhat-toolbox/network-helpers'

export { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

export type { SubPoolRouter } from '../typechain-types/contracts/SubPoolRouter'
export type { SubPoolNode } from '../typechain-types/contracts/SubPoolNode'

export { loadFixture, ethers, time }

export const DEFAULT_PERIOD_LOCK = 0
export const DEFAULT_REQUIRED_INITIAL_AMOUNT = ethers.toBigInt(0)
export const DEFAULT_MAX_ADDITIONAL_AMOUNT = ethers.toBigInt(0)
export const DEFAULT_FEES_FRACTION = {
  value: ethers.toBigInt(0),
  divider: ethers.toBigInt(100),
}

export const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
export const INVITED_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
export const NODE_ROLE = ethers.keccak256(ethers.toUtf8Bytes('NODE_ROLE'))

export async function deployRouterFixture() {
  const accounts = await ethers.getSigners()
  const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
  const subPoolRouter = await SubPoolRouter.deploy()

  return { accounts, subPoolRouter }
}

export async function deployNodeFixture(
  manager?: string,
  amount: string | BigInt = '0',
  fees: typeof DEFAULT_FEES_FRACTION = DEFAULT_FEES_FRACTION,
  invites: string[] = [],
  lockperiod = DEFAULT_PERIOD_LOCK,
  requiredInitialBalance = DEFAULT_REQUIRED_INITIAL_AMOUNT,
  maxAdditionalAmount = DEFAULT_MAX_ADDITIONAL_AMOUNT
) {
  const [_manager] = await ethers.getSigners()
  const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
  const subPoolNode = await SubPoolNode.deploy(
    manager || _manager,
    amount,
    fees,
    invites,
    lockperiod,
    requiredInitialBalance,
    maxAdditionalAmount
  )

  return { subPoolNode }
}

export async function deployRoutedNodeFixture(
  amount: string | BigInt = ethers.toBigInt(100),
  fees: typeof DEFAULT_FEES_FRACTION = DEFAULT_FEES_FRACTION,
  invites: string[] = [],
  lockperiod = DEFAULT_PERIOD_LOCK,
  requiredInitialBalance = DEFAULT_REQUIRED_INITIAL_AMOUNT,
  maxAdditionalAmount = DEFAULT_MAX_ADDITIONAL_AMOUNT
) {
  const accounts = await ethers.getSigners()

  const [_manager, invited] = accounts
  const { subPoolRouter } = await loadFixture(deployRouterFixture)

  const tx = await subPoolRouter.create(
    amount,
    fees,
    invites.length ? invites : [invited.address],
    lockperiod,
    requiredInitialBalance,
    maxAdditionalAmount
  )

  let receipt = await tx.wait()
  const [subPoolAddress] = receipt.logs[3].args
  const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)

  return { subPoolRouter, subPoolNode, accounts }
}
