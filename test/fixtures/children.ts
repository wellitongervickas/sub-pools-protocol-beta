import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

export { ethers, loadFixture }

export async function deployChildrenFixture(parentAddress: string) {
  const accounts = await ethers.getSigners()
  const Children = await ethers.getContractFactory('Children')
  const childrenContract = await Children.deploy(accounts[accounts.length - 1])

  return { accounts, childrenContract }
}

const fixtures = {
  deployChildrenFixture,
}

export default fixtures
