import { expect } from 'chai'
import { ethers, loadFixture, node } from '../fixtures'
import { ZERO_ADDRESS } from '../helpers/address'

describe('Node', () => {
  describe('Deploy', () => {
    it('should setup node manager on create', async function () {
      const { nodeContract, accounts } = await loadFixture(node.deployNodeFixture)
      const [manager] = accounts
      const nodeManager = await nodeContract.manager()

      expect(nodeManager).to.equal(manager.address)
    })

    it('should setup node parent on deploy', async function () {
      const accounts = await ethers.getSigners()
      const Node = await ethers.getContractFactory('Node')
      const nodeContract = await Node.deploy(ZERO_ADDRESS, accounts[0].address, [])

      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(ZERO_ADDRESS)
    })
  })

  describe('Invite', () => {
    it('should initialize as invited only', async function () {
      const { nodeContract } = await loadFixture(node.deployNodeFixture)
      expect(await nodeContract.invitedOnly()).to.equal(true)
    })

    it('should initialize with invited addresses', async function () {
      const [, invited] = await ethers.getSigners()

      const { nodeContract } = await loadFixture(node.deployNodeFixture.bind(this, [invited.address]))

      expect(await nodeContract.hasInvitedRole(invited.address)).to.equal(true)
    })
  })
})
