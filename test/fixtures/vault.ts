import { ethers } from 'hardhat'
import { createRandomAddress } from '../helpers/address'
import { IDeployTokenFixtureProps, DEFAULT_PROPS as DEFAULT_PROPS_TOKEN } from './token'

export type IDeployVaultFixtureProps = Partial<IDeployTokenFixtureProps> & {
  registry?: string
}

export const DEFAULT_PROPS: IDeployVaultFixtureProps = {
  registry: createRandomAddress(),
}

export async function deployVaultFixture(props: IDeployVaultFixtureProps) {
  const { initialSupply, name, symbol, decimals, registry } = {
    ...DEFAULT_PROPS,
    ...props,
  }

  const accounts = await ethers.getSigners()
  const Token = await ethers.getContractFactory('Token')

  const tokenContract = await Token.deploy(
    initialSupply || DEFAULT_PROPS_TOKEN.initialSupply,
    name || DEFAULT_PROPS_TOKEN.name,
    symbol || DEFAULT_PROPS_TOKEN.symbol,
    decimals || DEFAULT_PROPS_TOKEN.decimals
  )

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
