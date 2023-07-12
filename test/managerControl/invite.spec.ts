import { expect } from 'chai'
import { managerControl, loadFixture } from '../fixtures'
import { ZERO_ADDRESS } from '../helpers/address'

const { MANAGER_ROLE } = managerControl

describe('ManagerControl', () => {
  describe('Invite', () => {
    it('should invite children manager', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, invited] = accounts

      await managerControlContract.invite(invited.address)
      expect(await managerControlContract.hasInvitedRole(invited.address)).to.equal(true)
    })

    it('should update invited only to false', async function () {
      const { managerControlContract } = await loadFixture(managerControl.deployManagerControlFixture)

      await managerControlContract.setInvitedOnly(false)

      expect(await managerControlContract.invitedOnly()).to.equal(false)
    })

    it('should revert if not manager try to set invited only', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, notManager] = accounts

      const notManagerContractInstance = managerControlContract.connect(notManager) as any

      await expect(notManagerContractInstance.setInvitedOnly(false)).to.be.revertedWith(
        `AccessControl: account ${notManager.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })

    it('should revert if not manager try to invite children manager', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, notManager] = accounts

      const notManagerContractInstance = managerControlContract.connect(notManager) as any

      await expect(notManagerContractInstance.invite(ZERO_ADDRESS)).to.be.revertedWith(
        `AccessControl: account ${notManager.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })

    it('should revert if manager try to invite itself', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [manager] = accounts

      await expect(managerControlContract.invite(manager.address)).to.be.revertedWithCustomError(
        managerControlContract,
        'NotAllowed()'
      )
    })

    it('should revert if try to invite already invited manager', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, invited] = accounts

      await managerControlContract.invite(invited.address)
      await expect(managerControlContract.invite(invited.address)).to.be.revertedWithCustomError(
        managerControlContract,
        'AlreadyInvited()'
      )
    })

    it('should emit NodeManagerInvited on invite', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, invited] = accounts

      await expect(managerControlContract.invite(invited.address))
        .to.emit(managerControlContract, 'NodeManagerInvited')
        .withArgs(invited.address)
    })
  })
})
