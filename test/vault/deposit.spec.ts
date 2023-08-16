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

    it('should revert if try to deposit without being the owner', async function () {
      const expectedShares = '1000000000000000000'

      const { vaultContract, vaultAddress, tokenContract, accounts } = await loadFixture(vault.deployVaultFixture)
      const [, receiver] = accounts

      await tokenContract.transfer(receiver.address, expectedShares)

      const receiveTokenContract = tokenContract.connect(receiver) as any
      const receiverVaultContract = vaultContract.connect(receiver) as any

      await receiveTokenContract.approve(vaultAddress, expectedShares)

      await expect(receiverVaultContract.deposit(expectedShares, receiver.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
