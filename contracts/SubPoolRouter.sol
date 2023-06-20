// SPDX-License-Identifier: MIT
pragma solidity =0.8.18;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './SubPoolNode.sol';
import './SubPool.sol';
import './lib/SubPoolLib.sol';
import './lib/Fraction.sol';

contract SubPoolRouter is SubPool {
    using SubPoolLib for SubPoolLib.SubPool;
    using Counters for Counters.Counter;

    event SubPoolCreated(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolJoined(address indexed _subPoolAddress, uint256 indexed _subPoolId, uint256 _amount);
    event SubPoolDeposited(address indexed _subPoolAddress, uint256 _amount);

    /**
     * @dev Create a new root subpool
     * @param _amount initial amount deposited by manager
     * @param _invitedAddresses list of addresses invited by manager
     * @return address of the new root subpool
     */
    function create(
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _id = _updateCurrentID();

        subPools[_subPoolAddress] = SubPoolLib.SubPool({
            managerAddress: msg.sender,
            id: _id,
            initialBalance: _amount,
            balance: 0
        });

        _setParent(_subPool, address(this));

        emit SubPoolCreated(_subPoolAddress, subPools[_subPoolAddress].id, _amount);
        return _subPoolAddress;
    }

    /**
     * @dev Set subpool parent by address
     * @param _subPool subpool instance
     * @param _parentAddress address of the parent subpool
     */
    function _setParent(SubPoolNode _subPool, address _parentAddress) internal {
        _subPool.setParent(_parentAddress);
    }

    /**
     * @dev Join an existing subpool as node
     * @param _parentAddress address of the parent subpool
     * @param _amount initial amount deposited by manager of node
     * @param _invitedAddresses list of addresses invited by manager of node
     * @return address of the new node subpool
     */
    function join(
        address _parentAddress,
        uint256 _amount,
        FractionLib.Fraction memory _fees,
        address[] memory _invitedAddresses
    ) external returns (address) {
        SubPoolNode _parentSubPool = SubPoolNode(_parentAddress);
        SubPoolNode _subPool = new SubPoolNode(msg.sender, _amount, _fees, _invitedAddresses);

        address _subPoolAddress = address(_subPool);
        uint256 _subPoolId = _joinParent(_parentSubPool, _subPoolAddress, _amount);

        _setParent(_subPool, _parentAddress);

        emit SubPoolJoined(_subPoolAddress, _subPoolId, _amount);
        return _subPoolAddress;
    }

    /**
     * @dev join parent as subpool
     * @param _parentSubPool instance of parent subpool
     * @param _subPoolAddress address of the node subpool
     * @param _amount initial amount deposited by manager of node
     */
    function _joinParent(
        SubPoolNode _parentSubPool,
        address _subPoolAddress,
        uint256 _amount
    ) internal returns (uint256) {
        return _parentSubPool.join(_subPoolAddress, _amount);
    }

    /**
     * @dev Deposit to a subpool root
     * @param _amount amount to deposit
     */
    function deposit(uint256 _amount) public override {
        super.deposit(_amount);
        emit SubPoolDeposited(msg.sender, _amount);
    }
}
