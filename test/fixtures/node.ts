import { ethers } from 'hardhat'

import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { ZERO_ADDRESS } from '../helpers/address'

export { ethers, loadFixture }

export async function deployNodeFixture(invitedAddresses: string[] = [], defaultInitialization: boolean = false) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy(ZERO_ADDRESS, accounts[0].address, invitedAddresses)

  if (defaultInitialization === false) {
    await nodeContract.setInvitedOnly(false)
  }

  return { accounts, nodeContract }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
