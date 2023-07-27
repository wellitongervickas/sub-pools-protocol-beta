// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

interface IChildren {
    error ExceedMaxAdditionalDeposit();

    function setParent(address _parent) external;

    function join(address _nodeAddress, address _managerAddress, uint256 _amount) external returns (uint256);

    function additionalDeposit(uint256 _amount) external;

    function withdrawBalance(uint256 _amount) external;

    function withdrawInitialBalance(uint256 _amount) external;
}
