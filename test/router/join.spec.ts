import { expect } from 'chai'
import { router, loadFixture, ethers, anyValue } from '../fixtures'
import { getReceiptArgs } from '../helpers/receiptArgs'

describe('Router', () => {
  describe('Join', () => {
    it('should emit NodeCreated on join', async function () {
      const { routerContract } = await loadFixture(router.deployRouterFixture)

      const tx = await routerContract.create()
      const receipt = await tx.wait()
      const [nodeAddress] = getReceiptArgs(receipt)

      await expect(routerContract.join(nodeAddress)).to.emit(routerContract, 'NodeCreated').withArgs(anyValue)
    })
  })
})
