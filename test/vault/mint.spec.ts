import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Mint', () => {
    it('should receive shares on mint', async function () {
      const expectedAssets = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedAssets)
      await vaultContract.mint(expectedAssets, receiver.address)

      const shares = await vaultContract.balanceOf(receiver.address)
      expect(shares).to.be.equal(expectedAssets)
    })

    it('should revert try to mint without being the owner', async function () {
      const { vaultContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      const receiverVaultContract = vaultContract.connect(receiver) as any

      await expect(receiverVaultContract.mint('0', receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
