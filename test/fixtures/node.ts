import { ethers, loadFixture, vaultFactory } from './'
import token, { IDeployTokenFixtureProps, DEFAULT_PROPS } from './token'

export type IDeployNodeFixtureProps = IDeployTokenFixtureProps

export async function deployNodeFixture(props?: IDeployNodeFixtureProps) {
  const defaultProps = { ...DEFAULT_PROPS, ...props }

  const accounts = await ethers.getSigners()
  const { tokenAddress, tokenContract } = await loadFixture(token.deployTokenFixture)
  const { vaultFactoryContract, vaultFactoryAddress } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

  const tx = await vaultFactoryContract.createVault(tokenAddress, defaultProps.name, defaultProps.symbol)
  const receipt = await tx.wait()
  const [vaultAddress] = receipt.logs[0].args
  const vaultContract = await ethers.getContractAt('Vault', vaultAddress)

  const Node = await ethers.getContractFactory('Node')
  const nodeContract = await Node.deploy([vaultAddress])
  const nodeAddress = await nodeContract.getAddress()

  return {
    accounts,
    nodeContract,
    vaultFactoryContract,
    tokenContract,
    vaultFactoryAddress,
    vaultAddress,
    tokenAddress,
    nodeAddress,
    vaultContract,
  }
}

const fixtures = {
  deployNodeFixture,
}

export default fixtures
