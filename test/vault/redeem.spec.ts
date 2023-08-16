import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Redeem', () => {
    it('should receive assets on redeem', async function () {
      const expectedAssets = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [owner, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedAssets)
      await vaultContract.mint(expectedAssets, receiver.address)

      const receiverVaultContract = vaultContract.connect(receiver) as any
      await receiverVaultContract.approve(owner.address, expectedAssets)

      await vaultContract.redeem(expectedAssets, receiver.address, receiver.address)
      const assets = await tokenContract.balanceOf(receiver.address)

      expect(assets).to.be.equal(expectedAssets)
    })

    it('should revert if try to redeem without being the owner', async function () {
      const expectedAssets = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [owner, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedAssets)
      await vaultContract.mint(expectedAssets, receiver.address)

      const receiveVaultContract = vaultContract.connect(receiver) as any

      await expect(receiveVaultContract.redeem(expectedAssets, owner.address, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
