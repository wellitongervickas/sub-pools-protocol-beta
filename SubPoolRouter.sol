// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "./SubPool.sol";

contract SubPoolRouter is SubPool {
    constructor() {
        parentSubPool = address(0);
    }

    function setParentSubPool(address _parentSubPool) override external {
        // do not change parent since heres the router
    }

    function joinParent(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) external returns (uint256) {
        uint256 _currentID = SubPool(_parentSubPoolAddress).join(_subPoolAddress, _amount);

        SubPool(_subPoolAddress).setParentSubPool(_parentSubPoolAddress);

        return _currentID;
    }

    function initialDeposit(address _subPoolAddress, uint256 _amount) override external  {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.initialBalance = _amount;
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) override external  {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.balance += _amount;
    }
}
