const { Keypair, rpc, TransactionBuilder, Networks, Contract, xdr, scValToNative, nativeToScVal } = require("@stellar/stellar-sdk");

const RPC_URL = process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS || null;
const COORDINATOR_SECRET_KEY = process.env.COORDINATOR_SECRET_KEY;

// Special address representing a draw result
const DRAW_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"; // A valid but unusable address for draw

let server, coordinatorKeypair, contract;

function init() {
	server = new rpc.Server(RPC_URL);

	if (!COORDINATOR_SECRET_KEY) {
		console.warn("[Escrow] COORDINATOR_SECRET_KEY not set — operating in read-only mode");
	} else {
		coordinatorKeypair = Keypair.fromSecret(COORDINATOR_SECRET_KEY);
		console.log("[Escrow] Coordinator wallet:", coordinatorKeypair.publicKey());
	}

	if (ESCROW_ADDRESS) {
		contract = new Contract(ESCROW_ADDRESS);
		console.log("[Escrow] Contract connected at", ESCROW_ADDRESS);
	} else {
		console.warn("[Escrow] ESCROW_CONTRACT_ADDRESS not set — escrow disabled");
	}
}

/**
 * Convert a human-readable game code string to a Soroban String scval.
 */
function gameCodeToScVal(gameCode) {
	return nativeToScVal(gameCode, { type: "string" });
}

/**
 * Coordinator resolves the match.
 *
 * @param {string} gameCode  - Human-readable game code
 * @param {string} winner    - Player address, or DRAW_ADDRESS for a draw
 */
async function resolveMatch(gameCode, winner) {
	if (!contract) throw new Error("Escrow contract not configured");
	if (!coordinatorKeypair) throw new Error("Coordinator secret key not configured");

	const sourceAccount = await server.getAccount(coordinatorKeypair.publicKey());
	
    let winnerScVal;
    if (winner === DRAW_ADDRESS) {
        winnerScVal = xdr.ScVal.scvVoid(); // Option::None
    } else {
        winnerScVal = nativeToScVal(winner, { type: "address" }); // Option::Some(Address)
    }

	const tx = new TransactionBuilder(sourceAccount, {
		fee: "10000",
		networkPassphrase: NETWORK_PASSPHRASE,
	})
		.addOperation(
			contract.call("resolve_match",
				gameCodeToScVal(gameCode),
				winnerScVal
			)
		)
		.setTimeout(30)
		.build();

    const preparedTx = await server.prepareTransaction(tx);
	preparedTx.sign(coordinatorKeypair);

	const sendResponse = await server.sendTransaction(preparedTx);
    if (sendResponse.status === "PENDING") {
        let txResponse = await server.getTransaction(sendResponse.hash);
        while (txResponse.status === "NOT_FOUND") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            txResponse = await server.getTransaction(sendResponse.hash);
        }
        if (txResponse.status === "SUCCESS") {
            return txResponse;
        } else {
            throw new Error(`Transaction failed: ${JSON.stringify(txResponse)}`);
        }
    } else {
        throw new Error(`Transaction failed: ${JSON.stringify(sendResponse)}`);
    }
}

/**
 * Read match details from the contract.
 */
async function getMatch(gameCode) {
	if (!contract) throw new Error("Escrow contract not configured");
	
    const tx = new TransactionBuilder(await server.getAccount(ESCROW_ADDRESS).catch(() => new rpc.Account(ESCROW_ADDRESS, "0")), {
		fee: "10000",
		networkPassphrase: NETWORK_PASSPHRASE,
	})
		.addOperation(
			contract.call("get_match", gameCodeToScVal(gameCode))
		)
		.setTimeout(30)
		.build();

    const simResponse = await server.simulateTransaction(tx);
    if (simResponse.error) {
        throw new Error(`Simulation failed: ${simResponse.error}`);
    }

    const result = scValToNative(simResponse.result.retval);
    
	return {
		gameCode:    result.game_code,
		player1:     result.player1,
		player2:     result.player2,
		wagerAmount: result.wager_amount.toString(),
		totalStaked: result.total_staked.toString(),
		createdAt:   Number(result.created_at),
		status:      Number(result.status),
		winner:      result.winner,
	};
}

/** Convenience: resolve with an explicit winner address. */
async function resolveWithWinner(gameCode, winnerAddress) {
	return resolveMatch(gameCode, winnerAddress);
}

/** Convenience: resolve as a draw. */
async function resolveAsDraw(gameCode) {
	return resolveMatch(gameCode, DRAW_ADDRESS);
}

module.exports = {
	init,
	resolveMatch,
	resolveWithWinner,
	resolveAsDraw,
	getMatch,
	DRAW_ADDRESS,
};
