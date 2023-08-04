// SPDX-License-Identifier: MIT
pragma solidity =0.8.19;

import {IStrategyProxyFactory} from '../interfaces/strategyProxy/IStrategyProxyFactory.sol';
import {StrategyProxy, IStrategyProxy} from './StrategyProxy.sol';
import {IStrategy} from '../interfaces/strategy/IStrategy.sol';

/// ToDO: only deployer can build
contract StrategyProxyFactory is IStrategyProxyFactory {
    /// @inheritdoc IStrategyProxyFactory
    function build(IStrategy strategy_) public returns (address) {
        StrategyProxy strategyProxy = new StrategyProxy(strategy_);

        _setDeployerAsOwner(strategyProxy, msg.sender);

        emit IStrategyProxyFactory.StrategyProxyFactory_StrategyProxyCreated(
            address(strategyProxy),
            address(strategy_)
        );

        return address(strategyProxy);
    }

    /**
     * @notice set the deployer as the owner of the strategy proxy
     * @param _strategyProxy the strategy proxy to set the owner of
     * @param deployerAddress_ the address of the deployer
     */
    function _setDeployerAsOwner(StrategyProxy _strategyProxy, address deployerAddress_) private {
        _strategyProxy.transferOwnership(deployerAddress_);
    }
}
