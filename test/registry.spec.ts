import { expect } from 'chai'
import { ethers, loadFixture, registry } from './fixtures'
import logUtils from './utils/logs'
import coderUtils from './utils/coder'

describe('Registry', () => {
  describe('Adapter', () => {
    it('should create adapter', async () => {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture)

      const adapterSetup = {
        targetIn: ethers.ZeroAddress,
        tokensIn: [ethers.ZeroAddress],
        tokensOut: [ethers.ZeroAddress],
        depositFunction: coderUtils.getFunctionSignature('deposit(uint256[])'),
        withdrawFunction: coderUtils.getFunctionSignature('withdraw(uint256[])'),
      }

      const tx = await registryContract.createAdapter(adapterSetup)
      const receipt = await tx.wait()

      const [adapterId] = logUtils.getLogArgs(receipt.logs)
      const adapter = await registryContract.getAdapter(adapterId)

      expect({
        targetIn: adapter.targetIn,
        tokensIn: adapter.tokensIn,
        tokensOut: adapter.tokensOut,
        depositFunction: adapter.depositFunction,
        withdrawFunction: adapter.withdrawFunction,
      }).to.deep.equal(adapterSetup)
    })
  })
})
