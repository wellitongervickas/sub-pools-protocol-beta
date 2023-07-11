import { ethers } from '../fixtures'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const createRandomAddress = () => {
  const wallet = ethers.Wallet.createRandom()
  const address = wallet.address

  return address
}
