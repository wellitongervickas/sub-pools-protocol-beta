import { expect } from 'chai'
import { managerControl, loadFixture, ethers } from '../fixtures'

describe('ManagerControl', () => {
  describe('Deploy', () => {
    it('should setup node manager on create', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [manager] = accounts
      const nodeManager = await managerControlContract.manager()

      expect(nodeManager).to.equal(manager.address)
    })
  })

  describe('Invite', () => {
    it('should initialize as invited only', async function () {
      const { managerControlContract } = await loadFixture(managerControl.deployManagerControlFixture)
      expect(await managerControlContract.invitedOnly()).to.equal(true)
    })

    it('should initialize with invited addresses', async function () {
      const [, invited] = await ethers.getSigners()

      const { managerControlContract } = await loadFixture(
        managerControl.deployManagerControlFixture.bind(this, [invited.address])
      )

      expect(await managerControlContract.hasInvitedRole(invited.address)).to.equal(true)
    })
  })
})
