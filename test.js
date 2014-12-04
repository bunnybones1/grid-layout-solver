var onReady = function() {
	var View = require('threejs-managed-view').View,
		RectangleMesh = require('threejs-rectangle-mesh');
		GridLayoutSolver = require('./');

	var view = new View({
		camera: new THREE.OrthographicCamera(0, window.innerWidth, -window.innerHeight, 0, 100, -100),
		stats: true,
	});

	var totalCells = 10;
	var rectangleMeshesPoolSize = 120;

	var gridLayoutSolver = new GridLayoutSolver({
		totalCells: totalCells,
		preferredCellAspectRatio: .33,
		scoreWeightAspectRatio: 2,
		ensureTotalFits: true
	});

	var fullRectangle = {
		x: 10,
		y: 10,
		width: window.innerWidth-20,
		height: window.innerHeight-20
	};

	var gridLayoutSolution = gridLayoutSolver.solve(fullRectangle);

	var fullRectangleMesh = new RectangleMesh();
	fullRectangleMesh.material.color.setHSL(1, .1, .2);
	view.scene.add(fullRectangleMesh);
	fullRectangleMesh.setRect(fullRectangle);

	var rectangleMeshPool = [];
	var activeRectangleMeshes = [];
	for (var i = 0; i < rectangleMeshesPoolSize; i++) {
		var cellRectangleMesh = new RectangleMesh();
		cellRectangleMesh.material.color.setHSL(
			Math.random(),
			Math.random() * .25 + .35,
			Math.random() * .25 + .5
		)
		rectangleMeshPool.push(cellRectangleMesh);
	};

	var previousNumberOfActiveRectangles;
	var numberOfActiveRectangles;

	function placeRectangles() {
		previousNumberOfActiveRectangles = activeRectangleMeshes.length;
		numberOfActiveRectangles = 0;
		var cellWidth = fullRectangle.width / gridLayoutSolution.cols;
		var cellHeight = fullRectangle.height / gridLayoutSolution.rows;
		var keepGoing = true;
		for(var iRow = 0, iRows = gridLayoutSolution.rows; iRow < iRows; iRow++) {
			if(!keepGoing) break;
			for(var iCol = 0, iCols = gridLayoutSolution.cols; iCol < iCols; iCol++) {
				var index = iRow * iCols + iCol;
				if(index >= totalCells) {
					keepGoing = false;
					break;
				}
				var cellRectangleMesh = rectangleMeshPool[index];
				var rect = {
					x: fullRectangle.x + iCol * cellWidth,
					y: fullRectangle.y + iRow * cellHeight,
					width: cellWidth,
					height: cellHeight
				}
				cellRectangleMesh.setRect(rect);
				cellRectangleMesh.z = 1;
				numberOfActiveRectangles++;
			}
		}

		if(previousNumberOfActiveRectangles > numberOfActiveRectangles) {
			for (var i = previousNumberOfActiveRectangles-1; i >= numberOfActiveRectangles; i--) {
				// console.log('removing', activeRectangleMeshes[i]);
				view.scene.remove(activeRectangleMeshes[i]);
				activeRectangleMeshes.splice(i, 1);
			};
		} else if (previousNumberOfActiveRectangles < numberOfActiveRectangles) {
			for (var i = previousNumberOfActiveRectangles; i < numberOfActiveRectangles; i++) {
				activeRectangleMeshes[i] = rectangleMeshPool[i];
				// console.log('adding', activeRectangleMeshes[i]);
				view.scene.add(activeRectangleMeshes[i]);
			}
		}
	}
	placeRectangles();

	setInterval(function() {
		var time = (new Date()).getTime() * .001;
		fullRectangle.width = ((Math.cos(time) * .5 + .5) * .35 + .5) * window.innerWidth;
		fullRectangle.height = ((Math.sin(time) * .5 + .5) * .35 + .5) * window.innerHeight;
		fullRectangleMesh.setRect(fullRectangle);
		gridLayoutSolution = gridLayoutSolver.solve(fullRectangle);
		placeRectangles();
	}, 100);

}

var loadAndRunScripts = require('loadandrunscripts');
loadAndRunScripts(
	[
		'bower_components/three.js/three.js',
		'lib/stats.min.js',
		'lib/threex.rendererstats.js',
	],
	onReady
);
