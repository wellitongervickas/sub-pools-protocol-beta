// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {Node, INode} from './Node.sol';
import {Children} from './Children.sol';
import {FractionLib} from './lib/Fraction.sol';
import {IRouter} from './interfaces/IRouter.sol';

contract Router is IRouter, Node {
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
        Children _children = new Children(
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount,
            _maxAdditionalDeposit
        );

        address _childrenAddress = address(_children);
        uint256 _id = _setupChildren(_childrenAddress, msg.sender, _amount);

        _setupChildrenParent(_children, address(this));

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

        Children _children = new Children(
            msg.sender,
            _amount,
            _fees,
            _invitedAddresses,
            _lockperiod,
            _requiredInitialAmount,
            _maxAdditionalDeposit
        );

        address _childrenAddress = address(_children);
        uint256 _childrenId = _parentChildren.join(_childrenAddress, msg.sender, _amount);

        _setupChildrenParent(_children, _parentAddress);

        emit ChildrenJoined(_childrenAddress, _childrenId, _amount);
        return _childrenAddress;
    }

    function _setupChildrenParent(Children _children, address _parentAddress) private {
        _children.setParent(_parentAddress);
    }

    function withdraw(uint256 _amount) public override OnlyChildren(msg.sender) {
        super.withdraw(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function cashback(uint256 _amount) public override OnlyChildren(msg.sender) {
        super.cashback(_amount);
        emit ManagerWithdrew(msg.sender, _amount);
    }

    function deposit(uint256 _amount) public override OnlyChildren(msg.sender) {
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
