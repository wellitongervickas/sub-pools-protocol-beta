import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  describe('Create', () => {
    it('should setup node on create', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [manager] = accounts

      const tx = await routerContract.create()
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const [nodeManager] = await routerContract.node(nodeAddress)

      expect(nodeManager).to.equal(manager.address)
    })

    it('should setup node manager on create', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [manager] = accounts

      const tx1 = await routerContract.create()
      const receipt1 = await tx1.wait()
      const [nodeAddress] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const nodeManager = await nodeContract.manager()

      expect(nodeManager).to.equal(manager.address)
    })

    it('should set node parent on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx1 = await routerContract.create()
      const receipt1 = await tx1.wait()
      const [nodeAddress] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })
  })
})
