import { loadFixture, token } from '.'
import { ethers } from 'hardhat'

export async function deployFakeStrategyFixture() {
  const { tokenContract } = await loadFixture(token.deployTokenFixture)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy([tokenAddress])
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  return { fakeStrategyAddress, fakeStrategyContract, tokenAddress, tokenContract }
}

const fixtures = {
  deployFakeStrategyFixture,
}

export default fixtures
