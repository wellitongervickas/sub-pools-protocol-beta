import { expect } from 'chai'
import { deployRouterFixture, loadFixture, DEFAULT_FEES_FRACTION, ethers, SubPoolRouter, anyValue } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Events', () => {
    describe('Main', () => {
      it('should emit SubPoolCreated on create a main node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, invited] = accounts
        subPoolRouter.connect(invited)

        const amount = '1000'

        await expect(subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolCreated')
          .withArgs(anyValue, 1, amount)
      })
    })

    describe('Node', () => {
      it('should emit SubPoolJoined on create a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = '1000'
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolJoined')
          .withArgs(anyValue, 1, amount)
      })

      it('should emit SubPoolDeposited when node deposit', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = '1000'
        const [, invited] = accounts

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [invited.address])
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(newInstance.join(subPoolAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolRouter, 'SubPoolDeposited')
          .withArgs(anyValue, amount)
      })
    })

    describe('Additional deposit', () => {
      it('should emit SubPoolDeposited when do additional deposit', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)
        const amount = ethers.toBigInt(1000)

        const tx = await subPoolRouter.create(amount, DEFAULT_FEES_FRACTION, [])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args

        await expect(subPoolRouter.additionalDeposit(subPoolAddress, amount))
          .to.emit(subPoolRouter, 'SubPoolDeposited')
          .withArgs(anyValue, amount)
      })
    })
  })
})
