import { ethers } from 'hardhat'

export async function deployNodeFixture(invitedAddresses: string[] = [], invitedOnly: boolean = true) {
  const accounts = await ethers.getSigners()
  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy(accounts[0].address, invitedAddresses)

  await nodeContract.setInvitedOnly(invitedOnly)

  return { accounts, nodeContract }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
