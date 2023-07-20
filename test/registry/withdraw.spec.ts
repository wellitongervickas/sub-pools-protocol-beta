import { expect } from 'chai'
import { loadFixture, fakeStrategySingle, registry, token, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_REQUIRED_INITIAL_AMOUNT, DEFAULT_MAX_DEPOSIT } from '../helpers/tokens'

describe('Registry', () => {
  describe('Additional Deposit', () => {
    it('should decrease additional balance on withdraw of account', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)
      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmountNumber)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
      await registryContract.withdraw(otherAccount.address, otherAccount.address, amountToWithdraw)

      const [, , additionalBalance] = await registryContract.accounts(otherAccount.address)
      expect(additionalBalance).to.equal(expectedAmount)
    })

    it('should revert if try to withdraw more than available on additional balance', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)
      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmountNumber)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
      await expect(
        registryContract.withdraw(otherAccount.address, otherAccount.address, amountToWithdraw)
      ).to.be.revertedWithCustomError(registryContract, 'InsufficientAdditionalBalance()')
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
        DEFAULT_MAX_DEPOSIT
      )

      await tokenContract.transfer(otherAccount.address, initialAmountNumber)
      const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
      await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmountNumber)

      await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)

      await expect(registryContract.withdraw(otherAccount.address, otherAccount.address, initialAmount))
        .to.emit(registryContract, 'Withdrew')
        .withArgs(otherAccount.address, initialAmount)
    })

    // it('should transfer funds to strategy when additional deposit to account', async function () {
    //   const { tokenContract } = await loadFixture(token.deployTokenFixture)
    //   const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
    //   const { registryContract, accounts } = await loadFixture(
    //     registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
    //   )

    //   const [deployer, otherAccount] = accounts
    //

    //   const initialAmountNumber = '1000000000000000000'
    //   const initialAmount = coderUtils.build([initialAmountNumber], ['uint256'])

    //   await registryContract.join(
    //     deployer.address,
    //     otherAccount.address,
    //     DEFAULT_FEES_FRACTION,
    //     DEFAULT_REQUIRED_INITIAL_AMOUNT,
    //     DEFAULT_MAX_DEPOSIT
    //   )
    //   await tokenContract.transfer(otherAccount.address, initialAmountNumber)

    //   const otherAccountTokenContract = tokenContract.connect(otherAccount) as any
    //   await otherAccountTokenContract.approve(fakeStrategyAddress, initialAmount)

    //   await registryContract.additionalDeposit(otherAccount.address, otherAccount.address, initialAmount)
    //   expect(await tokenContract.balanceOf(fakeStrategyAddress)).to.equal(initialAmountNumber)
    // })
  })
})
