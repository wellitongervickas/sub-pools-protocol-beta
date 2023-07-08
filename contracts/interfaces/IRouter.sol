// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {FractionLib} from '../lib/Fraction.sol';

interface IRouter {
    event ChildrenCreated(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    event ChildrenJoined(address indexed _nodeAddress, uint256 indexed _subPoolId, uint256 _amount);
    event ManagerDeposited(address indexed _managerAddress, uint256 _amount);
    event ManagerWithdrew(address indexed _managerAddress, uint256 _amount);

    error NotChildrenManager();

    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) external returns (address);

    function join(
        address _parentNodeAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) external returns (address);

    function additionalDeposit(address _nodeAddress, uint256 _amount) external;

    function withdrawBalance(address _nodeAddress, uint256 _amount) external;

    function withdrawInitialBalance(address _nodeAddress, uint256 _amount) external;
}
