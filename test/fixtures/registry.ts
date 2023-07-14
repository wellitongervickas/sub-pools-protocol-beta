import { ethers } from 'hardhat'
import { RegistryType } from './types'
import { createRandomAddress } from '../helpers/address'
import { buildBytesSingleToken } from '../helpers/tokens'

const customAddress = createRandomAddress()
const tokenDataSingleToken = buildBytesSingleToken(customAddress)

export async function deployRegistryFixture(
  registryType: RegistryType = RegistryType.SingleTokenRegistry,
  tokenData: string = tokenDataSingleToken
) {
  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(registryType, tokenData)

  return { accounts, registryContract }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
