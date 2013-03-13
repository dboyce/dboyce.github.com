(function() {
  var ArrayUtil, Cell, Container, Grid, OnlyPossibleCellRule, SudokuSolverDemos, UniquenessRule,
    __hasProp = Object.prototype.hasOwnProperty,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  ArrayUtil = (function() {

    function ArrayUtil() {}

    ArrayUtil.prototype.remove = function(array, element) {
      var index;
      index = array.indexOf(element);
      if (index !== -1) return array.splice(index, 1);
    };

    ArrayUtil.prototype.flatten = function(arrays) {
      return [].concat.apply([], arrays);
    };

    ArrayUtil.prototype.copy = function(array) {
      return this.flatten(array);
    };

    return ArrayUtil;

  })();

  Cell = (function() {

    function Cell(containers, x, y) {
      var container, _i, _len, _ref;
      this.containers = containers;
      this.x = x;
      this.y = y;
      this.possibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      this.solved = false;
      _ref = this.containers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        container = _ref[_i];
        container.cells.push(this);
      }
    }

    Cell.prototype.eliminate = function(val) {
      if (!this.solved) {
        ArrayUtil.prototype.remove(this.possibilities, val);
        if (this.possibilities.length === 1) this.solve(val);
      }
      return this.solved;
    };

    Cell.prototype.solve = function(val) {
      var container, _i, _len, _ref;
      if (!this.solved) {
        this.value = val;
        this.solved = true;
        this.possibilities = [];
        _ref = this.containers;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          container = _ref[_i];
          container.cellSolved(this, val);
        }
        if (this.listener != null) this.listener(val, this);
      }
      return this.solved;
    };

    Cell.prototype.possibleValue = function(val) {
      return !this.solved && this.possibilities.indexOf(val) !== -1;
    };

    Cell.prototype.toString = function() {
      var val;
      return val = "cell " + this.x + "," + this.y;
    };

    return Cell;

  })();

  Container = (function() {

    function Container(name, grid) {
      this.name = name;
      this.grid = grid;
      this.cells = [];
      this.solutions = {};
      this.unsolvedValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    Container.prototype.contains = function(val) {
      var cell, _i, _len, _ref;
      _ref = this.cells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (cell.solved && cell.value === val) return true;
      }
      return false;
    };

    Container.prototype.cellSolved = function(cell, val) {
      var _i, _len, _ref;
      this.solutions[val] = cell;
      ArrayUtil.prototype.remove(this.unsolvedValues, val);
      _ref = this.cells;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        if (!cell.solved) ArrayUtil.prototype.remove(cell.possibilities, val);
      }
      this.grid.cellSolved(cell, val);
      return null;
    };

    Container.prototype.toString = function() {
      return this.name;
    };

    return Container;

  })();

  Grid = (function() {

    function Grid() {
      var i, x, y;
      this.rows = [];
      this.colls = [];
      this.boxes = [];
      this.cells = [];
      this.rules = [new OnlyPossibleCellRule()];
      this.unsolvedCells = 81;
      this.solved = false;
      for (i = 1; i <= 9; i++) {
        this.rows[i] = new Container("row " + i, this);
        this.colls[i] = new Container("col " + i, this);
        this.boxes[i] = new Container("box " + i, this);
      }
      for (y = 1; y <= 9; y++) {
        for (x = 1; x <= 9; x++) {
          this.cells.push(new Cell([this.colls[x], this.rows[y], this.boxes[this.toBox(x, y)]], x, y));
        }
      }
    }

    Grid.prototype.cellSolved = function(cell, val) {
      this.unsolvedCells--;
      return this.solved = this.unsolvedCells < 1;
    };

    Grid.prototype.toBox = function(x, y) {
      return 1 + 3 * Math.floor((y - 1) / 3) + Math.floor((x - 1) / 3);
    };

    Grid.prototype.getCell = function(x, y) {
      return this.cells[x - 1 + 9 * (y - 1)];
    };

    Grid.prototype.update = function(values) {
      var i, val, _len, _results;
      values = values(null);
      if (!values.size === 81) throw "size of update array must be 81";
      _results = [];
      for (i = 0, _len = values.length; i < _len; i++) {
        val = values[i];
        if (!(val === 0 || !(val != null))) {
          _results.push(this.cells[i].solve(val));
        }
      }
      return _results;
    };

    Grid.prototype.solve = function() {
      var container, done, rule, unsolvedCells, _i, _j, _len, _len2, _ref, _ref2, _results;
      done = false;
      _results = [];
      while (!done) {
        unsolvedCells = this.unsolvedCells;
        _ref = ArrayUtil.prototype.flatten([this.rows, this.colls, this.boxes]);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          container = _ref[_i];
          if (container != null) {
            _ref2 = this.rules;
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              rule = _ref2[_j];
              rule.eval(container);
            }
          }
        }
        _results.push(done = unsolvedCells === this.unsolvedCells);
      }
      return _results;
    };

    Grid.prototype.toString = function() {
      var cell, i, spacer, str, _len, _ref, _ref2;
      spacer = ((function() {
        var _results;
        _results = [];
        for (i = 1; i <= 31; i++) {
          _results.push('-');
        }
        return _results;
      })()).join('') + '\n';
      str = "\n " + spacer + " |";
      _ref = this.cells;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        cell = _ref[i];
        str = str + ' ' + ((_ref2 = cell.value) != null ? _ref2 : '_') + ' ';
        if ((i + 1) % 3 === 0 && i > 0) str = str + '|';
        if (i > 0) {
          if ((i + 1) % 27 === 0) {
            str = str + ("\n " + spacer + " |");
          } else if ((i + 1) % 9 === 0) {
            str = str + '\n |';
          }
        }
      }
      str = str.slice(0, (str.length - 2) + 1 || 9e9);
      return str;
    };

    return Grid;

  })();

  UniquenessRule = (function() {

    function UniquenessRule() {}

    UniquenessRule.prototype.eval = function(container) {
      var cell, solvedCell, val, _i, _len, _ref, _ref2;
      _ref = container.solutions;
      for (val in _ref) {
        if (!__hasProp.call(_ref, val)) continue;
        solvedCell = _ref[val];
        _ref2 = container.cells;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          cell = _ref2[_i];
          if (!cell.solved) cell.eliminate(val);
        }
      }
      return null;
    };

    return UniquenessRule;

  })();

  OnlyPossibleCellRule = (function() {

    function OnlyPossibleCellRule() {}

    OnlyPossibleCellRule.prototype.eval = function(container) {
      var candidate, cell, val, _i, _j, _len, _len2, _ref, _ref2, _results;
      _ref = ArrayUtil.prototype.copy(container.unsolvedValues);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        val = _ref[_i];
        candidate = null;
        _ref2 = container.cells;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          cell = _ref2[_j];
          if (cell.possibleValue(val)) {
            if (candidate != null) {
              candidate = null;
              break;
            } else {
              candidate = cell;
            }
          }
        }
        if (candidate != null) {
          _results.push(candidate.solve(val));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return OnlyPossibleCellRule;

  })();

  Grid.api = {
    'Cell': Cell,
    'Container': Container,
    'Grid': Grid,
    'UniquenessRule': UniquenessRule,
    'OnlyPossibleCellRule': OnlyPossibleCellRule
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = Grid;
  } else {
    window.Sudoku = Grid;
  }

  $(document).ready(function() {
    var AppView, BoxModel, BoxView, CellModel, CellView, StringUtil, SudokuGrid;
    StringUtil = (function() {

      function StringUtil() {}

      StringUtil.prototype.trim = function(val) {
        return val != null ? val.replace(/^\s+|\s+$/g, "") : void 0;
      };

      StringUtil.prototype.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      };

      return StringUtil;

    })();
    CellModel = (function(_super) {

      __extends(CellModel, _super);

      function CellModel() {
        this.update = __bind(this.update, this);
        CellModel.__super__.constructor.apply(this, arguments);
      }

      CellModel.prototype.initialize = function() {
        this.cell = this.get('cell');
        this.cell.listener = this.update;
        return this.update;
      };

      CellModel.prototype.update = function() {
        return this.set({
          solved: this.cell.solved,
          value: this.cell.value
        });
      };

      CellModel.prototype.possibleValue = function(val) {
        return this.cell.possibleValue(val);
      };

      return CellModel;

    })(Backbone.Model);
    BoxModel = (function(_super) {

      __extends(BoxModel, _super);

      function BoxModel() {
        BoxModel.__super__.constructor.apply(this, arguments);
      }

      BoxModel.prototype.initialize = function() {
        var cell;
        return this.cells = (function() {
          var _i, _len, _ref, _results;
          _ref = this.get('box').cells;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cell = _ref[_i];
            _results.push(new CellModel({
              cell: cell
            }));
          }
          return _results;
        }).call(this);
      };

      return BoxModel;

    })(Backbone.Model);
    SudokuGrid = (function(_super) {

      __extends(SudokuGrid, _super);

      function SudokuGrid() {
        SudokuGrid.__super__.constructor.apply(this, arguments);
      }

      SudokuGrid.prototype.model = BoxModel;

      SudokuGrid.prototype.initialize = function() {
        return this.sudoku = new Sudoku();
      };

      SudokuGrid.prototype.populate = function() {
        var box, i, _len, _ref, _results;
        _ref = this.sudoku.boxes;
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          box = _ref[i];
          if (box != null) {
            _results.push(this.add({
              box: box,
              number: i
            }));
          }
        }
        return _results;
      };

      return SudokuGrid;

    })(Backbone.Collection);
    CellView = (function(_super) {

      __extends(CellView, _super);

      function CellView() {
        this.render = __bind(this.render, this);
        CellView.__super__.constructor.apply(this, arguments);
      }

      CellView.prototype.tagName = "span";

      CellView.prototype.template = _.template($("#cell-template").html());

      CellView.prototype.events = {
        "change input.cell": "update"
      };

      CellView.prototype.update = function() {
        var input, val;
        input = $(this.el).find('input');
        $(this.el).removeClass('error');
        val = StringUtil.prototype.trim(input.val());
        if (!(val != null ? val.length : void 0)) {
          this.model.cell.solved = false;
          this.model.cell.possibilities = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          return input.val('');
        } else if (!StringUtil.prototype.isNumber(val) || +val < 1 || +val > 9 || !this.model.possibleValue(+val)) {
          $(this.el).addClass('error');
          return input.val('  ' + input.val());
        } else {
          this.model.cell.solved = false;
          return this.model.cell.solve(+($(this.el).find('input').val()));
        }
      };

      CellView.prototype.initialize = function() {
        return this.model.on('change', this.render);
      };

      CellView.prototype.render = function() {
        $(this.el).html(this.template(this.model.get('cell')));
        return this;
      };

      return CellView;

    })(Backbone.View);
    BoxView = (function(_super) {

      __extends(BoxView, _super);

      function BoxView() {
        this.render = __bind(this.render, this);
        BoxView.__super__.constructor.apply(this, arguments);
      }

      BoxView.prototype.tagName = "table";

      BoxView.prototype.classes = ["left", "middle", "right"];

      BoxView.prototype.attributes = function() {
        return {
          'class': this.classes[(this.model.get('number') - 1) % 3],
          'cellspacing': 0,
          'cellpadding': 0
        };
      };

      BoxView.prototype.initialize = function() {
        var cellModel;
        return this.cellViews = (function() {
          var _i, _len, _ref, _results;
          _ref = this.model.cells;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            cellModel = _ref[_i];
            _results.push(new CellView({
              model: cellModel
            }));
          }
          return _results;
        }).call(this);
      };

      BoxView.prototype.render = function() {
        var $tr, cellView, i, _len, _ref;
        $tr = null;
        _ref = this.cellViews;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          cellView = _ref[i];
          if (i % 3 === 0) $tr = $('<tr></tr>').appendTo($(this.el));
          $('<td></td>').appendTo($tr).append(cellView.render().el);
        }
        return this;
      };

      return BoxView;

    })(Backbone.View);
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        this.addCell = __bind(this.addCell, this);
        AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.el = $("#grid");

      AppView.prototype.events = {
        "click #solve": "solve",
        "click #reset": "reset"
      };

      AppView.prototype.solve = function() {
        return this.grid.sudoku.solve();
      };

      AppView.prototype.reset = function() {
        $('#sudoku-form').children().remove();
        return this.initialize();
      };

      AppView.prototype.loadDemos = function() {
        var $demo, demos, name,
          _this = this;
        $demo = $('#demo');
        demos = SudokuSolverDemos.prototype.demos;
        for (name in demos) {
          $("<option>" + name + "</option>").appendTo($demo);
        }
        return $demo.change(function() {
          var factory;
          factory = SudokuSolverDemos.prototype.demos[$demo.val()];
          if (factory != null) {
            _this.reset();
            return _this.grid.sudoku.update(factory);
          }
        });
      };

      AppView.prototype.initialize = function() {
        this.grid = new SudokuGrid();
        this.grid.bind('add', this.addCell);
        this.grid.populate();
        if ($('#demo').children().length < 2) return this.loadDemos();
      };

      AppView.prototype.addCell = function(box) {
        box = new BoxView({
          model: box
        });
        return $('#sudoku-form').append(box.render().el);
      };

      return AppView;

    })(Backbone.View);
    return new AppView();
  });

  SudokuSolverDemos = (function() {

    function SudokuSolverDemos() {}

    SudokuSolverDemos.prototype.demos = {
      'demo 1': function(_) {
        return [_, 6, _, _, 9, 1, _, 8, _, 1, _, 9, 6, 8, _, 4, _, 5, _, 5, _, _, 4, _, 1, _, 6, 6, _, _, _, _, _, 2, _, _, _, 2, 3, 9, _, 4, 7, 1, _, _, _, 4, _, _, _, _, _, 3, 9, _, 7, _, 2, _, _, 3, _, 3, _, 5, _, 7, 9, 6, _, 2, _, 4, _, 1, 5, _, _, 7, _];
      },
      'demo 2': function(_) {
        return [_, _, _, _, _, _, _, 6, _, _, 1, _, _, 3, _, 9, _, 4, 4, _, _, _, 7, 9, 8, 1, _, 9, _, _, _, 2, 1, _, 4, _, _, _, 2, _, 4, _, 1, _, _, _, 8, _, 7, 6, _, _, _, 3, _, 3, 9, 5, 1, _, _, _, 2, 7, _, 1, _, 8, _, _, 3, _, _, 2, _, _, _, _, _, _, _];
      },
      'demo 3': function(_) {
        return [4, _, _, 8, _, 5, _, 3, 7, 5, _, _, _, _, 7, 9, 1, _, _, _, _, _, _, 4, _, 8, _, _, _, _, _, _, 3, _, 2, _, 9, 3, _, 5, _, 2, _, 4, 1, _, 6, _, 7, _, _, _, _, _, _, 9, _, 4, _, _, _, _, _, _, 5, 6, 2, _, _, _, _, 3, 8, 1, _, 3, _, 9, _, _, 5];
      }
    };

    return SudokuSolverDemos;

  })();

}).call(this);
