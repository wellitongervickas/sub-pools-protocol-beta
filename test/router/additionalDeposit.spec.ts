import { expect } from 'chai'
import { router, fakeStrategySingle, loadFixture, ethers, anyValue } from '../fixtures'
import coderUtils from '../helpers/coder'
import { createRandomAddress } from '../helpers/address'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'
import { DEFAULT_MAX_DEPOSIT, DEFAULT_REQUIRED_INITIAL_AMOUNT } from '../helpers/tokens'

describe('Router', () => {
  describe('Additional Deposit', () => {
    it('should emit Deposited on additional deposit', async function () {
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
        DEFAULT_MAX_DEPOSIT
      )

      const receipt1 = await tx1.wait()
      const [nodeAddress] = receipt1.logs[2].args

      await expect(routerContract.additionalDeposit(nodeAddress, amount))
        .to.emit(routerContract, 'RegistryDeposited')
        .withArgs(registryAddress, anyValue, amount)
    })
  })
})
