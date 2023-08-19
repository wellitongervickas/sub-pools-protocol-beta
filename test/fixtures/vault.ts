import { ethers, loadFixture } from './'
import token, { IDeployTokenFixtureProps, DEFAULT_PROPS } from './token'

export type IDeployVaultFixtureProps = IDeployTokenFixtureProps

export async function deployVaultFixture(props?: IDeployVaultFixtureProps) {
  const defaultProps = { ...DEFAULT_PROPS, ...props }
  const accounts = await ethers.getSigners()
  const { tokenContract } = await loadFixture(token.deployTokenFixture.bind(null, defaultProps))

  const tokenAddress = await tokenContract.getAddress()
  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(tokenAddress, defaultProps.name, defaultProps.symbol)
  const vaultAddress = await vaultContract.getAddress()

  return { accounts, vaultContract, vaultAddress, tokenContract, tokenAddress }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
