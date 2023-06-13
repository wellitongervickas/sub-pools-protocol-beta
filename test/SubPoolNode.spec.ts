import { SubPoolNode } from './../typechain-types/contracts/SubPoolNode'
import { SubPoolRouter } from './../typechain-types/contracts/SubPoolRouter'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'

const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))

describe('SubPoolNode', () => {
  async function deployRounterFixture() {
    const FakeParent = await ethers.getContractFactory('FakeParent')
    const subPoolRouter = await FakeParent.deploy()

    return { subPoolRouter }
  }

  async function deployNodeFixture(owner: string, amount: number, invites: string[]) {
    const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
    const subPoolNode = await SubPoolNode.deploy(owner, amount, invites)

    return { subPoolNode }
  }

  async function deployRountedNodeFixture() {
    const [manager, other] = await ethers.getSigners()

    const { subPoolRouter } = await loadFixture(deployRounterFixture)
    const { subPoolNode } = await loadFixture(deployNodeFixture.bind(null, manager.address, 0, []))
    const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(null, other.address, 0, []))

    const routerAddress = await subPoolRouter.getAddress()

    await subPoolNode.setParentSubPool(routerAddress)
    await subPoolNode.invite(other.address)
    await subPoolNode.transferOwnership(routerAddress)

    return { subPoolRouter, subPoolNode, subPoolNode2 }
  }

  describe('Deploy', () => {
    it('should set the right initial node subpool ID', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 100, []))

      expect(await subPoolNode.nextSubPoolID()).to.equal(0)
    })

    it('should set the right manager', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, 100, []))

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(other.address)
    })

    it('should set the right manager initial balance', async function () {
      const amount = 100
      const [, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, other.address, amount, []))

      const [, managerInitialBalance] = await subPoolNode.manager()
      expect(managerInitialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set the right manager  balance', async function () {
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
      const role = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, [other.address]))

      expect(await subPoolNode.hasRole(role, other.address)).to.be.true
    })
  })

  describe('Validations', () => {
    it('should rever if manager try to update parent twice', async function () {
      const [manager, anyEntity] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      await subPoolNode.setParentSubPool(anyEntity.address)
      await expect(subPoolNode.setParentSubPool(anyEntity.address)).to.be.rejectedWith('NotAllowed()')
    })

    it('should revert if try to set parentSubPool if not the manager role', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      const subPoolNodeNewInstance = subPoolNode.connect(other) as SubPoolNode

      await expect(subPoolNodeNewInstance.setParentSubPool(other.address)).to.be.rejectedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if manager try to invite himself', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      await expect(subPoolNode.invite(manager.address)).to.be.rejectedWith('NotAllowed()')
    })

    it('should revert if try to invite an already invited node manager', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      await subPoolNode.invite(other.address)

      await expect(subPoolNode.invite(other.address)).to.be.rejectedWith('NotAllowed()')
    })

    it('should revert if try to invite an already node manager', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode2, subPoolNode, subPoolRouter } = await loadFixture(deployRountedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subNodeAddress2 = await subPoolNode2.getAddress()

      const subPoolRouterNewInstance = subPoolRouter.connect(other) as SubPoolRouter
      // @dev this last argument has changed to be used as _subPoolAddress and keep the same interface as router
      await subPoolRouterNewInstance.createNode(subNodeAddress, 0, [subNodeAddress2])

      await expect(subPoolNode.invite(other.address)).to.be.rejectedWith('NotAllowed()')
    })

    it('should revert when try to invite a node manager if not the manager role', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      const subPoolNodeNewInstance = subPoolNode.connect(other) as SubPoolNode

      await expect(subPoolNodeNewInstance.invite(other.address)).to.be.rejectedWith(
        `AccessControl: account ${other.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })
  })

  describe('Events', () => {
    it('should emit NodeManagerInvited event when invite a new node manager', async function () {
      const [manager, other] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture.bind(this, manager.address, 0, []))

      await expect(subPoolNode.invite(other.address)).to.emit(subPoolNode, 'NodeManagerInvited').withArgs(other.address)
    })
  })
})
