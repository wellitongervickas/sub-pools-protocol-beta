import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'

export async function deployRegistryFixture(strategy: string, protocol?: string) {
  const protocolAddress = protocol || createRandomAddress()

  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(strategy, accounts[0].address, protocolAddress)

  return { accounts, registryContract, protocolAddress }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
