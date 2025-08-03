use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ShadowProtocolError;

pub fn initialize_protocol(ctx: Context<InitializeProtocol>) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol_state;
    
    protocol.authority = ctx.accounts.authority.key();
    protocol.protocol_fee = 50; // 0.5% default fee
    protocol.fee_recipient = ctx.accounts.fee_recipient.key();
    protocol.paused = false;
    protocol.bump = ctx.bumps.protocol_state;
    protocol.reserved = [0u8; 128];
    
    msg!("Shadow Protocol initialized");
    msg!("Authority: {}", protocol.authority);
    msg!("Fee recipient: {}", protocol.fee_recipient);
    msg!("Protocol fee: {} basis points", protocol.protocol_fee);
    
    Ok(())
}

pub fn set_pause_state(ctx: Context<SetPauseState>, paused: bool) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol_state;
    
    require!(
        ctx.accounts.authority.key() == protocol.authority,
        ShadowProtocolError::Unauthorized
    );
    
    protocol.paused = paused;
    
    msg!("Protocol pause state updated: {}", paused);
    
    Ok(())
}

pub fn update_protocol_fee(ctx: Context<UpdateProtocolFee>, new_fee: u16) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol_state;
    
    require!(
        ctx.accounts.authority.key() == protocol.authority,
        ShadowProtocolError::Unauthorized
    );
    
    require!(
        new_fee <= MAX_PROTOCOL_FEE,
        ShadowProtocolError::InvalidProtocolFee
    );
    
    protocol.protocol_fee = new_fee;
    
    msg!("Protocol fee updated to {} basis points", new_fee);
    
    Ok(())
}

pub fn update_fee_recipient(ctx: Context<UpdateFeeRecipient>, new_recipient: Pubkey) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol_state;
    
    require!(
        ctx.accounts.authority.key() == protocol.authority,
        ShadowProtocolError::Unauthorized
    );
    
    protocol.fee_recipient = new_recipient;
    
    msg!("Fee recipient updated to {}", new_recipient);
    
    Ok(())
}

pub fn transfer_authority(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
    let protocol = &mut ctx.accounts.protocol_state;
    
    require!(
        ctx.accounts.authority.key() == protocol.authority,
        ShadowProtocolError::Unauthorized
    );
    
    protocol.authority = new_authority;
    
    msg!("Authority transferred to {}", new_authority);
    
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + ProtocolState::INIT_SPACE,
        seeds = [PROTOCOL_SEED],
        bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    /// CHECK: Fee recipient account
    pub fee_recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPauseState<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
}

#[derive(Accounts)]
pub struct UpdateProtocolFee<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
}

#[derive(Accounts)]
pub struct UpdateFeeRecipient<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    /// CHECK: New fee recipient account
    pub new_recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump = protocol_state.bump
    )]
    pub protocol_state: Account<'info, ProtocolState>,
    
    /// CHECK: New authority account
    pub new_authority: AccountInfo<'info>,
}