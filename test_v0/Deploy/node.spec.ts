import { expect } from 'chai'
import {
  deployNodeFixture,
  loadFixture,
  ethers,
  DEFAULT_FEES_FRACTION,
  MANAGER_ROLE,
  INVITED_ROLE,
  time,
} from '../fixtures'

describe('Children', () => {
  describe('Deploy', () => {
    it('should set manager by address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(manager.address)
    })

    it('should set manager initial balance', async function () {
      const amount = ethers.toBigInt(1000)
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, amount))

      const [, initialBalance] = await subPoolNode.manager()
      expect(initialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance', async function () {
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })

    it('should set manager fraction', async function () {
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const [, , , managerFraction] = await subPoolNode.manager()
      expect(managerFraction).to.deep.equal(Object.values(DEFAULT_FEES_FRACTION))
    })

    it('should set role to manager address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      expect(await subPoolNode.hasRole(MANAGER_ROLE, manager.address)).to.be.true
    })

    it('should set role to invited addresses', async function () {
      const [manager, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, ethers.toBigInt(0), DEFAULT_FEES_FRACTION, [invited.address])
      )

      expect(await subPoolNode.hasRole(INVITED_ROLE, invited.address)).to.be.true
    })

    it('should set initial locked period', async function () {
      const amount = ethers.toBigInt(1000)
      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
      const [manager] = await ethers.getSigners()

      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, amount, DEFAULT_FEES_FRACTION, [], unlockTime)
      )

      expect(await subPoolNode.lockPeriod()).to.equal(unlockTime)
    })
  })
})
