import { ethers } from 'hardhat'

export async function deployStrategyProxyFactoryFixture() {
  const accounts = await ethers.getSigners()
  const StrategyProxyFactory = await ethers.getContractFactory('StrategyProxyFactory')
  const strategyProxyFactoryContract = await StrategyProxyFactory.deploy()

  return { accounts, strategyProxyFactoryContract }
}

const fixtures = {
  deployStrategyProxyFactoryFixture,
}

export default fixtures
