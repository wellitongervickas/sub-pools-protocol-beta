import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'
import { RegistryType } from '../fixtures/types'
import { createRandomAddress } from '../helpers/address'
import { buildBytesSingleToken } from '../helpers/tokens'

describe('Registry', () => {
  describe('Join', () => {
    it('should set account ID on join', async function () {
      const { registryContract } = await loadFixture(
        registry.deployRegistryFixture.bind(this, RegistryType.SingleTokenRegistry)
      )

      const accountAddress = createRandomAddress()
      await registryContract.join(accountAddress)

      const [id] = await registryContract.accounts(accountAddress)
      expect(id).to.equal(1)
    })

    it('should set account initial balance on join', async function () {
      const { registryContract } = await loadFixture(
        registry.deployRegistryFixture.bind(this, RegistryType.SingleTokenRegistry)
      )

      const accountAddress = createRandomAddress()
      await registryContract.join(accountAddress)

      const [, initialBalance] = await registryContract.accounts(accountAddress)
      expect(initialBalance).to.equal(0)
    })

    it('should revert if try to join without being the owner', async function () {
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, RegistryType.SingleTokenRegistry)
      )
      const [, account] = accounts

      const accountAddress = createRandomAddress()
      const registryContractAccountInstance = registryContract.connect(account) as any
      await expect(registryContractAccountInstance.join(accountAddress)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })
  })
})
