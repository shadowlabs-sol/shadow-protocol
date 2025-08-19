# Shadow Protocol Transaction Flow Analysis

## Current Issues

### 1. Bid Submission Phase
- **WORKING**: Bidders transfer SOL to escrow PDA account
- Amount: Full bid amount (e.g., 1 SOL)
- Destination: `getBidEscrowPDA(auctionId)` - a Program Derived Address

### 2. Settlement Phase - BROKEN
The settlement is transferring from the SETTLER'S wallet instead of escrow:

#### Payment to Creator
- **BROKEN**: Transfers from settler's wallet to creator
- Should be: Transfer from escrow to creator
- Current cap: 0.01 SOL (safety limit)

#### Refunds to Non-Winners  
- **BROKEN**: Transfers from settler's wallet to each non-winner
- Should be: Transfer from each bidder's escrow back to them
- Current cap: 0.005 SOL per refund (safety limit)

### 3. The Wallet Drain Issue
With the infinite loop bug (now fixed), the system was:
1. Running settlement every few seconds for expired auctions
2. Each settlement attempt transfers real SOL from YOUR wallet
3. Multiple auctions × multiple bidders × repeated attempts = rapid drain

Example calculation:
- 5 expired auctions
- 3 bidders per auction
- Settlement every 10 seconds
- Cost per settlement: 0.01 (creator) + 3 × 0.005 (refunds) = 0.025 SOL
- Total per cycle: 5 × 0.025 = 0.125 SOL
- In 80 seconds: 10 SOL drained!

## Correct Architecture

### How It Should Work:
```
1. Bid Submission:
   Bidder --[SOL]--> Escrow PDA

2. Settlement (Winner):
   Winner's Escrow --[SOL]--> Creator
   Asset Vault --[NFT/Token]--> Winner

3. Settlement (Losers):
   Loser's Escrow --[SOL]--> Loser (refund)
```

### Current Implementation:
```
1. Bid Submission: ✅
   Bidder --[SOL]--> Escrow PDA

2. Settlement (Winner): ❌
   Settler's Wallet --[SOL]--> Creator
   Asset Vault --[NFT/Token]--> Winner (simulated)

3. Settlement (Losers): ❌
   Settler's Wallet --[SOL]--> Each Loser
```

## Required Fixes

### Immediate (Development Safety):
1. ✅ Disabled auto-settlement
2. ✅ Added transaction caps (0.01 SOL max)
3. ✅ Added status checks to prevent re-settlement

### Proper Fix (Production):
1. Implement proper escrow withdrawal logic
2. Only the program should control escrow funds
3. Settlement should trigger program instructions to:
   - Transfer escrow funds to creator
   - Refund escrow funds to losers
   - Transfer asset to winner
4. Never transfer from user's wallet during settlement

## Security Considerations

The current implementation has a critical security flaw where anyone settling an auction pays from their own wallet. This means:
- The settler loses money equal to the winning bid
- Malicious actors could drain settler wallets
- No actual escrow protection

This MUST be fixed before any production deployment.