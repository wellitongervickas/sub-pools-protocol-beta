import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  describe('Create', () => {
    it('should emit NodeCreated on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      await expect(routerContract.create()).to.emit(routerContract, 'NodeCreated').withArgs(anyValue)
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
