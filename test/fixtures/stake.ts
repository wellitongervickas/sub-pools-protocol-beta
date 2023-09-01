import { ethers, token } from './'

export async function deployStakeFixture() {
  const { tokenContract, tokenAddress } = await token.deployTokenFixture()
  const { tokenContract: token2Contract, tokenAddress: token2Address } = await token.deployTokenFixture()

  const accounts = await ethers.getSigners()
  const Stake = await ethers.getContractFactory('Stake')
  const stakeContract = await Stake.deploy([tokenAddress], token2Address)
  const stakeAddress = await stakeContract.getAddress()

  return { accounts, stakeAddress, stakeContract, tokenContract, token2Contract, tokenAddress, token2Address }
}

const fixtures = {
  deployStakeFixture,
}

export default fixtures
