# Shadow Protocol Deployment Guide

## Overview
Shadow Protocol is a privacy-preserving auction platform built on Solana with Arcium Network integration. All mock data has been removed and replaced with real blockchain interactions, database persistence, and encrypted computations.

## Architecture Components

### 1. PostgreSQL Database (Neon)
- **Connection**: Already configured with your Neon database
- **Schema**: Automatically migrated with Prisma
- **Tables**: Auctions, Bids, Settlements, MXEComputations, Users

### 2. Solana Program
- **Location**: `packages/programs/shadow-protocol/`
- **Features**:
  - Sealed-bid auctions with encrypted reserve prices
  - Dutch auctions with declining prices
  - Batch settlements for multiple auctions
  - Full Arcium MPC integration for privacy

### 3. Arcium Integration
- **Encrypted Instructions**: `packages/programs/shadow-protocol/encrypted-ixs/`
- **MPC Computations**: Winner determination without revealing losing bids
- **Encryption**: Rescue cipher with x25519 key exchange
- **Callback Server**: Handles large computation outputs at `/api/callback`

### 4. Client SDK
- **Location**: `packages/client/`
- **Modules**:
  - `AuctionManager`: Create and manage auctions
  - `BidManager`: Submit and track encrypted bids  
  - `EncryptionManager`: Handle Arcium encryption
  - Real-time blockchain synchronization

### 5. Web Application
- **Location**: `apps/web/`
- **Features**:
  - Wallet connection (Phantom, Solflare, etc.)
  - Real-time auction dashboard
  - Encrypted bid submission
  - Automatic settlement with MPC
  - Database + blockchain data synchronization

## Deployment Steps

### 1. Install Arcium CLI
```bash
# Requires sudo for system dependencies
sudo apt-get update
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev
curl --proto '=https' --tlsv1.2 -sSfL https://arcium-install.arcium.workers.dev/ | bash
```

### 2. Deploy Solana Program
```bash
cd packages/programs

# Build the program with Arcium
arcium build

# Deploy to devnet (requires ~2-5 SOL)
arcium deploy --cluster-offset 1116522165 \
  --keypair-path ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com \
  --mempool-size Small

# Note the deployed program ID
```

### 3. Update Environment Variables
Update `.env.local` with your deployed program ID:
```env
DATABASE_URL="postgresql://neondb_owner:npg_5X7WJDabjpGK@ep-mute-fire-aelwptrp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_ARCIUM_CLUSTER_OFFSET="1116522165"
NEXT_PUBLIC_PROGRAM_ID="YOUR_DEPLOYED_PROGRAM_ID"
```

### 4. Initialize Computation Definitions
After deployment, initialize the MPC computation definitions:
```typescript
// Run this once after deployment
await program.methods
  .initSealedBidCompDef()
  .accounts({...})
  .rpc();

await program.methods
  .initDutchAuctionCompDef()
  .accounts({...})
  .rpc();

await program.methods
  .initBatchSettlementCompDef()
  .accounts({...})
  .rpc();
```

### 5. Deploy Web Application
```bash
# Production build
bun run build

# Deploy to Vercel
vercel --prod

# Or deploy to any Node.js hosting service
```

## Key Features Implemented

### ✅ Real Blockchain Integration
- Direct Solana program calls
- Anchor framework integration
- Real wallet transactions
- On-chain account management

### ✅ Arcium MPC Encryption
- x25519 key exchange
- Rescue cipher encryption
- Private bid submission
- Encrypted reserve prices
- MPC-based winner determination

### ✅ Database Persistence
- PostgreSQL with Prisma ORM
- Transaction history
- User statistics
- Hybrid on-chain/off-chain data

### ✅ API Endpoints
- `/api/auctions` - Auction CRUD operations
- `/api/bids` - Bid submission and retrieval
- `/api/settlements` - Settlement processing
- `/api/callback` - Arcium MPC callback handler

### ✅ Security Features
- MEV protection through encryption
- Front-running prevention
- Private reserve prices
- Sealed bid privacy until settlement
- Ed25519 signature verification

## Testing the System

### 1. Create an Auction
```typescript
const auction = await createAuction({
  type: 'sealed',
  assetMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  duration: 86400, // 24 hours
  minimumBid: 1000000,
  reservePrice: 5000000
});
```

### 2. Submit Encrypted Bids
```typescript
await submitBid(auction.auctionId, 2000000);
// Bid is automatically encrypted using Arcium
```

### 3. Settle Auction
```typescript
await settleAuction(auction.auctionId);
// MPC nodes determine winner without revealing losing bids
```

## Monitoring

### Database Queries
```sql
-- View active auctions
SELECT * FROM "Auction" WHERE status = 'ACTIVE';

-- Check settlements
SELECT * FROM "Settlement" ORDER BY "settlementTime" DESC;

-- User statistics
SELECT * FROM "User" ORDER BY "auctionsWon" DESC;
```

### Blockchain Monitoring
- Use Solana Explorer to track transactions
- Monitor program logs for MPC computations
- Check Arcium network status

## Troubleshooting

### Common Issues

1. **MXE Public Key Not Found**
   - Wait for MXE initialization after deployment
   - Check cluster offset matches deployment

2. **Transaction Failures**
   - Ensure sufficient SOL balance
   - Check RPC endpoint reliability
   - Verify program deployment status

3. **Encryption Errors**
   - Verify Arcium cluster is active
   - Check x25519 key exchange
   - Ensure nonce uniqueness

4. **Database Connection**
   - Verify Neon connection string
   - Check SSL requirements
   - Monitor connection pool

## Production Considerations

1. **RPC Endpoints**: Use dedicated RPC (Helius, QuickNode)
2. **Database Scaling**: Consider connection pooling
3. **Circuit Storage**: Use offchain storage for large circuits
4. **Monitoring**: Implement proper logging and alerts
5. **Security Audit**: Review encryption implementation

## Support

For issues or questions:
- Arcium Discord: [Join community](https://discord.gg/arcium)
- Solana StackExchange: Tag with 'shadow-protocol'
- GitHub Issues: Report bugs and feature requests

## License
MIT