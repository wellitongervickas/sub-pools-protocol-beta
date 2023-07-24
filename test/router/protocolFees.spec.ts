import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { FractionLib } from './../../typechain-types/contracts/registry/Registry'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set protocol fees', async function () {
      const fees: FractionLib.FractionStruct = {
        value: ethers.toBigInt(15),
        divider: ethers.toBigInt(200),
      }

      const { routerContract } = await loadFixture(router.deployRouterFixture.bind(this, fees))

      const newFees: FractionLib.FractionStruct = {
        value: ethers.toBigInt(0),
        divider: ethers.toBigInt(100),
      }

      await routerContract.setProtocolFees(newFees)

      expect(await routerContract.protocolFees()).to.be.deep.equal([newFees.value, newFees.divider])
    })

    it('should revert if try to change protocol fees without being the manager', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [, otherAccount] = accounts

      const otherAccountRouterInstance = routerContract.connect(otherAccount) as any

      await expect(
        otherAccountRouterInstance.setProtocolFees([ethers.toBigInt(0), ethers.toBigInt(100)])
      ).to.be.revertedWithCustomError(otherAccountRouterInstance, 'InvalidManager()')
    })
  })
})
