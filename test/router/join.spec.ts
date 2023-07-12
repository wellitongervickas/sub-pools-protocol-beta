import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  describe('Join', () => {
    it('should create node on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [manager] = accounts

      const tx = await routerContract.create()
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const tx1 = await routerContract.join(nodeAddress)
      const receipt1 = await tx1.wait()
      const [node2Address] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const [nodeManager] = await nodeContract.node(node2Address)

      expect(nodeManager).to.equal(manager.address)
    })

    it('should set node manager on join', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
      const [manager] = accounts

      const tx = await routerContract.create()
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const tx1 = await routerContract.join(nodeAddress)
      const receipt1 = await tx1.wait()
      const [node2Address] = getReceiptArgs(receipt1)

      const node2Contract = await ethers.getContractAt('Node', node2Address)
      const nodeManager = await node2Contract.manager()

      expect(nodeManager).to.equal(manager.address)
    })

    it('should set node parent on join', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.create()
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      const tx1 = await routerContract.join(nodeAddress)
      const receipt1 = await tx1.wait()
      const [node2Address] = getReceiptArgs(receipt1)

      const node2Contract = await ethers.getContractAt('Node', node2Address)
      const parentAddress = await node2Contract.parent()

      expect(parentAddress).to.equal(nodeAddress)
    })
  })
})
