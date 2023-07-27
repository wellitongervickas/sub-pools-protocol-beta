import { expect } from 'chai'
import { managerControl, loadFixture, node } from '../fixtures'
import { ZERO_ADDRESS } from '../helpers/address'

const { MANAGER_ROLE } = managerControl

describe('Node', () => {
  describe('Invite', () => {
    it('should invite node manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts

      await nodeContract.invite(invited.address)
      expect(await nodeContract.hasInvitedRole(invited.address)).to.equal(true)
    })

    it('should emit NodeManagerInvited on invite', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts

      await expect(nodeContract.invite(invited.address))
        .to.emit(nodeContract, 'NodeManagerInvited')
        .withArgs(invited.address)
    })

    it('should update invited only to false', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)

      expect(await nodeContract.invitedOnly()).to.equal(false)
    })

    it('should revert if not manager try to set invited only', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, notManager] = accounts

      const notManagerContractInstance = nodeContract.connect(notManager) as any

      await expect(notManagerContractInstance.setInvitedOnly(false)).to.be.revertedWithCustomError(
        nodeContract,
        `InvalidManager()`
      )
    })

    it('should revert if not manager try to invite node manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, notManager] = accounts

      const notManagerContractInstance = nodeContract.connect(notManager) as any

      await expect(notManagerContractInstance.invite(ZERO_ADDRESS)).to.be.revertedWithCustomError(
        nodeContract,
        `InvalidManager()`
      )
    })

    it('should revert if manager try to invite itself', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts

      await expect(nodeContract.invite(manager.address)).to.be.revertedWithCustomError(
        nodeContract,
        'ManagerNotAllowed()'
      )
    })

    it('should revert if try to invite already invited manager', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [, invited] = accounts

      await nodeContract.invite(invited.address)
      await expect(nodeContract.invite(invited.address)).to.be.revertedWithCustomError(nodeContract, 'AlreadyInvited()')
    })

    it('should revert if try to invite already node manager', async function () {
      const { nodeContract: nodeContract2, accounts } = await loadFixture(node.deployNodeFixture.bind(this, [], true))
      const [, invited] = accounts

      const { nodeContract } = await loadFixture(node.deployNodeFixture.bind(this, [invited.address], true))

      const node2Address = await nodeContract2.getAddress()
      await nodeContract.join(node2Address, invited.address)

      await expect(nodeContract.invite(invited.address)).to.be.revertedWithCustomError(nodeContract, 'AlreadyNode()')
    })
  })
})
