import { expect } from "chai";
import { ethers } from "hardhat";
import { EduWordle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("EduWordle", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployEduWordleFixture() {
    const [owner, player1, player2, treasury] = await ethers.getSigners();

    // Deploy mock cUSD token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const cusd = await MockERC20.deploy("Celo Dollar", "cUSD", 18);
    await cusd.waitForDeployment();

    // Deploy EduWordle
    const EduWordle = await ethers.getContractFactory("EduWordle");
    const baseReward = ethers.parseEther("1"); // 1 cUSD
    const hintPrice = ethers.parseEther("0.1"); // 0.1 cUSD
    const streakBonus = 5000; // 50% bonus per streak day

    const eduWordle = await EduWordle.deploy(
      await cusd.getAddress(),
      baseReward,
      hintPrice,
      streakBonus
    );
    await eduWordle.waitForDeployment();

    // Fund treasury
    const treasuryAmount = ethers.parseEther("1000");
    await cusd.mint(treasury.address, treasuryAmount);
    await cusd.connect(treasury).approve(await eduWordle.getAddress(), treasuryAmount);
    await eduWordle.connect(treasury).fundTreasury(treasuryAmount);

    // Mint some cUSD for players
    await cusd.mint(player1.address, ethers.parseEther("100"));
    await cusd.mint(player2.address, ethers.parseEther("100"));

    return { eduWordle, cusd, owner, player1, player2, treasury, baseReward, hintPrice };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { eduWordle, owner } = await loadFixture(deployEduWordleFixture);
      expect(await eduWordle.owner()).to.equal(owner.address);
    });

    it("Should set correct initial values", async function () {
      const { eduWordle, baseReward, hintPrice } = await loadFixture(deployEduWordleFixture);
      expect(await eduWordle.baseRewardAmount()).to.equal(baseReward);
      expect(await eduWordle.hintPrice()).to.equal(hintPrice);
      expect(await eduWordle.maxHintsPerDay()).to.equal(3);
    });
  });

  describe("Puzzle Management", function () {
    it("Should allow owner to initialize day", async function () {
      const { eduWordle, owner } = await loadFixture(deployEduWordleFixture);
      const solution = "REACT";
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));

      await expect(eduWordle.connect(owner).initializeDay(solutionHash))
        .to.emit(eduWordle, "PuzzleInitialized");
    });

    it("Should prevent non-owner from initializing", async function () {
      const { eduWordle, player1 } = await loadFixture(deployEduWordleFixture);
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes("REACT"));

      await expect(
        eduWordle.connect(player1).initializeDay(solutionHash)
      ).to.be.revertedWithCustomError(eduWordle, "OwnableUnauthorizedAccount");
    });

    it("Should prevent initializing same day twice", async function () {
      const { eduWordle, owner } = await loadFixture(deployEduWordleFixture);
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes("REACT"));

      await eduWordle.connect(owner).initializeDay(solutionHash);
      await expect(
        eduWordle.connect(owner).initializeDay(solutionHash)
      ).to.be.revertedWith("EduWordle: Day already initialized");
    });
  });

  describe("Answer Submission", function () {
    it("Should reward correct answer", async function () {
      const { eduWordle, cusd, player1, owner, baseReward } = await loadFixture(deployEduWordleFixture);
      
      // Initialize puzzle
      const solution = "REACT";
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      // Get initial balance
      const initialBalance = await cusd.balanceOf(player1.address);

      // Submit correct answer
      await expect(eduWordle.connect(player1).submitAnswer(solution))
        .to.emit(eduWordle, "PuzzleSolved")
        .to.emit(eduWordle, "RewardClaimed");

      // Check balance increased
      const finalBalance = await cusd.balanceOf(player1.address);
      expect(finalBalance - initialBalance).to.equal(baseReward);
    });

    it("Should reject incorrect answer", async function () {
      const { eduWordle, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solution = "REACT";
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      await expect(
        eduWordle.connect(player1).submitAnswer("WRONG")
      ).to.be.revertedWith("EduWordle: Incorrect answer");
    });

    it("Should prevent double claiming", async function () {
      const { eduWordle, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solution = "REACT";
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      await eduWordle.connect(player1).submitAnswer(solution);
      
      await expect(
        eduWordle.connect(player1).submitAnswer(solution)
      ).to.be.revertedWith("EduWordle: Already claimed today");
    });

    it("Should reject answer before puzzle initialized", async function () {
      const { eduWordle, player1 } = await loadFixture(deployEduWordleFixture);
      
      await expect(
        eduWordle.connect(player1).submitAnswer("REACT")
      ).to.be.revertedWith("EduWordle: Puzzle not initialized for today");
    });

    it("Should reject non-5-letter words", async function () {
      const { eduWordle, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes("REACT"));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      await expect(
        eduWordle.connect(player1).submitAnswer("REAC")
      ).to.be.revertedWith("EduWordle: Guess must be 5 letters");
    });
  });

  describe("Streaks", function () {
    it("Should track streaks correctly", async function () {
      const { eduWordle, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solution1 = "REACT";
      const solution2 = "WORLD";
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes(solution1.toUpperCase()));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes(solution2.toUpperCase()));

      // Day 1
      await eduWordle.connect(owner).initializeDay(hash1);
      await eduWordle.connect(player1).submitAnswer(solution1);
      expect(await eduWordle.userStreaks(player1.address)).to.equal(1);

      // Move to next day (advance time by 1 day)
      await time.increase(86400); // 1 day in seconds
      await eduWordle.connect(owner).initializeDay(hash2);
      await eduWordle.connect(player1).submitAnswer(solution2);
      expect(await eduWordle.userStreaks(player1.address)).to.equal(2);
    });

    it("Should apply streak bonus", async function () {
      const { eduWordle, cusd, player1, owner, baseReward } = await loadFixture(deployEduWordleFixture);
      
      const solution1 = "REACT";
      const solution2 = "WORLD";
      const hash1 = ethers.keccak256(ethers.toUtf8Bytes(solution1.toUpperCase()));
      const hash2 = ethers.keccak256(ethers.toUtf8Bytes(solution2.toUpperCase()));

      // Day 1 - no bonus
      await eduWordle.connect(owner).initializeDay(hash1);
      const balance1 = await cusd.balanceOf(player1.address);
      await eduWordle.connect(player1).submitAnswer(solution1);
      const balance2 = await cusd.balanceOf(player1.address);
      expect(balance2 - balance1).to.equal(baseReward);

      // Move to next day (advance time by 1 day)
      await time.increase(86400); // 1 day in seconds
      
      // Day 2 - with streak bonus (50% for streak of 2)
      await eduWordle.connect(owner).initializeDay(hash2);
      const balance3 = await cusd.balanceOf(player1.address);
      await eduWordle.connect(player1).submitAnswer(solution2);
      const balance4 = await cusd.balanceOf(player1.address);
      // Should be baseReward + (baseReward * 0.5 * 1) = 1.5 * baseReward
      expect(balance4 - balance3).to.equal(baseReward + (baseReward * 5000n / 10000n));
    });
  });

  describe("Hints", function () {
    it("Should allow purchasing hints", async function () {
      const { eduWordle, cusd, player1, owner, hintPrice } = await loadFixture(deployEduWordleFixture);
      
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes("REACT"));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      // Approve contract to spend cUSD
      await cusd.connect(player1).approve(await eduWordle.getAddress(), hintPrice);

      await expect(eduWordle.connect(player1).buyHint())
        .to.emit(eduWordle, "HintPurchased");

      expect(await eduWordle.getHintsPurchased(player1.address)).to.equal(1);
    });

    it("Should enforce max hints per day", async function () {
      const { eduWordle, cusd, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes("REACT"));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      // Approve and buy 3 hints
      await cusd.connect(player1).approve(await eduWordle.getAddress(), ethers.MaxUint256);
      await eduWordle.connect(player1).buyHint();
      await eduWordle.connect(player1).buyHint();
      await eduWordle.connect(player1).buyHint();

      // 4th hint should fail
      await expect(
        eduWordle.connect(player1).buyHint()
      ).to.be.revertedWith("EduWordle: Max hints reached");
    });

    it("Should prevent hints after solving", async function () {
      const { eduWordle, player1, owner } = await loadFixture(deployEduWordleFixture);
      
      const solution = "REACT";
      const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(solution.toUpperCase()));
      await eduWordle.connect(owner).initializeDay(solutionHash);

      await eduWordle.connect(player1).submitAnswer(solution);

      await expect(
        eduWordle.connect(player1).buyHint()
      ).to.be.revertedWith("EduWordle: Already solved today");
    });
  });

  describe("Treasury Management", function () {
    it("Should allow funding treasury", async function () {
      const { eduWordle, cusd, treasury } = await loadFixture(deployEduWordleFixture);
      
      const amount = ethers.parseEther("100");
      await cusd.mint(treasury.address, amount);
      await cusd.connect(treasury).approve(await eduWordle.getAddress(), amount);

      await expect(eduWordle.connect(treasury).fundTreasury(amount))
        .to.emit(eduWordle, "TreasuryFunded");

      expect(await eduWordle.treasuryBalance()).to.be.gte(amount);
    });

    it("Should allow owner to withdraw", async function () {
      const { eduWordle, cusd, owner, treasury } = await loadFixture(deployEduWordleFixture);
      
      const amount = ethers.parseEther("50");
      const initialBalance = await cusd.balanceOf(owner.address);

      await eduWordle.connect(owner).withdrawFunds(amount, owner.address);

      const finalBalance = await cusd.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      const { eduWordle, player1 } = await loadFixture(deployEduWordleFixture);
      
      await expect(
        eduWordle.connect(player1).withdrawFunds(ethers.parseEther("10"), player1.address)
      ).to.be.revertedWithCustomError(eduWordle, "OwnableUnauthorizedAccount");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow updating reward amount", async function () {
      const { eduWordle, owner } = await loadFixture(deployEduWordleFixture);
      
      const newAmount = ethers.parseEther("2");
      await expect(eduWordle.connect(owner).setBaseRewardAmount(newAmount))
        .to.emit(eduWordle, "RewardAmountUpdated");

      expect(await eduWordle.baseRewardAmount()).to.equal(newAmount);
    });

    it("Should allow updating hint price", async function () {
      const { eduWordle, owner } = await loadFixture(deployEduWordleFixture);
      
      const newPrice = ethers.parseEther("0.2");
      await expect(eduWordle.connect(owner).setHintPrice(newPrice))
        .to.emit(eduWordle, "HintPriceUpdated");

      expect(await eduWordle.hintPrice()).to.equal(newPrice);
    });
  });
});

