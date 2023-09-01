import { expect } from 'chai'
import { ethers, loadFixture, router } from '../../fixtures'

describe('Router', () => {
  describe('VaultFactory', () => {
    it('should update vault factory', async function () {
      const VaultFactory = await ethers.getContractFactory('VaultFactory')
      const vaultFactoryContract = await VaultFactory.deploy()
      const newVaultFactoryAddress = await vaultFactoryContract.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await routerContract.updateVaultFactory(newVaultFactoryAddress)

      expect(await routerContract.vaultFactory()).to.equal(newVaultFactoryAddress)
    })

    it('should emit RouterManager_VaultFactoryUpdated when update node factory', async function () {
      const VaultFactory = await ethers.getContractFactory('VaultFactory')
      const vaultFactoryContract = await VaultFactory.deploy()
      const newVaultFactoryAddress = await vaultFactoryContract.getAddress()

      const { routerContract } = await loadFixture(router.deployRouterFixture)

      await expect(routerContract.updateVaultFactory(newVaultFactoryAddress))
        .to.emit(routerContract, 'RouterManager_VaultFactoryUpdated')
        .withArgs(newVaultFactoryAddress)
    })

    it('should revert if try to update vault factory without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [_, notManager] = accounts

      const VaultFactory = await ethers.getContractFactory('VaultFactory')
      const vaultFactoryContract = await VaultFactory.deploy()
      const newVaultFactoryAddress = await vaultFactoryContract.getAddress()

      const notManagerVaultFactoryContract = routerContract.connect(notManager) as any

      await expect(
        notManagerVaultFactoryContract.updateVaultFactory(newVaultFactoryAddress)
      ).to.be.revertedWithCustomError(routerContract, 'Manager_Invalid()')
    })
  })
})
