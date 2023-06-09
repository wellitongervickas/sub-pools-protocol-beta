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

    function setParentSubPool(address _parentSubPool) external onlyOwner {
        parentSubPool = _parentSubPool;
    }

    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (_checkEmptyParentSubPool()) revert ParentNotFound();

        subPools[_subPoolAddress] = SubPoolLib.SubPoolInfo({id: nextSubPoolID, initialBalance: 0, balance: 0});

        _initialDeposit(_subPoolAddress, _amount);
        nextSubPoolID++;

        return subPools[_subPoolAddress].id;
    }

    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal {
        subPools[_subPoolAddress]._initialDeposit(_amount);
        _updateParentBalance(_amount);
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        bool _isNode = subPools[_subPoolAddress]._checkSenderIsNode(msg.sender, _subPoolAddress);
        if (!_isNode) revert NotAllowed();

        subPools[_subPoolAddress]._additionalDeposit(_amount);
        _updateParentBalance(_amount);
    }

    function _updateParentBalance(uint256 _amount) internal {
        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }

    function _checkEmptyParentSubPool() internal view returns (bool) {
        return parentSubPool == address(0);
    }
}
