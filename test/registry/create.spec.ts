import { expect } from 'chai'
import { loadFixture, registry, token } from '../fixtures'

describe('Registry', () => {
  describe('Node', () => {
    describe('Create', () => {
      it('should emit Registry_NodeCreated on create', async function () {
        const { tokenAddress } = await loadFixture(token.deployTokenFixture)
        const { registryContract, vaultFactoryContract } = await loadFixture(registry.deployRegistryFixture)

        const tx = await vaultFactoryContract.createVault(tokenAddress, 'vUSDC', 'USD Coin Vault')
        const receipt = await tx.wait()
        const [vaultAddress] = receipt.logs[0].args

        await expect(registryContract.createNode([vaultAddress], [vaultAddress])).to.emit(
          registryContract,
          'Registry_NodeCreated'
        )
      })
    })
  })

  describe('Vault', () => {
    describe('Create', () => {
      it('should emit Registry_VaultCreated on create', async function () {
        const { tokenAddress } = await loadFixture(token.deployTokenFixture)
        const { registryContract } = await loadFixture(registry.deployRegistryFixture)

        await expect(registryContract.createVault(tokenAddress, 'vUSDC', 'USD Coin Vault')).to.emit(
          registryContract,
          'Registry_VaultCreated'
        )
      })
    })
  })
})
