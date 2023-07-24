import { FractionLib } from './../../typechain-types/contracts/registry/Registry'
import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'

const treasuryAddress = createRandomAddress()

export async function deployRouterFixture(protocolFees?: FractionLib.FractionStruct) {
  const accounts = await ethers.getSigners()
  const [manager] = accounts
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(manager.address, treasuryAddress, protocolFees || DEFAULT_FEES_FRACTION)

  return { accounts, routerContract, treasuryAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
