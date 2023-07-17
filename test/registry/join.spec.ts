import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'
import { createRandomAddress } from '../helpers/address'

describe('Registry', () => {
  describe('Join', () => {
    it('should set account on join', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const accountAddress = createRandomAddress()
      await registryContract.join(accountAddress)

      const [id] = await registryContract.accounts(accountAddress)
      expect(id).to.equal(2)
    })

    it('should revert if try to join with an already joined account', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const accountAddress = createRandomAddress()
      await registryContract.join(accountAddress)

      await expect(registryContract.join(accountAddress)).to.be.revertedWithCustomError(
        registryContract,
        'AlreadyJoined()'
      )
    })

    it('should emit Joined event on join', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, createRandomAddress()))

      const accountAddress = createRandomAddress()
      await expect(registryContract.join(accountAddress)).to.emit(registryContract, 'Joined').withArgs(accountAddress)
    })

    it('should revert if try to join without being the owner', async function () {
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, createRandomAddress())
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
