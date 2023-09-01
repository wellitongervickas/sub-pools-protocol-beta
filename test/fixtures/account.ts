import { Registry } from './../../typechain-types/contracts/Registry'
import { ethers } from 'hardhat'

export async function deployAccountFixture(adapter: Registry.AdapterStruct) {
  const accounts = await ethers.getSigners()
  const Account = await ethers.getContractFactory('Account')
  const accountContract = await Account.deploy(adapter)
  const accountAddress = await accountContract.getAddress()

  return { accounts, accountContract, accountAddress }
}

const fixtures = {
  deployAccountFixture,
}

export default fixtures
