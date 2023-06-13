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
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, manager.address, 100, []))

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

    it('should set the right role to manager address', async function () {
      const amount = 100
      const role = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, manager.address, amount, []))

      expect(await subPoolNode.hasRole(role, manager.address)).to.be.true
    })

    it('should set the right role to invited addresses', async function () {
      const amount = 100
      const role = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployRouterFixture.bind(null, manager.address, amount, [other.address])
      )

      expect(await subPoolNode.hasRole(role, other.address)).to.be.true
    })
  })

  describe('Validations', () => {
    it('should revert if manager try to invite himself', async function () {
      const amount = 100
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployRouterFixture.bind(null, manager.address, amount, []))

      await subPoolNode.invite(other.address)

      await expect(subPoolNode.invite(other.address)).to.be.rejectedWith('NotAllowed()')
    })

    it('should revert if try to invite an already node manager address', async function () {})
  })

  describe('Events', () => {})
})
