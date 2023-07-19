import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'

describe('Registry', () => {
  describe('Deposit', () => {
    it('should deposit to account', async function () {
      const { tokenContract } = await loadFixture(token.deployTokenFixture)
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )

      const [deployer, otherAccount] = accounts
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any

      await otherAccountTokenContract.approve(registryAddress, initialAmount)
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
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

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
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

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
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      await registryContract.setupAccount(deployer.address, otherAccount.address, DEFAULT_FEES_FRACTION)
      await tokenContract.transfer(otherAccount.address, initialAmountNumber)

      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(registryAddress, initialAmount)

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
      const registryAddress = await registryContract.getAddress()

      const initialAmountNumber = '1000000000000000000'
      const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

      const accountFees = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      }

      await registryContract.setupAccount(deployer.address, managerAccount.address, accountFees)
      await registryContract.setupAccount(managerAccount.address, invitedAccount.address, accountFees)

      await tokenContract.transfer(managerAccount.address, initialAmountNumber)
      await tokenContract.transfer(invitedAccount.address, initialAmountNumber)

      const managerAccountTokenContract = tokenContract.connect(managerAccount) as any
      await managerAccountTokenContract.approve(registryAddress, initialAmount)

      const invitedAccountTokenContract = tokenContract.connect(invitedAccount) as any
      await invitedAccountTokenContract.approve(registryAddress, initialAmount)

      await registryContract.deposit(managerAccount.address, managerAccount.address, initialAmount)
      await registryContract.deposit(invitedAccount.address, invitedAccount.address, initialAmount)

      const [, , additionalBalance] = await registryContract.accounts(managerAccount.address)
      const [decodedAdditionalBalance] = coderUtils.decompile(additionalBalance, ['uint256'])

      expect(decodedAdditionalBalance).to.equal('5000000000000000')
    })
  })
})
