import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'

export async function deployRegistryFixture(strategy: string) {
  const treasuryAddress = createRandomAddress()
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(strategy, accounts[0].address, treasuryAddress)

  return { accounts, registryContract, treasuryAddress }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
