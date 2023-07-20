import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_MAX_DEPOSIT, DEFAULT_REQUIRED_INITIAL_AMOUNT } from '../helpers/tokens'

describe('Registry', () => {
  describe('Deposit', () => {
    it('should deposit to account', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)
      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)

      const [, initialBalance] = await registryContract.accounts(otherAccount.address)

      expect(initialBalance).to.equal(initialAmount)
    })

    it('should emit Deposited when deposit to account', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await expect(registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Deposited')
        .withArgs(otherAccount.address, initialAmount)
    })

    it('should transfer funds to strategy when deposit to account', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(otherAccount.address, otherAccount.address, initialAmount)
      expect(await tokenContract.balanceOf(fakeStrategyAddress)).to.equal(initialAmountNumber)
    })

    it('should revert if try to deposit to account without being the owner', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await expect(
        (registryContract.connect(otherAccount) as any).deposit(
          otherAccount.address,
          otherAccount.address,
          initialAmount
        )
      ).to.be.rejectedWith('Ownable: caller is not the owner')
    })

    it('should charge fees from parent account when deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(managerAccount.address, initialAmountNumber)
      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(managerAccount.address, managerAccount.address, initialAmount)
      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(managerAccount.address)
      const [decodedAdditionalBalance] = coderUtils.decompile(additionalBalance, ['uint256'])

      expect(decodedAdditionalBalance).to.equal('5000000000000000')
    })

    it('should update parent cashback balance when join to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(managerAccount.address, initialAmountNumber)
      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

      await registryContract.deposit(managerAccount.address, managerAccount.address, initialAmount)
      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)

      const [, , , , , , cashbackBalance] = await registryContract.accounts(managerAccount.address)
      const [decodedCashbackBalance] = coderUtils.decompile(cashbackBalance, ['uint256'])

      expect(decodedCashbackBalance).to.equal('995000000000000000')
    })

    it('should revert if try to deposit amount not equal as required inital amount', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)

      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer, managerAccount, invitedAccount] = accounts

      const invalidInitialAmountNumber = '1'
      const requiredAmountNumber = '1000000000000000000'

      const invalidInitialAmount = coderUtils.build([invalidInitialAmountNumber], ['uint256'])
      const requiredInitialAmount = coderUtils.build([requiredAmountNumber], ['uint256'])

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.join(
        deployer.address,
        managerAccount.address,
        accountFees,
        requiredInitialAmount,
        DEFAULT_MAX_DEPOSIT
      )

      await registryContract.join(
        managerAccount.address,
        invitedAccount.address,
        accountFees,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(managerAccount.address, requiredAmountNumber)
      await tokenContract.transfer(invitedAccount.address, requiredAmountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(fakeStrategyAddress, requiredAmountNumber)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(fakeStrategyAddress, requiredAmountNumber)

      await registryContract.deposit(managerAccount.address, managerAccount.address, requiredInitialAmount)

      await expect(
        registryContract.deposit(invitedAccount.address, invitedAccount.address, invalidInitialAmount)
      ).to.be.revertedWithCustomError(registryContract, 'InvalidInitialAmount()')
    })
  })
})
