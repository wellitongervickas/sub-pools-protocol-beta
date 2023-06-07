// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// import "@openzeppelin/contracts/access/Ownable.sol";

contract SubPool {
    address public parentSubPool;
    uint256 public nextSubPoolID = 0;

    // struct Fraction {
    //     uint256 value;
    //     uint256 divider;
    // }

    // struct ManagerInfo {
    //     uint256 balance;
    //     Fraction fee;
    //     address managerAddress;
    // }
    
    // ManagerInfo public manager;
    
    struct SubPoolInfo {
        uint256 id;
        uint256 initialBalance; // initial deposit split by ratio
        uint256 balance; // additional deposit
    }
    
    mapping(address => SubPoolInfo) public subPools;

    // constructor(address _managerAddress, uint256[2] memory fee) {
    //     manager = ManagerInfo({
    //         managerAddress: _managerAddress,
    //         fee: Fraction({ value: fee[0], divider: fee[1] }),
    //         balance: 0
    //     });
    // }

    function _setParentSubPool(address _parentSubPool) external virtual {
        parentSubPool = _parentSubPool;
    }

    // function calculateManagerFee(uint256 _amount) external view returns (uint256) {
    //     return (_amount * manager.fee.value) / manager.fee.divider;
    // }

    // function setManagerBalance(uint256 _amount) external {
    //     manager.balance += _amount;
    // }

    function join(address _subPoolAddress, uint256 _amount) external returns (uint256) {
        subPools[_subPoolAddress] = SubPoolInfo({
            id: nextSubPoolID++,
            initialBalance: 0,
            balance: 0
        });

        SubPool(_subPoolAddress)._setParentSubPool(address(this));
        SubPool(this).initialDeposit(_subPoolAddress, _amount);

        return subPools[_subPoolAddress].id;
    }
    
    function initialDeposit(address _subPoolAddress, uint256 _amount) external virtual {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.initialBalance = _amount;

        SubPool _parentSubPool = SubPool(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }

    function additionalDeposit(address _subPoolAddress, uint256 _amount) external virtual {
        SubPoolInfo storage subPoolInfo = subPools[_subPoolAddress];
        subPoolInfo.balance += _amount;

        SubPool _parentSubPool = SubPool(parentSubPool);
        _parentSubPool.additionalDeposit(address(this), _amount);
    }
}
