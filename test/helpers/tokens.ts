import { ethers } from 'hardhat'

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export const buildBytesSingleToken = (tokenAddress: string) => {
  return abiCoder.encode(['address'], [tokenAddress])
}
