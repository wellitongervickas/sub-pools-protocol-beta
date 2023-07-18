import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'
import { createRandomAddress } from '../helpers/address'

describe('Registry', () => {
  describe('Create', () => {
    it('should create a new account', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await registryContract.setupAccount(otherAccount.address)

      const [id] = await registryContract.accounts(otherAccount.address)

      expect(id).to.equal(2)
    })

    it('should emit Joined when create a new account', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await expect(registryContract.setupAccount(otherAccount.address))
        .to.emit(registryContract, 'Joined')
        .withArgs(otherAccount.address)
    })

    it('should revert if try to create account twice', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await registryContract.setupAccount(otherAccount.address)

      await expect(registryContract.setupAccount(otherAccount.address)).to.be.revertedWithCustomError(
        registryContract,
        'AlreadyJoined()'
      )
    })

    it('should revert if try to create account without being the owner', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await expect(
        (registryContract.connect(otherAccount) as any).setupAccount(otherAccount.address)
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })
})
