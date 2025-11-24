// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title EduWordle
 * @notice A decentralized vocabulary game on Celo that rewards players with cUSD for solving daily word puzzles
 * @dev Implements secure puzzle verification, reward distribution, and hint purchases
 * 
 * Security Features:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - Ownable: Restricts admin functions to owner
 * - SafeERC20: Safe token transfers
 * - Hash-based puzzle storage: Solution never stored in plaintext
 * - Double-claim prevention: Tracks daily claims per address
 * - Checks-Effects-Interactions pattern: State changes before external calls
 */
contract EduWordle is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // ============ State Variables ============

    /// @notice cUSD token contract address on Celo
    IERC20 public immutable cusdToken;

    /// @notice Current day's puzzle solution hash (keccak256)
    bytes32 public currentSolutionHash;

    /// @notice Current day identifier (UTC day timestamp)
    uint256 public currentDay;

    /// @notice Base reward amount in cUSD (with 18 decimals)
    uint256 public baseRewardAmount;

    /// @notice Bonus reward for streak (multiplier in basis points, e.g., 15000 = 150%)
    uint256 public streakBonusBps;

    /// @notice Hint purchase price in cUSD
    uint256 public hintPrice;

    /// @notice Maximum number of hints per day per user
    uint256 public maxHintsPerDay;

    /// @notice Contract treasury balance
    uint256 public treasuryBalance;

    /// @notice Mapping: day => address => has claimed
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    /// @notice Mapping: day => address => number of hints purchased
    mapping(uint256 => mapping(address => uint256)) public hintsPurchased;

    /// @notice Mapping: address => current streak (consecutive days solved)
    mapping(address => uint256) public userStreaks;

    /// @notice Mapping: address => last day solved
    mapping(address => uint256) public lastSolvedDay;

    /// @notice Set of addresses that have solved today's puzzle
    EnumerableSet.AddressSet private todaySolvers;

    /// @notice Total number of solvers today
    uint256 public totalSolversToday;

    /// @notice Leaderboard contract address (optional)
    address public leaderboardContract;

    // ============ Events ============

    event PuzzleInitialized(uint256 indexed day, bytes32 solutionHash);
    event PuzzleSolved(address indexed solver, uint256 indexed day, uint256 reward, uint256 streak);
    event HintPurchased(address indexed buyer, uint256 indexed day, uint256 hintNumber);
    event RewardClaimed(address indexed claimer, uint256 amount);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event TreasuryWithdrawn(address indexed owner, uint256 amount);
    event RewardAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event HintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event StreakBonusUpdated(uint256 oldBonus, uint256 newBonus);

    // ============ Modifiers ============

    /// @notice Ensures the contract has sufficient funds
    modifier hasFunds(uint256 amount) {
        require(treasuryBalance >= amount, "EduWordle: Insufficient treasury funds");
        _;
    }

    /// @notice Ensures it's a new day (prevents replay on same day)
    modifier isNewDay() {
        uint256 today = getCurrentDay();
        require(today != currentDay, "EduWordle: Day already initialized");
        _;
    }

    // ============ Constructor ============

    /**
     * @param _cusdToken Address of cUSD token contract
     * @param _baseRewardAmount Base reward in cUSD (with 18 decimals, e.g., 1e18 = 1 cUSD)
     * @param _hintPrice Price per hint in cUSD (with 18 decimals)
     * @param _streakBonusBps Streak bonus in basis points (e.g., 15000 = 150%)
     */
    constructor(
        address _cusdToken,
        uint256 _baseRewardAmount,
        uint256 _hintPrice,
        uint256 _streakBonusBps
    ) Ownable(msg.sender) {
        require(_cusdToken != address(0), "EduWordle: Invalid cUSD address");
        require(_baseRewardAmount > 0, "EduWordle: Invalid reward amount");
        require(_hintPrice > 0, "EduWordle: Invalid hint price");
        require(_streakBonusBps <= 10000, "EduWordle: Bonus cannot exceed 100%");

        cusdToken = IERC20(_cusdToken);
        baseRewardAmount = _baseRewardAmount;
        hintPrice = _hintPrice;
        streakBonusBps = _streakBonusBps;
        maxHintsPerDay = 3; // Default: 3 hints per day

        currentDay = 0; // Initialize to 0, will be set on first puzzle
    }

    // ============ Admin Functions ============

    /**
     * @notice Initialize a new day's puzzle (admin only)
     * @param _solutionHash keccak256 hash of the solution word (with optional salt)
     * @dev Resets daily state and sets new puzzle
     */
    function initializeDay(bytes32 _solutionHash) external onlyOwner isNewDay {
        uint256 today = getCurrentDay();
        
        // Clear previous day's solvers set
        _clearSolversSet();
        
        currentSolutionHash = _solutionHash;
        currentDay = today;
        totalSolversToday = 0;

        emit PuzzleInitialized(today, _solutionHash);
    }

    /**
     * @notice Fund the contract treasury with cUSD
     * @param amount Amount of cUSD to fund (with 18 decimals)
     * @dev Transfers cUSD from caller to contract
     */
    function fundTreasury(uint256 amount) external {
        require(amount > 0, "EduWordle: Amount must be greater than 0");
        
        cusdToken.safeTransferFrom(msg.sender, address(this), amount);
        treasuryBalance += amount;

        emit TreasuryFunded(msg.sender, amount);
    }

    /**
     * @notice Withdraw excess funds from treasury (admin only)
     * @param amount Amount to withdraw
     * @param to Recipient address
     */
    function withdrawFunds(uint256 amount, address to) external onlyOwner {
        require(to != address(0), "EduWordle: Invalid recipient");
        require(amount > 0, "EduWordle: Amount must be greater than 0");
        require(treasuryBalance >= amount, "EduWordle: Insufficient balance");

        treasuryBalance -= amount;
        cusdToken.safeTransfer(to, amount);

        emit TreasuryWithdrawn(to, amount);
    }

    /**
     * @notice Update base reward amount (admin only)
     * @param _newAmount New base reward amount
     */
    function setBaseRewardAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "EduWordle: Invalid reward amount");
        
        uint256 oldAmount = baseRewardAmount;
        baseRewardAmount = _newAmount;

        emit RewardAmountUpdated(oldAmount, _newAmount);
    }

    /**
     * @notice Update hint price (admin only)
     * @param _newPrice New hint price
     */
    function setHintPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "EduWordle: Invalid hint price");
        
        uint256 oldPrice = hintPrice;
        hintPrice = _newPrice;

        emit HintPriceUpdated(oldPrice, _newPrice);
    }

    /**
     * @notice Update streak bonus (admin only)
     * @param _newBonus New streak bonus in basis points
     */
    function setStreakBonus(uint256 _newBonus) external onlyOwner {
        require(_newBonus <= 10000, "EduWordle: Bonus cannot exceed 100%");
        
        uint256 oldBonus = streakBonusBps;
        streakBonusBps = _newBonus;

        emit StreakBonusUpdated(oldBonus, _newBonus);
    }

    /**
     * @notice Update max hints per day (admin only)
     * @param _maxHints New maximum hints per day
     */
    function setMaxHintsPerDay(uint256 _maxHints) external onlyOwner {
        maxHintsPerDay = _maxHints;
    }

    /**
     * @notice Set leaderboard contract address (admin only)
     * @param _leaderboardContract Address of Leaderboard contract
     */
    function setLeaderboardContract(address _leaderboardContract) external onlyOwner {
        leaderboardContract = _leaderboardContract;
    }

    // ============ Public Functions ============

    /**
     * @notice Submit answer and claim reward if correct
     * @param guess The guessed word (will be hashed and compared)
     * @dev Implements checks-effects-interactions pattern
     * @dev Prevents double-claiming and validates solution
     */
    function submitAnswer(string memory guess) external nonReentrant {
        uint256 today = getCurrentDay();
        
        // Checks
        require(currentDay == today, "EduWordle: Puzzle not initialized for today");
        require(!hasClaimed[today][msg.sender], "EduWordle: Already claimed today");
        require(bytes(guess).length == 5, "EduWordle: Guess must be 5 letters");
        require(currentSolutionHash != bytes32(0), "EduWordle: No puzzle set");

        // Hash the guess (convert to uppercase and hash)
        bytes32 guessHash = keccak256(abi.encodePacked(_toUpperCase(guess)));
        
        require(guessHash == currentSolutionHash, "EduWordle: Incorrect answer");

        // Effects: Update state before external calls
        hasClaimed[today][msg.sender] = true;
        todaySolvers.add(msg.sender);
        totalSolversToday++;

        // Update streak first (needed for reward calculation)
        _updateStreak(msg.sender, today);

        // Calculate reward with streak bonus (after streak is updated)
        uint256 reward = _calculateReward(msg.sender, today);
        require(treasuryBalance >= reward, "EduWordle: Insufficient treasury funds");
        
        treasuryBalance -= reward;

        // Interactions: Transfer tokens
        cusdToken.safeTransfer(msg.sender, reward);

        // Update leaderboard if set (don't revert if call fails)
        if (leaderboardContract != address(0)) {
            // solhint-disable-next-line avoid-low-level-calls
            (bool success, ) = leaderboardContract.call(
                abi.encodeWithSignature("recordWin(address,uint256,uint256)", msg.sender, reward, userStreaks[msg.sender])
            );
            // Silently fail if leaderboard update fails (non-critical)
            success; // Suppress unused variable warning
        }

        emit PuzzleSolved(msg.sender, today, reward, userStreaks[msg.sender]);
        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @notice Purchase a hint (reveals one random correct letter position)
     * @dev Charges cUSD and emits hint event
     */
    function buyHint() external nonReentrant hasFunds(hintPrice) {
        uint256 today = getCurrentDay();
        
        require(currentDay == today, "EduWordle: Puzzle not initialized for today");
        require(hintsPurchased[today][msg.sender] < maxHintsPerDay, "EduWordle: Max hints reached");
        require(!hasClaimed[today][msg.sender], "EduWordle: Already solved today");

        // Transfer hint payment
        cusdToken.safeTransferFrom(msg.sender, address(this), hintPrice);
        treasuryBalance += hintPrice;

        // Increment hints purchased
        hintsPurchased[today][msg.sender]++;

        emit HintPurchased(msg.sender, today, hintsPurchased[today][msg.sender]);
    }

    // ============ View Functions ============

    /**
     * @notice Get reward amount for a user (including streak bonus)
     * @param user Address to check
     * @return Total reward amount in cUSD
     */
    function getRewardAmount(address user) external view returns (uint256) {
        uint256 today = getCurrentDay();
        return _calculateReward(user, today);
    }

    /**
     * @notice Check if user has claimed today
     * @param user Address to check
     * @return True if claimed, false otherwise
     */
    function hasUserClaimed(address user) external view returns (bool) {
        uint256 today = getCurrentDay();
        return hasClaimed[today][user];
    }

    /**
     * @notice Get user's current streak
     * @param user Address to check
     * @return Current streak count
     */
    function getUserStreak(address user) external view returns (uint256) {
        return userStreaks[user];
    }

    /**
     * @notice Get number of hints purchased today by user
     * @param user Address to check
     * @return Number of hints purchased
     */
    function getHintsPurchased(address user) external view returns (uint256) {
        uint256 today = getCurrentDay();
        return hintsPurchased[today][user];
    }

    /**
     * @notice Get current day identifier (UTC day timestamp)
     * @return Current day as timestamp
     */
    function getCurrentDay() public view returns (uint256) {
        // Returns UTC day as timestamp (midnight UTC)
        return (block.timestamp / 86400) * 86400;
    }

    /**
     * @notice Get total number of solvers today
     * @return Count of unique solvers
     */
    function getTotalSolversToday() external view returns (uint256) {
        return totalSolversToday;
    }

    /**
     * @notice Check if address solved today's puzzle
     * @param solver Address to check
     * @return True if solved, false otherwise
     */
    function isTodaySolver(address solver) external view returns (bool) {
        return todaySolvers.contains(solver);
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate reward with streak bonus
     * @param user Address to calculate for
     * @param day Current day
     * @return Total reward amount
     */
    function _calculateReward(address user, uint256 day) internal view returns (uint256) {
        uint256 streak = userStreaks[user];
        
        // If solving on a new day after previous solve, check if streak continues
        if (lastSolvedDay[user] > 0 && lastSolvedDay[user] < day - 86400) {
            // Streak broken (more than 1 day gap)
            return baseRewardAmount;
        }

        // Apply streak bonus
        if (streak > 1) {
            uint256 bonus = (baseRewardAmount * streakBonusBps * (streak - 1)) / 10000;
            return baseRewardAmount + bonus;
        }

        return baseRewardAmount;
    }

    /**
     * @notice Update user's streak
     * @param user Address to update
     * @param day Current day
     */
    function _updateStreak(address user, uint256 day) internal {
        uint256 lastSolved = lastSolvedDay[user];
        
        if (lastSolved == 0) {
            // First solve ever
            userStreaks[user] = 1;
        } else if (lastSolved == day - 86400) {
            // Consecutive day (yesterday)
            userStreaks[user] += 1;
        } else if (lastSolved < day - 86400) {
            // Streak broken (more than 1 day gap)
            userStreaks[user] = 1;
        }
        // If lastSolved == day, already solved today (shouldn't happen due to checks)

        lastSolvedDay[user] = day;
    }

    /**
     * @notice Convert string to uppercase (for consistent hashing)
     * @param str Input string
     * @return Uppercase string
     */
    function _toUpperCase(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(strBytes.length);
        
        for (uint256 i = 0; i < strBytes.length; i++) {
            // Convert lowercase to uppercase (a-z -> A-Z)
            if (strBytes[i] >= 0x61 && strBytes[i] <= 0x7A) {
                result[i] = bytes1(uint8(strBytes[i]) - 32);
            } else {
                result[i] = strBytes[i];
            }
        }
        
        return string(result);
    }

    /**
     * @notice Clear the solvers set (internal helper)
     */
    function _clearSolversSet() internal {
        uint256 length = todaySolvers.length();
        for (uint256 i = 0; i < length; i++) {
            todaySolvers.remove(todaySolvers.at(0));
        }
    }
}

