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

    /// it will skip few validations to the first joined account
    it('should setup deployer as first account', async function () {
      const { fakeStrategyAddress } = await loadFixture(fakeStrategySingle.deployFakeStrategySingleFixture)
      const { registryContract, accounts } = await loadFixture(
        registry.deployRegistryFixture.bind(this, fakeStrategyAddress)
      )
      const [deployer] = accounts

      const [id] = await registryContract.accounts(deployer)

      expect(id).to.equal(1)
    })
  })
})
