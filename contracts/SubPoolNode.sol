// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import './lib/SubPoolLib.sol';

contract SubPoolNode is Ownable {
    using SubPoolLib for SubPoolLib.SubPoolInfo;

    address public parentSubPool;
    uint256 public nextSubPoolID = 1;
    mapping(address => SubPoolLib.SubPoolInfo) public subPools;

    error ParentNotFound();
    error NotAllowed();

    /**
     * @notice Set the parent subpool
     * @param _parentSubPool The address of the parent subpool
     */
    function setParentSubPool(address _parentSubPool) external onlyOwner {
        parentSubPool = _parentSubPool;
    }

    /**
     * @notice Join a subpool
     * @param _subPoolAddress The address of the subpool
     * @param _amount The amount of the initial deposit
     * @return The ID of the subpool
     */
    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (_checkEmptyParent()) revert ParentNotFound();

        subPools[_subPoolAddress] = SubPoolLib.SubPoolInfo({id: nextSubPoolID, initialBalance: 0, balance: 0});

        _initialDeposit(_subPoolAddress, _amount);
        nextSubPoolID++;

        return subPools[_subPoolAddress].id;
    }

    /**
     * @notice update the initial deposit and balance on the parent subpool
     * @param _subPoolAddress The address of the subpool
     * @param _amount The amount of the initial deposit
     */
    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal {
        subPools[_subPoolAddress]._initialDeposit(_amount);
        _updateParentBalance(_amount);
    }

    /**
     * @notice Additional deposit of a sub pool
     * @param _subPoolAddress The address of the sub pool
     * @param _amount The amount of the additional deposit
     */
    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        bool _isNode = subPools[_subPoolAddress]._checkSenderIsNode(msg.sender, _subPoolAddress);
        if (!_isNode) revert NotAllowed();

        subPools[_subPoolAddress]._additionalDeposit(_amount);
        _updateParentBalance(_amount);
    }

    /**
     * @notice Update the balance of subpool itself on the parent subpool
     * @param _amount The amount of additional deposit
     */
    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }

    /**
     * @notice Check if the parent subpool is empty
     */
    function _checkEmptyParent() internal view returns (bool) {
        return parentSubPool == address(0);
    }
}
