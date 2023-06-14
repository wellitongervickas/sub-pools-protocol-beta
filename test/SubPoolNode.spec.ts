import { SubPoolNode } from './../typechain-types/contracts/SubPoolNode'
import { FakeParent } from './../typechain-types/contracts/utils/FakeParent'

import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
const INVITED_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
const NODE_ROLE = ethers.keccak256(ethers.toUtf8Bytes('NODE_ROLE'))

describe('SubPoolNode', () => {
  async function deployRounterFixture() {
    const FakeParent = await ethers.getContractFactory('FakeParent')
    const fakeParent = await FakeParent.deploy()

    return { fakeParent }
  }

  async function deployNodeFixture(owner: string, amount: number, invites: string[]) {
    const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
    const subPoolNode = await SubPoolNode.deploy(owner, amount, invites)

    return { subPoolNode }
  }

  async function deployRountedNodeFixture() {
    const [manager, other] = await ethers.getSigners()

    const { fakeParent } = await loadFixture(deployRounterFixture)
    const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))

    const routerAddress = await fakeParent.getAddress()

    await subPoolNode.setParentSubPool(routerAddress)
    await subPoolNode.invite(other.address)
    await subPoolNode.transferOwnership(routerAddress)

    return { fakeParent, subPoolNode }
  }

  describe('Deploy', () => {
    it('should set the right initial node subpool ID', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      expect(await subPoolNode.nextSubPoolID()).to.equal(0)
    })

    it('should set the right manager', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, 0, []))

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(other.address)
    })

    it('should set the right manager initial balance', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, amount, []))

      const [, initialBalance] = await subPoolNode.manager()
      expect(initialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set the right manager balance', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, 0, []))

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })

    it('should set the right role to manager address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      expect(await subPoolNode.hasRole(MANAGER_ROLE, manager.address)).to.be.true
    })

    it('should set the right role to invited addresses', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, [other.address]))

      expect(await subPoolNode.hasRole(INVITED_ROLE, other.address)).to.be.true
    })
  })

  describe('Join', () => {
    it('should update the ID when join as node', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const subNodeAddress = await subPoolNode.getAddress()
      const subNodeAddress2 = await subPoolNode2.getAddress()

      const subPoolRouterNewInstance = fakeParent.connect(other) as FakeParent
      await subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, 0)

      expect(await subPoolNode.nextSubPoolID()).to.equal(1)
    })

    it('should set initial balance when join as node', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, amount, []))

      const subNodeAddress = await subPoolNode.getAddress()
      const subNodeAddress2 = await subPoolNode2.getAddress()

      const subPoolRouterNewInstance = fakeParent.connect(other) as FakeParent
      await subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, amount)
      const [, initialBalance] = await subPoolNode.subPools(subNodeAddress2)

      expect(initialBalance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should update from invite to node role when join as node', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

      const subNodeAddress = await subPoolNode.getAddress()
      const subNodeAddress2 = await subPoolNode2.getAddress()

      const subPoolRouterNewInstance = fakeParent.connect(other) as FakeParent
      await subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, 0)

      expect(await subPoolNode.hasRole(NODE_ROLE, other.address)).to.be.true
    })

    it('should update parent balance when join as node', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, amount, []))

      const subNodeAddress = await subPoolNode.getAddress()
      const subNodeAddress2 = await subPoolNode2.getAddress()

      const subPoolRouterNewInstance = fakeParent.connect(other) as FakeParent
      await subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, amount)
      const [, , parentBalance] = await fakeParent.subPools(subNodeAddress)

      expect(parentBalance).to.be.equal(ethers.toBigInt(amount))
    })
  })

  describe('Validations', () => {
    describe('Parent', () => {
      it('should revert if on update parent twice', async function () {
        const [manager, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

        await subPoolNode.setParentSubPool(anyEntity.address)
        await expect(subPoolNode.setParentSubPool(anyEntity.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ParentAlreadySet()'
        )
      })

      it('should revert on set parentSubPool if not manager role', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

        const subPoolNodeNewInstance = subPoolNode.connect(other) as SubPoolNode

        await expect(subPoolNodeNewInstance.setParentSubPool(other.address)).to.be.rejectedWith(
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
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

        await subPoolNode.invite(other.address)

        await expect(subPoolNode.invite(other.address)).to.be.revertedWithCustomError(subPoolNode, 'AlreadyInvited()')
      })

      it('should revert on invite an already node manager', async function () {
        const [, other] = await ethers.getSigners()
        const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
        const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

        const subNodeAddress = await subPoolNode.getAddress()
        const subNodeAddress2 = await subPoolNode2.getAddress()

        const subPoolRouterNewInstance = fakeParent.connect(other) as FakeParent
        await subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, 0)

        await expect(subPoolNode.invite(other.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'AlreadyNodeManager()'
        )
      })

      it('should revert on invite a node manager if not the manager role', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

        const subPoolNodeNewInstance = subPoolNode.connect(other) as SubPoolNode

        await expect(subPoolNodeNewInstance.invite(other.address)).to.be.rejectedWith(
          `AccessControl: account ${other.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
        )
      })
    })

    describe('Join', () => {
      it('should revert on join as node without a parent subpool', async function () {
        const [, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, 0, []))
        const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(this, other.address, 0, []))

        const subPoolAddress = await subPoolNode2.getAddress()

        await expect(subPoolNode.join(subPoolAddress, 0)).to.be.rejectedWith('ParentNotFound()')
      })

      it('should revert on join as node without being invited', async function () {
        const [, other, hacker] = await ethers.getSigners()
        const { subPoolNode, fakeParent } = await loadFixture(deployRountedNodeFixture)
        const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

        const subNodeAddress = await subPoolNode.getAddress()
        const subNodeAddress2 = await subPoolNode2.getAddress()

        const subPoolRouterNewInstance = fakeParent.connect(hacker) as FakeParent

        await expect(subPoolRouterNewInstance.join(subNodeAddress, subNodeAddress2, 0)).to.be.rejectedWith(
          'NotInvited()'
        )
      })
    })
  })

  describe('Events', () => {
    describe('Invite', () => {
      it('should emit NodeManagerInvited event when invite a new node manager', async function () {
        const [manager, other] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

        await expect(subPoolNode.invite(other.address))
          .to.emit(subPoolNode, 'NodeManagerInvited')
          .withArgs(other.address)
      })
    })
  })
})
