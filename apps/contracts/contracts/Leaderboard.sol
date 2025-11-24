// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Leaderboard
 * @notice On-chain leaderboard tracking for EduWordle
 * @dev Tracks top players by total wins, streaks, and daily performance
 */
contract Leaderboard is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ============ Structs ============

    struct PlayerStats {
        uint256 totalWins;
        uint256 longestStreak;
        uint256 currentStreak;
        uint256 totalRewardsEarned;
        uint256 lastWinDay;
        bool exists;
    }

    // ============ State Variables ============

    /// @notice Reference to main EduWordle contract
    address public immutable eduWordleContract;

    /// @notice Mapping: address => PlayerStats
    mapping(address => PlayerStats) public playerStats;

    /// @notice Set of all registered players
    EnumerableSet.AddressSet private allPlayers;

    /// @notice Top players by total wins (addresses)
    address[] public topPlayersByWins;

    /// @notice Top players by longest streak (addresses)
    address[] public topPlayersByStreak;

    /// @notice Maximum number of top players to track
    uint256 public maxTopPlayers;

    // ============ Events ============

    event PlayerRegistered(address indexed player);
    event StatsUpdated(
        address indexed player,
        uint256 totalWins,
        uint256 longestStreak,
        uint256 currentStreak
    );
    event TopPlayersUpdated(string category, address[] players);

    // ============ Modifiers ============

    /// @notice Only EduWordle contract can call
    modifier onlyEduWordle() {
        require(msg.sender == eduWordleContract, "Leaderboard: Only EduWordle can call");
        _;
    }

    // ============ Constructor ============

    /**
     * @param _eduWordleContract Address of EduWordle contract
     * @param _maxTopPlayers Maximum number of top players to track
     */
    constructor(address _eduWordleContract, uint256 _maxTopPlayers) Ownable(msg.sender) {
        require(_eduWordleContract != address(0), "Leaderboard: Invalid contract address");
        require(_maxTopPlayers > 0, "Leaderboard: Invalid max players");

        eduWordleContract = _eduWordleContract;
        maxTopPlayers = _maxTopPlayers;
    }

    // ============ External Functions ============

    /**
     * @notice Update player stats after a win (called by EduWordle)
     * @param player Address of the player
     * @param rewardAmount Reward earned in this win
     * @param currentStreak Current streak after this win
     */
    function recordWin(
        address player,
        uint256 rewardAmount,
        uint256 currentStreak
    ) external onlyEduWordle {
        require(player != address(0), "Leaderboard: Invalid player address");

        PlayerStats storage stats = playerStats[player];

        // Register player if first time
        if (!stats.exists) {
            stats.exists = true;
            allPlayers.add(player);
            emit PlayerRegistered(player);
        }

        // Update stats
        stats.totalWins += 1;
        stats.totalRewardsEarned += rewardAmount;
        stats.currentStreak = currentStreak;
        stats.lastWinDay = block.timestamp / 86400; // UTC day

        // Update longest streak if current is longer
        if (currentStreak > stats.longestStreak) {
            stats.longestStreak = currentStreak;
        }

        // Update top players lists
        _updateTopPlayersByWins(player);
        _updateTopPlayersByStreak(player);

        emit StatsUpdated(player, stats.totalWins, stats.longestStreak, currentStreak);
    }

    /**
     * @notice Update max top players (admin only)
     * @param _maxTopPlayers New maximum
     */
    function setMaxTopPlayers(uint256 _maxTopPlayers) external onlyOwner {
        require(_maxTopPlayers > 0, "Leaderboard: Invalid max players");
        maxTopPlayers = _maxTopPlayers;
    }

    // ============ View Functions ============

    /**
     * @notice Get player stats
     * @param player Address to query
     * @return stats PlayerStats struct
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }

    /**
     * @notice Get top N players by total wins
     * @param n Number of players to return
     * @return players Array of addresses
     * @return wins Array of win counts
     */
    function getTopPlayersByWins(uint256 n) external view returns (address[] memory players, uint256[] memory wins) {
        uint256 length = topPlayersByWins.length;
        uint256 returnLength = n > length ? length : n;

        players = new address[](returnLength);
        wins = new uint256[](returnLength);

        for (uint256 i = 0; i < returnLength; i++) {
            players[i] = topPlayersByWins[i];
            wins[i] = playerStats[topPlayersByWins[i]].totalWins;
        }
    }

    /**
     * @notice Get top N players by longest streak
     * @param n Number of players to return
     * @return players Array of addresses
     * @return streaks Array of streak values
     */
    function getTopPlayersByStreak(uint256 n) external view returns (address[] memory players, uint256[] memory streaks) {
        uint256 length = topPlayersByStreak.length;
        uint256 returnLength = n > length ? length : n;

        players = new address[](returnLength);
        streaks = new uint256[](returnLength);

        for (uint256 i = 0; i < returnLength; i++) {
            players[i] = topPlayersByStreak[i];
            streaks[i] = playerStats[topPlayersByStreak[i]].longestStreak;
        }
    }

    /**
     * @notice Get total number of registered players
     * @return count Total players
     */
    function getTotalPlayers() external view returns (uint256) {
        return allPlayers.length();
    }

    /**
     * @notice Check if address is a registered player
     * @param player Address to check
     * @return True if registered
     */
    function isRegisteredPlayer(address player) external view returns (bool) {
        return playerStats[player].exists;
    }

    // ============ Internal Functions ============

    /**
     * @notice Update top players list by wins
     * @param player Address to potentially add
     */
    function _updateTopPlayersByWins(address player) internal {
        uint256 playerWins = playerStats[player].totalWins;
        uint256 length = topPlayersByWins.length;

        // Find insertion point
        int256 insertIndex = -1;
        for (uint256 i = 0; i < length; i++) {
            if (playerWins > playerStats[topPlayersByWins[i]].totalWins) {
                insertIndex = int256(i);
                break;
            }
        }

        // If player is already in list, remove first
        for (uint256 i = 0; i < length; i++) {
            if (topPlayersByWins[i] == player) {
                _removeFromArray(topPlayersByWins, i);
                length--;
                break;
            }
        }

        // Insert at appropriate position
        if (insertIndex == -1) {
            // Add to end if not in top list yet
            if (length < maxTopPlayers) {
                topPlayersByWins.push(player);
            }
        } else {
            // Insert at position
            topPlayersByWins.push(player); // Add to end first
            for (uint256 i = uint256(insertIndex); i < topPlayersByWins.length - 1; i++) {
                topPlayersByWins[i] = topPlayersByWins[i + 1];
            }
            topPlayersByWins[topPlayersByWins.length - 1] = player;

            // Trim if exceeds max
            if (topPlayersByWins.length > maxTopPlayers) {
                topPlayersByWins.pop();
            }
        }

        emit TopPlayersUpdated("wins", topPlayersByWins);
    }

    /**
     * @notice Update top players list by streak
     * @param player Address to potentially add
     */
    function _updateTopPlayersByStreak(address player) internal {
        uint256 playerStreak = playerStats[player].longestStreak;
        uint256 length = topPlayersByStreak.length;

        // Find insertion point
        int256 insertIndex = -1;
        for (uint256 i = 0; i < length; i++) {
            if (playerStreak > playerStats[topPlayersByStreak[i]].longestStreak) {
                insertIndex = int256(i);
                break;
            }
        }

        // If player is already in list, remove first
        for (uint256 i = 0; i < length; i++) {
            if (topPlayersByStreak[i] == player) {
                _removeFromArray(topPlayersByStreak, i);
                length--;
                break;
            }
        }

        // Insert at appropriate position
        if (insertIndex == -1) {
            // Add to end if not in top list yet
            if (length < maxTopPlayers) {
                topPlayersByStreak.push(player);
            }
        } else {
            // Insert at position
            topPlayersByStreak.push(player);
            for (uint256 i = uint256(insertIndex); i < topPlayersByStreak.length - 1; i++) {
                topPlayersByStreak[i] = topPlayersByStreak[i + 1];
            }
            topPlayersByStreak[topPlayersByStreak.length - 1] = player;

            // Trim if exceeds max
            if (topPlayersByStreak.length > maxTopPlayers) {
                topPlayersByStreak.pop();
            }
        }

        emit TopPlayersUpdated("streak", topPlayersByStreak);
    }

    /**
     * @notice Remove element from array at index
     * @param array Array to modify
     * @param index Index to remove
     */
    function _removeFromArray(address[] storage array, uint256 index) internal {
        require(index < array.length, "Leaderboard: Index out of bounds");
        
        for (uint256 i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.pop();
    }
}

