// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;
import '../SubPoolNode.sol';
import '../lib/SubPoolLib.sol';

contract FakeParent {
    using SubPoolLib for SubPoolLib.SubPool;

    mapping(address => SubPoolLib.SubPool) public subPools;

    function deposit(address _subPoolAddress, uint256 _amount) external {
        subPools[_subPoolAddress]._deposit(_amount);
    }

    function join(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) external {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        _parentSubPool.join(_subPoolAddress, _amount);
    }
}
