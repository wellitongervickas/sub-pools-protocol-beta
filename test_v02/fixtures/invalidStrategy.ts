import { loadFixture, token } from '.'
import { ethers } from 'hardhat'

export async function deployInvalidStrategyFixture() {
  const { tokenContract } = await loadFixture(token.deployTokenFixture)
  const tokenAddress = await tokenContract.getAddress()

  const InvalidStrategy = await ethers.getContractFactory('InvalidStrategy')
  const invalidStrategyContract = await InvalidStrategy.deploy([tokenAddress])
  const invalidStrategyAddress = await invalidStrategyContract.getAddress()

  return { invalidStrategyAddress, invalidStrategyContract, tokenAddress, tokenContract }
}

const fixtures = {
  deployInvalidStrategyFixture,
}

export default fixtures
