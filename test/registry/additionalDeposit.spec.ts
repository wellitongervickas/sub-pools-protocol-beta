import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT, DEFAULT_MAX_DEPOSIT } from '../helpers/tokens'
import { DEFAULT_PERIOD_LOCK } from '../helpers/time'

describe('Registry', () => {
  describe('Additional Deposit', () => {
    it('should additional deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmountNumber)
      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(otherAccount.address)

      expect(additionalBalance).to.equal(initialAmount)
    })

    it('should increase additional balance on deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const totalAmountNumber = '2000000000000000000'
      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const expectedAmount = coderUtils.build([totalAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(otherAccount.address, totalAmountNumber)
      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, totalAmountNumber)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(otherAccount.address)
      expect(additionalBalance).to.equal(expectedAmount)
    })

    it('should emit Deposited when additional deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmountNumber)

      await expect(registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Deposited')
        .withArgs(otherAccount.address, initialAmount)
    })

    it('should revert if try to additional deposit to account without being the owner', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        otherAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await expect(
        (registryContract.connect(otherAccount) as any).additionalDeposit(
          otherAccount.address,
          otherAccount.address,
          initialAmount
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })

    it('should revert if try to send additional deposit greater than max deposit', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const amountNumber = '1000000000000000000'
      const amount = coderUtils.build([amountNumber], ['uint256'])
      const maxDepositAmount = coderUtils.build(['1'], ['uint256'])

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        maxDepositAmount,
        DEFAULT_PERIOD_LOCK
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(managerAccount.address, amountNumber)
      await tokenContract.transfer(invitedAccount.address, amountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(fakeStrategyAddress, amountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, amountNumber)

      await expect(
        registryContract.additionalDeposit(invitedAccount.address, invitedAccount.address, amount)
      ).to.be.revertedWithCustomError(registryContract, 'ExceedsMaxDeposit()')
    })

    it('should revert if try to send additional deposit greater than max deposit other small additional deposit', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const amountNumber = '1000000000000000000'
      const amount = coderUtils.build([amountNumber], ['uint256'])
      const maxDepositAmount = coderUtils.build([amountNumber], ['uint256'])

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        maxDepositAmount,
        DEFAULT_PERIOD_LOCK
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(managerAccount.address, amountNumber)
      await tokenContract.transfer(invitedAccount.address, amountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(fakeStrategyAddress, amountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, amountNumber)

      await registryContract.additionalDeposit(invitedAccount.address, invitedAccount.address, amount)

      await expect(
        registryContract.additionalDeposit(invitedAccount.address, invitedAccount.address, amount)
      ).to.be.revertedWithCustomError(registryContract, 'ExceedsMaxDeposit()')
    })
  })
})
