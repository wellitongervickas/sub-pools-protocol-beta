// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/AccessControlEnumerable.sol'; // change to enumerable
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

import './lib/SubPoolLib.sol';
import './lib/ManagerLib.sol';

contract SubPoolNode is Ownable, AccessControl {
    using SubPoolLib for SubPoolLib.SubPool;
    using ManagerLib for ManagerLib.Manager;
    using Counters for Counters.Counter;

    // roles
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    // general state
    address public parentSubPool;
    ManagerLib.Manager public manager;
    Counters.Counter public nextSubPoolID;

    // nodes
    mapping(address => SubPoolLib.SubPool) public subPools;

    // events
    event NodeManagerInvited(address indexed _invitedAddress);
    event NodeManagerJoined(address indexed _nodeManagerAddress, uint256 indexed _subPoolID);

    // errors
    error ParentNotFound();
    error NotAllowed();

    constructor(address _managerAddress, uint256 _amount, address[] memory _invitedAddresses) {
        manager = ManagerLib.Manager({managerAddress: _managerAddress, initialBalance: _amount, balance: 0});

        _setupInitialInvites(_invitedAddresses);
        _grantRole(MANAGER_ROLE, _managerAddress);
    }

    /**
     * @dev setup the role of invited addressess
     * @param _invitedAddresses The addresses of the invited node managers
     */
    function _setupInitialInvites(address[] memory _invitedAddresses) internal {
        for (uint256 i = 0; i < _invitedAddresses.length; i++) {
            _grantRole(INVITED_ROLE, _invitedAddresses[i]);
        }
    }

    /**
     * @dev Invite new node manager
     * @param _invitedAddress The address of the invited node manager
     */
    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        if (_checkIsManagerAddress(_invitedAddress)) revert NotAllowed();
        if (_checkIsInvitedAddress(_invitedAddress)) revert NotAllowed();
        if (_checkIsNodeManagerAddress(_invitedAddress)) revert NotAllowed();

        _grantRole(INVITED_ROLE, _invitedAddress);

        emit NodeManagerInvited(_invitedAddress);
    }

    /**
     * @dev Set the parent subpool
     * @param _parentSubPool The address of the parent subpool
     */
    function setParentSubPool(address _parentSubPool) external onlyOwner {
        if (_checkHasParent()) revert NotAllowed();
        parentSubPool = _parentSubPool;
    }

    /**
     * @dev Join the subpool itself as node subpool
     * @param _subPoolAddress The address of the subpool
     * @param _amount The amount of the initial deposit
     * @return The ID of the subpool
     */
    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (!_checkHasParent()) revert ParentNotFound();
        if (!_checkIsInvitedAddress(tx.origin)) revert NotAllowed();

        nextSubPoolID.increment();
        subPools[_subPoolAddress] = SubPoolLib.SubPool({id: nextSubPoolID.current(), initialBalance: 0, balance: 0});

        _updateNodeManagerRole(tx.origin);
        _initialDeposit(_subPoolAddress, _amount);

        emit NodeManagerJoined(tx.origin, subPools[_subPoolAddress].id);

        return subPools[_subPoolAddress].id;
    }

    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _grantRole(NODE_ROLE, _nodeManagerAddress);
    }

    /**
     * @dev Anitial deposit of subpool node
     * @param _subPoolAddress The address of the subpool
     * @param _amount The amount of the initial deposit
     */
    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal {
        subPools[_subPoolAddress]._initialDeposit(_amount);
        _updateParentBalance(_amount);
    }

    /**
     * @dev Additional deposit of subpool node
     * @param _subPoolAddress The address of the sub pool
     * @param _amount The amount of the additional deposit
     */
    function deposit(address _subPoolAddress, uint256 _amount) external {
        bool _isNode = subPools[_subPoolAddress]._checkIsNode(msg.sender, _subPoolAddress);
        if (!_isNode) revert NotAllowed();

        subPools[_subPoolAddress]._deposit(_amount);
        _updateParentBalance(_amount);
    }

    /**
     * @dev Update the balance of subpool itself on the parent subpool
     * @param _amount The amount of additional deposit
     */
    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.deposit(address(this), _amount);
    }

    /**
     * @dev Check if the parent subpool is empty
     */
    function _checkHasParent() internal view returns (bool) {
        return parentSubPool != address(0);
    }

    /**
     * @dev Check if the address is invited
     * @param _nodeManagerAddress The address of the node manager
     * @return true or false
     */
    function _checkIsInvitedAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(INVITED_ROLE, _nodeManagerAddress);
    }

    /**
     * @dev Check if the address is node manager
     * @param _address The address of the requester
     */
    function _checkIsManagerAddress(address _address) internal view returns (bool) {
        return hasRole(MANAGER_ROLE, _address);
    }

    function _checkIsNodeManagerAddress(address _nodeManagerAddress) internal view returns (bool) {
        return hasRole(NODE_ROLE, _nodeManagerAddress);
    }
}
