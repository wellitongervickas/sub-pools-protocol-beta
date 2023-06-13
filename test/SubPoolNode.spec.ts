import { SubPoolRouter } from './../typechain-types/contracts/SubPoolRouter'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

describe('SubPoolNode', () => {
  async function deployRouterFixture(owner: string, amount: number, invites: string[]) {
    const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
    const subPoolNode = await SubPoolNode.deploy(owner, amount, invites)

    return { subPoolNode }
  }

  describe('Deploy', () => {
    it('should set the right initial node subpool ID', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, other.address, 100, []))

      expect(await subPoolNode.nextSubPoolID()).to.equal(0)
    })

    it('should set the right manager', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, other.address, 100, []))

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(other.address)
    })

    it('should set the right manager initial balance', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, other.address, amount, []))

      const [, managerInitialBalance] = await subPoolNode.manager()
      expect(managerInitialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set the right manager  balance', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, other.address, amount, []))

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })
  })
})
