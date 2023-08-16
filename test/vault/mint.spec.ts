import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Mint', () => {
    it('should receive assets on mint', async function () {
      const expectedAssets = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedAssets)
      await vaultContract.mint(expectedAssets, receiver.address)

      const assets = await vaultContract.balanceOf(receiver.address)
      expect(assets).to.be.equal(expectedAssets)
    })
    it('should revert if try to mint without being the owner', async function () {
      const expectedAssets = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.transfer(receiver.address, expectedAssets)

      const receiveTokenContract = tokenContract.connect(receiver) as any
      const receiverVaultContract = vaultContract.connect(receiver) as any

      await receiveTokenContract.approve(vaultAddress, expectedAssets)

      await expect(receiverVaultContract.mint(expectedAssets, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
