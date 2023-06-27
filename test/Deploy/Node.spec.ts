import { expect } from 'chai'
import { deployNodeFixture, loadFixture, ethers, DEFAULT_FEES_FRACTION, MANAGER_ROLE, INVITED_ROLE } from '../fixtures'

describe('SubPoolNode', () => {
  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [], 0)
      )

      expect(await subPoolNode.currentID()).to.equal(0)
    })

    it('should set manager by address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [], 0)
      )

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(manager.address)
    })

    it('should set manager initial balance', async function () {
      const amount = ethers.toBigInt(1000)
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, amount, DEFAULT_FEES_FRACTION, [], 0)
      )

      const [, initialBalance] = await subPoolNode.manager()
      expect(initialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [], 0)
      )

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })

    it('should set manager fraction', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [], 0)
      )

      const [, , , managerFraction] = await subPoolNode.manager()
      expect(managerFraction).to.deep.equal([DEFAULT_FEES_FRACTION.value, DEFAULT_FEES_FRACTION.divider])
    })

    it('should set role to manager address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [], 0)
      )

      expect(await subPoolNode.hasRole(MANAGER_ROLE, manager.address)).to.be.true
    })

    it('should set role to invited addresses', async function () {
      const [manager, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [invited.address], 0)
      )

      expect(await subPoolNode.hasRole(INVITED_ROLE, invited.address)).to.be.true
    })
  })
})
