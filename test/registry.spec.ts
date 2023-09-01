import { expect } from 'chai'
import { ethers, loadFixture, registry } from './fixtures'
import logUtils from './utils/logs'
import coderUtils from './utils/coder'

describe('Registry: Adapter', () => {
  it('should create adapter', async () => {
    const { registryContract } = await loadFixture(registry.deployRegistryFixture)

    const adapterSetup = {
      targetIn: ethers.ZeroAddress,
      tokensIn: [ethers.ZeroAddress],
      depositFunction: coderUtils.getFunctionSignature('deposit(uint256[])'),
    }

    const tx = await registryContract.createAdapter(adapterSetup)
    const receipt = await tx.wait()

    const [adapterId] = logUtils.getLogArgs(receipt.logs)
    const adapter = await registryContract.getAdapter(adapterId)

    expect({
      targetIn: adapter.targetIn,
      tokensIn: adapter.tokensIn,
      depositFunction: adapter.depositFunction,
    }).to.deep.equal(adapterSetup)
  })
})
