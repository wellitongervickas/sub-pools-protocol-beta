import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Deposit', () => {
    it('should receive shares on deposit', async function () {
      const expectedShares = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedShares)
      await vaultContract.deposit(expectedShares, receiver.address)

      const shares = await vaultContract.balanceOf(receiver.address)
      expect(shares).to.be.equal(expectedShares)
    })

    it.skip('should revert try to deposit without being the owner', async function () {
      const { vaultContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      const receiverVaultContract = vaultContract.connect(receiver) as any

      await expect(receiverVaultContract.deposit('0', receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
