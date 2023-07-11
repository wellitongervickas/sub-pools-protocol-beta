import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

export { ethers, loadFixture }

export async function deployRouterFixture() {
  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy()

  return { accounts, routerContract }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
