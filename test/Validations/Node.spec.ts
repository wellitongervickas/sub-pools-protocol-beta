import { DEFAULT_REQUIRED_INITIAL_AMOUNT, DEFAULT_MAX_ADDITIONAL_AMOUNT, deployRouterFixture } from './../fixtures'
import { expect } from 'chai'

import {
  deployNodeFixture,
  deployRoutedNodeFixture,
  loadFixture,
  DEFAULT_FEES_FRACTION,
  MANAGER_ROLE,
  ethers,
  Router,
  Children,
  time,
  DEFAULT_PERIOD_LOCK,
} from '../fixtures'

describe('Children', () => {
  describe('Parent', () => {
    it('should revert if try to update parent twice', async function () {
      const [, anyEntity] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await subPoolNode.setParent(anyEntity.address)
      await expect(subPoolNode.setParent(anyEntity.address)).to.be.revertedWithCustomError(
        subPoolNode,
        'ParentAlreadySet()'
      )
    })

    it('should revert on set parent if not manager role', async function () {
      const [, anyEntity] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const subPoolInstance = subPoolNode.connect(anyEntity) as Children

      await expect(subPoolInstance.setParent(anyEntity.address)).to.be.rejectedWith('Ownable: caller is not the owner')
    })
  })

  describe('Invite', () => {
    it('should revert when manager try to invite himself', async function () {
      const [manager] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await expect(subPoolNode.invite(manager.address)).to.be.revertedWithCustomError(
        subPoolNode,
        'ManagerNotAllowed()'
      )
    })

    it('should revert on invite an already invited node manager', async function () {
      const [, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await subPoolNode.invite(invited.address)

      await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(subPoolNode, 'AlreadyInvited()')
    })

    it('should revert on invite an already node manager', async function () {
      const amount = 100
      const [, invited, node] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)
      const subNodeAddress = await subPoolNode.getAddress()

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [node.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(
        subPoolNode,
        'AlreadyNodeManager()'
      )
    })

    it('should revert on invite a node manager if not the manager role', async function () {
      const [, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const subPoolInstance = subPoolNode.connect(invited) as Children

      await expect(subPoolInstance.invite(invited.address)).to.be.rejectedWith(
        `AccessControl: account ${invited.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })

    it('should revert on invite when not invited only', async function () {
      const [, , invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await subPoolNode.setIsInvitedOnly(false)
      await expect(subPoolNode.invite(invited.address)).to.be.revertedWithCustomError(subPoolNode, 'NotInvitedOnly()')
    })

    it('should revert if try to setup invited only without being the manager', async function () {
      const [, , invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      const subPoolInstance = subPoolNode.connect(invited) as Children

      await expect(subPoolInstance.setIsInvitedOnly(true)).to.be.rejectedWith(
        `AccessControl: account ${invited.address.toLowerCase()} is missing role ${MANAGER_ROLE}`
      )
    })
  })

  describe('Join', () => {
    it('should revert on join as node without a parent subpool', async function () {
      const [, , hacker] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture)

      const subPoolAddress = await subPoolNode2.getAddress()

      await expect(subPoolNode.join(subPoolAddress, hacker.address, 0)).to.be.revertedWithCustomError(
        subPoolNode,
        'ParentNotFound()'
      )
    })

    it('should revert if try to join setting manually the parent as a main subpool', async function () {
      const [, , hacker] = await ethers.getSigners()
      const { subPoolNode: subPoolNodeDefault } = await loadFixture(deployRoutedNodeFixture)

      const defaultSubPoolNodeAddress = await subPoolNodeDefault.getAddress()
      const SubPoolNode = await ethers.getContractFactory('Children', hacker)

      const subPoolNode = await SubPoolNode.deploy(
        hacker.address,
        100,
        DEFAULT_FEES_FRACTION,
        [hacker.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      const subPoolNode2 = await SubPoolNode.deploy(
        hacker.address,
        100,
        DEFAULT_FEES_FRACTION,
        [hacker.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      const subPoolNode2Address = await subPoolNode2.getAddress()
      await subPoolNode.setParent(defaultSubPoolNodeAddress)

      await expect(subPoolNode.join(subPoolNode2Address, hacker.address, 100)).to.be.revertedWithCustomError(
        subPoolNode,
        'NotAllowed()'
      )
    })

    it('should revert on join as node without being invited', async function () {
      const [, , hacker] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const subPoolRouterInstance = subPoolRouter.connect(hacker) as Router

      await expect(
        subPoolRouterInstance.join(
          subNodeAddress,
          0,
          DEFAULT_FEES_FRACTION,
          [],
          DEFAULT_PERIOD_LOCK,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_ADDITIONAL_AMOUNT
        )
      ).to.be.revertedWithCustomError(subPoolNode, 'NotInvited()')
    })

    it('should revert on call join without being the owner', async function () {
      const [, invited] = await ethers.getSigners()
      const { subPoolNode } = await loadFixture(deployNodeFixture)
      const { subPoolNode: subPoolNode2 } = await loadFixture(deployNodeFixture.bind(this, invited.address))

      const subNodeAddress2 = await subPoolNode2.getAddress()
      const newSubPoolInstance = subPoolNode.connect(invited) as Children

      await expect(newSubPoolInstance.join(subNodeAddress2, invited.address, 0)).to.be.rejectedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if try to join without a required initial balance', async function () {
      const [, , otherInvited] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(
        deployRoutedNodeFixture.bind(
          this,
          ethers.toBigInt(100),
          DEFAULT_FEES_FRACTION,
          [],
          DEFAULT_PERIOD_LOCK,
          ethers.toBigInt(100)
        )
      )

      const subPoolNodeAddress = await subPoolNode.getAddress()

      await subPoolNode.invite(otherInvited.address)

      const invitedRouterInstance = subPoolRouter.connect(otherInvited) as Router

      await expect(
        invitedRouterInstance.join(
          subPoolNodeAddress,
          0,
          DEFAULT_FEES_FRACTION,
          [],
          DEFAULT_PERIOD_LOCK,
          DEFAULT_REQUIRED_INITIAL_AMOUNT,
          DEFAULT_MAX_ADDITIONAL_AMOUNT
        )
      ).to.be.revertedWithCustomError(subPoolNode, 'InvalidInitialAmount()')
    })
  })

  describe('Deposit', () => {
    it('should revert when try to call deposit if sender is not node', async function () {
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await expect(subPoolNode.deposit(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
    })
  })

  describe('Additional deposit', () => {
    it('should revert if try to call manager additional deposit without being the manager', async function () {
      const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

      await expect(subPoolNode.additionalDeposit(ethers.toBigInt(100))).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if try to call additioanl deposit greater than max additional amount of parent', async function () {
      const amount = ethers.toBigInt(1000)
      const [, invited, node1] = await ethers.getSigners()
      const { subPoolNode, subPoolRouter } = await loadFixture(deployRoutedNodeFixture)

      const subNodeAddress = await subPoolNode.getAddress()
      const invitedRouterInstance = subPoolRouter.connect(invited) as any

      const maxAdditionalDeposit = ethers.toBigInt(1)

      const tx0 = await invitedRouterInstance.join(
        subNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [node1.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        maxAdditionalDeposit
      )

      const rcpt0 = await tx0.wait()
      const invitedSubPoolNodeAddress = rcpt0.logs[6].args[0]
      const node1RouterInstance = subPoolRouter.connect(node1) as any

      const tx1 = await node1RouterInstance.join(
        invitedSubPoolNodeAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      const rcpt1 = await tx1.wait()
      const node1SubPoolNodeAddress = rcpt1.logs[5].args[0]
      const newAmount = ethers.toBigInt(1000)

      await expect(
        node1RouterInstance.additionalDeposit(node1SubPoolNodeAddress, newAmount)
      ).to.be.revertedWithCustomError(subPoolNode, 'ExceedMaxAdditionalDeposit()')
    })
  })

  describe('Withdraw ', () => {
    it('should revert if try to withdraw greater than balance', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)
      const additionalAmount = ethers.toBigInt(100)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )

      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(
        subPoolAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt2 = await tx1.wait()

      const [invitedSubPoolAddress] = receipt2.logs[5].args

      await invitedRouterInstance.additionalDeposit(invitedSubPoolAddress, additionalAmount)

      const subPoolNodeContract = await ethers.getContractAt('Children', subPoolAddress)
      const extraValue = ethers.toBigInt(100)

      await expect(
        invitedRouterInstance.withdrawBalance(invitedSubPoolAddress, additionalAmount + extraValue)
      ).to.be.revertedWithCustomError(subPoolNodeContract, 'NotAllowed()')
    })

    it('should revert if try to withdraw greater than initial balance', async function () {
      const { subPoolRouter, accounts } = await loadFixture(deployRouterFixture)
      const [, invited] = accounts
      const amount = ethers.toBigInt(1000)

      const tx = await subPoolRouter.create(
        amount,
        DEFAULT_FEES_FRACTION,
        [invited.address],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt = await tx.wait()
      const [subPoolAddress] = receipt.logs[3].args

      const invitedRouterInstance = subPoolRouter.connect(invited) as any
      const tx1 = await invitedRouterInstance.join(
        subPoolAddress,
        amount,
        DEFAULT_FEES_FRACTION,
        [],
        DEFAULT_PERIOD_LOCK,
        DEFAULT_REQUIRED_INITIAL_AMOUNT,
        DEFAULT_MAX_ADDITIONAL_AMOUNT
      )
      let receipt2 = await tx1.wait()
      const [invitedSubPoolAddress] = receipt2.logs[5].args

      const invitedSubPoolNodeContract = await ethers.getContractAt('Children', invitedSubPoolAddress)

      const extraValue = ethers.toBigInt(100)

      await expect(
        invitedRouterInstance.withdrawInitialBalance(invitedSubPoolAddress, amount + extraValue)
      ).to.be.revertedWithCustomError(invitedSubPoolNodeContract, 'NotAllowed()')
    })

    it('should revert if try to withdraw balance without being the owner', async function () {
      const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

      await expect(subPoolNode.withdrawBalance(ethers.toBigInt(100))).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert if try to withdraw initial balance without being the owner', async function () {
      const { subPoolNode } = await loadFixture(deployRoutedNodeFixture)

      await expect(subPoolNode.withdrawInitialBalance(ethers.toBigInt(100))).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should revert when try to call withdraw if sender is not node', async function () {
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await expect(subPoolNode.withdraw(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
    })

    it('should revert when try to call cashback if sender is not node', async function () {
      const { subPoolNode } = await loadFixture(deployNodeFixture)

      await expect(subPoolNode.cashback(100)).to.be.revertedWithCustomError(subPoolNode, 'NotAllowed()')
    })

    it('should revert if try to withdraw initial balance in locked period', async function () {
      const [manager] = await ethers.getSigners()

      const amount = ethers.toBigInt(1000)

      const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

      const { subPoolNode } = await loadFixture(
        deployNodeFixture.bind(this, manager.address, amount, DEFAULT_FEES_FRACTION, [], unlockTime)
      )

      await expect(subPoolNode.withdrawInitialBalance(amount)).to.be.revertedWithCustomError(
        subPoolNode,
        'LockPeriod()'
      )
    })
  })
})
