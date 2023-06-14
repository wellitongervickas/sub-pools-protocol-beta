import { SubPoolNode } from './../typechain-types/contracts/SubPoolNode'
import { FakeParent } from './../typechain-types/contracts/utils/FakeParent'

import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { SubPoolRouter } from '../typechain-types/contracts/SubPoolRouter'

const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
const INVITED_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
const NODE_ROLE = ethers.keccak256(ethers.toUtf8Bytes('NODE_ROLE'))

describe('SubPoolNode', () => {
  async function deployRouterFixture() {
    const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
    const subPoolRouter = await SubPoolRouter.deploy()

    return { subPoolRouter }
  }

  async function deployNodeFixture(owner: string, amount: number, invites: string[]) {
    const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
    const subPoolNode = await SubPoolNode.deploy(owner, amount, invites)

    return { subPoolNode }
  }

  async function deployRoutedNodeFixture() {
    const [, other] = await ethers.getSigners()
    const { subPoolRouter } = await loadFixture(deployRouterFixture)

    const tx = await subPoolRouter.createMain(0, [other.address])
    let receipt = await tx.wait()

    const [subPoolAddress] = receipt.logs[3].args
    const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)

    return { subPoolRouter, subPoolNode }
  }

  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

      expect(await subPoolNode.nextSubPoolID()).to.equal(0)
    })

    it('should set manager', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(other.address)
    })

    it('should set manager initial balance', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, other.address, amount, []))

      const [, initialBalance] = await subPoolNode.manager()
      expect(initialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })

    it('should set role to manager address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

      expect(await subPoolNode.hasRole(MANAGER_ROLE, manager.address)).to.be.true
    })

    it('should set role to invited addresses', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, [other.address]))

      expect(await subPoolNode.hasRole(INVITED_ROLE, other.address)).to.be.true
    })
  })

  describe('Join', () => {
    it('should update the ID when join as node', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(other) as SubPoolRouter
      await subPoolRouterInstance.createNode(subNodeAddress, 0, [])

      expect(await subPoolNode.nextSubPoolID()).to.equal(1)
    })

    it('should set initial balance when join as node', async function () {
      const amount = 100
      const [, other, otherNode] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      // Create parent
      const subNodeAddress = await subPoolNode.getAddress()
      const otherRouterInstance = subPoolRouter.connect(other) as any
      const tx0 = await otherRouterInstance.createNode(subNodeAddress, amount, [otherNode.address])
      const rcpt0 = await tx0.wait()
      const otherSubNodeAddress = rcpt0.logs[7].args[0]

      // ₢reate node
      const otherNodeRouterInstance = subPoolRouter.connect(otherNode) as any
      const tx1 = await otherNodeRouterInstance.createNode(otherSubNodeAddress, amount, [])
      const rcpt1 = await tx1.wait()
      const otherNodeAddress = rcpt1.logs[7].args[0]

      // get parent contract instance
      const otherSubPoolNode = await ethers.getContractAt('SubPoolNode', otherSubNodeAddress)
      const [, initialBalance] = await otherSubPoolNode.subPools(otherNodeAddress)
      expect(initialBalance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should update from invite to node role when join as node', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(other) as SubPoolRouter
      await subPoolRouterInstance.createNode(subNodeAddress, 0, [])

      expect(await subPoolNode.hasRole(NODE_ROLE, other.address)).to.be.true
    })

    it('should update parent balance when join as node', async function () {
      const amount = 100
      const [, other, otherNode] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const otherRouterInstance = subPoolRouter.connect(other) as any
      await otherRouterInstance.createNode(subNodeAddress, amount, [otherNode.address])

      const [, , balance] = await subPoolRouter.subPools(subNodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(amount))
    })
  })

  describe('Validations', () => {
    describe('Parent', () => {
      it('should revert if try to update parent twice', async function () {
        const [manager, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        await subPoolNode.setParentSubPool(anyEntity.address)
        await expect(subPoolNode.setParentSubPool(anyEntity.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ParentAlreadySet()'
        )
      })

      it('should revert on set parentSubPool if not manager role', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        const subPoolInstance = subPoolNode.connect(other) as SubPoolNode

        await expect(subPoolInstance.setParentSubPool(other.address)).to.be.rejectedWith(
          'Ownable: caller is not the owner'
        )
      })
    })

    describe('Invite', () => {
      it('should revert when manager try to invite himself', async function () {
        const [manager] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        await expect(subPoolNode.invite(manager.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ManagerNotAllowed()'
        )
      })

      it('should revert on invite an already invited node manager', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        await subPoolNode.invite(other.address)

        await expect(subPoolNode.invite(other.address)).to.be.revertedWithCustomError(subPoolNode, 'AlreadyInvited()')
      })

      it('should revert on invite an already node manager', async function () {
        const amount = 100
        const [, other, otherNode] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const otherRouterInstance = subPoolRouter.connect(other) as any
        await otherRouterInstance.createNode(subNodeAddress, amount, [otherNode.address])

        await expect(subPoolNode.invite(other.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'AlreadyNodeManager()'
        )
      })

      it('should revert on invite a node manager if not the manager role', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        const subPoolInstance = subPoolNode.connect(other) as SubPoolNode

        await expect(subPoolInstance.invite(other.address)).to.be.rejectedWith(
          `AccessControl: account ${other.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
        )
      })
    })
  })

  describe('Join', () => {
    it('should revert on join as node without a parent subpool', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const subPoolAddress = await subPoolNode2.getAddress()

      await expect(subPoolNode.join(subPoolAddress, 0)).to.be.revertedWithCustomError(subPoolNode, 'ParentNotFound()')
    })

    it('should revert on join as node without being invited', async function () {
      const [, , hacker] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(hacker) as SubPoolRouter

      await expect(subPoolRouterInstance.createNode(subNodeAddress, 0, [])).to.be.revertedWithCustomError(
        subPoolNode,
        'NotInvited()'
      )
    })

    it('should revert on call join without being the owner', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const subNodeAddress2 = await subPoolNode2.getAddress()
      const newSubPoolInstance = subPoolNode.connect(other) as SubPoolNode

      await expect(newSubPoolInstance.join(subNodeAddress2, 0)).to.be.rejectedWith('Ownable: caller is not the owner')
    })

    it('should revert when try to call deposit if sender is not node', async function () {
      const [, other, anyEntity] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      await expect(subPoolNode.deposit(anyEntity.address, 100)).to.be.revertedWithCustomError(
        subPoolNode,
        'NodeNotAllowed()'
      )
    })
  })

  describe('Events', () => {
    describe('Invite', () => {
      it('should emit NodeManagerInvited event when invite a new node manager', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

        await expect(subPoolNode.invite(other.address))
          .to.emit(subPoolNode, 'NodeManagerInvited')
          .withArgs(other.address)
      })
    })

    describe('Join', () => {
      it('should emit NodeManagerJoined event when node manager join', async function () {
        const [, other] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const subPoolRouterInstance = subPoolRouter.connect(other) as SubPoolRouter

        await expect(await subPoolRouterInstance.createNode(subNodeAddress, 0, []))
          .to.emit(subPoolNode, 'NodeManagerJoined')
          .withArgs(other.address, anyValue)
      })

      it('should emit SubPoolNodeDeposited event when node join', async function () {
        const amount = 100
        const [, other, otherNode] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const otherRouterInstance = subPoolRouter.connect(other) as any
        const tx0 = await otherRouterInstance.createNode(subNodeAddress, amount, [otherNode.address])
        const rcpt0 = await tx0.wait()
        const otherSubNodeAddress = rcpt0.logs[7].args[0]
        const otherNodeRouterInstance = subPoolRouter.connect(otherNode) as any

        await expect(otherNodeRouterInstance.createNode(otherSubNodeAddress, amount, []))
          .to.emit(subPoolNode, 'SubPoolNodeDeposited')
          .withArgs(otherSubNodeAddress, anyValue)
      })
    })
  })
})
