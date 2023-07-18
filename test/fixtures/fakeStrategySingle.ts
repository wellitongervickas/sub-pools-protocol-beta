import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import token from './token'
import coderUtils from '../helpers/coder'

export { ethers, loadFixture }

export async function deployFakeStrategySingleFixture() {
  const { tokenContract } = await loadFixture(token.deployTokenFixture)
  const tokenAddress = await tokenContract.getAddress()

  const FakeStrategy = await ethers.getContractFactory('FakeStrategySingle')
  const fakeStrategyContract = await FakeStrategy.deploy(coderUtils.build([tokenAddress], ['address']))
  const fakeStrategyAddress = await fakeStrategyContract.getAddress()

  return { fakeStrategyAddress, tokenContract, fakeStrategyContract }
}

const fixtures = {
  deployFakeStrategySingleFixture,
}

export default fixtures
