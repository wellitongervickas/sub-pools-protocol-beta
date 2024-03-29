import { expect } from 'chai'
import {
  deployRoutedNodeFixture,
  loadFixture,
  ethers,
  DEFAULT_FEES_FRACTION,
  deployRouterFixture,
  time,
  DEFAULT_REQUIRED_INITIAL_AMOUNT,
  DEFAULT_MAX_ADDITIONAL_AMOUNT,
  DEFAULT_PERIOD_LOCK,
} from '../fixtures'

describe('Router', () => {
  describe('Additional deposit', () => {
    it('should revert if try to call additional deposit without being the manager', async function () {
      const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const nodeAddress = await subPoolNode.getAddress()
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(
        anyEntityRouterInstance.additionalDeposit(nodeAddress, ethers.toBigInt(100))
      ).to.be.revertedWithCustomError(subPoolRouter, 'NotChildrenManager()')
    })
  })

  describe('Deposit', () => {
    it('should revert when try to call deposit if sender is not node', async function () {
      const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(anyEntityRouterInstance.deposit(ethers.toBigInt(100))).to.be.revertedWithCustomError(
        subPoolRouter,
        'NotAllowed()'
      )
    })
  })

  describe('Withdraw Balance', () => {
    it('should revert if try to call withdraw greater than balance', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      await subPoolRouter.additionalDeposit(subPoolAddress, additionalAmount)

      const extraValue = ethers.toBigInt(100)

      await expect(
        subPoolRouter.withdrawBalance(subPoolAddress, additionalAmount + extraValue)
      ).to.be.revertedWithCustomError(subPoolRouter, 'NotAllowed()')
    })

    it('should revert if try to call withdraw greater than initial balance', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args
      const extraValue = ethers.toBigInt(100)

      await expect(
        subPoolRouter.withdrawInitialBalance(subPoolAddress, amount + extraValue)
      ).to.be.revertedWithCustomError(subPoolRouter, 'NotAllowed()')
    })

    it('should revert if try to call withdraw balance without being the manager', async function () {
      const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const nodeAddress = await subPoolNode.getAddress()
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(
        anyEntityRouterInstance.withdrawBalance(nodeAddress, ethers.toBigInt(100))
      ).to.be.revertedWithCustomError(subPoolRouter, 'NotChildrenManager()')
    })

    it('should revert if try to call withdraw initial balance without being the manager', async function () {
      const { subPoolRouter, subPoolNode, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const nodeAddress = await subPoolNode.getAddress()
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(
        anyEntityRouterInstance.withdrawInitialBalance(nodeAddress, ethers.toBigInt(100))
      ).to.be.revertedWithCustomError(subPoolRouter, 'NotChildrenManager()')
    })

    it('should revert when try to call withdraw if sender is not node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(anyEntityRouterInstance.withdraw(ethers.toBigInt(100))).to.be.revertedWithCustomError(
        subPoolRouter,
        'NotAllowed()'
      )
    })

    it('should revert when try to call cashback if sender is not node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRoutedNodeFixture)
      const [, anyEntity] = accounts
      const anyEntityRouterInstance = subPoolRouter.connect(anyEntity) as any

      await expect(anyEntityRouterInstance.cashback(ethers.toBigInt(100))).to.be.revertedWithCustomError(
        subPoolRouter,
        'NotAllowed()'
      )
    })

    it('should revert if try to withdraw initial balance in locked period', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

      const amount = ethers.toBigInt(1000)
      const [, invited] = accounts

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        unlockTime,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      await invitedRouterInstance.join(
        subPoolAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        unlockTime,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      await expect(
        subPoolRouter.withdrawInitialBalance(subPoolAddress, ethers.toBigInt(100))
      ).to.be.revertedWithCustomError(subPoolRouter, 'LockPeriod()')
    })
  })
})
