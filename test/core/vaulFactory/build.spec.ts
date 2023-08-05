import { expect } from 'chai'
import { anyValue, ethers, loadFixture, vaultFactory } from '../../fixtures'
import { FAKE_STRATEGY, createRandomAddress } from '../../helpers/address'

describe('VaultFactory', () => {
  describe('Build', () => {
    it('should emit VaultFactory_VaultCreated when build', async function () {
      const { vaultFactoryContract } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

      await expect(vaultFactoryContract.build(FAKE_STRATEGY))
        .to.emit(vaultFactoryContract, 'VaultFactory_VaultCreated')
        .withArgs(anyValue, FAKE_STRATEGY)
    })

    it('should set the vault owner as the sender', async function () {
      const { vaultFactoryContract, accounts } = await loadFixture(vaultFactory.deployVaultFactoryFixture)

      const [manager] = accounts

      const tx = await vaultFactoryContract.build(FAKE_STRATEGY)
      const receipt = await tx.wait()

      const vaultContract = await ethers.getContractAt('Vault', receipt.logs[2].args[0])

      expect(await vaultContract.owner()).to.equal(manager.address)
    })
  })
})
