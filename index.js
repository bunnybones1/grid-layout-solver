function GridLayoutSolver(params) {
	var _preferredCellCount = params.preferredCellCount || 12;
	var _preferredCellAspectRatio = params.preferredCellAspectRatio || 1;
	var _scoreWeightAspectRatio = params.scoreWeightAspectRatio || 1;
	var _scoreWeightCellCount = params.scoreWeightCellCount || 1;
	var _marginX = params.marginX || 0.0;
	var _marginY = params.marginY || 0.0;
	var _fitAll = params.fitAll || true;
	var _considerationRange = params.considerationRange || 2;

	function _solve(rect) {
		var aspectRatioOfGrid = rect.height / rect.width;
		var aspectRatio = aspectRatioOfGrid / _preferredCellAspectRatio;
		var aspectRatioHalfStrength = (aspectRatio - 1) * 0.5 + 1;
		//starting point
		var ceilingedSquareRoot = Math.ceil(Math.sqrt(_preferredCellCount));
		var rows = Math.ceil(ceilingedSquareRoot * aspectRatioHalfStrength);
		var cols = Math.ceil(ceilingedSquareRoot / aspectRatioHalfStrength);

		var considerations = [];
		var minRows = Math.max(1, rows - _considerationRange);
		var minCols = Math.max(1, cols - _considerationRange);
		for (var iRows = minRows, maxRows = rows + _considerationRange; iRows <= maxRows; iRows++) {
			for (var iCols = minCols, maxCols = cols + _considerationRange;  iCols <= maxCols; iCols++) {
				considerations.push({
					rows: iRows,
					cols: iCols,
					cellCount: iRows * iCols
				})
			};
		};
		var _this = this;
		considerations.forEach(function(consideration) {
			var scoreFill;
			if(_preferredCellCount > consideration.cellCount) {
				if(_fitAll) {
					scoreFill = 0;
				} else {
					scoreFill = consideration.cellCount / _preferredCellCount;
				}
			} else {
				scoreFill = _preferredCellCount / consideration.cellCount;
			}
			var aspectRatioOfCell = (rect.height / consideration.rows) / (rect.width / consideration.cols);
			var scoreAspectRatio;
			if(aspectRatioOfCell < _preferredCellAspectRatio) {
				scoreAspectRatio = aspectRatioOfCell / _preferredCellAspectRatio;
			} else {
				scoreAspectRatio = _preferredCellAspectRatio / aspectRatioOfCell;
			}
			// console.log(scoreAspectRatio);
			//weights
			scoreFill *= _scoreWeightCellCount;
			scoreAspectRatio *= _scoreWeightAspectRatio;
			//tally
			consideration.score = scoreFill + scoreAspectRatio;
		})
		considerations.sort(function(a, b) {
			return b.score - a.score;
		})
		var best = considerations[0];
		best.cellWidth = rect.width / best.cols;
		best.cellHeight = rect.height / best.rows;
		return best;
	}

	function _setPreferredCellCount(val) {
		_preferredCellCount = val;
	}
	function _setPreferredCellAspectRatio(val) {
		_preferredCellAspectRatio = val;
	}
	function _setScoreWeightAspectRatio(val) {
		_scoreWeightAspectRatio = val;
	}
	function _setScoreWeightCellCount(val) {
		_scoreWeightCellCount = val;
	}
	function _setFitAll(val) {
		_fitAll = val;
	}
	function _setMarginX(val) {
		_marginX = val;
	}
	function _setMarginY(val) {
		_marginY = val;
	}
	function _setConsiderationRange(val) {
		_considerationRange = val;
	}

	this.setPreferredCellCount = _setPreferredCellCount;
	this.setPreferredCellAspectRatio = _setPreferredCellAspectRatio;
	this.setScoreWeightAspectRatio = _setScoreWeightAspectRatio;
	this.setScoreWeightCellCount = _setScoreWeightCellCount;
	this.setMarginX = _setMarginX;
	this.setMarginY = _setMarginY;
	this.setFitAll = _setFitAll;
	this.setConsiderationRange = _setConsiderationRange;

	this.solve = _solve;
}
module.exports = GridLayoutSolver;