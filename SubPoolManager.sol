// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./SubPoolNode.sol";
import "./SubPoolMain.sol";

contract SubPoolManager {
    function createMain() external returns (address) {
        SubPoolMain subPool = new SubPoolMain();
        return address(subPool);
    }

    function createNode() external returns (address) {
        SubPoolNode subPool = new SubPoolNode();
        return address(subPool);
    }

    function join(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) external returns (uint256) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        SubPoolNode _subPool = SubPoolNode(_subPoolAddress);

        uint256 subPoolId = _parentSubPool.join(_subPoolAddress, _amount);
        _subPool.setParentSubPool(_parentSubPoolAddress);

        return subPoolId;
    }
}