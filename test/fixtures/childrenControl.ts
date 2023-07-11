import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

export { ethers, loadFixture }

export async function deployChildrenControlFixture() {
  const accounts = await ethers.getSigners()
  const Children = await ethers.getContractFactory('ChildrenControl')
  const childrenControlContract = await Children.deploy()

  return { accounts, childrenControlContract }
}

const fixtures = {
  deployChildrenControlFixture,
}

export default fixtures
