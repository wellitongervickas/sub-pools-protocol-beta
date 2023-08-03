import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'
import { DEFAULT_SUPPLY } from '../../fixtures/token'

describe('AdapterVault', () => {
  describe('Withdraw', () => {
    it('should revert if try to withdraw without being the owner', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const adapterVaultContractAddress = await adapterVaultContract.getAddress()

      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      await tokenContract.approve(adapterVaultContractAddress, amount)
      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await expect(receiverAdapterVaultContract.withdraw(amount, receiver.address, owner.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
