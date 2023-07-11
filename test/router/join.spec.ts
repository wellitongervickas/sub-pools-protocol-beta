import { expect } from 'chai'
import { router, loadFixture, ethers } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  it('should create children on join', async function () {
    const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
    const [manager] = accounts

    const tx = await routerContract.create()
    const receipt = await tx.wait()
    const [childrenAddress] = getReceiptArgs(receipt)

    const tx1 = await routerContract.join(childrenAddress)
    const receipt1 = await tx1.wait()
    const [children2Address] = getReceiptArgs(receipt1)

    const childrenContract = await ethers.getContractAt('Children', childrenAddress)
    const [childrenManager] = await childrenContract.children(children2Address)

    expect(childrenManager).to.equal(manager.address)
  })

  it('should set children manager on join', async function () {
    const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)
    const [manager] = accounts

    const tx = await routerContract.create()
    const receipt = await tx.wait()
    const [childrenAddress] = getReceiptArgs(receipt)

    const tx1 = await routerContract.join(childrenAddress)
    const receipt1 = await tx1.wait()
    const [children2Address] = getReceiptArgs(receipt1)

    const children2Contract = await ethers.getContractAt('Children', children2Address)
    const childrenManager = await children2Contract.manager()

    expect(childrenManager).to.equal(manager.address)
  })

  it('should set children parent on join', async function () {
    const { routerContract } = await loadFixture(router.deployRouterFixture)

    const tx = await routerContract.create()
    const receipt = await tx.wait()
    const [childrenAddress] = getReceiptArgs(receipt)

    const tx1 = await routerContract.join(childrenAddress)
    const receipt1 = await tx1.wait()
    const [children2Address] = getReceiptArgs(receipt1)

    const children2Contract = await ethers.getContractAt('Children', children2Address)
    const parentAddress = await children2Contract.parent()

    expect(parentAddress).to.equal(childrenAddress)
  })
})
