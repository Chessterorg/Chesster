#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MatchStatus {
    Pending = 0,
    Active = 1,
    Resolved = 2,
    Refunded = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Match {
    pub game_code: String,
    pub player1: Address,
    pub player2: Option<Address>,
    pub wager_amount: i128,
    pub total_staked: i128,
    pub created_at: u64,
    pub status: MatchStatus,
    pub winner: Option<Address>,
    pub token: Address,
}

#[contract]
pub struct ChessterEscrow;

#[contractimpl]
impl ChessterEscrow {
    /// Initialize the contract with the coordinator address and admin fee (in basis points)
    pub fn init(env: Env, coordinator: Address, admin_bps: u32) {
        coordinator.require_auth();
        env.storage().instance().set(&soroban_sdk::symbol_short!("coord"), &coordinator);
        env.storage().instance().set(&soroban_sdk::symbol_short!("fee"), &admin_bps);
    }

    /// Player 1 creates a match and deposits the wager
    pub fn create_match(env: Env, game_code: String, player1: Address, token: Address, amount: i128) {
        player1.require_auth();
        
        if env.storage().persistent().has(&game_code) {
            panic!("Match already exists");
        }
        if amount <= 0 {
            panic!("Wager must be > 0");
        }

        // Transfer tokens from player1 to the contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&player1, &env.current_contract_address(), &amount);

        let m = Match {
            game_code: game_code.clone(),
            player1,
            player2: None,
            wager_amount: amount,
            total_staked: amount,
            created_at: env.ledger().timestamp(),
            status: MatchStatus::Pending,
            winner: None,
            token,
        };

        env.storage().persistent().set(&game_code, &m);
    }

    /// Player 2 joins an existing match and deposits the wager
    pub fn join_match(env: Env, game_code: String, player2: Address) {
        player2.require_auth();

        let mut m: Match = env.storage().persistent().get(&game_code).expect("Match not found");
        
        if m.status != MatchStatus::Pending {
            panic!("Match not pending");
        }
        if m.player2.is_some() {
            panic!("Match already has 2 players");
        }
        if m.player1 == player2 {
            panic!("Cannot join own match");
        }

        // Transfer tokens from player2 to the contract
        let token_client = token::Client::new(&env, &m.token);
        token_client.transfer(&player2, &env.current_contract_address(), &m.wager_amount);

        m.player2 = Some(player2);
        m.status = MatchStatus::Active;
        m.total_staked += m.wager_amount;

        env.storage().persistent().set(&game_code, &m);
    }

    /// Coordinator resolves the match
    pub fn resolve_match(env: Env, game_code: String, winner: Option<Address>) {
        let coordinator: Address = env.storage().instance().get(&soroban_sdk::symbol_short!("coord")).expect("Not initialized");
        coordinator.require_auth();

        let mut m: Match = env.storage().persistent().get(&game_code).expect("Match not found");

        if m.status != MatchStatus::Active {
            panic!("Match not active");
        }

        let token_client = token::Client::new(&env, &m.token);

        if let Some(w) = winner.clone() {
            if w != m.player1 && Some(w.clone()) != m.player2 {
                panic!("Invalid winner address");
            }
            
            let admin_bps: u32 = env.storage().instance().get(&soroban_sdk::symbol_short!("fee")).unwrap_or(500);
            let admin_fee = (m.total_staked * (admin_bps as i128)) / 10000;
            let winner_pay = m.total_staked - admin_fee;

            token_client.transfer(&env.current_contract_address(), &w, &winner_pay);
            token_client.transfer(&env.current_contract_address(), &coordinator, &admin_fee);
        } else {
            // Draw: refund both players
            token_client.transfer(&env.current_contract_address(), &m.player1, &m.wager_amount);
            if let Some(p2) = m.player2.clone() {
                token_client.transfer(&env.current_contract_address(), &p2, &m.wager_amount);
            }
        }

        m.status = MatchStatus::Resolved;
        m.winner = winner;
        env.storage().persistent().set(&game_code, &m);
    }

    /// Refund after timeout (1 hour)
    pub fn refund_after_timeout(env: Env, game_code: String) {
        let mut m: Match = env.storage().persistent().get(&game_code).expect("Match not found");

        if m.status == MatchStatus::Resolved || m.status == MatchStatus::Refunded {
            panic!("Already resolved or refunded");
        }
        
        // 3600 seconds = 1 hour
        if env.ledger().timestamp() < m.created_at + 3600 {
            panic!("Wait 1 hour from creation");
        }

        let token_client = token::Client::new(&env, &m.token);
        
        token_client.transfer(&env.current_contract_address(), &m.player1, &m.wager_amount);
        if let Some(p2) = m.player2.clone() {
            token_client.transfer(&env.current_contract_address(), &p2, &m.wager_amount);
        }

        m.status = MatchStatus::Refunded;
        env.storage().persistent().set(&game_code, &m);
    }

    /// Get match details
    pub fn get_match(env: Env, game_code: String) -> Match {
        env.storage().persistent().get(&game_code).expect("Match not found")
    }
}
