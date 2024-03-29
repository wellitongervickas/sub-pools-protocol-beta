// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {ChildrenControl, IChildrenControl} from '../children/ChildrenControl.sol';
import {Children} from '../children/Children.sol';
import {FractionLib} from '../lib/Fraction.sol';
import {IRouter} from '../interfaces/router/IRouter.sol';

contract Router is IRouter, ChildrenControl {
    modifier onlyChildrenManager(address _childrenAddress) {
        (address _managerAddress, , , ) = Children(_childrenAddress).manager();
        if (_managerAddress != msg.sender) revert IRouter.NotChildrenManager();
        _;
    }

    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) external returns (address) {
        address _childrenAddress = _createChildren(
            address(this),
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount,
            _maxAdditionalDeposit
        );

        uint256 _id = _setupChildren(_childrenAddress, msg.sender, _amount);

        emit ChildrenCreated(_childrenAddress, _id, _amount);
        return _childrenAddress;
    }

    function join(
        address _parentAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) external returns (address) {
        Children _parentChildren = Children(_parentAddress);

        address _childrenAddress = _createChildren(
            _parentAddress,
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount,
            _maxAdditionalDeposit
        );

        uint256 _id = _parentChildren.join(_childrenAddress, msg.sender, _amount);

        emit ChildrenJoined(_childrenAddress, _id, _amount);
        return _childrenAddress;
    }

    function _createChildren(
        address _parentAddress,
        address _managerAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses,
        uint256 _lockperiod,
        uint256 _requiredInitialAmount,
        uint256 _maxAdditionalDeposit
    ) internal returns (address) {
        Children _children = new Children(
            _managerAddress,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount,
            _maxAdditionalDeposit
        );

        address _childrenAddress = address(_children);
        _children.setParent(_parentAddress);

        return _childrenAddress;
    }

    function withdraw(uint256 _amount) public override onlyChildren(msg.sender) {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public override onlyChildren(msg.sender) {
        super.cashback(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function deposit(uint256 _amount) public override onlyChildren(msg.sender) {
        super.deposit(_amount);
        emit ManagerDeposited(msg.sender, _amount);
    }

    function additionalDeposit(
        address _childrenAddress,
        uint256 _amount
    ) external onlyChildrenManager(_childrenAddress) {
        if (!_checkChildrenParentIsRouter(_childrenAddress)) {
            return Children(_childrenAddress).additionalDeposit(_amount);
        }

        _increaseChildrenBalance(_childrenAddress, _amount);

        emit ManagerDeposited(_childrenAddress, _amount);
    }

    function withdrawBalance(address _childrenAddress, uint256 _amount) external onlyChildrenManager(_childrenAddress) {
        if (!_checkChildrenParentIsRouter(_childrenAddress)) {
            return Children(_childrenAddress).withdrawBalance(_amount);
        }

        _decreaseChildrenBalance(_childrenAddress, _amount);

        emit ManagerWithdrew(_childrenAddress, _amount);
    }

    function withdrawInitialBalance(
        address _childrenAddress,
        uint256 _amount
    ) external onlyChildrenManager(_childrenAddress) {
        if (!_checkChildrenParentIsRouter(_childrenAddress)) {
            return Children(_childrenAddress).withdrawInitialBalance(_amount);
        }

        _decreaseChildrenInitialBalance(_childrenAddress, _amount);

        emit ManagerWithdrew(_childrenAddress, _amount);
    }

    function _decreaseChildrenInitialBalance(
        address _nodeAddess,
        uint256 _amount
    ) internal override onlyUnlockedPeriod(Children(_nodeAddess).lockPeriod()) {
        super._decreaseChildrenInitialBalance(_nodeAddess, _amount);
    }

    function _checkChildrenParentIsRouter(address _childrenAddress) private view returns (bool) {
        return Children(_childrenAddress).parent() == address(this);
    }
}
