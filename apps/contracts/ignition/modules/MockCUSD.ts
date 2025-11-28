import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockCUSDModule = buildModule("MockCUSDModule", (m) => {
  // Deploy MockERC20 as cUSD
  const mockCUSD = m.contract("MockERC20", [
    "Celo Dollar",  // name
    "cUSD",         // symbol
    18              // decimals
  ]);

  return { mockCUSD };
});

export default MockCUSDModule;





