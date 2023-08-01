import { ethers } from 'hardhat'
import { FAKE_PARENT } from '../helpers/address'

export async function deployNodeFixture(
  invitedAddresses: string[] = [],
  invitedOnly: boolean = true,
  parentAddress?: string
) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy(accounts[0].address, invitedAddresses, parentAddress || FAKE_PARENT)

  await nodeContract.setInvitedOnly(invitedOnly)

  return { accounts, nodeContract }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
