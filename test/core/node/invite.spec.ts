import { expect } from 'chai'
import { loadFixture, node } from '../../fixtures'

describe('Node', () => {
  describe('Invite', () => {
    it('should set invited role when invite node manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts
      await nodeContract.invite(invited.address)

      expect(await nodeContract.hasInvitedRole(invited)).to.be.true
    })

    it('should emit NodeManager_Invited on invite node manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts

      await expect(nodeContract.invite(invited.address))
        .to.emit(nodeContract, 'NodeManager_Invited')
        .withArgs(invited.address)
    })

    it('should revert if try to invite without being manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, notManager] = accounts
      const notManagerNodeContract = nodeContract.connect(notManager) as any

      await expect(notManagerNodeContract.invite(notManager.address)).to.be.revertedWithCustomError(
        nodeContract,
        'Manager_Invalid()'
      )
    })

    it('should revert if try to invite an already invited address', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts

      await nodeContract.invite(invited.address)

      await expect(nodeContract.invite(invited.address)).to.be.revertedWithCustomError(
        nodeContract,
        'NodeManager_AlreadyInvited()'
      )
    })

    it('should revert if try to invite the manager itself', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts

      await expect(nodeContract.invite(manager.address)).to.be.revertedWithCustomError(
        nodeContract,
        'NodeManager_ManagerNotAllowed()'
      )
    })

    it('should revert if try to invite already node', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], false))
      const [, nodeTest] = accounts

      await nodeContract.join(nodeTest.address, nodeTest.address)

      await expect(nodeContract.invite(nodeTest.address)).to.be.revertedWithCustomError(
        nodeContract,
        'Node_AlreadyJoined()'
      )
    })
  })
})
