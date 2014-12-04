var _ = require('lodash');
function GridLayoutSolver(params) {
	params = _.merge({
		totalCells: 12,
		preferredCellAspectRatio: .5,
		scoreWeightAspectRatio: 1.05,
		scoreWeightFill: 1,
		ensureTotalFits: true,
		considerationRange: 2
	}, params || {});
	_.assign(this, params);
}
GridLayoutSolver.prototype = {
	solve: function(rect) {
		var aspectRatioOfGrid = rect.height / rect.width;
		var aspectRatio = aspectRatioOfGrid / this.preferredCellAspectRatio;
		var aspectRatioHalfStrength = (aspectRatio - 1) * .5 + 1;
		//starting point
		var ceilingedSquareRoot = Math.ceil(Math.sqrt(this.totalCells));
		var rows = Math.ceil(ceilingedSquareRoot * aspectRatioHalfStrength);
		var cols = Math.ceil(ceilingedSquareRoot / aspectRatioHalfStrength);

		var considerations = [];
		var minRows = Math.max(1, rows - this.considerationRange);
		var minCols = Math.max(1, cols - this.considerationRange);
		for (var iRows = minRows, maxRows = rows + this.considerationRange; iRows <= maxRows; iRows++) {
			for (var iCols = minCols, maxCols = cols + this.considerationRange;  iCols <= maxCols; iCols++) {
				considerations.push({
					rows: iRows,
					cols: iCols,
					total: iRows * iCols
				})
			};
		};
		var _this = this;
		considerations.forEach(function(consideration) {
			var scoreFill;
			if(_this.totalCells > consideration.total) {
				if(_this.ensureTotalFits) {
					scoreFill = 0;
				} else {
					scoreFill = consideration.total / _this.totalCells;
				}
			} else {
				scoreFill = _this.totalCells / consideration.total;
			}
			var aspectRatioOfCell = (rect.height / consideration.rows) / (rect.width / consideration.cols);
			var scoreAspectRatio;
			if(aspectRatioOfCell < _this.preferredCellAspectRatio) {
				scoreAspectRatio = aspectRatioOfCell / _this.preferredCellAspectRatio;
			} else {
				scoreAspectRatio = _this.preferredCellAspectRatio / aspectRatioOfCell;
			}
			// console.log(scoreAspectRatio);
			//weights
			scoreFill *= _this.scoreWeightFill;
			scoreAspectRatio *= _this.scoreWeightAspectRatio;
			//tally
			consideration.score = scoreFill + scoreAspectRatio;
		})
		considerations.sort(function(a, b) {
			return b.score - a.score;
		})
		var best = considerations[0];
		return {
			rows: best.rows,
			cols: best.cols
		};
	}
}
module.exports = GridLayoutSolver;