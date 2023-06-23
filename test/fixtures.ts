import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { InterfaceAbi, LogDescription, LogParams, Result } from 'ethers'

export { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

export type { SubPoolRouter } from '../typechain-types/contracts/SubPoolRouter'
export type { SubPoolNode } from '../typechain-types/contracts/SubPoolNode'

export { loadFixture, ethers }

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
  manager: string,
  amount: string,
  fees: typeof DEFAULT_FEES_FRACTION,
  invites: string[]
) {
  const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
  const subPoolNode = await SubPoolNode.deploy(manager, amount, fees, invites)

  return { subPoolNode }
}

export async function deployRoutedNodeFixture() {
  const accounts = await ethers.getSigners()

  const [, invited] = accounts
  const { subPoolRouter } = await loadFixture(deployRouterFixture)

  const tx = await subPoolRouter.create(ethers.toBigInt(100), DEFAULT_FEES_FRACTION, [invited.address])
  let receipt = await tx.wait()
  const [subPoolAddress] = receipt.logs[3].args
  const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)

  return { subPoolRouter, subPoolNode, accounts }
}

export const getArgs = (abi: InterfaceAbi, event: string, logs: LogParams[]) => {
  const contractInterface = new ethers.Interface(abi)
  return logs.map((log) => {
    try {
      return contractInterface.decodeEventLog(event, log.data, log.topics)
    } catch {
      return
    }
  })
}
