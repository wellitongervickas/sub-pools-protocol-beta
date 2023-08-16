import { expect } from 'chai'
import { loadFixture, vault } from '../fixtures'

describe('Vault', () => {
  describe('Withdraw', () => {
    it('should receive shares on withdraw', async function () {
      const expectedShares = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [owner, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedShares)
      await vaultContract.deposit(expectedShares, receiver.address)

      const receiverVaultContract = vaultContract.connect(receiver) as any
      await receiverVaultContract.approve(owner.address, expectedShares)
      await vaultContract.withdraw(expectedShares, receiver.address, receiver.address)

      const shares = await tokenContract.balanceOf(receiver.address)
      expect(shares).to.be.equal(expectedShares)
    })

    it('should revert if try to withdraw without being the owner', async function () {
      const expectedShares = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [owner, receiver] = accounts

      await tokenContract.approve(vaultAddress, expectedShares)
      await vaultContract.deposit(expectedShares, receiver.address)

      const receiveVaultContract = vaultContract.connect(receiver) as any

      await expect(receiveVaultContract.withdraw(expectedShares, owner.address, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
