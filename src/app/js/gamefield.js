(function(){
	let stage = new createjs.Stage("canvas");
	createjs.Ticker.on('tick', stage);
	let sea = new Image();
	sea.src = 'images/sea.jpg';
	sea.onload = handleImageLoad;

	let ship = new Image();
	ship.src = 'images/ships.png';

	let myship;
	let fieldSize = 12;
	let sections = [];
	let startPos = {};
	let player = {
		speed: 1,
		monitions: 10,
		life: 3,
		range: 3,
		sectionsInRange: [],
		increaseSpeed(){
			this.speed +=1;
		},
		resetSpeed(){
			this.speed = 1;
		},
		decreaseLife(){
			this.life -=1;
		},
		fillLife(){
			this.life = 3;
		},
		increaseRange(){
			this.range +=1;
		},
		resetRange(){
			this.range = 3;
		},
		increaseMonitions(amount){
			this.monitions += amount;
		},
		decreaseMonitions(){
			this.monitions -=1;
		}
	}

	let powerUps = ['speed', 'range', 'monitions', 'life'];

	let zoom;

	function mouseWheelHandler(e) {
		if(Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)))>0) zoom=1.1; else zoom=1/1.1;

		stage.scaleX = stage.scaleY *= zoom;
	}

	function handleShipImageLoad(event) {
		let spritesheet = new createjs.SpriteSheet({
			images : [ship.src],
			frames: [[630, 135, 55, 110]],
			animations: {
	    	ship: [0]
	    }
		});
		drawShip(spritesheet, 'my ship', {x: stage.canvas.clientWidth/2 + fieldSize*152 , y: stage.canvas.clientHeight/2 + fieldSize*88});
		drawShip(spritesheet, 'oponent ship', {x: stage.canvas.clientWidth/2 + fieldSize*152 , y: stage.canvas.clientHeight/2 - fieldSize*88});
		drawShip(spritesheet, 'oponent ship', {x: stage.canvas.clientWidth/2 - fieldSize*152 , y: stage.canvas.clientHeight/2 + fieldSize*88});
		drawShip(spritesheet, 'oponent ship', {x: stage.canvas.clientWidth/2 - fieldSize*152 , y: stage.canvas.clientHeight/2 - fieldSize*88});
		drawShip(spritesheet, 'oponent ship', {x: stage.canvas.clientWidth/2, y: stage.canvas.clientHeight/2 + fieldSize*175});
		drawShip(spritesheet, 'oponent ship', {x: stage.canvas.clientWidth/2, y: stage.canvas.clientHeight/2 - fieldSize*175});

		myship = stage.getChildByName('my ship');
		drawRangeMarker();

		canvas.addEventListener("mousewheel", mouseWheelHandler, false);
		canvas.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
	}

	function drawShip(spritesheet, name, position){
		let sprite = new createjs.Sprite(spritesheet);		
		sprite.regX = 55/2;
		sprite.regY = 110/2;

		sprite.x = position.x;
		sprite.y = position.y;
		sprite.position = getPositionByCoordinates(sprite.x, sprite.y);
		sprite.gotoAndPlay('ship');
		sprite.name = name;
		sprite.props = Object.assign({}, player);
		stage.addChild(sprite);
	}

	function drawRangeMarker(){
		myship.rangeSection = new createjs.Shape();

		myship.rangeSection.graphics.beginFill('#4682B4').beginStroke('#4682B4').drawPolyStar(myship.x, myship.y, 100*(myship.props.range + 2), 6, 0, 0);
		myship.rangeSection.alpha = 0.2;
		myship.rangeSection.name = 'range';

		stage.addChild(myship.rangeSection);

		markSectionsInRange(myship.props.range);
	}

	function handleImageLoad(event) {
		//middle section
		drawField({x:stage.canvas.clientWidth/2, y: stage.canvas.clientHeight/2});

		stage.addEventListener('stagemousedown', handleStageMovement);

		stage.children.forEach( function(section) {
			if(section.children){
				section.children.forEach( function(hexagon) {
					hexagon.addEventListener('click', handleHexagonInteraction);
				});
			}
		});
		ship.onload = handleShipImageLoad;
	}

	function drawField(sectionCenter){
		//draw center of section
		drawHexagon(sectionCenter);
		// draw center line
		drawLineOfSections(sectionCenter, fieldSize, 175);
		drawLineOfSections(sectionCenter, fieldSize, -175);
		
		// rest of the section
		for(let i = fieldSize; i > fieldSize/2; i-=1){
			let j = fieldSize - i +1;
			for(let k = 1; k<3; k+=1){
				let d = Math.pow(-1, k);

				drawLineOfSections({x: sectionCenter.x + 304*j*d, y: sectionCenter.y - 175}, i, 175);
				drawLineOfSections({x: sectionCenter.x + 304*j*d, y: sectionCenter.y}, i-1, -175);

				drawLineOfSections({x: sectionCenter.x + (152 + 304*(j-1))*d, y: sectionCenter.y - 88}, i, 175);
				drawLineOfSections({x: sectionCenter.x + (152 + 304*(j-1))*d, y: sectionCenter.y + 88}, i, -175);
			}
		}
		setPowerUpsInSection(sections, powerUps.length*fieldSize);
		let playerSection = new createjs.Container();
		playerSection.addChild(...sections);
		playerSection.name = 'section';

		stage.addChild(playerSection);
	}

	function drawHexagon(center){
		let hexagon = new createjs.Shape();
		hexagon.graphics.beginBitmapFill(sea).beginStroke('#4682B4').drawPolyStar(center.x, center.y, 100, 6, 0, 0);
		hexagon.name = 'section';
		sections.push(hexagon);
	}

	function drawLineOfSections(startingPoint, numberofSections, step){
		for(let i = 1; i < numberofSections + 1; i+=1){
			drawHexagon({x: startingPoint.x, y: startingPoint.y + step*i});
		}
	}

	function calculateAngle(startPoint, endPoint, hipotenuse){
		let angle= 0;
		let orientation;
		if(startPoint.x == endPoint.x){
			if(startPoint.y > endPoint.y) return 0; else	return 180;
		}else{
			let sin = Math.sin(Math.abs(startPoint.y - endPoint.y)/hipotenuse);
			angle = Math.asin(sin) * 180/Math.PI;
			if(startPoint.x > endPoint.x) orientation = -1; else orientation = 1;

			if(startPoint.y > endPoint.y){
				return -orientation*angle + orientation*90;
			}else if(startPoint.y < endPoint.y){
				return orientation*angle + orientation*90;
			}else{
				return orientation*90;
			}
		}
	}

	function handleStageMovement(){
		startPos = {
			mouseX: stage.mouseX,
			mouseY: stage.mouseY,
			x: stage.x,
			y: stage.y 
		}

		stage.addEventListener('stagemousemove', function(e){
			stage.x = startPos.x + (stage.mouseX - startPos.mouseX);
			stage.y = startPos.y + (stage.mouseY - startPos.mouseY);
		});

		stage.addEventListener('stagemouseup', function (e) {
			stage.removeAllEventListeners();
			stage.addEventListener('stagemousedown', handleStageMovement)
		});
	}

	function handleHexagonInteraction(e){
		if(startPos.mouseX == stage.mouseX && startPos.mouseY == stage.mouseY){
			let targetShip = getTargetShip(e.target);
			if(targetShip){
				if(isTargetInRange(e.target)) attackOponent(targetShip);
			}else{
				createjs.Tween.removeAllTweens();
				moveToNextPosition({x: myship.x, y: myship.y},{x: e.target.graphics.command.x, y: e.target.graphics.command.y});
				myship.position = e.target;
				// moveShip(e.target, {x: sprite.x, y: sprite.y} );
			}
		}
	}

	function moveToNextPosition(startPos, endPos){
		if(startPos.x != endPos.x || startPos.y != endPos.y){
			let newPos = {
				x: startPos.x,
				y: startPos.y
			};
			if(endPos.x == startPos.x){
				if(endPos.y > startPos.y){
					newPos.y += 175;
				}else{
					newPos.y -= 175;
				}
			}else if(endPos.x > startPos.x){
				newPos.x += 152;
				if(endPos.y > startPos.y){
					newPos.y += 88;
				}else{
					newPos.y -= 88;
				}
			}else{
				newPos.x -= 152;
				if(endPos.y > startPos.y){
					newPos.y += 88;
				}else{
					newPos.y -= 88;
				}
			}
			moveShip(getPositionByCoordinates(newPos.x, newPos.y), endPos);
		}else{
			return;
		}
	}

	function getPositionByCoordinates(x, y){
		let target;
		stage.children.forEach((section) =>{
			if(section.children){
				let temp = section.children.find((hexagon) => {
					return hexagon.hitTest(x, y) == true
				})
				if(temp){
					target = temp;
				}
			}
		})
		return target;
	}

	function moveShip(target, endPos){
		let nextPos = {
			x: target.graphics.command.x,
			y: target.graphics.command.y
		}
		let hipotenuse = Math.sqrt(Math.pow(Math.abs(myship.x - nextPos.x),2) + Math.pow(Math.abs(myship.y - nextPos.y),2));
		let angle = calculateAngle({x: myship.x, y: myship.y}, nextPos, hipotenuse);
		createjs.Tween.get(myship.rangeSection.graphics.command)
			.to({x: nextPos.x, y: nextPos.y}, hipotenuse*10/player.speed, createjs.Ease.sinIn)
			.call(markSectionsInRange, [myship.props.range]);

		createjs.Tween.get(myship)
	  	.to({rotation: angle}, (myship.rotation - angle)*10/player.speed, createjs.Ease.sinIn)
	  	.to({ x: nextPos.x, y: nextPos.y}, hipotenuse*10/player.speed, createjs.Ease.sinIn)
	  	.call(checkForPowerUp,[target])
	  	.call(moveToNextPosition,[nextPos, endPos]);
	}

	function setPowerUpsInSection(sections, count){
		for(count; count > 0; count -=1){
			let hexagon = sections[Math.floor(Math.random()*sections.length)];
			hexagon.alpha = 0.5;
			hexagon.powerup = powerUps[Math.ceil(count/fieldSize) - 1];
		}
	}

	function checkForPowerUp(target){
		if(target.powerup == 'speed'){
			player.increaseSpeed();
		}else if(target.powerup == 'range'){
			player.increaseRange();
		}else	if(target.powerup == 'life'){
			player.fillLife();
		}else	if(target.powerup == 'monitions'){
			player.increaseMonitions(3);
		}
		if(target.powerup){
			target.powerup = '';
			createjs.Tween.get(target)
				.to({alpha: 1}, 500, createjs.Ease.sinIn)
		}
	}

	function getTargetShip(target){
		let ships = stage.children.filter((child) =>{ return child.name =='oponent ship'});
		if(ships){
			return ships.find( function(ship) {
				return (ship.position.graphics.command.x == target.graphics.command.x && ship.position.graphics.command.y == target.graphics.command.y);
			});
		}
	}
	
	function attackOponent(targetShip){
		if(myship.props.monitions > 0 && targetShip.props.life > 0){
			targetShip.props.decreaseLife();
			myship.props.decreaseMonitions();
		}
	}

	function markSectionsInRange(range){
		myship.props.sectionsInRange = [];
		myship.props.sectionsInRange = sections.filter((section) => { 
			return myship.rangeSection.hitTest(section.graphics.command.x, section.graphics.command.y);
		});
	}

	function isTargetInRange(target){
		let targetPosition = target.graphics.command;

		return !!myship.props.sectionsInRange.find(section => { return section.hitTest(targetPosition.x, targetPosition.y)});
	}
}())