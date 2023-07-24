import { expect } from 'chai'
import { router, fakeStrategySingle, loadFixture, ethers, anyValue } from '../fixtures'
import coderUtils from '../helpers/coder'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_MAX_DEPOSIT, DEFAULT_REQUIRED_INITIAL_AMOUNT } from '../helpers/tokens'
import { DEFAULT_PERIOD_LOCK } from '../helpers/time'

describe('Router', () => {
  describe('Withdraw', () => {
    it('should emit Withdrew on withdraw balance', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check
      const tx1 = await routerContract.create(
        registryAddress,
        [],
        amount,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      await routerContract.additionalDeposit(nodeAddress, amount)

      await expect(routerContract.withdraw(nodeAddress, amount))
        .to.emit(routerContract, 'RegistryWithdrew')
        .withArgs(registryAddress, anyValue, amount)
    })

    it('should revert if try to withdraw balance of a non node manager ', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const tx = await routerContract.registry(fakeStrategyAddress)
      const receipt = await tx.wait()
      const [registryAddress] = receipt.logs[2].args

      const amount = coderUtils.build(['0'], ['uint256']) // bypass allowance check
      const tx1 = await routerContract.create(
        registryAddress,
        [],
        amount,
        DEFAULT_FEES_FRACTION,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_DEPOSIT,
        DEFAULT_PERIOD_LOCK
      )

      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(otherAccountRouterInstance.withdraw(nodeAddress, amount)).to.be.revertedWithCustomError(
        otherAccountRouterInstance,
        'InvalidManager()'
      )
    })
  })
})
