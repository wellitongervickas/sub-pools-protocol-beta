import { ethers, token } from './'

export async function deployStakeFixture() {
  const { tokenContract, tokenAddress } = await token.deployTokenFixture()

  const accounts = await ethers.getSigners()
  const Stake = await ethers.getContractFactory('Stake')
  const stakeContract = await Stake.deploy([tokenAddress], tokenAddress)
  const stakeAddress = await stakeContract.getAddress()

  return { accounts, stakeAddress, stakeContract, tokenContract, tokenAddress }
}

const fixtures = {
  deployStakeFixture,
}

export default fixtures
