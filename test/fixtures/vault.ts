import { ethers, loadFixture } from './'
import { createRandomAddress } from '../helpers/address'
import token, { IDeployTokenFixtureProps, DEFAULT_PROPS as DEFAULT_PROPS_TOKEN } from './token'

export type IDeployVaultFixtureProps = Partial<IDeployTokenFixtureProps> & {
  registry?: string
}

export const DEFAULT_PROPS: IDeployVaultFixtureProps = {
  ...DEFAULT_PROPS_TOKEN,
  registry: createRandomAddress(),
}

export async function deployVaultFixture(props: IDeployVaultFixtureProps) {
  const { registry, ...tokenProps } = {
    ...DEFAULT_PROPS,
    ...props,
  }

  const accounts = await ethers.getSigners()
  const { tokenContract } = await loadFixture(token.deployTokenFixture.bind(null, tokenProps))

  const tokenAddress = await tokenContract.getAddress()
  const Vault = await ethers.getContractFactory('Vault')
  const vaultContract = await Vault.deploy(tokenAddress, registry)
  const vaultAddress = await vaultContract.getAddress()

  return { accounts, vaultContract, vaultAddress, tokenContract, tokenAddress }
}

const fixtures = {
  deployVaultFixture,
}

export default fixtures
