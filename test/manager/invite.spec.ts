import { expect } from 'chai'
import { managerControl, loadFixture } from '../fixtures'
import { ZERO_ADDRESS } from '../helpers/address'

const { MANAGER_ROLE, INVITED_ROLE } = managerControl

describe('ManagerControl', () => {
  describe('Invite', () => {
    it('should invite children manager', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, invited] = accounts

      await managerControlContract.invite(invited.address)

      // const [manager] = accounts

      // const tx = await routerContract.create()
      // const receipt = await tx.wait()
      // const [childrenAddress] = getReceiptArgs(receipt)

      // const [childrenManager] = await routerContract.children(childrenAddress)

      // expect(childrenManager).to.equal(manager.address)
      expect(await managerControlContract.hasInvitedRole(invited.address)).to.equal(true)
    })

    it('should revert if not manager try to invite children manager', async function () {
      const { managerControlContract, accounts } = await loadFixture(managerControl.deployManagerControlFixture)
      const [, notManager] = accounts

      const notManagerContractInstance = managerControlContract.connect(notManager) as any

      await expect(notManagerContractInstance.invite(ZERO_ADDRESS)).to.be.revertedWith(
        `AccessControl: account ${notManager.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })
  })
})
