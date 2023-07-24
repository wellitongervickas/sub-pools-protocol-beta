import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'

export async function deployRouterFixture() {
  const treasuryAddress = createRandomAddress()
  const accounts = await ethers.getSigners()
  const [manager] = accounts
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(manager.address, treasuryAddress)

  return { accounts, routerContract, treasuryAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
