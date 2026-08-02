process.env.COORDINATOR_SECRET_KEY = "dummy-secret-key";
process.env.ESCROW_CONTRACT_ADDRESS = "CCO5ZQKTAUJ4JXZLVK3NWE5RNWAT2KZDNEDP4NLN7AU35KK4VE7XGO4Q";

const escrowService = require("../services/escrowService");
const { Keypair, rpc, TransactionBuilder, Contract, xdr, scValToNative, nativeToScVal } = require("@stellar/stellar-sdk");

jest.mock("@stellar/stellar-sdk", () => {
  return {
    Networks: { TESTNET: "Test SDF Network ; September 2015" },
    Keypair: {
      fromSecret: jest.fn().mockReturnValue({
        publicKey: jest.fn().mockReturnValue("GBELXTVUSO745SBIL6OINE3FR3YB4BTXKOL5BY7LK6GC5AOQJCZOVMBX"),
      }),
    },
    rpc: {
      Server: jest.fn().mockImplementation(() => ({
        getAccount: jest.fn().mockResolvedValue({}),
        prepareTransaction: jest.fn().mockResolvedValue({
          sign: jest.fn(),
        }),
        sendTransaction: jest.fn().mockResolvedValue({
          status: "PENDING",
          hash: "test-hash",
        }),
        getTransaction: jest.fn().mockResolvedValue({
          status: "SUCCESS",
        }),
        simulateTransaction: jest.fn().mockResolvedValue({
          result: {
            retval: "mock-scval",
          },
        }),
      })),
      Account: jest.fn(),
    },
    Contract: jest.fn().mockImplementation(() => ({
      call: jest.fn().mockReturnValue("mock-operation"),
    })),
    TransactionBuilder: jest.fn().mockImplementation(() => ({
      addOperation: jest.fn().mockReturnThis(),
      setTimeout: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue("mock-tx"),
    })),
    xdr: {
      ScVal: {
        scvVoid: jest.fn().mockReturnValue("mock-void"),
      }
    },
    scValToNative: jest.fn().mockReturnValue({
      game_code: "GAME123",
      player1: "PLAYER1",
      player2: "PLAYER2",
      wager_amount: 100n,
      total_staked: 200n,
      created_at: 1000n,
      status: 1,
      winner: null,
    }),
    nativeToScVal: jest.fn().mockReturnValue("mock-scval"),
  };
});

describe("Escrow Service", () => {
  beforeEach(() => {
    escrowService.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMatch", () => {
    it("should fetch and parse match details correctly", async () => {
      const match = await escrowService.getMatch("GAME123");
      
      expect(match.gameCode).toBe("GAME123");
      expect(match.player1).toBe("PLAYER1");
      expect(match.wagerAmount).toBe("100");
      expect(match.status).toBe(1);
    });
  });

  describe("resolveWithWinner", () => {
    it("should resolve a match with a winner", async () => {
      const result = await escrowService.resolveWithWinner("GAME123", "PLAYER1");
      expect(result.status).toBe("SUCCESS");
    });
  });

  describe("resolveAsDraw", () => {
    it("should resolve a match as a draw", async () => {
      const result = await escrowService.resolveAsDraw("GAME123");
      expect(result.status).toBe("SUCCESS");
    });
  });
});
