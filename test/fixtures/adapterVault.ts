import { ethers } from 'hardhat'
import { loadFixture, token } from '.'

export async function deployAdapterVaultFixture() {
  const { tokenContract } = await loadFixture(token.deployTokenFixture)
  const tokenContractAddress = await tokenContract.getAddress()

  const accounts = await ethers.getSigners()
  const AdapterVault = await ethers.getContractFactory('AdapterVault')
  const adapterVaultContract = await AdapterVault.deploy(tokenContractAddress)

  return { accounts, adapterVaultContract, tokenContract, tokenContractAddress }
}

const fixtures = {
  deployAdapterVaultFixture,
}

export default fixtures
