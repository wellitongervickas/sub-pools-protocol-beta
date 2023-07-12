import { ethers } from 'hardhat'

export const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
export const INVITED_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
export const NODE_ROLE = ethers.keccak256(ethers.toUtf8Bytes('NODE_ROLE'))

export async function deployManagerControlFixture(invitedAddresses: string[] = []) {
  const accounts = await ethers.getSigners()
  const ManagerControl = await ethers.getContractFactory('ManagerControl')
  const managerControlContract = await ManagerControl.deploy(accounts[0], invitedAddresses)

  return { accounts, managerControlContract }
}

const fixtures = {
  deployManagerControlFixture,
  MANAGER_ROLE,
  INVITED_ROLE,
  NODE_ROLE,
}

export default fixtures
