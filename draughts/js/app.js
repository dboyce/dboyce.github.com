(function() {
  var Colour, ComputerPlayer, DragNDropManager, DraughtsBoard, KeyType, King, Move, Piece, Square, api, black, white,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  $(document).ready(function() {
    var AppView, BoardModel, PieceModel, PieceView, SquareModel, SquareView, appView, computer, dragDrop;
    PieceModel = (function(_super) {

      __extends(PieceModel, _super);

      function PieceModel() {
        PieceModel.__super__.constructor.apply(this, arguments);
      }

      PieceModel.prototype.initialize = function() {
        return this.piece = this.get('piece');
      };

      return PieceModel;

    })(Backbone.Model);
    SquareModel = (function(_super) {

      __extends(SquareModel, _super);

      function SquareModel() {
        SquareModel.__super__.constructor.apply(this, arguments);
      }

      SquareModel.prototype.initialize = function() {
        this.square = this.get('square');
        this.board = this.get('board');
        this.row = this.square.row;
        return this.col = this.square.col;
      };

      SquareModel.prototype.getTargetSquares = function() {
        var ret, square, vector, _i, _len, _ref;
        ret = [];
        if (this.square.piece != null) {
          _ref = this.square.piece.vectors;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            vector = _ref[_i];
            square = this.board.getSquareView(vector[0] + this.row, vector[1] + this.col);
            if ((square != null) && square.model.square.isEmpty()) {
              ret.push(square);
            }
          }
        }
        return ret;
      };

      return SquareModel;

    })(Backbone.Model);
    BoardModel = (function(_super) {

      __extends(BoardModel, _super);

      function BoardModel() {
        BoardModel.__super__.constructor.apply(this, arguments);
      }

      BoardModel.prototype.model = SquareModel;

      BoardModel.prototype.initialize = function() {
        this.board = new DraughtsBoard();
        this.squareModels = {};
        this.board.listener = this;
        return this.pieceViews = {};
      };

      BoardModel.prototype.remove = function(piece) {
        return this.pieceViews[piece].remove();
      };

      BoardModel.prototype.move = function(piece, to) {
        this.pieceViews[piece].move(to);
        if (piece.colour === white) return this.trigger('move');
      };

      BoardModel.prototype.addPiece = function(piece) {
        var view;
        view = new PieceView({
          model: new PieceModel({
            piece: piece
          }),
          appView: this.appView
        });
        this.pieceViews[piece] = view;
        if (piece.colour === white) return dragDrop.addDraggable(view.el);
      };

      BoardModel.prototype.populate = function() {
        var row, square, _i, _j, _len, _len2, _ref;
        _ref = [].concat(this.board.squares).reverse();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
            square = row[_j];
            this.add({
              square: square,
              board: this
            });
          }
        }
        return this.board.initGame();
      };

      return BoardModel;

    })(Backbone.Collection);
    PieceView = (function(_super) {

      __extends(PieceView, _super);

      function PieceView() {
        PieceView.__super__.constructor.apply(this, arguments);
      }

      PieceView.prototype.tagName = 'div';

      PieceView.prototype.attributes = function() {
        return {
          "class": "piece " + (this.model.piece.colour.name.toLowerCase()) + " " + (this.model.piece instanceof King ? 'king' : '')
        };
      };

      PieceView.prototype.initialize = function() {
        this.piece = this.model.piece;
        this.appView = this.options.appView;
        this.king = this.piece instanceof King;
        if (this.king) $(this.el).append("K");
        return $(this.el).data('piece', this);
      };

      PieceView.prototype.remove = function() {
        return $(this.el).remove();
      };

      PieceView.prototype.move = function(square) {
        $(this.el).detach();
        this.square = square;
        return this.appView.getSquareView(this.square.row, this.square.col).setPiece(this);
      };

      return PieceView;

    })(Backbone.View);
    SquareView = (function(_super) {

      __extends(SquareView, _super);

      function SquareView() {
        SquareView.__super__.constructor.apply(this, arguments);
      }

      SquareView.prototype.tagName = "div";

      SquareView.prototype.attributes = function() {
        return {
          "class": "square " + (this.model.square.colour.name.toLowerCase())
        };
      };

      SquareView.prototype.setPiece = function(piece) {
        $(this.el).children().remove();
        return $(this.el).append(piece.el);
      };

      SquareView.prototype.render = function() {
        return this;
      };

      return SquareView;

    })(Backbone.View);
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        this.addSquare = __bind(this.addSquare, this);
        AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.tagName = 'div';

      AppView.prototype.attributes = {
        "class": "board"
      };

      AppView.prototype.initialize = function() {
        this.squareCount = 0;
        this.el = $('div#board');
        this.squareViews = {};
        this.board = new BoardModel();
        this.board.appView = this;
        this.board.bind('add', this.addSquare);
        return this.board.populate();
      };

      AppView.prototype.addSquare = function(model) {
        var row, square, view,
          _this = this;
        if (this.squareCount++ % 8 === 0) {
          this.row = $("<div class='row'></div>").appendTo($(this.el));
        }
        view = new SquareView({
          model: model
        });
        $(this.row).append(view.render().el);
        dragDrop.addDropTarget(view.el, function(el) {
          var move, pieceView;
          pieceView = $(el).data('piece');
          if (pieceView == null) throw "couldn't locate piece for: " + el;
          move = pieceView.piece.getMove(model.square);
          if (move != null) {
            move.take();
            return true;
          } else {
            return false;
          }
        });
        square = model.square;
        row = this.squareViews[square.row];
        if (!row) {
          row = {};
          this.squareViews[square.row] = row;
        }
        return row[square.col] = view;
      };

      AppView.prototype.getSquareView = function(row, col) {
        var _ref;
        return (_ref = this.squareViews[row]) != null ? _ref[col] : void 0;
      };

      return AppView;

    })(Backbone.View);
    dragDrop = new DragNDropManager();
    appView = new AppView();
    computer = new ComputerPlayer(appView.board.board, black);
    return appView.board.on('move', function() {
      try {
        dragDrop.dragDisabled = true;
        return computer.move().take();
      } finally {
        dragDrop.dragDisabled = false;
      }
    });
  });

  KeyType = (function() {

    KeyType.prototype.id = 0;

    function KeyType() {
      this.id = ++KeyType.prototype.id;
    }

    KeyType.prototype.toString = function() {
      return this.id;
    };

    return KeyType;

  })();

  Colour = (function() {

    Colour.prototype.BLACK = new Colour("BLACK");

    Colour.prototype.WHITE = new Colour("WHITE");

    function Colour(name) {
      this.name = name;
    }

    Colour.prototype.flip = function() {
      if (this === Colour.prototype.BLACK) {
        return Colour.prototype.WHITE;
      } else {
        return Colour.prototype.BLACK;
      }
    };

    Colour.prototype.toString = function() {
      return this.name;
    };

    return Colour;

  })();

  black = Colour.prototype.BLACK;

  white = Colour.prototype.WHITE;

  Piece = (function(_super) {

    __extends(Piece, _super);

    function Piece(colour, board) {
      var deltaI;
      this.colour = colour;
      this.board = board;
      Piece.__super__.constructor.call(this);
      deltaI = this.colour === black ? -1 : 1;
      this.vectors = [[deltaI, -1], [deltaI, 1]];
      this.board.addPiece(this);
      this.value = 1;
    }

    Piece.prototype.isKinged = function() {
      return (this.square != null) && (this.colour === white && this.square.row === 7 || this.square.row === 0);
    };

    Piece.prototype.move = function(square) {
      return this.board.movePiece(this, square);
    };

    Piece.prototype.take = function(piece, jumpTo) {
      this.board.removePiece(piece);
      return this.move(jumpTo);
    };

    Piece.prototype.getMove = function(square) {
      var colDelta, hopped, ret, rowDelta;
      if (!((square != null) && square.isEmpty())) return null;
      colDelta = square.col - this.square.col;
      rowDelta = square.row - this.square.row;
      if (Math.abs(colDelta) === 2 && Math.abs(rowDelta) === 2) {
        hopped = this.board.getSquare(this.square.row + rowDelta / 2, this.square.col + colDelta / 2);
        if ((hopped != null) && !hopped.isEmpty() && hopped.piece.colour === this.colour.flip()) {
          if (this instanceof King || rowDelta / 2 === this.vectors[0][0]) {
            ret = new Move(this, this.square, square, 1);
            ret.hops.push(hopped);
            return ret;
          }
        }
      } else if (Math.abs(colDelta) === 1 && Math.abs(rowDelta) === 1) {
        if (this instanceof King || rowDelta === this.vectors[0][0]) {
          return new Move(this, this.square, square, 0);
        }
      }
      return null;
    };

    return Piece;

  })(KeyType);

  King = (function(_super) {

    __extends(King, _super);

    function King(colour, board) {
      this.colour = colour;
      this.board = board;
      King.__super__.constructor.call(this, this.colour, this.board);
      this.vectors = [[1, -1], [1, 1], [[-1, -1], [-1, 1]]];
      this.value = 2;
    }

    King.prototype.isKinged = function() {
      return false;
    };

    return King;

  })(Piece);

  Square = (function() {

    function Square(row, col, colour) {
      this.row = row;
      this.col = col;
      this.colour = colour;
    }

    Square.prototype.isEmpty = function() {
      return !(this.piece != null);
    };

    Square.prototype.toString = function() {
      return "" + 'abcdefgh'[this.col] + "," + this.row;
    };

    return Square;

  })();

  DraughtsBoard = (function() {

    function DraughtsBoard(factory) {
      var board, cols, i, j, name, row, _len, _ref;
      this.pieces = {};
      this.pieces[white] = [];
      this.pieces[black] = [];
      this.publish = true;
      this.squares = [];
      for (i = 0; i <= 7; i++) {
        row = [];
        this.squares.push(row);
        for (j = 0; j <= 7; j++) {
          row.push(new Square(i, j, i % 2 === j % 2 ? black : white));
        }
      }
      if (factory != null) {
        board = this;
        cols = {};
        _ref = 'abcdefgh'.split('');
        for (i = 0, _len = _ref.length; i < _len; i++) {
          name = _ref[i];
          cols[name] = i;
        }
        factory.call({
          black: function() {
            var args, col, i, _len2, _results, _step;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            _results = [];
            for (i = 0, _len2 = args.length, _step = 2; i < _len2; i += _step) {
              col = args[i];
              _results.push(new Piece(black, board).move(board.getSquare(args[i + 1], args[i])));
            }
            return _results;
          },
          white: function() {
            var args, col, i, _len2, _results, _step;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            _results = [];
            for (i = 0, _len2 = args.length, _step = 2; i < _len2; i += _step) {
              col = args[i];
              _results.push(new Piece(white, board).move(board.getSquare(args[i + 1], args[i])));
            }
            return _results;
          }
        }, cols);
      }
    }

    DraughtsBoard.prototype.initGame = function() {
      var i, j, row, square, _len, _len2, _ref;
      this.pieces[white] = [];
      this.pieces[black] = [];
      _ref = this.squares;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        row = _ref[i];
        for (j = 0, _len2 = row.length; j < _len2; j++) {
          square = row[j];
          if (square.colour === black && !(i === 3 || i === 4)) {
            new Piece((i < 3 ? white : black), this).move(square);
          } else {
            square.piece = null;
          }
        }
      }
      return this;
    };

    DraughtsBoard.prototype.toString = function() {
      var name, piece, ret, row, rowSeparator, square, _i, _j, _len, _len2, _ref;
      rowSeparator = "--------" + "---------";
      ret = "" + rowSeparator + "\n";
      _ref = [].concat(this.squares).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
          square = row[_j];
          piece = square.piece;
          name = piece != null ? piece.colour.name.substr(0, 1) : void 0;
          if ((piece != null ? piece.value : void 0) === 1) {
            name = name.toLowerCase();
          }
          ret = "" + ret + "|" + (piece != null ? name : (square.color === black ? '*' : ' '));
        }
        ret = "" + ret + "|\n" + rowSeparator + "\n";
      }
      return ret;
    };

    DraughtsBoard.prototype.getSquare = function(i, j) {
      if (this.squares[i] != null) return this.squares[i][j];
    };

    DraughtsBoard.prototype.addPiece = function(piece) {
      this.pieces[piece.colour].push(piece);
      if (this.publish && this.listener) return this.listener.addPiece(piece);
    };

    DraughtsBoard.prototype.removePiece = function(piece) {
      var index;
      if (piece.square != null) piece.square.piece = null;
      piece.square = null;
      index = this.pieces[piece.colour].indexOf(piece);
      if (index === !-1) this.pieces[piece.colour].remove(index);
      if (this.publish && (this.listener != null)) {
        return this.listener.remove(piece);
      }
    };

    DraughtsBoard.prototype.movePiece = function(piece, square) {
      if (!square.isEmpty()) {
        throw "cannot move to " + square + " as it contains " + square.piece;
      }
      if (piece.square != null) piece.square.piece = null;
      piece.square = square;
      square.piece = piece;
      if (this.publish && (this.listener != null)) {
        return this.listener.move(piece, square);
      }
    };

    return DraughtsBoard;

  })();

  ComputerPlayer = (function() {

    ComputerPlayer.prototype.depth = 4;

    function ComputerPlayer(board, colour) {
      this.board = board;
      this.colour = colour;
      this.takenPieces = {};
    }

    ComputerPlayer.prototype.move = function() {
      var ret;
      try {
        this.board.publish = false;
        return ret = this.pickMove(this.board.pieces[this.colour], this.board.pieces[this.colour.flip], this.colour, 0, false, 0);
      } finally {
        this.board.publish = true;
        this.takenPieces = {};
      }
    };

    ComputerPlayer.prototype.pickMove = function(pieces, opponentPieces, colour, depth, hopping, score) {
      var bestMove, counterMove, current, fromSquare, jumpTo, piece, takenPiece, toSquare, vector, _i, _j, _len, _len2, _ref;
      bestMove = null;
      for (_i = 0, _len = pieces.length; _i < _len; _i++) {
        piece = pieces[_i];
        if (!((piece != null ? piece.square : void 0) != null)) continue;
        if (this.takenPieces[piece] != null) continue;
        fromSquare = piece.square;
        _ref = piece.vectors;
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          vector = _ref[_j];
          current = null;
          toSquare = this.board.getSquare(fromSquare.row + vector[0], fromSquare.col + vector[1]);
          if (!this.canMove(toSquare, colour)) continue;
          if (!toSquare.isEmpty()) {
            jumpTo = this.board.getSquare(toSquare.row + vector[0], toSquare.col + vector[1]);
            if (!(jumpTo != null) || !jumpTo.isEmpty()) continue;
            takenPiece = toSquare.piece;
            this.takenPieces[takenPiece] = true;
            toSquare.piece = null;
            takenPiece.square = null;
            piece.move(jumpTo);
            if (piece.isKinged()) {
              current = new Move(piece, fromSquare, jumpTo, score + takenPiece.value);
              if (depth < this.depth) {
                counterMove = this.pickMove(this.board.pieces[colour.flip()], this.board.pieces[colour], colour.flip(), depth + 1, false, 0);
                if (counterMove != null) current.score -= counterMove.score;
              }
            } else {
              current = this.pickMove([piece], opponentPieces, colour, depth, true, score + takenPiece.value);
              if (current == null) {
                current = new Move(piece, fromSquare, jumpTo, score + takenPiece.value);
              }
            }
            if (current.hops.length === 0) current.to = jumpTo;
            current.from = fromSquare;
            current.hops.push(toSquare);
            this.takenPieces[takenPiece] = null;
            piece.move(fromSquare);
            takenPiece.move(toSquare);
          } else {
            current = new Move(piece, fromSquare, hopping ? fromSquare : toSquare, piece.isKinged() ? score + 2 : score);
            if (depth < this.depth) {
              piece.move(toSquare);
              counterMove = this.pickMove(this.board.pieces[colour.flip()], this.board.pieces[colour], colour.flip(), depth + 1, false, 0);
              if (counterMove != null) current.score -= counterMove.score;
              piece.move(fromSquare);
            }
          }
          if (current != null ? current.betterThan(bestMove) : void 0) {
            bestMove = current;
          }
        }
      }
      return bestMove;
    };

    ComputerPlayer.prototype.canMove = function(square, colour) {
      return !(!(square != null) || !square.isEmpty() && square.piece.colour === colour);
    };

    return ComputerPlayer;

  })();

  Move = (function() {

    function Move(piece, from, to, score) {
      this.piece = piece;
      this.from = from;
      this.to = to;
      this.score = score;
      this.hops = [];
      this.board = this.piece.board;
    }

    Move.prototype.take = function() {
      var hop, opponentPieces, _i, _len, _ref;
      if (this.hops.length !== 0) {
        opponentPieces = this.board.pieces[this.piece.colour.flip()];
        _ref = this.hops;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          hop = _ref[_i];
          this.board.removePiece(hop.piece);
        }
      }
      this.piece.move(this.to);
      if (this.piece.isKinged()) {
        this.board.removePiece(this.piece);
        return this.piece = new King(this.piece.colour, this.board).move(this.to);
      }
    };

    Move.prototype.betterThan = function(move) {
      return !(move != null) || move.score < this.score && (!move.takesPieces || this.takesPieces());
    };

    Move.prototype.takesPieces = function() {
      return this.hops.length !== 0;
    };

    Move.prototype.toString = function() {
      return "" + this.from + " " + (this.hops.join(' ')) + " " + this.to;
    };

    return Move;

  })();

  api = {
    Colour: Colour,
    KeyType: KeyType,
    Piece: Piece,
    King: King,
    Square: Square,
    DraughtsBoard: DraughtsBoard,
    ComputerPlayer: ComputerPlayer,
    Move: Move
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = api;
  } else {
    window.Draughts = api;
  }

  DragNDropManager = (function() {

    DragNDropManager.prototype.debugEnabled = false;

    DragNDropManager.prototype.dragDisabled = false;

    function DragNDropManager() {
      this.onMouseDown = __bind(this.onMouseDown, this);
      var _this = this;
      if (this.debugEnabled) {
        this.debug = $('<div id="debug"></div>');
        this.debug.appendTo($('body'));
      }
      this.dropTargets = [];
      this.draggables = [];
      $(document).mousedown(this.onMouseDown);
      $(document).resize(function() {});
    }

    DragNDropManager.prototype.addDropTarget = function(el, handler) {
      var $el, pos;
      $el = $(el);
      pos = $el.offset();
      return this.dropTargets.push({
        top: pos.top,
        left: pos.left,
        bottom: pos.top + $el.width(),
        right: pos.left + $el.height(),
        width: $el.width(),
        height: $el.height(),
        el: el,
        handler: handler
      });
    };

    DragNDropManager.prototype.addDraggable = function(el) {
      return this.draggables.push(el);
    };

    DragNDropManager.prototype.onMouseDown = function(e) {
      var $dragging, clickX, clickY, counter, offsetX, offsetY, position,
        _this = this;
      if (this.disabled) return;
      if (!((e.target != null) && this.arrayContains(this.draggables, e.target))) {
        return;
      }
      $dragging = $(e.target);
      position = $dragging.css('position');
      $dragging.css('position', 'relative');
      if (e.which !== 1) return;
      clickX = e.pageX;
      clickY = e.pageY;
      offsetX = this.toNumber($dragging.css('left'));
      offsetY = this.toNumber($dragging.css('top'));
      counter = 0;
      $(document).mousemove(function(e) {
        var newX, newY;
        newX = offsetX + e.pageX - clickX;
        newY = offsetY + e.pageY - clickY;
        $dragging.css('left', "" + newX + "px");
        $dragging.css('top', "" + newY + "px");
        if (_this.debugEnabled) {
          return _this.debug.html("" + (++counter) + " left: " + newX + " top: " + newY + " offset: " + offsetX + " page: " + e.pageX + " start: " + clickX);
        }
      });
      $(document).mouseup(function(e) {
        var target;
        target = _this.getDropTarget(e.pageX, e.pageY);
        if (target != null) target.handler($dragging);
        $(document).unbind('mousemove');
        $(document).unbind('mouseup');
        $dragging.css('left', "0px");
        $dragging.css('top', "0px");
        return $dragging.css('position', position);
      });
      return false;
    };

    DragNDropManager.prototype.getDropTarget = function(x, y) {
      var target, _i, _len, _ref;
      _ref = this.dropTargets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        target = _ref[_i];
        if (x > target.left && y > target.top && x < target.right && y < target.bottom) {
          return target;
        }
      }
    };

    DragNDropManager.prototype.toNumber = function(str) {
      var ret;
      if (str == null) return;
      str = str.toString();
      str = str.replace(/px/, "");
      ret = +str;
      if (ret === null || isNaN(ret)) ret = 0;
      return ret;
    };

    DragNDropManager.prototype.arrayContains = function(array, value) {
      var val, _i, _len;
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        val = array[_i];
        if (val === value) return true;
      }
      return false;
    };

    return DragNDropManager;

  })();

}).call(this);
