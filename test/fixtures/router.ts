import { ethers } from 'hardhat'

export async function deployRouterFixture(registry: string) {
  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(registry)

  return { accounts, routerContract }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
