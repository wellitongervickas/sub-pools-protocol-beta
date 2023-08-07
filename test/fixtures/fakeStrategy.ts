import { ethers } from 'hardhat'
import coderUtils from '../helpers/coder'

export async function deployFakeStrategyFixture() {
  const supply = '1000000000000000000000000'
  const Token = await ethers.getContractFactory('Token')
  const tokenContract = await Token.deploy(supply, 18)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategy')
  const fakeStrategyContract = await FakeStrategy.deploy(coderUtils.build([[tokenAddress]], ['address[]']))
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  return { fakeStrategyAddress, fakeStrategyContract, tokenAddress, supply, tokenContract }
}

const fixtures = {
  deployFakeStrategyFixture,
}

export default fixtures
