import { ethers } from 'hardhat'
import { loadFixture, nodeFactory, strategyProxyFactory } from '.'

export async function deployRouterFixture() {
  const { strategyProxyFactoryContract } = await loadFixture(strategyProxyFactory.deployStrategyProxyFactoryFixture)
  const strategyProxyFactoryAddress = await strategyProxyFactoryContract.getAddress()
  const { nodeFactoryContract } = await loadFixture(nodeFactory.deployNodeFactoryFixture)
  const nodeFactoryAddress = await nodeFactoryContract.getAddress()

  const accounts = await ethers.getSigners()
  const Router = await ethers.getContractFactory('Router')
  const routerContract = await Router.deploy(nodeFactoryAddress, strategyProxyFactoryAddress)

  return { accounts, routerContract, nodeFactoryAddress, strategyProxyFactoryAddress }
}

const fixtures = {
  deployRouterFixture,
}

export default fixtures
