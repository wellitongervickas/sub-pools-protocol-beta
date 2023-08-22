import { ethers } from '../fixtures'

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export const id = (functionSignature: string) => {
  return ethers.id(functionSignature).slice(0, 10)
}

export const encode = (args: any[], types: any[]) => {
  return abiCoder.encode(types, args)
}

export const decode = (args: string, types: any[]) => {
  return abiCoder.decode(types, args)
}

const coderUtils = {
  encode,
  decode,
  id,
}

export default coderUtils
