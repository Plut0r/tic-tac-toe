function Square(props: {
  handleClick: Function;
  x: number;
  o: number;
  isWinning: boolean | null;
  winner: string | null;
}) {
  // console.log(props.isWinning);
  return (
    <div
      className={`square ${
        props.x
          ? `${props.winner === "x" ? "xwin" : "x"}`
          : `${props.o ? `${props.winner === "o" ? "owin" : "o"}` : ""}`
      } ${
        props.isWinning && props.winner === "x"
          ? "win"
          : `${props.isWinning && props.winner === "o" ? "lose" : ""}`
      }`}
      onClick={() => props.handleClick()}
    >
      {props.x ? "x" : props.o ? "o" : ""}
    </div>
  );
}

export default Square;
