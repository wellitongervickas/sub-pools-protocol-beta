import { Registry } from './../../typechain-types/contracts/Registry'
import { expect } from 'chai'
import { loadFixture, registry, ethers } from '../fixtures'
import coderUtils from '../helpers/coder'

describe('Registry', () => {
  describe('Create', () => {
    it('should emit Registry_AdapterCreated on create', async function () {
      const { registryContract } = await loadFixture(registry.deployRegistryFixture)

      const supplyEncodedSelector = coderUtils.id('supply(uint256,uint256)')

      const withdrawEncodedSelector = coderUtils.id('withdraw(uint256,uint256)')

      const harvestEncodedSelector = coderUtils.id('harvest(uint256)')

      const assetsBalanceEncodedSelector = coderUtils.id('tokenBalance(')

      const rewardsBalanceEncodedSelector = coderUtils.id('rewardsBalance(')

      const adapter: Registry.AdapterStruct = {
        target: ethers.Wallet.createRandom(),
        assetsIn: [ethers.Wallet.createRandom()],
        assetsOut: [ethers.Wallet.createRandom()],
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
