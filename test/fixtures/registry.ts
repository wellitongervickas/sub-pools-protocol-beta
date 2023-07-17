import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'

const customAddress = createRandomAddress()

export async function deployRegistryFixture(strategy = customAddress) {
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(strategy)

  return { accounts, registryContract }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
