import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EduWordleWithMockCUSDModule = buildModule("EduWordleWithMockCUSDModule", (m) => {
  // Use the deployed MockERC20 address
  const mockCUSDAddress = m.getParameter("mockCUSDAddress", "0x644160A6e05D96fA84dc5525E1E5CC213D9F3a13");

  // Configuration parameters
  const baseRewardAmount = m.getParameter("baseRewardAmount", "1000000000000000000"); // 1 cUSD (18 decimals)
  const hintPrice = m.getParameter("hintPrice", "100000000000000000"); // 0.1 cUSD
  const streakBonusBps = m.getParameter("streakBonusBps", "5000"); // 50% bonus per streak day

  // Deploy EduWordle contract with MockERC20
  const eduWordle = m.contract("EduWordle", [
    mockCUSDAddress,
    baseRewardAmount,
    hintPrice,
    streakBonusBps,
  ]);

  // Deploy Leaderboard contract
  const maxTopPlayers = m.getParameter("maxTopPlayers", "100");
  const leaderboard = m.contract("Leaderboard", [
    eduWordle,
    maxTopPlayers,
  ]);

  // Set leaderboard in EduWordle
  m.call(eduWordle, "setLeaderboardContract", [leaderboard]);

  return { eduWordle, leaderboard };
});

export default EduWordleWithMockCUSDModule;


