import { SubPoolRouter } from './../typechain-types/contracts/SubPoolRouter'
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

  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      expect(await subPoolRouter.nextSubPoolID()).to.equal(0)
    })
  })

  describe('Main', () => {
    it('should update next ID', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      await subPoolRouter.createMain(100, [])

      expect(await subPoolRouter.nextSubPoolID()).to.equal(1)
    })

    it('should set the main subpool initial balance', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)

      const amount = 1000
      const tx = await subPoolRouter.createMain(amount, [])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[2].args
      const [id, initialBalance, balance] = await subPoolRouter.subPools(subPoolAddress)

      expect([id.toString(), initialBalance.toString(), balance.toString()]).to.deep.equal(['1', `${amount}`, '0'])
    })

    it('should set the parent of main node as router itself', async function () {
      const { subPoolRouter } = await loadFixture(deployRouterFixture)
      const amount = 1000

      const tx = await subPoolRouter.createMain(amount, [])
      const receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[2].args

      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)
      const parent = await subPoolNode.parentSubPool()

      expect(await subPoolRouter.getAddress()).to.equal(parent)
    })
  })

  describe('Node', () => {
    it('should join a parent subpool as node', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = 1000
      const [, other] = accounts

      const tx = await subPoolRouter.createMain(amount, [other.address])
      let receipt = await tx.wait()

      const [subPoolAddress] = receipt.logs[3].args

      const newInstance = subPoolRouter.connect(other) as SubPoolRouter

      await expect(newInstance.createNode(subPoolAddress, amount, [])).to.not.be.reverted
    })

    it('should set parent subpool when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = 1000
      const [, other] = accounts

      // Create parent
      const tx = await subPoolRouter.createMain(amount, [other.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      // ₢reate node
      const newInstance = subPoolRouter.connect(other) as any
      const tx2 = await newInstance.createNode(subPoolAddress, amount, [])
      let receipt2 = await tx2.wait()
      const [subPoolAddress2] = receipt2.logs[6].args

      const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress2)
      const parentAddress = await subPoolNode.parentSubPool()

      expect(subPoolAddress).to.equal(parentAddress)
    })

    it('should update parent balance when joined', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const amount = 1000
      const [, other] = accounts

      const tx = await subPoolRouter.createMain(amount, [other.address])
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const newInstance = subPoolRouter.connect(other) as SubPoolRouter
      await newInstance.createNode(subPoolAddress, amount, [])

      const [, , balance] = await subPoolRouter.subPools(subPoolAddress)

      expect(balance).to.equal(ethers.toBigInt(amount))
    })
  })

  describe('Validations', () => {
    describe('Node', () => {
      it('should revert when node manager is not invited', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = 1000
        const [, hacker] = accounts

        const tx = await subPoolRouter.createMain(amount, [])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args
        const newInstance = subPoolRouter.connect(hacker) as SubPoolRouter

        await expect(newInstance.createNode(subPoolAddress, amount, [])).to.be.rejectedWith('NotInvited()')
      })

      it('should revert when try to call deposit if sender is not node', async function () {
        const { subPoolRouter } = await loadFixture(deployRouterFixture)
        const amount = 1000

        const tx = await subPoolRouter.createMain(amount, [])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[2].args

        await expect(subPoolRouter.deposit(subPoolAddress, amount)).to.be.rejectedWith('NodeNotAllowed()')
      })
    })
  })

  describe('Events', () => {
    describe('Main', () => {
      it('should emit SubPoolMainCreated on create a main node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)

        const [, other] = accounts
        subPoolRouter.connect(other)

        const amount = 1000

        await expect(subPoolRouter.createMain(amount, []))
          .to.emit(subPoolRouter, 'SubPoolMainCreated')
          .withArgs(anyValue, 1, amount)
      })
    })

    describe('Node', () => {
      it('should emit SubPoolNodeCreated on create a node', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = 1000
        const [, other] = accounts

        const tx = await subPoolRouter.createMain(amount, [other.address])
        let receipt = await tx.wait()

        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(other) as SubPoolRouter

        await expect(newInstance.createNode(subPoolAddress, amount, []))
          .to.emit(subPoolRouter, 'SubPoolNodeCreated')
          .withArgs(anyValue, 1, amount)
      })

      it('should emit SubPoolDeposited when node deposit', async function () {
        const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
        const amount = 1000
        const [, other] = accounts

        const tx = await subPoolRouter.createMain(amount, [other.address])
        let receipt = await tx.wait()
        const [subPoolAddress] = receipt.logs[3].args

        const newInstance = subPoolRouter.connect(other) as SubPoolRouter

        await expect(newInstance.createNode(subPoolAddress, amount, []))
          .to.emit(subPoolRouter, 'SubPoolDeposited')
          .withArgs(anyValue, amount)
      })
    })
  })
})