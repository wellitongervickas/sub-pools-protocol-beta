import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  it('should create children on create', async function () {
    const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
    const [manager] = accounts

    const tx = await routerContract.create()
    const receipt = await tx.wait()
    const [childrenAddress] = getReceiptArgs(receipt)

    const [childrenManager] = await routerContract.children(childrenAddress)

    expect(childrenManager).to.equal(manager.address)
  })

  it('should set children manager on create', async function () {
    const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
    const [manager] = accounts

    const tx1 = await routerContract.create()
    const receipt1 = await tx1.wait()
    const [childrenAddress] = getReceiptArgs(receipt1)

    const childrenContract = await ethers.getContractAt('Children', childrenAddress)
    const childrenManager = await childrenContract.manager()

    expect(childrenManager).to.equal(manager.address)
  })

  it('should set children parent on create', async function () {
    const { routerContract } = await loadFixture(router.deployRouterFixture)

    const tx1 = await routerContract.create()
    const receipt1 = await tx1.wait()
    const [childrenAddress] = getReceiptArgs(receipt1)

    const childrenContract = await ethers.getContractAt('Children', childrenAddress)
    const routerAddress = await routerContract.getAddress()
    const parentAddress = await childrenContract.parent()

    expect(parentAddress).to.equal(routerAddress)
  })
})
