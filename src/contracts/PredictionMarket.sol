// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionMarket
 * @notice CPMM-based binary prediction market with admin settlement
 * @dev Deployed on Base chain, uses USDC as collateral
 */
contract PredictionMarket is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    uint256 public constant FEE_BPS = 200;       // 2% fee
    uint256 public constant BPS_DENOM = 10_000;
    uint256 public constant PRECISION = 1e18;

    enum Outcome { None, Yes, No }
    enum Status  { Pending, Active, Settled }

    struct Market {
        string  title;
        uint256 yesShares;   // CPMM pool
        uint256 noShares;
        uint256 endTime;
        Status  status;
        Outcome result;
        uint256 totalFees;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
    }

    uint256 public nextMarketId;
    mapping(uint256 => Market)   public markets;
    mapping(uint256 => mapping(address => Position)) public positions;

    event MarketCreated(uint256 indexed id, string title, uint256 endTime, uint256 initialLiquidity);
    event SharesBought(uint256 indexed id, address indexed user, Outcome outcome, uint256 usdcIn, uint256 sharesOut);
    event SharesSold(uint256 indexed id, address indexed user, Outcome outcome, uint256 sharesIn, uint256 usdcOut);
    event MarketSettled(uint256 indexed id, Outcome result);
    event WinningsClaimed(uint256 indexed id, address indexed user, uint256 amount);

    constructor(address _usdc, address _owner) Ownable(_owner) {
        usdc = IERC20(_usdc);
    }

    // ─── Admin: Create Market ────────────────────────────────────────────────

    function createMarket(
        string calldata title,
        uint256 endTime,
        uint256 initialLiquidity  // USDC amount (6 decimals)
    ) external onlyOwner returns (uint256 id) {
        require(endTime > block.timestamp, "End time in past");
        require(initialLiquidity >= 10e6, "Min liquidity 10 USDC");

        usdc.transferFrom(msg.sender, address(this), initialLiquidity);

        id = nextMarketId++;
        uint256 shares = initialLiquidity * PRECISION / 1e6; // normalize to 18 decimals
        markets[id] = Market({
            title:      title,
            yesShares:  shares,
            noShares:   shares,
            endTime:    endTime,
            status:     Status.Active,
            result:     Outcome.None,
            totalFees:  0
        });

        emit MarketCreated(id, title, endTime, initialLiquidity);
    }

    // ─── Admin: Settle Market ────────────────────────────────────────────────

    function settleMarket(uint256 id, Outcome result) external onlyOwner {
        Market storage m = markets[id];
        require(m.status == Status.Active, "Not active");
        require(result == Outcome.Yes || result == Outcome.No, "Invalid outcome");
        m.status = Status.Settled;
        m.result = result;
        emit MarketSettled(id, result);
    }

    // ─── Trading ─────────────────────────────────────────────────────────────

    function buyShares(
        uint256 id,
        Outcome outcome,
        uint256 usdcIn,     // USDC amount (6 decimals)
        uint256 minShares   // slippage protection
    ) external nonReentrant {
        Market storage m = markets[id];
        require(m.status == Status.Active, "Market not active");
        require(block.timestamp < m.endTime, "Market ended");
        require(outcome == Outcome.Yes || outcome == Outcome.No, "Invalid outcome");

        usdc.transferFrom(msg.sender, address(this), usdcIn);

        uint256 fee = (usdcIn * FEE_BPS) / BPS_DENOM;
        m.totalFees += fee;
        uint256 amountAfterFee = (usdcIn - fee) * PRECISION / 1e6;

        uint256 sharesOut;
        if (outcome == Outcome.Yes) {
            uint256 k = m.yesShares * m.noShares;
            uint256 newNo = m.noShares + amountAfterFee;
            uint256 newYes = k / newNo;
            sharesOut = m.yesShares - newYes;
            m.yesShares = newYes;
            m.noShares = newNo;
            positions[id][msg.sender].yesShares += sharesOut;
        } else {
            uint256 k = m.yesShares * m.noShares;
            uint256 newYes = m.yesShares + amountAfterFee;
            uint256 newNo = k / newYes;
            sharesOut = m.noShares - newNo;
            m.yesShares = newYes;
            m.noShares = newNo;
            positions[id][msg.sender].noShares += sharesOut;
        }

        require(sharesOut >= minShares, "Slippage exceeded");
        emit SharesBought(id, msg.sender, outcome, usdcIn, sharesOut);
    }

    function sellShares(
        uint256 id,
        Outcome outcome,
        uint256 sharesIn,
        uint256 minUsdc
    ) external nonReentrant {
        Market storage m = markets[id];
        require(m.status == Status.Active, "Market not active");

        Position storage pos = positions[id][msg.sender];
        if (outcome == Outcome.Yes) {
            require(pos.yesShares >= sharesIn, "Insufficient YES shares");
            pos.yesShares -= sharesIn;
            uint256 k = m.yesShares * m.noShares;
            uint256 newYes = m.yesShares + sharesIn;
            uint256 newNo = k / newYes;
            uint256 usdcBeforeFee = (m.noShares - newNo) * 1e6 / PRECISION;
            uint256 fee = (usdcBeforeFee * FEE_BPS) / BPS_DENOM;
            uint256 usdcOut = usdcBeforeFee - fee;
            m.yesShares = newYes;
            m.noShares = newNo;
            m.totalFees += fee;
            require(usdcOut >= minUsdc, "Slippage exceeded");
            usdc.transfer(msg.sender, usdcOut);
            emit SharesSold(id, msg.sender, outcome, sharesIn, usdcOut);
        } else {
            require(pos.noShares >= sharesIn, "Insufficient NO shares");
            pos.noShares -= sharesIn;
            uint256 k = m.yesShares * m.noShares;
            uint256 newNo = m.noShares + sharesIn;
            uint256 newYes = k / newNo;
            uint256 usdcBeforeFee = (m.yesShares - newYes) * 1e6 / PRECISION;
            uint256 fee = (usdcBeforeFee * FEE_BPS) / BPS_DENOM;
            uint256 usdcOut = usdcBeforeFee - fee;
            m.yesShares = newYes;
            m.noShares = newNo;
            m.totalFees += fee;
            require(usdcOut >= minUsdc, "Slippage exceeded");
            usdc.transfer(msg.sender, usdcOut);
            emit SharesSold(id, msg.sender, outcome, sharesIn, usdcOut);
        }
    }

    // ─── Claim Winnings ──────────────────────────────────────────────────────

    function claimWinnings(uint256 id) external nonReentrant {
        Market storage m = markets[id];
        require(m.status == Status.Settled, "Not settled");

        Position storage pos = positions[id][msg.sender];
        uint256 winningShares;
        if (m.result == Outcome.Yes) {
            winningShares = pos.yesShares;
            pos.yesShares = 0;
        } else {
            winningShares = pos.noShares;
            pos.noShares = 0;
        }
        require(winningShares > 0, "No winning shares");

        // Each winning share redeems for 1 USDC (scaled by precision)
        uint256 payout = winningShares * 1e6 / PRECISION;
        usdc.transfer(msg.sender, payout);
        emit WinningsClaimed(id, msg.sender, payout);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getPrice(uint256 id) external view returns (uint256 yesPrice, uint256 noPrice) {
        Market storage m = markets[id];
        uint256 total = m.yesShares + m.noShares;
        yesPrice = (m.noShares * 1e18) / total;   // price in 1e18 format
        noPrice  = (m.yesShares * 1e18) / total;
    }

    function getPosition(uint256 id, address user) external view returns (uint256 yes, uint256 no) {
        Position storage pos = positions[id][user];
        return (pos.yesShares, pos.noShares);
    }

    // ─── Admin: Withdraw Fees ────────────────────────────────────────────────

    function withdrawFees(uint256 id) external onlyOwner {
        Market storage m = markets[id];
        uint256 fees = m.totalFees;
        m.totalFees = 0;
        usdc.transfer(owner(), fees);
    }
}
