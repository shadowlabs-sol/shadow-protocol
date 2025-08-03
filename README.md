# Shadow Protocol

A privacy-preserving auction platform built on Solana using Arcium's Multi-Party Computation (MPC) technology. Shadow Protocol enables truly private sealed-bid auctions, Dutch auctions with hidden reserves, and batch settlement processing.

## 🌟 Features

- **🔒 Complete Privacy**: Bids remain encrypted until settlement
- **⚡ Fast Settlement**: Powered by Arcium's MPC for instant processing  
- **🛡️ MEV Protection**: Eliminates front-running and sandwich attacks
- **📊 Fair Price Discovery**: True market prices without manipulation
- **🎯 Multiple Formats**: Sealed-bid, Dutch, and batch auctions
- **🏢 Enterprise Ready**: Institutional-grade privacy guarantees

## 🏗️ Architecture

Shadow Protocol consists of four main components:

1. **Solana Programs** - Smart contracts handling auction logic and state
2. **Confidential Instructions** - Arcium MPC circuits for encrypted computation
3. **Client SDK** - TypeScript library for easy integration
4. **Web Application** - Next.js frontend for user interaction

## 📁 Project Structure

```
shadow-protocol/
├── apps/
│   └── web/                    # Next.js frontend application
├── packages/
│   ├── programs/               # Solana smart contracts (Anchor)
│   ├── confidential/           # Arcium MPC circuits (Arcis)
│   ├── client/                 # TypeScript client SDK
│   └── shared/                 # Shared types and utilities
└── docs/                       # Documentation
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Node.js](https://nodejs.org/) >= 18.0.0
- [Rust](https://rustup.rs/) >= 1.70.0
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) >= 1.16.0
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) >= 0.29.0
- [Arcium CLI](https://docs.arcium.com/installation) >= 0.1.0
- [Docker](https://docs.docker.com/get-docker/) (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/shadow-protocol.git
   cd shadow-protocol
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Solana keypair** (if you don't have one)
   ```bash
   solana-keygen new
   ```

5. **Build all packages**
   ```bash
   bun run setup
   ```

### Development Workflow

1. **Start local Solana validator**
   ```bash
   solana-test-validator
   ```

2. **Deploy programs to localnet**
   ```bash
   bun run program:deploy
   ```

3. **Build confidential instructions**
   ```bash
   bun run confidential:build
   ```

4. **Start the frontend**
   ```bash
   bun run app:dev
   ```

5. **Visit the application**
   ```
   http://localhost:3000
   ```

## 🧪 Testing

### Run all tests
```bash
bun run test
```

### Test individual packages
```bash
# Test Solana programs
bun run program:test

# Test confidential instructions
bun run confidential:test

# Test client SDK
bun run --filter='@shadow-protocol/client' test
```

## 🚢 Deployment

### Deploy to Devnet

1. **Configure for devnet**
   ```bash
   solana config set --url devnet
   ```

2. **Airdrop SOL for deployment**
   ```bash
   solana airdrop 2
   ```

3. **Deploy programs**
   ```bash
   bun run program:deploy:devnet
   ```

4. **Deploy confidential instructions**
   ```bash
   bun run --filter='@shadow-protocol/confidential' deploy
   ```

5. **Update environment variables**
   ```bash
   # Update .env with deployed program IDs
   NEXT_PUBLIC_SHADOW_PROTOCOL_PROGRAM_ID=<your-program-id>
   ```

6. **Build and deploy frontend**
   ```bash
   bun run app:build
   # Deploy to your preferred hosting platform
   ```

## 📖 Usage Examples

### Creating a Sealed-Bid Auction

```typescript
import { ShadowProtocolClient } from '@shadow-protocol/client';
import { PublicKey } from '@solana/web3.js';

// Initialize client
const client = new ShadowProtocolClient({
  rpcUrl: 'https://api.devnet.solana.com',
  arciumClusterPubkey: new PublicKey('your-cluster-pubkey'),
  wallet: yourWallet,
});

// Create auction
const result = await client.createSealedAuction({
  assetMint: new PublicKey('asset-mint-address'),
  duration: 3600, // 1 hour
  minimumBid: 1000000, // 1 SOL in lamports
  reservePrice: 5000000, // 5 SOL in lamports
});

console.log('Auction created:', result.auctionId);
```

### Submitting an Encrypted Bid

```typescript
// Submit bid (amount is encrypted client-side)
const bidResult = await client.submitEncryptedBid({
  auctionId: 123,
  bidAmount: 7000000, // 7 SOL in lamports
});

console.log('Bid submitted:', bidResult.signature);
```

### Settling an Auction

```typescript
// Settle auction (triggers MPC computation)
const settlement = await client.settleAuction(123);
console.log('Settlement:', settlement.signature);

// Wait for MPC computation to complete
const finalResult = await client.waitForComputation(settlement.signature);
console.log('Final result:', finalResult);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `SOLANA_CLUSTER` | Solana cluster | `devnet` |
| `ARCIUM_CLUSTER_OFFSET` | Arcium cluster identifier | `2326510165` |
| `SHADOW_PROTOCOL_PROGRAM_ID` | Deployed program ID | - |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |

### Arcium Configuration

Edit `packages/confidential/Arcium.toml` to configure MPC settings:

```toml
[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[programs.devnet]
shadow_protocol = "YourProgramID"
```

## 🏛️ Smart Contract Architecture

### Core Programs

- **ShadowProtocol** - Main auction management contract
- **AuctionFactory** - Creates and manages auction instances  
- **SealedBidAuction** - Handles sealed-bid auction logic
- **DutchAuction** - Manages Dutch auctions with hidden reserves
- **BatchSettlement** - Coordinates multi-auction settlements

### State Accounts

- **ProtocolState** - Global protocol configuration
- **AuctionAccount** - Individual auction data
- **BidAccount** - Encrypted bid submissions
- **BatchSettlement** - Batch processing state

## 🔐 Privacy & Security

### Encryption Flow

1. **Client-Side**: Bid amounts encrypted using x25519 + Rescue cipher
2. **MPC Processing**: Computations on encrypted data without decryption
3. **Settlement**: Winner determination in encrypted environment
4. **Revelation**: Only final results revealed, losing bids remain private

### Security Features

- **Byzantine Fault Tolerance**: Secure with 1+ honest MPC nodes
- **Slashing Mechanisms**: Economic penalties for misbehavior
- **Cryptographic Proofs**: Verifiable auction fairness
- **MEV Protection**: Encrypted order flow prevents extraction

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `bun run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Website**: [shadowprotocol.xyz](https://shadowprotocol.xyz)
- **Documentation**: [docs.shadowprotocol.xyz](https://docs.shadowprotocol.xyz)
- **Discord**: [discord.gg/shadowprotocol](https://discord.gg/shadowprotocol)
- **Twitter**: [@ShadowProtocol](https://twitter.com/ShadowProtocol)

## 🙏 Acknowledgments

- **Arcium Team** - For the incredible MPC technology
- **Solana Foundation** - For the high-performance blockchain
- **Anchor Framework** - For Solana development tools
- **Open Source Community** - For the amazing tools and libraries

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk. Not financial advice.