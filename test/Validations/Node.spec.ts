import { expect } from 'chai'
import {
  deployNodeFixture,
  deployRoutedNodeFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  MANAGER_ROLE,
  ethers,
  SubPoolRouter,
  SubPoolNode,
} from '../fixtures'

describe('SubPoolNode', () => {
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

    describe('Additional deposit', () => {
      it('should revert if try to call manager additional deposit without being the manager', async function () {
        const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)
        const [manager] = await ethers.getSigners()
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])

        await expect(subPoolNode.additionalDeposit(ethers.toBigInt(100))).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })
    })

    describe('Withdraw funds', () => {
      it('should revert if try to withdraw funds without being the manager', async function () {
        const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)
        const [manager] = await ethers.getSigners()
        deployNodeFixture.bind(this, manager.address, '0', DEFAULT_FEES_FRACTION, [])

        await expect(subPoolNode.withdrawFunds(ethers.toBigInt(100))).to.be.revertedWith(
          'Ownable: caller is not the owner'
        )
      })
    })
  })
})
