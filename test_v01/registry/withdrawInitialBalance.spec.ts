import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers, time } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT, DEFAULT_MAX_DEPOSIT } from '../helpers/tokens'
import { DEFAULT_PERIOD_LOCK } from '../helpers/time'

describe('Registry', () => {
  describe('Withdraw Initial Deposit', () => {
    it('should decrease initial balance on withdraw of account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const amountToWithdrawNumber = '5000000000000000'

      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const amountToWithdraw = coderUtils.build([amountToWithdrawNumber], ['uint256'])
      const expectedAmount = coderUtils.build(['995000000000000000'], ['uint256'])

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

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)
      await registryContract.withdrawInitialBalance(otherAccount.address, otherAccount.address, amountToWithdraw)

      const [, initialBalance] = await registryContract.accounts(otherAccount.address)
      expect(initialBalance).to.equal(expectedAmount)
    })

    it('should revert if try to withdraw more than available on initial balance', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const amountToWithdrawNumber = '5000000000000000000'

      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const amountToWithdraw = coderUtils.build([amountToWithdrawNumber], ['uint256'])

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

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)
      await expect(
        registryContract.withdrawInitialBalance(otherAccount.address, otherAccount.address, amountToWithdraw)
      ).to.be.revertedWithCustomError(registryContract, 'InsufficientInitialBalance()')
    })

    it('should emit Withdrew when withdraw balance of account', async function () {
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

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)

      await expect(registryContract.withdrawInitialBalance(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Withdrew')
        .withArgs(otherAccount.address, initialAmount)
    })

    it('should decrease parent cashback balance when child withdraw initial deposit', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const withdrewAmountNumber = '995000000000000000'
      const withdrewAmount = coderUtils.build([withdrewAmountNumber], ['uint256'])
      const expectedAmount = coderUtils.build(['0'], ['uint256'])

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)
      await registryContract.withdrawInitialBalance(invitedAccount.address, invitedAccount.address, withdrewAmount)

      const [, , , , , , cashbackBalance] = await registryContract.accounts(managerAccount.address)
      const [decodedCashbackBalance] = coderUtils.decompile(cashbackBalance, ['uint256'])

      expect(decodedCashbackBalance).to.equal(expectedAmount)
    })

    it('should revert if try to withdraw initial balance in lock period', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const withdrewAmountNumber = '995000000000000000'
      const withdrewAmount = coderUtils.build([withdrewAmountNumber], ['uint256'])

      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        unlockTime
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)
      await expect(
        registryContract.withdrawInitialBalance(invitedAccount.address, invitedAccount.address, withdrewAmount)
      ).to.be.revertedWithCustomError(registryContract, 'LockPeriod()')
    })

    it('should revert if try to withdraw initial balance to account without being the owner', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const amountToWithdrawNumber = '5000000000000000'

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

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)

      const otherAccountRegistryContract = registryContract.connect(otherAccount) as any

      await expect(
        otherAccountRegistryContract.withdrawInitialBalance(otherAccount.address, otherAccount.address, initialAmount)
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })
    it('should revert if try to withdraw initial balance as root in lock period', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])
      const withdrewAmountNumber = '995000000000000000'
      const withdrewAmount = coderUtils.build([withdrewAmountNumber], ['uint256'])

      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        unlockTime
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)
      await expect(
        registryContract.withdrawInitialBalance(managerAccount.address, managerAccount.address, withdrewAmount)
      ).to.be.revertedWithCustomError(registryContract, 'LockPeriod()')
    })
  })
})
