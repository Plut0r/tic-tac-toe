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

      const emptyIndexes = squares
        .map((square, index) => (square === null ? index : null))
        .filter((val) => val !== null);

      const randomIndex =
        emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
      putComputerAt(randomIndex);
    }
  }, [squares, isComputerTurn]);

  // useEffect(() => {
  //   const playerWon = linesThatAre("x", "x", "x").length > 0;

  //   const computerWon = linesThatAre("o", "o", "o").length > 0;
  //   if (playerWon) {
  //     setWinner("x");
  //     setWins((prev) => ({ ...prev, playerWins: prev.playerWins + 1 }));
  //   }
  //   if (computerWon) {
  //     setWinner("o");
  //     setWins((prev) => ({ ...prev, cpuWins: prev.cpuWins + 1 }));
  //   }
  // }, [squares]);

  function handleSquareClick(index: number) {
    if (squares[index] !== null || winner) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[index] = "x";
    setSquares(newSquares);

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
  // console.log(winningSquares);

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
