import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'
import { FractionLib } from '../../typechain-types/contracts/registry/Registry'

export async function deployRegistryFixture(strategy: string, protocolFees?: FractionLib.FractionStruct) {
  const treasuryAddrees = createRandomAddress()

  const fees = protocolFees || {
    value: ethers.toBigInt(0),
    divider: ethers.toBigInt(100),
  }

  const ProtocolContract = await ethers.getContractFactory('Protocol')
  const protocolContract = await ProtocolContract.deploy(treasuryAddrees, fees)
  const protocolAddress = await protocolContract.getAddress()

  const accounts = await ethers.getSigners()
  const Registry = await ethers.getContractFactory('Registry')
  const registryContract = await Registry.deploy(strategy, accounts[0].address, protocolAddress)

  return { accounts, registryContract, protocolAddress, treasuryAddrees, fees, protocolContract }
}

const fixtures = {
  deployRegistryFixture,
}

export default fixtures
