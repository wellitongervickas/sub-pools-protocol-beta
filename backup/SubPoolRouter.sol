// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SubPool.sol";

contract SubPoolRouter is SubPool {
    error NotAllowed();

    function _setParentSubPool(address /* _parentSubPool */) external pure override {
        revert NotAllowed();
    }

    function _checkEmptyParentSubPool() override internal view returns (bool) {
        return parentSubPool != address(0);
    }

    function _initialDeposit(address _subPoolAddress, uint256 _amount) override internal  {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.initialBalance = _amount;
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) override external  {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.balance += _amount;
    }
}
