import { expect } from 'chai'
import { ethers, loadFixture, registry } from './fixtures'
import logUtils from './utils/logs'

describe('Registry: Adapter', () => {
  it('should create adapter', async () => {
    const { registryContract } = await loadFixture(registry.deployRegistryFixture)

    const adapterSetup = {
      targetIn: ethers.ZeroAddress,
    }

    const tx = await registryContract.createAdapter(adapterSetup)
    const receipt = await tx.wait()
    const [adapterId] = logUtils.getLogArgs(receipt.logs)

    const adapter = await registryContract.getAdapter(adapterId)
    expect(adapter.targetIn).to.equal(adapterSetup.targetIn)
  })
})
