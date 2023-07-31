import { expect } from 'chai'
import { loadFixture, node } from '../../fixtures'

describe('Node', () => {
  describe('InvitedOnly', () => {
    it('should set invited only', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)

      await nodeContract.setInvitedOnly(false)

      expect(await nodeContract.invitedOnly()).to.equal(false)
    })

    it('should emit NodeManager_InvitedOnly event', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)

      await expect(nodeContract.setInvitedOnly(false)).to.emit(nodeContract, 'NodeManager_InvitedOnly').withArgs(false)
    })

    it('should revert if try to set invited only without being the manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, notManager] = accounts
      const notManagerNodeContract = nodeContract.connect(notManager) as any

      await expect(notManagerNodeContract.setInvitedOnly(false)).to.be.revertedWithCustomError(
        nodeContract,
        'Manager_Invalid()'
      )
    })
  })
})
