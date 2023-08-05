import { ethers } from 'hardhat'

export async function deployFakeStrategyFixture() {
  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy()
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  return { fakeStrategyAddress, fakeStrategyContract }
}

const fixtures = {
  deployFakeStrategyFixture,
}

export default fixtures
