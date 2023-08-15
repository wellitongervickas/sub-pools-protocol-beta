import { ethers } from '../fixtures'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const FAKE_PARENT = ZERO_ADDRESS
export const FAKE_REGISTRY = ZERO_ADDRESS
export const FAKE_STRATEGY = ZERO_ADDRESS

export const createRandomAddress = () => {
  const wallet = ethers.Wallet.createRandom()
  const address = wallet.address

  return address
}
