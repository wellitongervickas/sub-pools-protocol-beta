import { expect } from 'chai'
import { ethers, loadFixture, node } from '../fixtures'
import { FAKE_PARENT, FAKE_REGISTRY, ZERO_ADDRESS, createRandomAddress } from '../helpers/address'

describe('Node', () => {
  describe('Deploy', () => {
    it('should set parent on deploy', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(FAKE_PARENT)
    })

    it('should set registry on deploy', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)
      const registryAddress = await nodeContract.registry()

      expect(registryAddress).to.equal(FAKE_REGISTRY)
    })

    it('should set manager on deploy', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts
      const nodeManager = await nodeContract.manager()

      expect(nodeManager).to.equal(manager.address)
    })
  })

  describe('Invite', () => {
    it('should initialize as invited only', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture.bind(this, [], true))
      expect(await nodeContract.invitedOnly()).to.equal(true)
    })

    it('should initialize with invited addresses', async function () {
      const [, invited] = await ethers.getSigners()
      const { nodeContract } = await loadFixture(node.deployNodeFixture.bind(this, [invited.address]))

      expect(await nodeContract.hasInvitedRole(invited.address)).to.equal(true)
    })
  })
})
