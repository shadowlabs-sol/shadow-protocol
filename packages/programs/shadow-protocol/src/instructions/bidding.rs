use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
// TODO: Re-enable after fixing Arcium imports
// use arcium_anchor::{queue_computation};
// use arcium_client::idl::arcium::{
//     accounts::{ComputationDefinitionAccount, PersistentMXEAccount},
//     types::Argument,
// };
use crate::state::*;
use crate::error::ShadowProtocolError;

pub fn submit_encrypted_bid(
    ctx: Context<SubmitBid>,
    auction_id: u64,
    bid_amount_encrypted: [u8; 32],
    public_key: [u8; 32],
    nonce: u128,
    computation_offset: u64,
) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let clock = Clock::get()?;
    
    require!(
        auction.status == AuctionStatus::Active,
        ShadowProtocolError::InvalidAuctionStatus
    );
    
    require!(
        clock.unix_timestamp < auction.end_time,
        ShadowProtocolError::AuctionEnded
    );
    
    require!(
        auction.bid_count < MAX_BIDS_PER_AUCTION as u64,
        ShadowProtocolError::MaxBidsExceeded
    );
    
    let bid = &mut ctx.accounts.bid;
    bid.auction_id = auction_id;
    bid.bidder = ctx.accounts.bidder.key();
    bid.amount_encrypted = bid_amount_encrypted;
    bid.encryption_public_key = public_key;
    bid.nonce = nonce;
    bid.timestamp = clock.unix_timestamp;
    bid.is_winner = false;
    bid.bump = ctx.bumps.bid;
    
    auction.bid_count += 1;
    
    // TODO: Re-enable MPC processing after fixing Arcium imports
    // Queue computation for MPC processing if auction is ending soon
    // let time_until_end = auction.end_time - clock.unix_timestamp;
    // if time_until_end < 300 {
    //     // Queue if less than 5 minutes remaining
    //     let mut args = Vec::new();
    //     args.push(Argument {
    //         name: "auction_id".to_string(),
    //         value: auction_id.to_le_bytes().to_vec(),
    //     });
    //     args.push(Argument {
    //         name: "bid_data".to_string(),
    //         value: bid_amount_encrypted.to_vec(),
    //     });
    //     
    //     queue_computation(
    //         ctx.accounts.queue_computation_ctx(),
    //         computation_offset,
    //         args,
    //     )?;
    // }
    
    emit!(BidSubmitted {
        auction_id,
        bidder: ctx.accounts.bidder.key(),
        timestamp: clock.unix_timestamp,
        bid_count: auction.bid_count,
    });
    
    Ok(())
}

pub fn submit_dutch_bid(
    ctx: Context<SubmitDutchBid>,
    auction_id: u64,
    bid_amount: u64,
) -> Result<()> {
    let auction = &mut ctx.accounts.auction;
    let clock = Clock::get()?;
    
    require!(
        auction.auction_type == AuctionType::Dutch,
        ShadowProtocolError::InvalidAuctionType
    );
    
    require!(
        auction.status == AuctionStatus::Active,
        ShadowProtocolError::InvalidAuctionStatus
    );
    
    require!(
        clock.unix_timestamp < auction.end_time,
        ShadowProtocolError::AuctionEnded
    );
    
    // Calculate current price
    let elapsed = (clock.unix_timestamp - auction.start_time) as u64;
    let price_decrease = elapsed.saturating_mul(auction.price_decrease_rate);
    let current_price = auction.current_price.saturating_sub(price_decrease);
    
    require!(
        bid_amount >= current_price,
        ShadowProtocolError::DutchPriceNotMet
    );
    
    // Dutch auction ends immediately when bid meets price
    auction.status = AuctionStatus::Ended;
    auction.winner = Some(ctx.accounts.bidder.key());
    auction.winning_amount = current_price;
    auction.bid_count = 1;
    
    // TODO: Re-enable MPC computation after fixing Arcium imports
    // Queue MPC computation to verify against hidden reserve
    // let mut args = Vec::new();
    // args.push(Argument {
    //     name: "auction_id".to_string(),
    //     value: auction_id.to_le_bytes().to_vec(),
    // });
    // args.push(Argument {
    //     name: "winning_amount".to_string(),
    //     value: current_price.to_le_bytes().to_vec(),
    // });
    // args.push(Argument {
    //     name: "reserve_encrypted".to_string(),
    //     value: auction.reserve_price_encrypted.to_vec(),
    // });
    // 
    // queue_computation(
    //     ctx.accounts.queue_computation_ctx(),
    //     0, // Dutch auction computation offset
    //     args,
    // )?;
    
    emit!(BidSubmitted {
        auction_id,
        bidder: ctx.accounts.bidder.key(),
        timestamp: clock.unix_timestamp,
        bid_count: 1,
    });
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct SubmitBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    #[account(
        mut,
        seeds = [AUCTION_SEED, auction_id.to_le_bytes().as_ref()],
        bump = auction.bump
    )]
    pub auction: Account<'info, AuctionAccount>,
    
    #[account(
        init,
        payer = bidder,
        space = 8 + BidAccount::INIT_SPACE,
        seeds = [BID_SEED, auction_id.to_le_bytes().as_ref(), bidder.key().as_ref()],
        bump
    )]
    pub bid: Account<'info, BidAccount>,
    
    #[account(
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    // TODO: Re-enable after fixing Arcium imports
    // pub computation_definition: Account<'info, ComputationDefinitionAccount>,
    // pub mxe: Account<'info, PersistentMXEAccount>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct SubmitDutchBid<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    
    #[account(
        mut,
        seeds = [AUCTION_SEED, auction_id.to_le_bytes().as_ref()],
        bump = auction.bump,
        constraint = auction.auction_type == AuctionType::Dutch @ ShadowProtocolError::InvalidAuctionType
    )]
    pub auction: Account<'info, AuctionAccount>,
    
    #[account(
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    // TODO: Re-enable after fixing Arcium imports
    // pub computation_definition: Account<'info, ComputationDefinitionAccount>,
    // pub mxe: Account<'info, PersistentMXEAccount>,
    
    pub system_program: Program<'info, System>,
}

impl<'info> SubmitBid<'info> {
    pub fn queue_computation_ctx(&self) -> CpiContext<'_, '_, '_, 'info, arcium_anchor::QueueComputation<'info>> {
        let cpi_program = self.computation_definition.to_account_info();
        let cpi_accounts = arcium_anchor::QueueComputation {
            computation_definition: self.computation_definition.to_account_info(),
            mxe: self.mxe.to_account_info(),
            payer: self.bidder.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}

impl<'info> SubmitDutchBid<'info> {
    pub fn queue_computation_ctx(&self) -> CpiContext<'_, '_, '_, 'info, arcium_anchor::QueueComputation<'info>> {
        let cpi_program = self.computation_definition.to_account_info();
        let cpi_accounts = arcium_anchor::QueueComputation {
            computation_definition: self.computation_definition.to_account_info(),
            mxe: self.mxe.to_account_info(),
            payer: self.bidder.to_account_info(),
            system_program: self.system_program.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}