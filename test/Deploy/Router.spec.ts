import { expect } from 'chai'
import { deployRouterFixture, loadFixture } from '../fixtures'

describe('SubPoolRouter', () => {
  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      expect(await subPoolRouter.currentID()).to.equal(0)
    })
  })
})
