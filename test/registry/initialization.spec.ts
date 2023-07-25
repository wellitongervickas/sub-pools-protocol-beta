import { expect } from 'chai'
import { loadFixture, registry, fakeStrategySingle } from '../fixtures'

describe('Registry', () => {
  describe('Deploy', () => {
    it('should set strategy on deploy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract } = await loadFixture(registry.deployRegistryFixture.bind(this, fakeStrategyAddress))
      const strategyAddress = await registryContract.strategy()

      expect(strategyAddress).to.equal(fakeStrategyAddress)
    })

    it('should set protocol on deploy', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, protocolAddress } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const protocol = await registryContract.protocol()

      expect(protocol).to.equal(protocolAddress)
    })
  })
})
