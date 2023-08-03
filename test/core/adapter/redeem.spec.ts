import { expect } from 'chai'
import { loadFixture, adapterVault } from '../../fixtures'
import { DEFAULT_SUPPLY } from '../../fixtures/token'

describe('AdapterVault', () => {
  describe('Redeem', () => {
    it('should revert if try to mint without being the owner', async function () {
      const { adapterVaultContract, tokenContract, accounts } = await loadFixture(
        adapterVault.deployAdapterVaultFixture
      )

      const [owner, receiver] = accounts
      const amount = DEFAULT_SUPPLY

      const receiverAdapterVaultContract = adapterVaultContract.connect(receiver) as any

      await expect(receiverAdapterVaultContract.redeem(amount, receiver.address, owner.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
