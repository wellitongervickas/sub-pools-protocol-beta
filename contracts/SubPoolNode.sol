// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './SubPool.sol';
import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

contract SubPoolNode is SubPool, Ownable, AccessControl {
    using ManagerLib for ManagerLib.Manager;
    using ManagerLib for ManagerLib.Manager;

    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    address public parent;
    ManagerLib.Manager public manager;

    event NodeManagerInvited(address indexed _invitedAddress);
    event NodeManagerJoined(address indexed _nodeManagerAddress, uint256 indexed _subPoolID);
    event SubPoolDeposited(address indexed _subPoolAddress, uint256 _amount);

    error ParentNotFound();
    error ParentAlreadySet();
    error ManagerNotAllowed();
    error AlreadyNodeManager();
    error NotInvited();
    error AlreadyInvited();

    /**
     * @dev Initialize the contract
     * @param _managerAddress address of the manager
     * @param _amount amount of initial deposit of the manager
     * @param _invitedAddresses array of addresses to invite
     */
    constructor(address _managerAddress, uint256 _amount, address[] memory _invitedAddresses) {
        manager = ManagerLib.Manager({
            managerAddress: _managerAddress,
            initialBalance: _amount,
            balance: 0,
            feesRatio: FractionLib.Fraction({value: 0, divider: 100})
        });

        _setupInitialInvites(_invitedAddresses);
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    /**
     * @dev update invited address role
     * @param _invitedAddresses addressess of the invitation
     */
    function _setupInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    /**
     * @dev Set parent address
     * @param _parent address of the parent subpool
     */
    function setParent(address _parent) external onlyOwner {
        if (_checkHasParent()) revert ParentAlreadySet();
        parent = _parent;
    }

    /**
     * @dev Check if parent address is already set
     */
    function _checkHasParent() internal view returns (bool) {
        return parent != address(0);
    }

    /**
     * @dev Invite new subpool node
     * @param _invitedAddress address of the invited node manager
     */
    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerAddress(_invitedAddress)) revert ManagerNotAllowed();
        if (_checkIsInvitedAddress(_invitedAddress)) revert AlreadyInvited();
        if (_checkIsNodeManagerAddress(_invitedAddress)) revert AlreadyNodeManager();

        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    /**
     * @dev check if address is manager
     * @param _address address to check
     */
    function _checkIsManagerAddress(address _address) internal view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    /**
     * @dev check if address is invited
     * @param _nodeManagerAddress address of node manager to check
     */
    function _checkIsInvitedAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    /**
     * @dev check if address is node manager
     * @param _nodeManagerAddress address of node manager to check
     */
    function _checkIsNodeManagerAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }

    /**
     * @dev Join as subpool node
     * @param _subPoolAddress address of the subpool node
     * @param _amount amount of initial deposit of the subpool node
     * @return id of the subpool node
     */
    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (!_checkHasParent()) revert ParentNotFound();
        if (!_checkIsInvitedAddress(tx.origin)) revert NotInvited();

        uint256 _id = _updateCurrentID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            id: _id,
            initialBalance: _amount,
            balance: 0,
            feesRatio: FractionLib.Fraction({value: 0, divider: 100})
        });

        _updateNodeManagerRole(tx.origin);
        _updateParentBalance(_amount);

        emit NodeManagerJoined(tx.origin, subPools[_subPoolAddress].id);

        return subPools[_subPoolAddress].id;
    }

    /**
     * @dev Update from invited to node role
     * @param _nodeManagerAddress address of the node manager
     */
    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    /**
     * @dev Update parent balance
     * @param _amount amount to update on parent context
     */
    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode(parent).deposit(address(this), _amount);
    }

    /**
     * @dev Deposit to a subpool root and update parent balance
     * @param _subPoolAddress address of the subpool root
     * @param _amount amount to deposit
     */

    function deposit(address _subPoolAddress, uint256 _amount) public override {
        super.deposit(_subPoolAddress, _amount);

        _updateParentBalance(_amount);

        emit SubPoolDeposited(_subPoolAddress, _amount);
    }
}
