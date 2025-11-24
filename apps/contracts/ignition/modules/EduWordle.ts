import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getAddress } from "viem";

// cUSD addresses on Celo networks (checksummed)
const CUSD_ADDRESSES = {
  celo: getAddress("0x765DE816845861e75A25fCA122bb6898B8B1282a"), // Mainnet
  alfajores: getAddress("0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"), // Alfajores
  sepolia: getAddress("0x1C7D4B196Cb0C7B01d743Fbc6116a902379C7238"), // Sepolia
};

const EduWordleModule = buildModule("EduWordleModule", (m) => {
  // Configuration parameters
  const baseRewardAmount = m.getParameter("baseRewardAmount", "1000000000000000000"); // 1 cUSD (18 decimals)
  const hintPrice = m.getParameter("hintPrice", "100000000000000000"); // 0.1 cUSD
  const streakBonusBps = m.getParameter("streakBonusBps", "5000"); // 50% bonus per streak day

  // Get network to determine cUSD address (default: sepolia)
  const network = m.getParameter("network", "sepolia");
  const cusdAddress = m.getParameter(
    "cusdAddress",
    network === "celo" 
      ? CUSD_ADDRESSES.celo 
      : network === "alfajores"
      ? CUSD_ADDRESSES.alfajores
      : CUSD_ADDRESSES.sepolia // Default to Sepolia
  );

  // Deploy EduWordle contract
  const eduWordle = m.contract("EduWordle", [
    cusdAddress,
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

export default EduWordleModule;

