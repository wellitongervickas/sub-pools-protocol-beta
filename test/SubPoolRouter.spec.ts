import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

describe('SubPoolRouter', () => {
  async function deployRouterFixture() {
    const accounts = await ethers.getSigners()
    const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
    const subPoolRouter = await SubPoolRouter.deploy()

    return { accounts, subPoolRouter }
  }

  describe('MainSubPool', () => {
    describe('Create Main Pool', () => {
      it('should update next ID', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, other] = accounts
        subPoolRouter.connect(other)

        await subPoolRouter.createMain(100)

        expect(await subPoolRouter.nextMainPoolID()).to.equal(1)
      })
    })
    describe('Events', () => {
      it('should emit MainSubPoolCreated on create a main pool', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        //   const accounts = await ethers.getSigners()
        //   const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
        //   const subPoolRouter = await SubPoolRouter.deploy()

        //   const tx = await subPoolRouter.createMain(amount)
        //   let receipt = await tx.wait()

        //   const contractInterface = subPoolRouter.interface
        //   const result = contractInterface.decodeEventLog('MainSubPoolCreated', receipt.logs[2].data, receipt.logs[2].topics)

        //   console.log(...receipt.logs[2].data)
        //   console.log(receipt.logs[2].args[0])

        const [, other] = accounts
        subPoolRouter.connect(other)

        const amount = 1000

        await expect(subPoolRouter.createMain(amount))
          .to.emit(subPoolRouter, 'MainSubPoolCreated')
          .withArgs(anyValue, 1, amount)
      })
    })
  })
})
