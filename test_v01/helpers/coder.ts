import { ethers } from 'hardhat'

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export const build = (args: any[], types: any[]) => {
  return abiCoder.encode(types, args)
}

export const decompile = (args: string, types: any[]) => {
  return abiCoder.decode(types, args)
}

const coderUtils = {
  build,
  decompile,
}

export default coderUtils
