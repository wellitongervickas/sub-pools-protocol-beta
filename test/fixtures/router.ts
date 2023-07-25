import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'

export async function deployRouterFixture(protocol?: string) {
  const protocolAddress = protocol || createRandomAddress()
  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(protocolAddress)

  return { accounts, routerContract, protocolAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
