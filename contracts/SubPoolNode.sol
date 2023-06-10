// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './lib/SubPoolLib.sol';

contract SubPoolNode is Ownable, AccessControl {
    using SubPoolLib for SubPoolLib.SubPool;

    // roles
    bytes32 public constant MANAGER_ROLE = keccak256('MANAGER_ROLE');
    bytes32 public constant INVITED_ROLE = keccak256('INVITED_ROLE');
    bytes32 public constant NODE_ROLE = keccak256('NODE_ROLE');

    // general state
    address public parentSubPool;
    uint256 public nextSubPoolID = 1;

    // nodes
    mapping(address => SubPoolLib.SubPool) public subPools;

    // events and errors
    error ParentNotFound();
    error NotAllowed();

    constructor(address _managerAddress) {
        _setupRole(MANAGER_ROLE, _managerAddress);
    }

    function invite(address _invitedAddress) external onlyRole(MANAGER_ROLE) {
        _setupRole(INVITED_ROLE, _invitedAddress);
    }

    /**
     * @dev Set the parent subpool
     * @param _parentSubPool The address of the parent subpool
     */
    function setParentSubPool(address _parentSubPool) external onlyOwner {
        if (!_checkEmptyParent()) revert NotAllowed();
        parentSubPool = _parentSubPool;
    }

    /**
     * @dev Join the subpool itself as node subpool
     * @param _subPoolAddress The address of the subpool
     * @param _amount The amount of the initial deposit
     * @return The ID of the subpool
     */
    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (_checkEmptyParent()) revert ParentNotFound();
        if (!hasRole(INVITED_ROLE, tx.origin)) revert NotAllowed();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({id: nextSubPoolID, initialBalance: 0, balance: 0});

        _updateNodeManagerRole(tx.origin);
        _initialDeposit(_subPoolAddress, _amount);

        nextSubPoolID++;

        return subPools[_subPoolAddress].id;
    }

    function _updateNodeManagerRole(address _nodeManagerAddress) internal {
        _revokeRole(INVITED_ROLE, _nodeManagerAddress);
        _setupRole(NODE_ROLE, _nodeManagerAddress);
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
    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        bool _isNode = subPools[_subPoolAddress]._checkIsNode(msg.sender, _subPoolAddress);
        if (!_isNode) revert NotAllowed();

        subPools[_subPoolAddress]._additionalDeposit(_amount);
        _updateParentBalance(_amount);
    }

    /**
     * @dev Update the balance of subpool itself on the parent subpool
     * @param _amount The amount of additional deposit
     */
    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }

    /**
     * @dev Check if the parent subpool is empty
     */
    function _checkEmptyParent() internal view returns (bool) {
        return parentSubPool == address(0);
    }
}
