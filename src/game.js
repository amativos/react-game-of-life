import React from 'react';
import update from 'react-addons-update';
import async from 'async';

/*
* Game of Life. Grid of cells is represented by two-dimensional
* board with each cell represented by an integer, where 0 means
* that the cell is dead and >0 indicates cell's age. Older cells
* are drawn in lighter color.
*/
export default class GameContainer extends React.Component {
  static cellMaxAge = 8;

  state = {
    board: this._board({rows: 30, cols: 50}),
    generationCount: 0,
    speed: 60
  };
  gameRunning = false;

  _boardDimensions = (board) => {
    return {rows: board.length, cols: board[0].length};
  };

  // Create either a copy of the 'from' board or just an
  // empty board where all cells are dead. No need to
  // specify rows/cols when 'from' is specified.
  _board({ from = null, rows, cols }) {
    let board = [];

    if (from !== null) {
      let {rows: r, cols: c} = this._boardDimensions(from);
      [rows, cols] = [r, c];
    }
    for (let r = 0; r < rows; r++) {
      board.push([]);
      for (let c = 0; c < cols; c++) {
        board[r].push(from !== null ? from[r][c] : 0);
      }
    }
    return board;
  }

  // Check two boards for equivalence.
  _boardEQ(prevBoard, nextBoard) {
    let {rows, cols} = this._boardDimensions(prevBoard);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let [prevCell, nextCell] = [prevBoard[r][c], nextBoard[r][c]];
        if (prevCell !== nextCell) return false;
      }
    }
    return true;
  }

  boardSizeHandler = (rows, cols) => {
    this.setState({
      ...this.state,
      board: this._board({rows, cols}),
      generationCount: 0
    });
  };

  onCellClick = (row, col) => {
    let board = this._board({from: this.state.board});
    board[row][col] = !board[row][col];
    this.setState({ ...this.state, board });
  };

  onCellDrag = (row, col) => {
    if (this.state.board[row][col] === 0) {
      let board = this._board({from: this.state.board});
      board[row][col] = 1;
      this.setState({ ...this.state, board});
    }
  };

  boardActionHandler = (action) => {
    if (action === 'start') {
      this.startLife();
    } else if (action === 'stop') {
      this.stopLife();
    } else if (action === 'clear') {
      this.clearBoard();
    }
  };

  clearBoard() {
    if (this.gameRunning) this.stopLife();
    this.setState({
      ...this.state,
      board: this._board(this._boardDimensions(this.state.board)),
      generationCount: 0
    });
  }

  startLife() {
    this.gameRunning = true;

    async.doWhilst((done) => {
      let nextBoard = this.advanceGeneration(this.state.board);
      if (this._boardEQ(this.state.board, nextBoard)) return this.stopLife();

      this.setState({
        ...this.state,
        board: nextBoard,
        generationCount: this.state.generationCount + 1
      });
      setTimeout(done, this.state.speed);
    }, () => this.gameRunning);
  }

  stopLife() {
    this.gameRunning = false;
  }

  advanceGeneration(board) {
    let {rows, cols} = this._boardDimensions(board);
    let newBoard = this._board({rows, cols});

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cell = board[row][col];
        let neighbourCount = this.countLiveNeighbours(row, col);
        if (cell > 0) {
          if (neighbourCount === 2 || neighbourCount === 3) {
            newBoard[row][col] = cell + 1 <= GameContainer.cellMaxAge ? cell + 1 : cell;
          }
        } else if (neighbourCount === 3) newBoard[row][col] = 1;
      }
    }
    return newBoard;
  }

  countLiveNeighbours(row, col) {
    let count = 0;
    for (let drow = -1; drow <= 1; drow++) {
      for (let dcol = -1; dcol <=1; dcol++) {
        if ((drow != 0 || dcol != 0) &&
          this.inBounds(row+drow, col+dcol) &&
          this.state.board[row+drow][col+dcol] > 0) {
            count++;
          }
      }
    }
    return count;
  }

  inBounds(row, col) {
    let {rows: currRows, cols: currCols} = this._boardDimensions(this.state.board);
    return row >= 0 && row < currRows && col >= 0 && col < currCols;
  }

  renderBoard() {
    let board = [];
    let {rows, cols} = this._boardDimensions(this.state.board);

    for (var row = 0; row < rows; row++) {
      var cells = [];
      for (var col = 0; col < cols; col++) {
        cells.push(<Cell key={row+col}
                         state={this.state.board[row][col]}
                         clickHandler={this.onCellClick}
                         dragHandler={this.onCellDrag}
                         row={row}
                         col={col}
        />);
      }
      board.push(<GameBoardRow key={row} cells={cells} />);
    }
    return board;
  }

  render() {
    return <div id="game-container">
      <Toolbar boardActionHandler={this.boardActionHandler}
               boardSizeHandler={this.boardSizeHandler}
               generationCount={this.state.generationCount}
      />
      <GameBoard rows={this.renderBoard()} />
    </div>;
  }
}

class Toolbar extends React.Component {
  render = () => {
    return <div id="game-toolbar">
      <button onClick={this.props.boardActionHandler.bind(undefined, 'start')}>Start</button>
      <button onClick={this.props.boardActionHandler.bind(undefined, 'stop')}>Stop</button>
      <button onClick={this.props.boardActionHandler.bind(undefined, 'clear')}>Clear</button>
      <button onClick={this.props.boardSizeHandler.bind(undefined, 30, 50)}>50x30</button>
      <button onClick={this.props.boardSizeHandler.bind(undefined, 40, 70)}>70x40</button>
      <span>&nbsp;&nbsp;&nbsp;Generation: {this.props.generationCount}</span>
    </div>;
  }
}

class GameBoardRow extends React.Component {
  render() {
    return <div className="board-row">
      {this.props.cells}
    </div>;
  }
}

class GameBoard extends React.Component {
  render() {
    return <div id="game-board">
      {this.props.rows}
    </div>;
  }
}

class Cell extends React.Component {
  static mouseDown = false;

  handleMouseDown = () => {
    Cell.mouseDown = true;
    this.props.clickHandler(this.props.row, this.props.col);
  };

  handleMouseUp = () => {
    Cell.mouseDown = false;
  };

  handleMouseOver = () => {
    if (Cell.mouseDown) {
      this.props.dragHandler(this.props.row, this.props.col);
    }
  };

  render() {
    let style = {opacity: 1.0 / (this.props.state || 1)};
    return <div className={this.props.state > 0 ? 'cell--alive' : 'cell--dead'}
                style={style}
                onMouseDown={this.handleMouseDown}
                onMouseOver={this.handleMouseOver}
                onMouseUp={this.handleMouseUp}
    ></div>;
  }
}
