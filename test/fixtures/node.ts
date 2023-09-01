import { Registry } from './../../typechain-types/contracts/Registry'
import { ethers } from 'hardhat'

export async function deployNodeFixture(adapter: Registry.AdapterStruct) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy(adapter)
  const nodeAddress = await nodeContract.getAddress()

  return { accounts, nodeContract, nodeAddress }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
