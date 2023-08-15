import { loadFixture, token } from '.'
import { ethers } from 'hardhat'

export async function deployVaultFixture(
  initialSupply = token.DEFAULT_SUPPLY,
  name = token.DEFAULT_NAME,
  symbol = token.DEFAULT_SYMBOL,
  decimals = token.DEFAULT_DECIMALS
) {
  const accounts = await ethers.getSigners()
  const registry = accounts[0]
  const { tokenContract } = await loadFixture(
    token.deployTokenFixture.bind(null, initialSupply, name, symbol, decimals)
  )
  const tokenAddress = await tokenContract.getAddress()

  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(tokenAddress, registry)
  const vaultAddress = await vaultContract.getAddress()

  return { vaultAddress, vaultContract, tokenAddress, tokenContract }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
