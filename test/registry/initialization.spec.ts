import { expect } from 'chai'
import { loadFixture, registry } from '../fixtures'
import { RegistryType } from '../fixtures/types'
import { createRandomAddress } from '../helpers/address'
import { buildBytesSingleToken } from '../helpers/tokens'

describe('Registry', () => {
  describe('Deploy', () => {
    it('should set registry type on deploy', async function () {
      const { registryContract } = await loadFixture(
        registry.deployRegistryFixture.bind(this, RegistryType.SingleTokenRegistry)
      )

      const registryType = await registryContract.registryType()
      expect(registryType).to.equal(RegistryType.SingleTokenRegistry)
    })

    it('should set token data on deploy', async function () {
      const customAddress = createRandomAddress()
      const tokenData = buildBytesSingleToken(customAddress)

      const { registryContract } = await loadFixture(
        registry.deployRegistryFixture.bind(this, RegistryType.SingleTokenRegistry, tokenData)
      )

      const registryTokenData = await registryContract.tokenData()

      expect(registryTokenData).to.equal(tokenData)
    })
  })
})
