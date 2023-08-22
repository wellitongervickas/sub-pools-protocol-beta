import { Registry } from './../../typechain-types/contracts/Registry'
import { expect } from 'chai'
import { loadFixture, registry, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Registry', () => {
  describe('Create', () => {
    it('should emit Registry_AdapterCreated on create', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture)

      const supplyEncodedSelector = coderUtils.getFunctionSignature('supply(uint256,uint256)')

      const withdrawEncodedSelector = coderUtils.getFunctionSignature('withdraw(uint256,uint256)')

      const harvestEncodedSelector = coderUtils.getFunctionSignature('harvest(uint256)')

      const assetsBalanceEncodedSelector = coderUtils.getFunctionSignature('tokenBalance()')

      const rewardsBalanceEncodedSelector = coderUtils.getFunctionSignature('rewardsBalance()')

      const adapter: Registry.AdapterStruct = {
        target: ethers.ZeroAddress,
        assetsIn: [ethers.ZeroAddress],
        assetsOut: [ethers.ZeroAddress],
        supplySelector: supplyEncodedSelector,
        withdrawSelector: withdrawEncodedSelector,
        harvestSelector: harvestEncodedSelector,
        assetsBalanceSelector: assetsBalanceEncodedSelector,
        rewardsBalanceSelector: rewardsBalanceEncodedSelector,
      }

      await expect(registryContract.createAdapter(adapter)).to.emit(registryContract, 'Registry_AdapterCreated')
    })
  })
})
