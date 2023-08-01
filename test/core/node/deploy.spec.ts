import { expect } from 'chai'
import { ethers, loadFixture, node } from '../../fixtures'
import { FAKE_PARENT, FAKE_REGISTRY } from '../../helpers/address'

describe('Node', () => {
  describe('Deploy', () => {
    // it('should set parent on deploy', async function () {
    //   const { nodeContract } = await loadFixture(node.deployNodeFixture)
    //   const parentAddress = await nodeContract.parent()

    //   expect(parentAddress).to.equal(FAKE_PARENT)
    // })

    // it('should set registry on deploy', async function () {
    //   const { nodeContract } = await loadFixture(node.deployNodeFixture)
    //   const registryAddress = await nodeContract.registry()

    //   expect(registryAddress).to.equal(FAKE_REGISTRY)
    // })

    it('should set manager on deploy', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts
      const managerAddress = await nodeContract.managerAddress()

      expect(managerAddress).to.equal(manager.address)
    })

    it('should set invited only on deploy', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)
      const invitedOnly = await nodeContract.invitedOnly()

      expect(invitedOnly).to.equal(true)
    })

    it('should set manager role on deploy', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts
      const isManager = await nodeContract.hasManagerRole(manager.address)

      expect(isManager).to.equal(true)
    })

    it('should set initial invited addressses on deploy', async function () {
      const [, invited] = await ethers.getSigners()
      const { nodeContract } = await loadFixture(node.deployNodeFixture.bind(this, [invited.address]))

      expect(await nodeContract.hasInvitedRole(invited.address)).to.equal(true)
    })
  })
})
