use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint, Transfer, transfer};
use crate::state::*;
use crate::error::ShadowProtocolError;

pub fn create_sealed_auction(
    ctx: Context<CreateSealedAuction>,
    auction_id: u64,
    asset_mint: Pubkey,
    duration: u64,
    minimum_bid: u64,
    reserve_price_encrypted: [u8; 32],
    reserve_price_nonce: u128,
) -> Result<()> {
    let protocol = &ctx.accounts.protocol_state;
    require!(!protocol.paused, ShadowProtocolError::ProtocolPaused);
    
    let clock = Clock::get()?;
    let start_time = clock.unix_timestamp;
    let end_time = start_time + duration as i64;
    
    require!(
        duration as i64 <= MAX_AUCTION_DURATION,
        ShadowProtocolError::AuctionDurationTooLong
    );
    
    let auction = &mut ctx.accounts.auction;
    auction.auction_id = auction_id;
    auction.creator = ctx.accounts.creator.key();
    auction.asset_mint = asset_mint;
    auction.asset_vault = ctx.accounts.asset_vault.key();
    auction.auction_type = AuctionType::SealedBid;
    auction.status = AuctionStatus::Active;
    auction.start_time = start_time;
    auction.end_time = end_time;
    auction.minimum_bid = minimum_bid;
    auction.reserve_price_encrypted = reserve_price_encrypted;
    auction.reserve_price_nonce = reserve_price_nonce;
    auction.current_price = 0;
    auction.price_decrease_rate = 0;
    auction.bid_count = 0;
    auction.winner = None;
    auction.winning_amount = 0;
    auction.settled_at = None;
    auction.bump = ctx.bumps.auction;
    
    // Transfer asset to vault
    if ctx.accounts.creator_asset_account.amount > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.creator_asset_account.to_account_info(),
                    to: ctx.accounts.asset_vault_account.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            ctx.accounts.creator_asset_account.amount,
        )?;
    }
    
    emit!(AuctionCreated {
        auction_id,
        creator: ctx.accounts.creator.key(),
        asset_mint,
        auction_type: AuctionType::SealedBid,
        start_time,
        end_time,
        minimum_bid,
    });
    
    Ok(())
}

pub fn create_dutch_auction(
    ctx: Context<CreateDutchAuction>,
    auction_id: u64,
    asset_mint: Pubkey,
    starting_price: u64,
    price_decrease_rate: u64,
    duration: u64,
    reserve_price_encrypted: [u8; 32],
    reserve_price_nonce: u128,
) -> Result<()> {
    let protocol = &ctx.accounts.protocol_state;
    require!(!protocol.paused, ShadowProtocolError::ProtocolPaused);
    
    require!(
        price_decrease_rate > 0,
        ShadowProtocolError::InvalidPriceDecreaseRate
    );
    
    let clock = Clock::get()?;
    let start_time = clock.unix_timestamp;
    let end_time = start_time + duration as i64;
    
    require!(
        duration as i64 <= MAX_AUCTION_DURATION,
        ShadowProtocolError::AuctionDurationTooLong
    );
    
    let auction = &mut ctx.accounts.auction;
    auction.auction_id = auction_id;
    auction.creator = ctx.accounts.creator.key();
    auction.asset_mint = asset_mint;
    auction.asset_vault = ctx.accounts.asset_vault.key();
    auction.auction_type = AuctionType::Dutch;
    auction.status = AuctionStatus::Active;
    auction.start_time = start_time;
    auction.end_time = end_time;
    auction.minimum_bid = 0;
    auction.reserve_price_encrypted = reserve_price_encrypted;
    auction.reserve_price_nonce = reserve_price_nonce;
    auction.current_price = starting_price;
    auction.price_decrease_rate = price_decrease_rate;
    auction.bid_count = 0;
    auction.winner = None;
    auction.winning_amount = 0;
    auction.settled_at = None;
    auction.bump = ctx.bumps.auction;
    
    // Transfer asset to vault
    if ctx.accounts.creator_asset_account.amount > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.creator_asset_account.to_account_info(),
                    to: ctx.accounts.asset_vault_account.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            ctx.accounts.creator_asset_account.amount,
        )?;
    }
    
    emit!(AuctionCreated {
        auction_id,
        creator: ctx.accounts.creator.key(),
        asset_mint,
        auction_type: AuctionType::Dutch,
        start_time,
        end_time,
        minimum_bid: 0,
    });
    
    Ok(())
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct CreateSealedAuction<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + AuctionAccount::INIT_SPACE,
        seeds = [AUCTION_SEED, auction_id.to_le_bytes().as_ref()],
        bump
    )]
    pub auction: Account<'info, AuctionAccount>,
    
    #[account(
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    pub asset_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = creator,
        token::mint = asset_mint,
        token::authority = auction,
        seeds = [ASSET_VAULT_SEED, auction_id.to_le_bytes().as_ref()],
        bump
    )]
    pub asset_vault: Account<'info, Pubkey>,
    
    #[account(
        mut,
        associated_token::mint = asset_mint,
        associated_token::authority = auction
    )]
    pub asset_vault_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = asset_mint,
        associated_token::authority = creator
    )]
    pub creator_asset_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(auction_id: u64)]
pub struct CreateDutchAuction<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + AuctionAccount::INIT_SPACE,
        seeds = [AUCTION_SEED, auction_id.to_le_bytes().as_ref()],
        bump
    )]
    pub auction: Account<'info, AuctionAccount>,
    
    #[account(
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    pub asset_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = creator,
        token::mint = asset_mint,
        token::authority = auction,
        seeds = [ASSET_VAULT_SEED, auction_id.to_le_bytes().as_ref()],
        bump
    )]
    pub asset_vault: Account<'info, Pubkey>,
    
    #[account(
        mut,
        associated_token::mint = asset_mint,
        associated_token::authority = auction
    )]
    pub asset_vault_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = asset_mint,
        associated_token::authority = creator
    )]
    pub creator_asset_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}