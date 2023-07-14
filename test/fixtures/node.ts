import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { FAKE_PARENT, FAKE_REGISTRY } from '../helpers/address'

export { ethers, loadFixture }

export async function deployNodeFixture(invitedAddresses: string[] = [], invitedOnly: boolean = false) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')

  const nodeContract = await Node.deploy(FAKE_PARENT, accounts[0].address, invitedAddresses, FAKE_REGISTRY)

  await nodeContract.setInvitedOnly(invitedOnly)

  return { accounts, nodeContract }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
