// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./SubPoolNode.sol";
import "./lib/SubPoolLib.sol";


contract SubPoolManager {
    using SubPoolLib for SubPoolLib.SubPoolInfo;

    uint256 public nextSubPoolID = 1;
    
    mapping(address => SubPoolLib.SubPoolInfo) public subPools;

    error NotAllowed();
    
    function createMain(uint256 _amount) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode();
        address _subPoolAddress = address(_subPool);

        subPools[_subPoolAddress] = SubPoolLib.SubPoolInfo({
            id: nextSubPoolID,
            initialBalance: 0,
            balance: 0
        });

        _subPool.setParentSubPool(address(this));
        _initialDeposit(_subPoolAddress, _amount);
        nextSubPoolID++;

        return _subPoolAddress;
    }

    function createNode(address _parentSubPoolAddress, uint256 _amount) external returns (address, uint256) {
        SubPoolNode _subPool = new SubPoolNode();
        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _join(_parentSubPoolAddress, _subPoolAddress, _amount);

        return (_subPoolAddress, _subPoolId);
    }

    function _join(address _parentSubPoolAddress, address _subPoolAddress, uint256 _amount) internal returns (uint256) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentSubPoolAddress);
        SubPoolNode _subPool = SubPoolNode(_subPoolAddress);

        uint256 _subPoolId = _parentSubPool.join(_subPoolAddress, _amount);
        _subPool.setParentSubPool(_parentSubPoolAddress);

        return _subPoolId;
    }

    function _initialDeposit(address _subPoolAddress, uint256 _amount) internal {
        subPools[_subPoolAddress]._initialDeposit(_amount);
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) external {
        bool isNode = subPools[_subPoolAddress]._checkSenderIsNode(msg.sender, _subPoolAddress);
        if (!isNode) revert NotAllowed();

        subPools[_subPoolAddress]._additionalDeposit(_amount);
    }
}