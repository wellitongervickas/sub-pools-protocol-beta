import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { FractionLib } from './../../typechain-types/contracts/registry/Registry'
import { DEFAULT_FEES_FRACTION } from '../helpers/fees'

describe('Router', () => {
  describe('Deploy', () => {
    it('should set manager address', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const [manager] = accounts

      expect(await routerContract.hasRoleManager(manager.address)).to.be.true
    })

    it('should set treasury address', async function () {
      const { routerContract, treasuryAddress } = await loadFixture(router.deployRouterFixture)

      expect(await routerContract.treasuryAddress()).to.be.equal(treasuryAddress)
    })

    it('should set protocol fees', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      expect(await routerContract.protocolFees()).to.be.deep.equal([
        DEFAULT_FEES_FRACTION.value,
        DEFAULT_FEES_FRACTION.divider,
      ])
    })
  })
})
