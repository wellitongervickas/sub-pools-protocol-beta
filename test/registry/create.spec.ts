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
      const [deployer, otherAccount] = accounts
      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      const [id, initialBalance, additionalBalance, fees, parentAddress] = await registryContract.accounts(
        otherAccount.address
      )

      expect([id, initialBalance, additionalBalance, fees, parentAddress]).to.deep.equal([
        ethers.toBigInt(2),
        '0x',
        '0x',
        [DEFAULT_FEES_FRACTION.value, DEFAULT_FEES_FRACTION.divider],
        deployer.address,
      ])
    })

    it('should emit Joined when create a new account', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await expect(registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION))
        .to.emit(registryContract, 'Joined')
        .withArgs(otherAccount.address)
    })

    it('should revert if try to create account twice', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)

      await expect(
        registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      ).to.be.revertedWithCustomError(registryContract, 'AlreadyJoined()')
    })

    it('should revert if try to create account without being the owner', async function () {
      const fakeStrategyAddress = createRandomAddress()
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await expect(
        (registryContract.connect(otherAccount) as any).setupAccount(
          deployer.address,
          otherAccount.address,
          DEFAULT_FEES_FRACTION
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })
})
