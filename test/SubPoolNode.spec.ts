import { SubPoolNode } from './../typechain-types/contracts/SubPoolNode'

import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import { SubPoolRouter } from '../typechain-types/contracts/SubPoolRouter'

const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MANAGER_ROLE'))
const INVITED_ROLE = ethers.keccak256(ethers.toUtf8Bytes('INVITED_ROLE'))
const NODE_ROLE = ethers.keccak256(ethers.toUtf8Bytes('NODE_ROLE'))

const DEFAULT_FEES_FRACTION = {
  value: ethers.toBigInt(0),
  divider: ethers.toBigInt(100),
} // 10%

describe('SubPoolNode', () => {
  async function deployRouterFixture() {
    const SubPoolRouter = await ethers.getContractFactory('SubPoolRouter')
    const subPoolRouter = await SubPoolRouter.deploy()

    return { subPoolRouter }
  }

  async function deployNodeFixture(
    manager: string,
    amount: string,
    fees: typeof DEFAULT_FEES_FRACTION,
    invites: string[]
  ) {
    const SubPoolNode = await ethers.getContractFactory('SubPoolNode')
    const subPoolNode = await SubPoolNode.deploy(manager, amount, fees, invites)

    return { subPoolNode }
  }

  async function deployRoutedNodeFixture() {
    const [, invited] = await ethers.getSigners()
    const { subPoolRouter } = await loadFixture(deployRouterFixture)

    const tx = await subPoolRouter.create(0, DEFAULT_FEES_FRACTION, [invited.address])
    let receipt = await tx.wait()
    const [subPoolAddress] = receipt.logs[3].args
    const subPoolNode = await ethers.getContractAt('SubPoolNode', subPoolAddress)

    return { subPoolRouter, subPoolNode }
  }

  describe('Deploy', () => {
    it('should set initial ID', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
      )

      expect(await subPoolNode.currentID()).to.equal(0)
    })

    it('should set manager by address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
      )

      const [managerAddress] = await subPoolNode.manager()
      expect(managerAddress).to.equal(manager.address)
    })

    it('should set manager initial balance', async function () {
      const amount = '100'
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, amount, DEFAULT_FEES_FRACTION, [])
      )

      const [, initialBalance] = await subPoolNode.manager()
      expect(initialBalance).to.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
      )

      const [, , managerBlance] = await subPoolNode.manager()
      expect(managerBlance).to.equal(ethers.toBigInt(0))
    })

    it('should set manager fraction', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
      )

      const [, , , managerFraction] = await subPoolNode.manager()
      expect(managerFraction).to.deep.equal([DEFAULT_FEES_FRACTION.value, DEFAULT_FEES_FRACTION.divider])
    })

    it('should set role to manager address', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
      )

      expect(await subPoolNode.hasRole(MANAGER_ROLE, manager.address)).to.be.true
    })

    it('should set role to invited addresses', async function () {
      const [manager, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [invited.address])
      )

      expect(await subPoolNode.hasRole(INVITED_ROLE, invited.address)).to.be.true
    })
  })

  describe('Join', () => {
    it('should update the ID', async function () {
      const [, invited] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter
      await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolNode.currentID()).to.equal(1)
    })

    it('should set initial balance', async function () {
      const amount = ethers.toBigInt(100)
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)
      const [, initialBalance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(initialBalance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should set balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)
      const [, , balance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(0))
    })

    it('should update from invite to node role', async function () {
      const [, other] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(other) as SubPoolRouter
      await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [])

      expect(await subPoolNode.hasRole(NODE_ROLE, other.address)).to.be.true
    })

    it('should update parent balance', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])

      const [, , balance] = await subPoolRouter.subPools(subNodeAddress)
      expect(balance).to.be.equal(ethers.toBigInt(amount))
    })

    it('should set manager balance when manager ratio is set', async function () {
      const customFeesFraction = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(200),
      } // 100e18 * (1/200 = 0.005) = 0.5e18

      const amount = ethers.parseUnits('100', 18)

      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, customFeesFraction, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)

      const [, , balance] = await invitedSubPoolNode.manager()
      expect(balance).to.be.equal('500000000000000000')
    })

    it('should set node balance when manager ratio is set', async function () {
      const customFeesFraction = {
        value: ethers.toBigInt(1),
        divider: ethers.toBigInt(100),
      } // 10%

      const amount = ethers.parseUnits('100', 18)

      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, customFeesFraction, [node.address])
      const rcpt0 = await tx0.wait()
      const invitedSubNodeAddress = rcpt0.logs[7].args[0]

      const nodeRouterInstance = subPoolRouter.connect(node) as any
      const tx1 = await nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, [])
      const rcpt1 = await tx1.wait()
      const nodeAddress = rcpt1.logs[7].args[0]

      const invitedSubPoolNode = await ethers.getContractAt('SubPoolNode', invitedSubNodeAddress)

      const [, initialBalance] = await invitedSubPoolNode.subPools(nodeAddress)
      expect(initialBalance).to.be.equal('99000000000000000000')
    })
  })

  describe('Validations', () => {
    describe('Parent', () => {
      it('should revert if try to update parent twice', async function () {
        const [manager, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await subPoolNode.setParent(anyEntity.address)
        await expect(subPoolNode.setParent(anyEntity.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ParentAlreadySet()'
        )
      })

      it('should revert on set parent if not manager role', async function () {
        const [manager, anyEntity] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        const subPoolInstance = subPoolNode.connect(anyEntity) as SubPoolNode

        await expect(subPoolInstance.setParent(anyEntity.address)).to.be.rejectedWith(
          'Ownable: caller is not the owner'
        )
      })
    })

    describe('Invite', () => {
      it('should revert when manager try to invite himself', async function () {
        const [manager] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await expect(subPoolNode.invite(manager.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'ManagerNotAllowed()'
        )
      })

      it('should revert on invite an already invited node manager', async function () {
        const [manager, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await subPoolNode.invite(invited.address)

        await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(subPoolNode, 'AlreadyInvited()')
      })

      it('should revert on invite an already node manager', async function () {
        const amount = 100
        const [, invited, node] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
        const subNodeAddress = await subPoolNode.getAddress()

        const invitedRouterInstance = subPoolRouter.connect(invited) as any
        await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])

        await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(
          subPoolNode,
          'AlreadyNodeManager()'
        )
      })

      it('should revert on invite a node manager if not the manager role', async function () {
        const [manager, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        const subPoolInstance = subPoolNode.connect(invited) as SubPoolNode

        await expect(subPoolInstance.invite(invited.address)).to.be.rejectedWith(
          `AccessControl: account ${invited.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
        )
      })
    })

    describe('Join', () => {
      it('should revert on join as node without a parent subpool', async function () {
        const [manager] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )
        const { subPoolNode: subPoolNode2 } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        const subPoolAddress = await subPoolNode2.getAddress()

        await expect(subPoolNode.join(subPoolAddress, 0)).to.be.revertedWithCustomError(subPoolNode, 'ParentNotFound()')
      })

      it('should revert on join as node without being invited', async function () {
        const [, , hacker] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const subPoolRouterInstance = subPoolRouter.connect(hacker) as SubPoolRouter

        await expect(
          subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, [])
        ).to.be.revertedWithCustomError(subPoolNode, 'NotInvited()')
      })

      it('should revert on call join without being the owner', async function () {
        const [manager, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )
        const { subPoolNode: subPoolNode2 } = await loadFixture(
          deployNodeFixture.bind(this, invited.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        const subNodeAddress2 = await subPoolNode2.getAddress()
        const newSubPoolInstance = subPoolNode.connect(invited) as SubPoolNode

        await expect(newSubPoolInstance.join(subNodeAddress2, 0)).to.be.rejectedWith('Ownable: caller is not the owner')
      })

      it('should revert when try to call deposit if sender is not node', async function () {
        const [manager] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await expect(subPoolNode.deposit(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
      })
    })
  })

  describe('Events', () => {
    describe('Invite', () => {
      it('should emit NodeManagerInvited event when invite a new node manager', async function () {
        const [manager, invited] = await ethers.getSigners()
        const { subPoolNode } = await loadFixture(
          deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])
        )

        await expect(subPoolNode.invite(invited.address))
          .to.emit(subPoolNode, 'NodeManagerInvited')
          .withArgs(invited.address)
      })
    })

    describe('Join', () => {
      it('should emit NodeManagerJoined event when node manager join', async function () {
        const [, invited] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

        const subNodeAddress = await subPoolNode.getAddress()
        const subPoolRouterInstance = subPoolRouter.connect(invited) as SubPoolRouter

        await expect(await subPoolRouterInstance.join(subNodeAddress, 0, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolNode, 'NodeManagerJoined')
          .withArgs(invited.address, anyValue)
      })

      it('should emit SubPoolDeposited event when node join', async function () {
        const amount = 100
        const [, invited, node] = await ethers.getSigners()
        const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
        const subNodeAddress = await subPoolNode.getAddress()

        const invitedRouterInstance = subPoolRouter.connect(invited) as any
        const tx0 = await invitedRouterInstance.join(subNodeAddress, amount, DEFAULT_FEES_FRACTION, [node.address])
        const rcpt0 = await tx0.wait()
        const invitedSubNodeAddress = rcpt0.logs[7].args[0]

        const nodeRouterInstance = subPoolRouter.connect(node) as any

        await expect(nodeRouterInstance.join(invitedSubNodeAddress, amount, DEFAULT_FEES_FRACTION, []))
          .to.emit(subPoolNode, 'SubPoolDeposited')
          .withArgs(invitedSubNodeAddress, anyValue)
      })
    })
  })

  describe('Hacking', () => {
    it('should revert if try to join setting manually the parent as a main subpool', async function () {
      const [, , hacker] = await ethers.getSigners()
      const { subPoolNode: subPoolNodeDefault } = await loadFixture(deployRoutedNodeFixture)

      const defaultSubPoolNodeAddress = await subPoolNodeDefault.getAddress()
      const SubPoolNode = await ethers.getContractFactory('SubPoolNode', hacker)

      const subPoolNode = await SubPoolNode.deploy(hacker.address, 100, DEFAULT_FEES_FRACTION, [hacker.address])
      const subPoolNode2 = await SubPoolNode.deploy(hacker.address, 100, DEFAULT_FEES_FRACTION, [hacker.address])

      const subPoolNode2Address = await subPoolNode2.getAddress()
      await subPoolNode.setParent(defaultSubPoolNodeAddress)

      await expect(subPoolNode.join(subPoolNode2Address, 100)).to.be.revertedWithCustomError(
        subPoolNode,
        'NotAllowed()'
      )
    })
  })
})
