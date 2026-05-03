// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title KeeperSakeVault — an on-chain keepsake, kept by a Keeper
/// @notice Users commit ERC20 to their heir. They must heartbeat() periodically.
///         If they go silent past `timeout`, anyone (typically a KeeperHub workflow)
///         can call execute(user) to deliver the assets — and the will note —
///         to the heir.
/// @dev    Funds stay in the user's wallet via ERC20 allowance — the vault only
///         pulls them at delivery time. Users can revoke at any time.
contract KeeperSakeVault {
    using SafeERC20 for IERC20;

    struct Will {
        address heir;
        IERC20 token;
        uint256 amount;
        bytes32 willNoteHash; // IPFS CID hash of the user's final words
        uint64 timeout;       // seconds of silence before delivery is allowed
        uint64 lastHeartbeat; // unix seconds of the last heartbeat
        bool delivered;
    }

    mapping(address => Will) public wills;

    event WillCommitted(
        address indexed user,
        address indexed heir,
        address indexed token,
        uint256 amount,
        bytes32 willNoteHash,
        uint64 timeout
    );
    event Heartbeat(address indexed user, uint64 timestamp);
    /// @notice Fired when a will has been delivered to its heir.
    /// @param caller The address that invoked `execute()` (KeeperHub workflow,
    ///        the heir, a bot, or anyone else — execute is permissionless).
    /// @dev   `token` is left non-indexed so that `caller` can take an indexed
    ///        slot. Frontends typically already know the token; they more often
    ///        want to filter by who triggered the delivery.
    event KeeperSakeDelivered(
        address indexed user,
        address indexed heir,
        address indexed caller,
        address token,
        uint256 amount,
        bytes32 willNoteHash
    );
    event WillRevoked(address indexed user);

    error NoWill();
    error AlreadyDelivered();
    error StillAlive(uint64 secondsRemaining);
    error ZeroHeir();
    error ZeroAmount();
    error ZeroTimeout();
    error SelfHeir();

    /// @notice Create or overwrite the caller's will. Resets the heartbeat to now.
    /// @dev    Caller must have approved this contract to spend `amount` of `token`.
    function commit(
        address heir,
        IERC20 token,
        uint256 amount,
        bytes32 willNoteHash,
        uint64 timeout
    ) external {
        if (heir == address(0)) revert ZeroHeir();
        if (heir == msg.sender) revert SelfHeir();
        if (amount == 0) revert ZeroAmount();
        if (timeout == 0) revert ZeroTimeout();

        wills[msg.sender] = Will({
            heir: heir,
            token: token,
            amount: amount,
            willNoteHash: willNoteHash,
            timeout: timeout,
            lastHeartbeat: uint64(block.timestamp),
            delivered: false
        });

        emit WillCommitted(msg.sender, heir, address(token), amount, willNoteHash, timeout);
        emit Heartbeat(msg.sender, uint64(block.timestamp));
    }

    /// @notice "I'm still alive." Resets the user's heartbeat to now.
    function heartbeat() external {
        Will storage w = wills[msg.sender];
        if (w.heir == address(0)) revert NoWill();
        if (w.delivered) revert AlreadyDelivered();
        w.lastHeartbeat = uint64(block.timestamp);
        emit Heartbeat(msg.sender, uint64(block.timestamp));
    }

    /// @notice Revoke the will. Heir gets nothing. Heartbeat data is wiped.
    function revoke() external {
        Will storage w = wills[msg.sender];
        if (w.heir == address(0)) revert NoWill();
        if (w.delivered) revert AlreadyDelivered();
        delete wills[msg.sender];
        emit WillRevoked(msg.sender);
    }

    /// @notice Permissionless. Anyone (a KeeperHub workflow, the heir, a bot)
    ///         can call this once the user's heartbeat has been silent for `timeout`.
    function execute(address user) external {
        Will storage w = wills[user];
        if (w.heir == address(0)) revert NoWill();
        if (w.delivered) revert AlreadyDelivered();

        uint256 elapsed = block.timestamp - w.lastHeartbeat;
        if (elapsed < w.timeout) revert StillAlive(w.timeout - uint64(elapsed));

        w.delivered = true;
        w.token.safeTransferFrom(user, w.heir, w.amount);

        emit KeeperSakeDelivered(
            user,
            w.heir,
            msg.sender,
            address(w.token),
            w.amount,
            w.willNoteHash
        );
    }

    // ─── views (KeeperHub reads these) ──────────────────────────────────────

    /// @notice Seconds since the user's last heartbeat. Returns 0 if no will.
    function silenceOf(address user) external view returns (uint256) {
        Will storage w = wills[user];
        if (w.heir == address(0)) return 0;
        return block.timestamp - w.lastHeartbeat;
    }

    /// @notice True iff `execute(user)` would succeed right now.
    function isExpired(address user) external view returns (bool) {
        Will storage w = wills[user];
        if (w.heir == address(0) || w.delivered) return false;
        return (block.timestamp - w.lastHeartbeat) >= w.timeout;
    }
}
