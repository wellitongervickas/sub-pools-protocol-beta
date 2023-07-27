import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'

export { ethers, loadFixture }

export async function deployNodeControlFixture() {
  const accounts = await ethers.getSigners()
  const NodeControl = await ethers.getContractFactory('NodeControl')
  const nodeControlContract = await NodeControl.deploy()

  return { accounts, nodeControlContract }
}

const fixtures = {
  deployNodeControlFixture,
}

export default fixtures
