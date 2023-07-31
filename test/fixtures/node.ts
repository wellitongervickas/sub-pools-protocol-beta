import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { FAKE_PARENT, FAKE_REGISTRY } from '../helpers/address'

export { ethers, loadFixture }

export async function deployNodeFixture(invitedAddresses: string[] = [], invitedOnly: boolean = true) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy(FAKE_PARENT, FAKE_REGISTRY, accounts[0].address, invitedAddresses)

  await nodeContract.setInvitedOnly(invitedOnly)

  return { accounts, nodeContract }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
