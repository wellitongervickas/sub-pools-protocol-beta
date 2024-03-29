import { expect } from 'chai'
import { ethers, loadFixture, registry, fakeStrategySingle } from '../fixtures'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT, DEFAULT_MAX_DEPOSIT } from '../helpers/tokens'
import { DEFAULT_PERIOD_LOCK } from '../helpers/time'

describe('Registry', () => {
  describe('Create', () => {
    it('should create a new account', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )
      const [id, initialBalance, additionalBalance, fees, parentAddress] = await registryContract.accounts(
        otherAccount.address
      )

      expect([id, initialBalance, additionalBalance, fees, parentAddress]).to.deep.equal([
        ethers.toBigInt(1),
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        [accountFees.value, accountFees.divider],
        deployer.address,
      ])
    })

    it('should emit Joined when create a new account', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await expect(
        registryContract.join(
          deployer.address,
          otherAccount.address,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_DEPOSIT,
          DEFAULT_PERIOD_LOCK
        )
      )
        .to.emit(registryContract, 'Joined')
        .withArgs(otherAccount.address)
    })

    it('should revert if try to create account twice', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await expect(
        registryContract.join(
          deployer.address,
          otherAccount.address,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_DEPOSIT,
          DEFAULT_PERIOD_LOCK
        )
      ).to.be.revertedWithCustomError(registryContract, 'AlreadyJoined()')
    })

    it('should revert if try to create account without being the owner', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, otherAccount] = accounts

      await expect(
        (registryContract.connect(otherAccount) as any).join(
          deployer.address,
          otherAccount.address,
          DEFAULT_FEES_FRACTION,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_DEPOSIT,
          DEFAULT_PERIOD_LOCK
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })
})
