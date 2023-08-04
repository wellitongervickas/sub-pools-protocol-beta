import { expect } from 'chai'
import { anyValue, ethers, loadFixture, strategyProxyFactory } from '../../fixtures'
import { FAKE_STRATEGY } from '../../helpers/address'

describe('StrategyProxyFactory', () => {
  describe('Build', () => {
    it('should emit StrategyProxyFactory_StrategyProxyCreated when build', async function () {
      const { strategyProxyFactoryContract } = await loadFixture(strategyProxyFactory.deployStrategyProxyFactoryFixture)

      await expect(strategyProxyFactoryContract.build(FAKE_STRATEGY))
        .to.emit(strategyProxyFactoryContract, 'StrategyProxyFactory_StrategyProxyCreated')
        .withArgs(anyValue, FAKE_STRATEGY)
    })
  })

  it('should set the strategy proxy owner as the sender', async function () {
    const { strategyProxyFactoryContract, accounts } = await loadFixture(
      strategyProxyFactory.deployStrategyProxyFactoryFixture
    )

    const [manager] = accounts

    const tx = await strategyProxyFactoryContract.build(FAKE_STRATEGY)
    const receipt = await tx.wait()

    const nodeContract = await ethers.getContractAt('StrategyProxy', receipt.logs[2].args[0])

    expect(await nodeContract.owner()).to.equal(manager.address)
  })
})
