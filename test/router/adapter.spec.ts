import { expect } from 'chai'
import { ethers, loadFixture, router } from '../fixtures'

describe('Router: Adapter', () => {
  describe('Create', () => {
    it('should create adapter', async function () {
      const { routerContract, accounts } = await loadFixture(router.deployRouterFixture)

      const adapterSettings = {
        builder: accounts[0].address,
        targetIn: ethers.ZeroAddress,
      }

      const tx = await routerContract.createAdapter(adapterSettings)
      const receipt = await tx.wait()
      const [adapterId] = receipt.logs[0].args

      const [builder, targetIn] = await routerContract.adapters(adapterId)

      expect({ builder, targetIn }).to.deep.equal(adapterSettings)
    })
  })
})
