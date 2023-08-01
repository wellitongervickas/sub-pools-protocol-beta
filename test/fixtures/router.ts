import { ethers } from 'hardhat'
import { loadFixture, nodeFactory } from '.'

export async function deployRouterFixture() {
  const { nodeFactoryContract } = await loadFixture(nodeFactory.deployNodeFactoryFixture)
  const nodeFactoryAddress = await nodeFactoryContract.getAddress()

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(nodeFactoryAddress)

  return { accounts, routerContract, nodeFactoryAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
