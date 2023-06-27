import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers, SubPoolRouter, anyValue } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Events', () => {
    describe('Main', () => {
      it('should emit SubPoolCreated on create a main node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, invited] = accounts
        const rounterInvitedInstance = subPoolRouter.connect(invited) as any
        const amount = ethers.toBigInt(1000)

        await expect(rounterInvitedInstance.create(amount, DEFAULT_FEES_FRACTION, [], 0))
          .to.emit(subPoolRouter, 'SubPoolCreated')
          .withArgs(anyValue, 1, amount)
      })
    })

    describe('Node', () => {
      it('should emit SubPoolJoined on create a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = ethers.toBigInt(1000)
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [], 0))
          .to.emit(subPoolRouter, 'SubPoolJoined')
          .withArgs(anyValue, 1, amount)
      })

      it('should emit ManagerDeposited when node deposit', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = ethers.toBigInt(1000)
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, [], 0))
          .to.emit(subPoolRouter, 'ManagerDeposited')
          .withArgs(anyValue, amount)
      })
    })

    describe('Additional deposit', () => {
      it('should emit ManagerDeposited when do additional deposit', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)
        const amount = ethers.toBigInt(1000)

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [], 0)
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[2].args

        await expect(subPoolRouter.additionalDeposit(subPoolAddress, amount))
          .to.emit(subPoolRouter, 'ManagerDeposited')
          .withArgs(anyValue, amount)
      })
    })

    describe('Withdraw', () => {
      it('should emit ManagerWithdrew when withdraw balance from a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const [, invited] = accounts
        const amount = ethers.toBigInt(1000)
        const additionalAmount = ethers.toBigInt(100)

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        await subPoolRouter.additionalDeposit(subPoolAddress, additionalAmount)

        await expect(subPoolRouter.withdrawBalance(subPoolAddress, additionalAmount))
          .to.emit(subPoolRouter, 'ManagerWithdrew')
          .withArgs(anyValue, additionalAmount)
      })

      it('should emit ManagerWithdrew when withdraw initial balance from a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const [, invited] = accounts
        const amount = ethers.toBigInt(1000)

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address], 0)
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        await expect(subPoolRouter.withdrawInitialBalance(subPoolAddress, amount))
          .to.emit(subPoolRouter, 'ManagerWithdrew')
          .withArgs(anyValue, amount)
      })
    })
  })
})
