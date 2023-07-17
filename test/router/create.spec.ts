import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'
import { ZERO_ADDRESS } from '../helpers/address'
import coderUtils from '../helpers/coder'

describe('Router', () => {
  describe('Create', () => {
    it('should set node parent as itself on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const amount = coderUtils.build([100], ['uint256'])
      const tx1 = await routerContract.registryAndCreate(ZERO_ADDRESS, [], amount)
      const receipt1 = await tx1.wait()
      const [nodeAddress] = getReceiptArgs(receipt1)

      const nodeContract = await ethers.getContractAt('Node', nodeAddress)
      const routerAddress = await routerContract.getAddress()
      const parentAddress = await nodeContract.parent()

      expect(parentAddress).to.equal(routerAddress)
    })

    it('should emit NodeCreated on create', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)
      const amount = coderUtils.build([100], ['uint256'])
      await expect(routerContract.registryAndCreate(ZERO_ADDRESS, [], amount))
        .to.emit(routerContract, 'NodeCreated')
        .withArgs(anyValue)
    })
  })
})
