use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};

// TODO: Re-enable Arcium imports after fixing version conflicts
// use arcium_anchor::{
//     init_comp_def, queue_computation,
//     derive_cluster_pda, derive_comp_def_pda, derive_comp_pda, 
//     derive_execpool_pda, derive_mempool_pda, derive_mxe_pda,
//     comp_def_offset,
//     ARCIUM_CLOCK_ACCOUNT_ADDRESS, ARCIUM_STAKING_POOL_ACCOUNT_ADDRESS,
// };
// use arcium_client::idl::arcium::{
//     accounts::{ClockAccount, Cluster, ComputationDefinitionAccount, PersistentMXEAccount, StakingPoolAccount},
//     program::Arcium,
//     types::Argument,
// };
// use arcium_macros::{
//     arcium_callback, arcium_program, callback_accounts, 
//     init_computation_definition_accounts, queue_computation_accounts,
// };

mod instructions;
mod state;
mod error;

use instructions::*;
use state::*;
use error::*;

// Program ID - Generated for Shadow Protocol
declare_id!("Apw2K9F8KRSgie4iS5ea82Vd3XwTtmojQfXPdbxYFCQm");

// Computation definition offsets for encrypted instructions
// TODO: Re-enable after fixing Arcium imports
// const COMP_DEF_OFFSET_SEALED_BID: u32 = comp_def_offset("sealed_bid_auction");
// const COMP_DEF_OFFSET_DUTCH_AUCTION: u32 = comp_def_offset("dutch_auction");
// const COMP_DEF_OFFSET_BATCH_SETTLEMENT: u32 = comp_def_offset("batch_settlement");

#[program]
pub mod shadow_protocol {
    use super::*;

    // ========================================
    // Auction Management Instructions
    // ========================================

    /// Initialize a new sealed-bid auction
    pub fn create_sealed_auction(
        ctx: Context<CreateSealedAuction>,
        asset_mint: Pubkey,
        asset_amount: u64,
        duration: u64,
        minimum_bid: u64,
        reserve_price_encrypted: [u8; 32],
        reserve_price_nonce: u128,
    ) -> Result<()> {
        instructions::create_sealed_auction(
            ctx,
            asset_mint,
            asset_amount,
            duration,
            minimum_bid,
            reserve_price_encrypted,
            reserve_price_nonce,
        )
    }

    /// Initialize a new Dutch auction with hidden reserve
    pub fn create_dutch_auction(
        ctx: Context<CreateDutchAuction>,
        asset_mint: Pubkey,
        asset_amount: u64,
        starting_price: u64,
        price_decrease_rate: u64,
        minimum_price_floor: u64,
        duration: u64,
        reserve_price_encrypted: [u8; 32],
        reserve_price_nonce: u128,
    ) -> Result<()> {
        instructions::create_dutch_auction(
            ctx,
            asset_mint,
            asset_amount,
            starting_price,
            price_decrease_rate,
            minimum_price_floor,
            duration,
            reserve_price_encrypted,
            reserve_price_nonce,
        )
    }

    // ========================================
    // Bidding Instructions
    // ========================================

    /// Submit an encrypted bid to a sealed auction
    pub fn submit_encrypted_bid(
        ctx: Context<SubmitBid>,
        auction_id: u64,
        bid_amount_encrypted: [u8; 32],
        public_key: [u8; 32],
        nonce: u128,
        collateral_amount: u64,
        computation_offset: u64,
    ) -> Result<()> {
        instructions::submit_encrypted_bid(
            ctx,
            auction_id,
            bid_amount_encrypted,
            public_key,
            nonce,
            collateral_amount,
            computation_offset,
        )
    }

    /// Submit a bid to a Dutch auction
    pub fn submit_dutch_bid(
        ctx: Context<SubmitDutchBid>,
        auction_id: u64,
        bid_amount: u64,
        collateral_amount: u64,
    ) -> Result<()> {
        instructions::submit_dutch_bid(ctx, auction_id, bid_amount, collateral_amount)
    }

    // ========================================
    // Settlement Instructions
    // ========================================

    /// Authorize settlement after MPC computation verification
    pub fn authorize_settlement(
        ctx: Context<AuthorizeSettlement>,
        auction_id: u64,
        mpc_verification_hash: [u8; 32],
    ) -> Result<()> {
        instructions::authorize_settlement(ctx, auction_id, mpc_verification_hash)
    }

    /// Trigger auction settlement (for sealed-bid auctions)
    pub fn settle_auction(
        ctx: Context<SettleAuction>,
        auction_id: u64,
        computation_offset: u64,
    ) -> Result<()> {
        instructions::settle_auction(ctx, auction_id, computation_offset)
    }

    /// Process batch settlement of multiple auctions
    pub fn batch_settle(
        ctx: Context<BatchSettle>,
        auction_ids: Vec<u64>,
        computation_offset: u64,
    ) -> Result<()> {
        instructions::batch_settle(ctx, auction_ids, computation_offset)
    }

    // ========================================
    // Computation Definition Initialization
    // ========================================
    // TODO: Re-enable after fixing Arcium imports
    
    // /// Initialize sealed-bid auction computation definition
    // pub fn init_sealed_bid_comp_def(ctx: Context<InitSealedBidCompDef>) -> Result<()> {
    //     init_comp_def(ctx.accounts, None)?;
    //     Ok(())
    // }

    // /// Initialize Dutch auction computation definition
    // pub fn init_dutch_auction_comp_def(ctx: Context<InitDutchAuctionCompDef>) -> Result<()> {
    //     init_comp_def(ctx.accounts, None)?;
    //     Ok(())
    // }

    // /// Initialize batch settlement computation definition
    // pub fn init_batch_settlement_comp_def(ctx: Context<InitBatchSettlementCompDef>) -> Result<()> {
    //     init_comp_def(ctx.accounts, None)?;
    //     Ok(())
    // }

    // ========================================
    // Callback Instructions
    // ========================================
    // TODO: Re-enable after fixing Arcium imports
    
    // /// Callback for sealed-bid auction settlement
    // #[arcium_callback(encrypted_ix = "sealed_bid_auction")]
    // pub fn sealed_bid_settlement_callback(
    //     ctx: Context<SealedBidSettlementCallback>,
    //     output: ComputationOutputs,
    // ) -> Result<()> {
    //     instructions::handle_sealed_bid_settlement(ctx, output)
    // }

    // /// Callback for Dutch auction execution
    // #[arcium_callback(encrypted_ix = "dutch_auction")]
    // pub fn dutch_auction_callback(
    //     ctx: Context<DutchAuctionCallback>,
    //     output: ComputationOutputs,
    // ) -> Result<()> {
    //     instructions::handle_dutch_auction_result(ctx, output)
    // }

    // /// Callback for batch settlement
    // #[arcium_callback(encrypted_ix = "batch_settlement")]
    // pub fn batch_settlement_callback(
    //     ctx: Context<BatchSettlementCallback>,
    //     output: ComputationOutputs,
    // ) -> Result<()> {
    //     instructions::handle_batch_settlement(ctx, output)
    // }

    // ========================================
    // Admin Instructions
    // ========================================

    /// Initialize the protocol (one-time setup)
    pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
        instructions::initialize_protocol(ctx)
    }

    /// Emergency pause functionality
    pub fn set_pause_state(ctx: Context<SetPauseState>, paused: bool) -> Result<()> {
        instructions::set_pause_state(ctx, paused)
    }

    /// Update protocol fee (admin only)
    pub fn update_protocol_fee(ctx: Context<UpdateProtocolFee>, new_fee: u16) -> Result<()> {
        instructions::update_protocol_fee(ctx, new_fee)
    }

    /// Update fee recipient (admin only)
    pub fn update_fee_recipient(ctx: Context<UpdateFeeRecipient>, new_recipient: Pubkey) -> Result<()> {
        instructions::update_fee_recipient(ctx, new_recipient)
    }

    /// Initiate protocol authority transfer (admin only, first step)
    pub fn initiate_authority_transfer(ctx: Context<InitiateAuthorityTransfer>, new_authority: Pubkey) -> Result<()> {
        instructions::initiate_authority_transfer(ctx, new_authority)
    }

    /// Complete protocol authority transfer (admin only, second step after timelock)
    pub fn complete_authority_transfer(ctx: Context<CompleteAuthorityTransfer>) -> Result<()> {
        instructions::complete_authority_transfer(ctx)
    }

    /// Cancel pending authority transfer (admin only)
    pub fn cancel_authority_transfer(ctx: Context<CancelAuthorityTransfer>) -> Result<()> {
        instructions::cancel_authority_transfer(ctx)
    }

    /// Transfer protocol authority (admin only) - DEPRECATED: Use initiate/complete pattern instead
    pub fn transfer_authority(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
        instructions::transfer_authority(ctx, new_authority)
    }
}

// ========================================
// ComputationOutputs enum for callbacks
// ========================================

#[derive(Debug)]
pub enum ComputationOutputs {
    Bytes(Vec<u8>),
    Error(String),
}