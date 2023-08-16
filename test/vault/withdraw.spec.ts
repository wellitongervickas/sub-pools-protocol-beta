import { expect } from 'chai'
import { loadFixture, token, vault } from '../fixtures'

describe('Vault', () => {
  describe('Withdraw', () => {
    it('should receive shares on deposit', async function () {
      const expectedShares = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.transfer(receiver, expectedShares)
      const receiverTokenContract = tokenContract.connect(receiver) as any

      await receiverTokenContract.approve(vaultAddress, expectedShares)
      await vaultContract.deposit(expectedShares, receiver.address)
      await vaultContract.withdraw(expectedShares, receiver.address, receiver.address)

      const shares = await tokenContract.balanceOf(receiver.address)
      expect(shares).to.be.equal(expectedShares)
    })

    it('should revert try to deposit without being the owner', async function () {
      const { vaultContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      const receiverVaultContract = vaultContract.connect(receiver) as any

      await expect(receiverVaultContract.withdraw('0', receiver.address, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
