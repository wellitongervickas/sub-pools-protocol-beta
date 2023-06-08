// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SubPoolNode is Ownable {
    address public parentSubPool;
    uint256 public nextSubPoolID = 0;

    struct SubPoolInfo {
        uint256 id;
        uint256 initialBalance;
        uint256 balance;
    }
    
    mapping(address => SubPoolInfo) public subPools;
  
    error ParentNotFound();

    function setParentSubPool(address _parentSubPool) external virtual onlyOwner {
        parentSubPool = _parentSubPool;
    }

    function _checkEmptyParentSubPool() internal view virtual returns (bool) {
        return parentSubPool == address(0);
    }

    function join(address _subPoolAddress, uint256 _amount) external onlyOwner returns (uint256) {
        if (_checkEmptyParentSubPool()) revert ParentNotFound();

        subPools[_subPoolAddress] = SubPoolInfo({
            id: nextSubPoolID++,
            initialBalance: 0,
            balance: 0
        });

        _initialDeposit(_subPoolAddress, _amount);

        return subPools[_subPoolAddress].id;
    }
    
    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal virtual onlyOwner {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.initialBalance = _amount;

        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) external virtual onlyOwner {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.balance += _amount;

        SubPoolNode _parentSubPool = SubPoolNode(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }
}
