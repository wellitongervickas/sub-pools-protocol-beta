import { expect } from 'chai'
import { loadFixture, vaultFactory, token, anyValue } from '../fixtures'

describe('VaultFactory', () => {
  describe('Create', () => {
    it('should emit VaultFactory_created on create', async function () {
      const { tokenAddress } = await loadFixture(token.deployTokenFixture)
      const { vaultFactoryContract, accounts } = await loadFixture(vaultFactory.deployVaultFactoryFixture)
      const [owner] = accounts

      await expect(vaultFactoryContract.createVault(tokenAddress, 'Vault USDC', 'vUSDC'))
        .to.emit(vaultFactoryContract, 'VaultFactory_created')
        .withArgs(anyValue, owner.address)
    })
  })
})
