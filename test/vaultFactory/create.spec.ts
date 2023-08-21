import { expect } from 'chai'
import { loadFixture, vaultFactory, token } from '../fixtures'

describe('VaultFactory', () => {
  describe('Create', () => {
    it('should emit VaultFactory_Created on create', async function () {
      const { tokenAddress } = await loadFixture(token.deployTokenFixture)
      const { vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

      await expect(vaultFactoryContract.createVault(tokenAddress, 'Vault USDC', 'vUSDC')).to.emit(
        vaultFactoryContract,
        'VaultFactory_Created'
      )
    })
  })
})
