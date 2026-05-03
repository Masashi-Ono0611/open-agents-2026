// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Faucet-style mock USDC for local Hardhat tests. 6 decimals like real USDC.
///         On Base Sepolia we use Circle's official USDC at
///         0x036CbD53842c5426634e7929541eC2318f3dCF7e and ignore this file.
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USD Coin", "USDC") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Anyone can mint 100 USDC for themselves once per call. Tests only.
    function faucet() external {
        _mint(msg.sender, 100 * 1e6);
    }
}
