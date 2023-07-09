import { useState, useEffect } from "react";
import Square from "./Square";

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

type SquareValue = "x" | "o" | null;

function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isComputerTurn, setIsComputerTurn] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [wins, setWins] = useState({
    playerWins: 0,
    cpuWins: 0,
    ties: 0,
  });
  const [lastMove, setLastMove] = useState<number | null>(null);

  function checkWin() {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return true;
      }
    }
    return false;
  }

  function calculateWinningIndex(squares: SquareValue[]) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return [a, b, c];
      }
    }
    return null;
  }

  function calculateWinner(squares: SquareValue[]) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  function checkTie() {
    if (!checkWin()) {
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // @ts-ignore
  const putComputerAt = (index) => {
    if (winner) {
      return;
    }

    const newSquares = squares.slice();
    newSquares[index] = "o";
    setSquares(newSquares);

    if (calculateWinner(newSquares) === "o") {
      setWins((prev) => ({ ...prev, cpuWins: prev.cpuWins + 1 }));
      setWinner("o");
      return;
    }

    setIsComputerTurn(false);

    if (checkTie()) {
      setWins((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
  };

  const linesThatAre = (
    a: string | null,
    b: string | null,
    c: string | null
  ) => {
    return lines.filter((squareIndexes) => {
      const squareValues = squareIndexes.map((index) => squares[index]);
      return (
        JSON.stringify([a, b, c].sort()) === JSON.stringify(squareValues.sort())
      );
    });
  };

  function getLinesContaining(squareIndex: number): number[][] {
    const row: number = Math.floor(squareIndex / 3);
    const col: number = squareIndex % 3;

    const horizontalLine: number[] = [row * 3, row * 3 + 1, row * 3 + 2];
    const verticalLine: number[] = [col, col + 3, col + 6];
    const diagonalLine1: number[] = [0, 4, 8];
    const diagonalLine2: number[] = [2, 4, 6];

    return [horizontalLine, verticalLine, diagonalLine1, diagonalLine2].filter(
      (line: number[]) => line.includes(squareIndex)
    );
  }

  type Mark = "x" | "o";

  function checkForks(squares: SquareValue[]): number[] {
    const player: Mark = "o";
    const opponent: Mark = "x";
    // @ts-ignore
    const emptySquares: number[] = squares.filter(
      // @ts-ignore
      (index: number) => squares[index] === null
    );
    const forks: number[] = [];

    for (let i = 0; i < emptySquares.length; i++) {
      const squareIndex: number = emptySquares[i];
      squares[squareIndex] = player;

      const lines: number[][] = getLinesContaining(squareIndex).filter(
        (line: number[]) =>
          line.filter((index: number) => squares[index] === opponent).length ===
          1
      );

      for (let j = 0; j < lines.length; j++) {
        const line: number[] = lines[j];
        const emptyIndex: number = line.filter(
          (index: number) => squares[index] === null
        )[0];

        squares[emptyIndex] = player;

        const forksInLine: number[] = getLinesContaining(emptyIndex).filter(
          (forkLine: number[]) =>
            forkLine.filter((index: number) => squares[index] === opponent)
              .length === 1 &&
            forkLine.filter((index: number) => squares[index] === player)
              .length === 0
        )[0];

        if (forksInLine) {
          forks.push(emptyIndex);
        }

        squares[emptyIndex] = null;
      }

      squares[squareIndex] = null;
    }

    return forks;
  }

  useEffect(() => {
    if (isComputerTurn) {
      const winningLines = linesThatAre("o", "o", null);
      if (winningLines.length > 0) {
        const winIndex = winningLines[0].filter(
          (index) => squares[index] === null
        )[0];
        putComputerAt(winIndex);
        return;
      }

      const linesToBlock = linesThatAre("x", "x", null);
      if (linesToBlock.length > 0) {
        const blockIndex = linesToBlock[0].filter(
          (index) => squares[index] === null
        )[0];
        putComputerAt(blockIndex);
        return;
      }

      const linesToContinue = linesThatAre("o", null, null);
      if (linesToContinue.length > 0) {
        putComputerAt(
          linesToContinue[0].filter((index) => squares[index] === null)[0]
        );
        return;
      }

      const forks = checkForks(squares);
      if (forks.length > 0) {
        putComputerAt(forks[0]);
        return;
      }

      const emptyIndexes = squares
        .map((square, index) => (square === null ? index : null))
        .filter((val) => val !== null);

      let randomIndex;

      if (lastMove === 4) {
        // Player's last move is center
        const corners = [0, 2, 6, 8];
        randomIndex = corners[Math.floor(Math.random() * corners.length)];
        // @ts-ignore
      } else if ([0, 2, 6, 8].includes(lastMove)) {
        // Player's last move is a corner
        randomIndex = 4;
      } else {
        // Player's last move is an edge
        const adjacentCorners = {
          1: [0, 2],
          3: [0, 6],
          5: [2, 8],
          7: [6, 8],
        };
        const cornerIndex =
          // @ts-ignore
          adjacentCorners[lastMove][Math.floor(Math.random() * 2)];
        randomIndex = cornerIndex;
      }

      // Check if the chosen index is empty
      if (emptyIndexes.includes(randomIndex)) {
        putComputerAt(randomIndex);
      } else {
        // Choose a new random index if the first one is not empty
        const newRandomIndex =
          emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        putComputerAt(newRandomIndex);
      }
    }
  }, [squares, isComputerTurn]);

  function handleSquareClick(index: number) {
    if (squares[index] !== null || winner) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[index] = "x";
    setSquares(newSquares);
    setLastMove(index);

    if (calculateWinner(newSquares) === "x") {
      setWins((prev) => ({ ...prev, playerWins: prev.playerWins + 1 }));
      setWinner("x");
      return;
    }

    setIsComputerTurn(true);
    if (checkTie()) {
      setWins((prev) => ({ ...prev, ties: prev.ties + 1 }));
    }
  }

  function handleRestart() {
    setSquares(Array(9).fill(null));
    setWinner(null);
    setWins((prev) => ({
      ...prev,
      playerWins: 0,
      ties: 0,
      cpuWins: 0,
    }));
  }

  function handleNext() {
    setSquares(Array(9).fill(null));
    setWinner(null);
  }

  const winningSquares = calculateWinningIndex(squares)
    ? calculateWinningIndex(squares)
    : [];

  return (
    <div>
      <div className="flex justify-between mb-3">
        <div className="flex gap-1">
          <span className="text-2xl text-[hsl(178,60%,48%)] font-bold">X</span>
          <span className="text-2xl text-[hsl(39,88%,58%)] font-bold">O</span>
        </div>
        <div
          className="restart flex justify-center items-center cursor-pointer"
          onClick={handleRestart}
        >
          <img src="/icon-restart.svg" alt="restart-icon" />
        </div>
      </div>
      <div className="board">
        {squares.map((square, index) => (
          <Square
            key={index}
            x={square === "x" ? 1 : 0}
            o={square === "o" ? 1 : 0}
            handleClick={() => handleSquareClick(index)}
            isWinning={winningSquares && winningSquares.includes(index)}
            winner={winner}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="h-[4rem] rounded-2xl bg-[hsl(178,60%,48%)] flex flex-col justify-center items-center">
          <h4 className="text-[0.875rem] text-[hsl(202,32%,15%)] font-semibold">
            X (YOU)
          </h4>
          <p className="text-[1.25rem] text-[hsl(202,32%,15%)] font-bold">
            {wins.playerWins}
          </p>
        </div>
        <div className="h-[4rem] rounded-2xl bg-[hsl(198,23%,72%)] flex flex-col justify-center items-center">
          <h4 className="text-[0.875rem] text-[hsl(202,32%,15%)] font-semibold">
            TIES
          </h4>
          <p className="text-[1.25rem] text-[hsl(202,32%,15%)] font-bold">
            {wins.ties}
          </p>
        </div>
        <div className="h-[4rem] rounded-2xl bg-[hsl(39,88%,58%)] flex flex-col justify-center items-center">
          <h4 className="text-[0.875rem] text-[hsl(202,32%,15%)] font-semibold">
            O (CPU)
          </h4>
          <p className="text-[1.25rem] text-[hsl(202,32%,15%)] font-bold">
            {wins.cpuWins}
          </p>
        </div>
      </div>
      {!!winner && (
        <div className="flex flex-col justify-center items-center mt-3 bg-[hsl(199,35%,19%)] rounded-lg p-1">
          <div className="text-[1.3rem]">
            {winner === "x"
              ? "You WON!"
              : `${winner === "o" ? "You LOST!" : ""}`}
          </div>
          <div>
            <button className="quitBtn" onClick={handleRestart}>
              Quit
            </button>
            <button className="nextBtn" onClick={handleNext}>
              Next Round
            </button>
          </div>
        </div>
      )}
      {checkTie() && (
        <div className="flex flex-col justify-center items-center mt-3 bg-[hsl(199,35%,19%)] rounded-lg p-1">
          <div className="text-[1.3rem]">There is a TIE!</div>
          <div>
            <button className="quitBtn" onClick={handleRestart}>
              Quit
            </button>
            <button className="nextBtn" onClick={handleNext}>
              Next Round
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;
