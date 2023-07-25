import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'
import { FractionLib } from '../../typechain-types/contracts/registry/Registry'

export async function deployRouterFixture(protocolFees?: FractionLib.FractionStruct) {
  const treasuryAddrees = createRandomAddress()

  const fees = protocolFees || {
    value: ethers.toBigInt(0),
    divider: ethers.toBigInt(100),
  }

  const ProtocolContract = await ethers.getContractFactory('Protocol')
  const protocolContract = await ProtocolContract.deploy(treasuryAddrees, fees)
  const protocolAddress = await protocolContract.getAddress()

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(protocolAddress)

  return { accounts, routerContract, protocolAddress, protocolContract, fees, treasuryAddrees }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
