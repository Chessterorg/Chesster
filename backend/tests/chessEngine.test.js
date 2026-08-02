const chessEngine = require("../services/chessEngine");

describe("Chess Engine", () => {
  describe("initBoard", () => {
    it("should initialize a standard 8x8 chess board", () => {
      const board = chessEngine.initBoard();
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);
      
      // Check some initial positions
      expect(board[0][0]).toBe("r"); // Black rook
      expect(board[0][4]).toBe("k"); // Black king
      expect(board[7][0]).toBe("R"); // White rook
      expect(board[7][4]).toBe("K"); // White king
      expect(board[1][0]).toBe("p"); // Black pawn
      expect(board[6][0]).toBe("P"); // White pawn
      expect(board[3][3]).toBe("."); // Empty square
    });
  });

  describe("isValidMove", () => {
    let board;

    beforeEach(() => {
      board = chessEngine.initBoard();
    });

    it("should allow a valid pawn move", () => {
      const result = chessEngine.isValidMove(board, [6, 4], [4, 4], "white", null);
      expect(result.valid).toBe(true);
    });

    it("should reject an invalid pawn move", () => {
      const result = chessEngine.isValidMove(board, [6, 4], [3, 4], "white", null);
      expect(result.valid).toBe(false);
    });

    it("should reject moving opponent's piece", () => {
      const result = chessEngine.isValidMove(board, [1, 4], [3, 4], "white", null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Not your piece");
    });

    it("should allow a valid knight move", () => {
      const result = chessEngine.isValidMove(board, [7, 1], [5, 2], "white", null);
      expect(result.valid).toBe(true);
    });
  });

  describe("makeMove", () => {
    let board;

    beforeEach(() => {
      board = chessEngine.initBoard();
    });

    it("should update the board state correctly", () => {
      const newBoard = chessEngine.makeMove(board, [6, 4], [4, 4], null, false);
      expect(newBoard[6][4]).toBe(".");
      expect(newBoard[4][4]).toBe("P");
    });
  });

  describe("isKingInCheck", () => {
    it("should detect when king is in check", () => {
      const board = [
        [".", ".", ".", ".", "k", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", "R", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", "K", ".", ".", "."]
      ];
      
      expect(chessEngine.isKingInCheck(board, "black")).toBe(true);
      expect(chessEngine.isKingInCheck(board, "white")).toBe(false);
    });
  });
});
