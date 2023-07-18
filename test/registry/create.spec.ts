import { expect } from 'chai'
import { ethers, loadFixture, registry } from '../fixtures'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'

describe('Registry', () => {
  describe('Create', () => {
    it('should create a new account', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts
      await registryContract.setupAccount(otherAccount.address, DEFAULT_FEES_FRACTION)
      const [id, initialBalance, additionalBalance] = await registryContract.accounts(otherAccount.address)

      expect([id, initialBalance, additionalBalance]).to.deep.equal([ethers.toBigInt(2), '0x', '0x'])
    })

    it('should emit Joined when create a new account', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await expect(registryContract.setupAccount(otherAccount.address, DEFAULT_FEES_FRACTION))
        .to.emit(registryContract, 'Joined')
        .withArgs(otherAccount.address)
    })

    it('should revert if try to create account twice', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await registryContract.setupAccount(otherAccount.address, DEFAULT_FEES_FRACTION)

      await expect(
        registryContract.setupAccount(otherAccount.address, DEFAULT_FEES_FRACTION)
      ).to.be.revertedWithCustomError(registryContract, 'AlreadyJoined()')
    })

    it('should revert if try to create account without being the owner', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [, otherAccount] = accounts

      await expect(
        (registryContract.connect(otherAccount) as any).setupAccount(otherAccount.address, DEFAULT_FEES_FRACTION)
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })
})
