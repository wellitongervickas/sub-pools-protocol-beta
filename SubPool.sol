// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SubPool is Ownable {
    address public parentSubPool;
    uint256 public nextSubPoolID = 0;

    struct Fraction {
        uint256 value;
        uint256 divider;
    }

    struct ManagerInfo {
        uint256 balance;
        Fraction fee;
        address managerAddress;
    }
    
    ManagerInfo public manager;
    
    struct SubPoolInfo {
        uint256 id;
        uint256 initialBalance;
    }
    
    mapping(address => SubPoolInfo) public subPools;

    constructor(address _managerAddress, uint256[2] memory fee) {
        manager = ManagerInfo({
            managerAddress: _managerAddress,
            fee: Fraction({ value: fee[0], divider: fee[1] }),
            balance: 0
        });
    }

    function calculateManagerFee(uint256 _amount) external view returns (uint256) {
        return (_amount * manager.fee.value) / manager.fee.divider;
    }

    function setManagerBalance(uint256 _amount) external onlyOwner {
        manager.balance += _amount;
    }

    function setSubPoolBalance(address _subPoolAddress, uint256 _amount) external onlyOwner {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.initialBalance += _amount;
    }

    function join(address _subPoolAddress) external onlyOwner returns (uint256) {
        SubPoolInfo memory subPoolInfo = SubPoolInfo({
            id: nextSubPoolID,
            initialBalance: 0
        });
        
        subPools[_subPoolAddress] = subPoolInfo;
        nextSubPoolID++;

        return nextSubPoolID;
    }

    function setParentSubPool(address _parentSubPool) external onlyOwner {
        parentSubPool = _parentSubPool;
    }
}
