/*
* @author: Alec Knutsen
* @date: April 3, 2016
* @assignment: EECS 368 Project 1
* @Sources Used:
    * https://codemyroad.wordpress.com/2013/04/14/tetris-ai-the-near-perfect-player/ - For developing the AI logic behind the game
		*The AI is based on the height of the columns, the number of complete rows, the number of holes, and differences in height of the columns
		* We take a linear combination of these values and try to maximze this combination 
		* We check all possible shifts and rotaions and then let the block fall until it hits another shape or falls to the ground. We then calculate the maximum score and return the block to its original plaace.
		* We find the shift or rotate that maximizes this combination
	* http://gamedevelopment.tutsplus.com/tutorials/implementing-tetris-clearing-lines--gamedev-1197 - For helping clear completed lines 
*
*/




//Main Tetris Game Object
tetrisGame = {};

//Arrary that functions as a grid for the tetris game. If the array value is -1 the grid is empty, otherwise it has a block at the array value
tetrisGame.currentState = [];

//Boolean for if the game is initialized or not 
tetrisGame.initialized = false;

//Stores ids for tetris game 
tetrisGame.id_inc =0;

//An array that holds shape objects for each shape that has entered the game
tetrisGame.shapes = [];

//Stores the AI's score 
tetrisGame.cleared_lines = 0;

//Variable for helping enter advanced mode 
tetrisGame.incrementCount =0;


/*
* Shape prototype 
*/
function Shape(shapeType, position, id) {
	
	//Object variables to hold each of the four blocks in a shape 
	this.block1 = 0;
	this.block2 =0;
	this.block3 =0;
	this.block4 = 0;
	
	
	//Object variables to hold the cartesian position of each of the four blocks in the shape
	this.block1_x_pos =0;
	this.block1_y_pos = 0;
	this.block2_x_pos =0;
	this.block2_y_pos = 0;
	this.block3_x_pos =0;
	this.block3_y_pos = 0;
	this.block4_x_pos =0;
	this.block4_y_pos = 0;
	
	//Object variable that stores  the pivot - The block the shape rotates around 
	this.pivot = 0;
	
	//Object variable that stores the type of the standard tetris shapes. Can have values (0 -6)
	this.shapeType = shapeType;
	
	//Object variable that stores the shape color of the shape. We generate the shape color randomly. The shape color can have values (0-6)
	
	this.shapeColor=this.shapeType;
	
	//Object Variable for the shape id 
	this.id=id;
	
	//Object variable (boolean) that stores if a shape is still falling or not 
	this.isFalling = false;
	

	/*
	* @name - AddShape 
	* @description - Sets the cartesian coordinates of the corresponding shape and sets the pivot. Sets the corresponding currentState values, sets the isFalling property to true, and push the shape onto the shapes array 
	* @param - None
	* @return - None
	*/
	this.AddShape = function() {
		
		//We set the cartesian position of the shapes and the pivot based on the type of shape
		switch(this.shapeType) {
		
			case 0:
				this.block1_x_pos = position;
				this.block1_y_pos = 0;
				this.block2_x_pos = position+1;
				this.block2_y_pos = 0;
				this.block3_x_pos = position+2;
				this.block3_y_pos = 0;
				this.block4_x_pos = position+3;
				this.block4_y_pos = 0;
				
				this.pivot = 2;
				
				break;
				
			case 1:
				this.block1_x_pos = position;
				this.block1_y_pos = 0;
				this.block2_x_pos = position+1;
				this.block2_y_pos = 0;
				this.block3_x_pos = position+1;
				this.block3_y_pos = 1;
				this.block4_x_pos = position+2;
				this.block4_y_pos = 0;
				
				this.pivot = 2;
				
				break;
				
			case 2:
				this.block1_x_pos = position;
				this.block1_y_pos = 0;
				this.block2_x_pos = position+1;
				this.block2_y_pos = 0;
				this.block3_x_pos = position+1;
				this.block3_y_pos = 1;
				this.block4_x_pos = position+2;
				this.block4_y_pos = 1;
				
				this.pivot = 3;
				
				break;
				
			case 3:
				this.block1_x_pos = position;
				this.block1_y_pos = 1;
				this.block2_x_pos = position+1;
				this.block2_y_pos = 1;
				this.block3_x_pos = position+1;
				this.block3_y_pos = 0;
				this.block4_x_pos = position+2;
				this.block4_y_pos = 0;
				
				this.pivot = 2;
				
				break;
				
			case 4:
				this.block1_x_pos = position;
				this.block1_y_pos = 0;
				this.block2_x_pos = position+1;
				this.block2_y_pos = 0;
				this.block3_x_pos = position;
				this.block3_y_pos = 1;
				this.block4_x_pos = position+1;
				this.block4_y_pos = 1;
				
				this.pivot = 2;
				
				break;
				
			case 5:
				this.block1_x_pos = position;
				this.block1_y_pos = 0;
				this.block2_x_pos = position;
				this.block2_y_pos = 1;
				this.block3_x_pos = position+1;
				this.block3_y_pos = 1;
				this.block4_x_pos = position+2;
				this.block4_y_pos = 1;
				
				this.pivot = 3;
				
				break;
				
			case 6:
				this.block1_x_pos = position;
				this.block1_y_pos = 1;
				this.block2_x_pos = position;
				this.block2_y_pos = 0;
				this.block3_x_pos = position+1;
				this.block3_y_pos = 0;
				this.block4_x_pos = position+2;
				this.block4_y_pos = 0;
				
				this.pivot = 3;
				
				break;
				
			default:
			
				
	
		}
		
		//We use this function to convert the cartesian position to the corresponding array indicies in the tetrisGame.currentState array 
		this.toArrayVal();
		
		//Update the currentState array to reflect the added shape 
		tetrisGame.currentState[this.block1] = this.shapeColor;
		tetrisGame.currentState[this.block2] = this.shapeColor;
		tetrisGame.currentState[this.block3] = this.shapeColor;
		tetrisGame.currentState[this.block4] = this.shapeColor;
		
		
		
		//Set the shape to be fallin 
		this.isFalling = true;
		
		//Push the new shape on to the shapes of the tetrisGame 
		tetrisGame.shapes.push(this);
	
	}
	
	/*
	* @name - incrementTime 
	* @description - Determines the best move either (rotation or shift) according to the AI principles. Either rotates or shifts left or right then shifts down 
	* @param -  None
	* @return - None 
	*/
	this.incrementTime = function() {
		
		//If the shape is falling 
		if(this.isFalling == true) {
			
			//Calculate the AI value for a shift 
			var shift_arr = this.calculateMaximumShift();
			
			//Calculate the AI value for a rotation 
			var rotate_val = this.calculateRotation();
			
			//If the rotation value maximizes the score, rotate the shape 
			if(rotate_val > shift_arr[0]) {
				
				//Rotate the shape around pivot 2 
				if(this.pivot == 2) {
				this.completeRotation(this.block2_x_pos,this.block2_y_pos,this.block1_x_pos,this.block1_y_pos,this.block3_x_pos,this.block3_y_pos,this.block4_x_pos,this.block4_y_pos);
				
				
				}
			
				//Rotate the shape around pivot 3 
				else if (this.pivot == 3) {
					this.completeRotation(this.block3_x_pos,this.block3_y_pos,this.block1_x_pos,this.block1_y_pos,this.block2_x_pos,this.block2_y_pos,this.block4_x_pos,this.block4_y_pos);
					
				
				}
				
			}
			//If the shift value maximizes the score, shift the shape by the value that maximizes the score 
			else {
			
				this.shiftLeftRight(shift_arr[1]);
			}
			
			//Shift the shape down after the rotation or shift 
			this.shiftDown();
		
			
				
		}
		
		
		
		
	}
				
	
	

	/*
	* @name - shiftDown 
	* @description - If the down shift is valid, sets all necessary things to make a tetris block shift down 
	* @param - None 
	* @return - True - If the block was shifted correctly, false otherwise 
	*/
	this.shiftDown = function() {
		
		//If the shape is falling, will not hit another shape, and is not at the bottom 
		if(this.isFalling == true && this.checkIfHitAnotherShape(10) == true && this.getMaxVal() < 19) {
			
			
			
				//Blank out the current positions 
				tetrisGame.currentState[this.block1] = -1;
				tetrisGame.currentState[this.block2] = -1;
				tetrisGame.currentState[this.block3] = -1;
				tetrisGame.currentState[this.block4] = -1;
			
				
				//Update the cartesian y position
				this.block1_y_pos = this.block1_y_pos +1;
				this.block2_y_pos = this.block2_y_pos +1;
				this.block3_y_pos = this.block3_y_pos +1;
				this.block4_y_pos = this.block4_y_pos +1;
				
				//Update the block values that correspond to the proper array indices 
				this.toArrayVal();
				
				
					
				// Set the new current position of the dot to be filled
				tetrisGame.currentState[this.block1] = this.shapeColor;
				tetrisGame.currentState[this.block2] = this.shapeColor;
				tetrisGame.currentState[this.block3] = this.shapeColor;
				tetrisGame.currentState[this.block4] = this.shapeColor;
				
				//Return true if we have shifted 
				return(true);
			
		
		}
		
		//If the shape is not falling, at the bottom, or will hit another shape 
		else {
			//Set the falling property to false to stop the shape from falling 
			this.isFalling = false;
			//Return false 
			return(false);
		
		}
		
		
		
	}
	
	/*
	* @name - toArrayVal 
	* @description - Converts the corresponding block cartesian coordinates to an index for the currentState array 
	* @param -  None 
	* @return - None 
	*/
	this.toArrayVal = function() {
		
		//Convert the x,y cartesian block1 positions to the corresponding array index for the currentState array
		var x1_pos = this.block1_x_pos.toString();
		var y1_pos = this.block1_y_pos.toString();
		var concat1 = y1_pos + x1_pos;
		this.block1 = parseInt(concat1);

		//Convert the x,y cartesian block2 positions to the corresponding array index for the currentState array
		var x2_pos = this.block2_x_pos.toString();
		var y2_pos = this.block2_y_pos.toString();
		var concat2 = y2_pos + x2_pos;
		this.block2 = parseInt(concat2);

		//Convert the x,y cartesian block3 positions to the corresponding array index for the currentState array
		var x3_pos = this.block3_x_pos.toString();
		var y3_pos = this.block3_y_pos.toString();
		var concat3 = y3_pos + x3_pos;
		this.block3 = parseInt(concat3);

		//Convert the x,y cartesian block4 positions to the corresponding array index for the currentState array
		var x4_pos = this.block4_x_pos.toString();
		var y4_pos = this.block4_y_pos.toString();
		var concat4 = y4_pos + x4_pos;
		this.block4 = parseInt(concat4);
	
	}
	
	/*
	* @name - toCartesian 
	* @description - Turns the block indices into corresponding cartesian indices 
	* @param - None
	* @return - None 
	*/
	this.toCartesian = function() {
	
			
		//Convert the block1 position to a string 
		var block1_string = this.block1.toString();

		/*
		* We parse the x,y cartesian position of the shape based on the block1 value. 
		*/
		
		if(this.block1 < 10) {
			this.block1_x_pos = parseInt(block1_string.substring(0,1));
			this.block1_y_pos = 0;
		}

		else if(this.block1 < 100) {
			this.block1_x_pos = parseInt(block1_string.substring(1,2));
			this.block1_y_pos = parseInt(block1_string.substring(0,1));
		}

		else {
			this.block1_x_pos = parseInt(block1_string.substring(2,3));
			this.block1_y_pos = parseInt(block1_string.substring(0,2));

		}


		//Convert the block2 position to a string 
		var block2_string = this.block2.toString();

		
		/*
		* We parse the x,y cartesian position of the shape based on the block2 value. 
		*/
		if(this.block2 < 10) {
			this.block2_x_pos = parseInt(block2_string.substring(0,1));
			this.block2_y_pos = 0;
		}

		else if(this.block2 < 100) {
			this.block2_x_pos = parseInt(block2_string.substring(1,2));
			this.block2_y_pos = parseInt(block2_string.substring(0,1));
		}

		else {
			this.block2_x_pos = parseInt(block2_string.substring(2,3));
			this.block2_y_pos = parseInt(block2_string.substring(0,2));

		}

		
		//Convert the block3 position to a string 
		var block3_string = this.block3.toString();

		/*
		* We parse the x,y cartesian position of the shape based on the block3 value. 
		*/
		if(this.block3 < 10) {
			this.block3_x_pos = parseInt(block3_string.substring(0,1));
			this.block3_y_pos = 0;
		}

		else if(this.block3 < 100) {
			this.block3_x_pos = parseInt(block3_string.substring(1,2));
			this.block3_y_pos = parseInt(block3_string.substring(0,1));
		}

		else {
			this.block3_x_pos = parseInt(block3_string.substring(2,3));
			this.block3_y_pos = parseInt(block3_string.substring(0,2));

		}

		
		//Convert the block4 position to a string 
		var block4_string = this.block4.toString();

		/*
		* We parse the x,y cartesian position of the shape based on the block4 value. 
		*/
		if(this.block4 < 10) {
			this.block4_x_pos = parseInt(block4_string.substring(0,1));
			this.block4_y_pos = 0;
		}

		else if(this.block4 < 100) {
			this.block4_x_pos = parseInt(block4_string.substring(1,2));
			this.block4_y_pos = parseInt(block4_string.substring(0,1));
		}

		else {
			this.block4_x_pos = parseInt(block4_string.substring(2,3));
			this.block4_y_pos = parseInt(block4_string.substring(0,2));

		}

	}
	/*
	* @name - checkShiftThroughBlock
	* @description - Checks if a block can be shifted left or right by array_shift without going through another block 
	* @param - array_shift - How far shifted left or right 
	* @return - False - If shift was not successful, true otherwise 
	*/
	this.checkShiftThroughBlock = function(array_shift) {
		//If we shift right 
		if(array_shift > 0) {
			//Loop through all the shapes in the tetrisGame shapes array 
			for(var i=0; i < tetrisGame.shapes.length; i++) {
				//We will not compare the current shape to itself 
				if(tetrisGame.shapes[i].id != this.id) {
					//If the current block1 and the shifted block1 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 >=this.block1  && tetrisGame.shapes[i].block1<= this.block1 +array_shift) || (tetrisGame.shapes[i].block2 >=this.block1  && tetrisGame.shapes[i].block2<= this.block1 +array_shift) || (tetrisGame.shapes[i].block3 >=this.block1  && tetrisGame.shapes[i].block3<= this.block1 +array_shift) || (tetrisGame.shapes[i].block4 >=this.block1  && tetrisGame.shapes[i].block4<= this.block1 +array_shift)) {

						return false;
					}
					//If the current block2 and the shifted block2 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 >=this.block2  && tetrisGame.shapes[i].block1<= this.block2 +array_shift) || (tetrisGame.shapes[i].block2 >=this.block2  && tetrisGame.shapes[i].block2<= this.block2 +array_shift) || (tetrisGame.shapes[i].block3 >=this.block3  && tetrisGame.shapes[i].block3<= this.block3 +array_shift) || (tetrisGame.shapes[i].block4 >=this.block4  && tetrisGame.shapes[i].block4<= this.block4 +array_shift)) {

						return false;
					}
					//If the current block3 and the shifted block3 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 >=this.block3  && tetrisGame.shapes[i].block1<= this.block3 +array_shift) || (tetrisGame.shapes[i].block2 >=this.block3  && tetrisGame.shapes[i].block2<= this.block3 +array_shift) || (tetrisGame.shapes[i].block3 >=this.block3  && tetrisGame.shapes[i].block3<= this.block3 +array_shift) || (tetrisGame.shapes[i].block4 >=this.block3  && tetrisGame.shapes[i].block4<= this.block3 +array_shift)) {

						return false;
					}
					
					//If the current block4 and the shifted block4 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 >=this.block4  && tetrisGame.shapes[i].block1<= this.block4 +array_shift) || (tetrisGame.shapes[i].block2 >=this.block4  && tetrisGame.shapes[i].block2<= this.block4 +array_shift) || (tetrisGame.shapes[i].block3 >=this.block4 && tetrisGame.shapes[i].block3<= this.block4 +array_shift) || (tetrisGame.shapes[i].block4 >=this.block4  && tetrisGame.shapes[i].block4<= this.block4 +array_shift)) {

						return false;
					}
				}
			}
		}
		//If we are shifting left 
		else if (array_shift <0) {
			//Loop through all the shapes in the tetrisGame shapes array 
			for(var i=0; i < tetrisGame.shapes.length; i++) {
				//We will not compare the current shape to itself 
				if(tetrisGame.shapes[i].id != this.id) {
					//If the current block1 and the shifted block1 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 <=this.block1  && tetrisGame.shapes[i].block1>= this.block1 +array_shift) || (tetrisGame.shapes[i].block2 <=this.block1  && tetrisGame.shapes[i].block2>= this.block1 +array_shift) || (tetrisGame.shapes[i].block3 <=this.block1  && tetrisGame.shapes[i].block3>= this.block1 +array_shift) || (tetrisGame.shapes[i].block4 <=this.block1  && tetrisGame.shapes[i].block4>= this.block1 +array_shift)) {

						return false;
					}
					//If the current block2 and the shifted block2 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 <=this.block2  && tetrisGame.shapes[i].block1>= this.block2 +array_shift) || (tetrisGame.shapes[i].block2 <=this.block2  && tetrisGame.shapes[i].block2>= this.block2 +array_shift) || (tetrisGame.shapes[i].block3 <=this.block3  && tetrisGame.shapes[i].block3>= this.block3 +array_shift) || (tetrisGame.shapes[i].block4 <=this.block4  && tetrisGame.shapes[i].block4>= this.block4 +array_shift)) {

						return false;
					}
					//If the current block3 and the shifted block3 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 <=this.block3  && tetrisGame.shapes[i].block1>= this.block3 +array_shift) || (tetrisGame.shapes[i].block2 <=this.block3  && tetrisGame.shapes[i].block2>= this.block3 +array_shift) || (tetrisGame.shapes[i].block3 <=this.block3  && tetrisGame.shapes[i].block3>= this.block3 +array_shift) || (tetrisGame.shapes[i].block4 <=this.block3  && tetrisGame.shapes[i].block4>= this.block3 +array_shift)) {

						return false;
					}
					//If the current block4 and the shifted block4 goes through any block in any shape(excluding the current shape) return false 
					if((tetrisGame.shapes[i].block1 <=this.block4  && tetrisGame.shapes[i].block1>= this.block4 +array_shift) || (tetrisGame.shapes[i].block2 <=this.block4  && tetrisGame.shapes[i].block2>= this.block4 +array_shift) || (tetrisGame.shapes[i].block3 <=this.block4 && tetrisGame.shapes[i].block3>= this.block4 +array_shift) || (tetrisGame.shapes[i].block4 <=this.block4  && tetrisGame.shapes[i].block4>= this.block4 +array_shift)) {

						return false;
					}
				}
			}
			
		}
		return(true);
		
	}
	
	/*
	* @name - checkHitAnotherShape
	* @description - Checks if the shape plus a shift lands on another shape 
	* @param -  array_shift - Value to shift by 
	* @return - False - If the shift was unsuccessful, returns true otherwise 
	*/
	this.checkIfHitAnotherShape = function(array_shift) {
		//Loop through all the shapes in the tetrisGame shapes array 
		for(var i=0; i < tetrisGame.shapes.length; i++) {
			//We will not compare the current shape to itself 
			if(tetrisGame.shapes[i].id != this.id) {
				//If the current shapes block1 shifted down by the shift hits any block of any shape (excluding its own blocks), set this.isFalling = false and return false 
				if(tetrisGame.shapes[i].block1 == this.block1 +array_shift || tetrisGame.shapes[i].block2 == this.block1 +array_shift|| tetrisGame.shapes[i].block3 == this.block1 +array_shift|| tetrisGame.shapes[i].block4 == this.block1+array_shift) {
					if(this.array_shift == 10) {
						this.isFalling = false;
					}
					return false;
				}
				//If the current shapes block2 shifted down by the shift hits any block of any shape (excluding its own blocks), set this.isFalling = false and return false 
				if(tetrisGame.shapes[i].block1 == this.block2+array_shift || tetrisGame.shapes[i].block2 == this.block2+array_shift || tetrisGame.shapes[i].block3 == this.block2+array_shift || tetrisGame.shapes[i].block4 == this.block2+array_shift) {
					if(this.array_shift == 10) {
						this.isFalling = false;
					}
					return false;
				}
				//If the current shapes block3 shifted down by the shift hits any block of any shape (excluding its own blocks), set this.isFalling = false and return false 
				if(tetrisGame.shapes[i].block1 == this.block3+array_shift || tetrisGame.shapes[i].block2 == this.block3+array_shift || tetrisGame.shapes[i].block3 == this.block3+array_shift || tetrisGame.shapes[i].block4 == this.block3+array_shift) {
					if(this.array_shift == 10) {
						this.isFalling = false;
					}
					return false;
				}
				//If the current shapes block4 shifted down by the shift hits any block of any shape (excluding its own blocks), set this.isFalling = false and return false 
				if(tetrisGame.shapes[i].block1 == this.block4+array_shift || tetrisGame.shapes[i].block2 == this.block4+array_shift || tetrisGame.shapes[i].block3 == this.block4+array_shift || tetrisGame.shapes[i].block4 == this.block4+array_shift) {
					if(this.array_shift == 10) {
						this.isFalling = false;
					}
					return false;
				}
			}
		}
		//Return true if no block was hit 
		return(true);
	}
	
	
	/*
	* @name - transform_coordinates 
	* @description - Transforms the coordinates so that the coordinates passed in are centered at the pivot which represents the origin 
	* @param - pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3  - Cartesian values to be transformed 
	* @return - new_pivot_x,new_pivot_y,x_1,y_1,x_2,y_2,x_3,y_3 - Transformed Cartiesn values 
	*/
	this.transform_coordinates = function(pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3) {
	
		//For each of the cartesian coordanites, we set the pivot as the origin. Then, we make all the other coordinates relative to the origin 
		var new_pivot_x = 0;
		var new_pivot_y =0;
		x_1 = x_1 - pivot_x;
		y_1 = y_1 - pivot_y;
		x_2 = x_2 - pivot_x;
		y_2 = y_2 - pivot_y;
		x_3 = x_3 - pivot_x;
		y_3 = y_3 - pivot_y;
		return([new_pivot_x,new_pivot_y,x_1,y_1,x_2,y_2,x_3,y_3]);
		
	}

	/*
	* @name - rotate_coordinates 
	* @description - Rotates the coordinates using the standard rotation matrix 
	* @param - pivot_x,pivot_y, x_1,y_1,x_2,y_2,x_3,y_3 - Coordinates to be rotated 
	* @return -new_pivot_x,new_pivot_y,new_x_1,new_y_1,new_x_2,new_y_2,new_x_3,new_y_3 - Rotated coordinates 
	*/
	this.rotate_coordinates = function(pivot_x,pivot_y, x_1,y_1,x_2,y_2,x_3,y_3) {
		//For each of the cartesian coordanites, we use the rotation matrix [[0,1],[-1,0]]
		//The returned cartesian coordinates are equivalent to multiplying the vector [x_pos, y_pos] by these values 
			var new_pivot_x = -pivot_y;
			var new_pivot_y = pivot_x;
			var new_x_1 = -y_1;
			var new_y_1 = x_1;
			var new_x_2 = -y_2;
			var new_y_2 = x_2;
			var new_x_3 = -y_3;
			var new_y_3 = x_3;
			return([new_pivot_x,new_pivot_y,new_x_1,new_y_1,new_x_2,new_y_2,new_x_3,new_y_3]);
			
	}
	
	/*
	* @name - transform_coordinates_back 
	* @description - Transforms the coordinates which are centtered at the old_pivot value back to the original values on the tetrisBoard 
	* @param - pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3, old_pivot_x, old_pivot_y - Coordinates to be changed 
	* @return - new_pivot_x,new_pivot_y,x_1,y_1,x_2,y_2,x_3,y_3 - Changed Coordinates 
	*/
	this.transform_coordinates_back = function(pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3, old_pivot_x, old_pivot_y) {
			//We previously had the coordinates relative to the pivot which was the origin. Now we transform the coordinates back usin the old pivot value 
			var new_pivot_x = old_pivot_x;
			var new_pivot_y =old_pivot_y;
			x_1 = x_1 + old_pivot_x;
			y_1 = y_1 + old_pivot_y;
			x_2 = x_2 + old_pivot_x;
			y_2 = y_2 + old_pivot_y;
			x_3 = x_3 + old_pivot_x;
			y_3 = y_3 + old_pivot_y;
			return([new_pivot_x,new_pivot_y,x_1,y_1,x_2,y_2,x_3,y_3]);
			
	}
	
	/*
	* @name - checkInBounds 
	* @description - Checks if the parameters passed in are in valid tetrisBoard range 
	* @param - x_1,y_1,x_2,y_2,x_3,y_3,x_4,y_4 - Cartesian values to be teseted 
	* @return - True - If the values are in a valid range, false otherwise 
	*/
	this.checkInBounds = function(x_1,y_1,x_2,y_2,x_3,y_3,x_4,y_4) {
		//If any of the cartesian values are not in a valid tetris board range, return false 
		if(x_1 < 0 || x_2 < 0 || x_3 < 0 || x_4 < 0 || x_1 > 9 || x_2 > 9 || x_3 > 9 || x_4 > 9 || y_1 <0 || y_2 < 0 || y_3 <0 || y_4 <0 || y_1 >  19 || y_2 > 19 || y_3 > 19 || y_4 > 19) {
			return(false);
		}
		else {
			return(true);
		}
	}


	/*
	* @name - completeRotation 
	* @description - Uses the functions above to do a complete rotation of a shape. 
	* @param - pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3 - Original Cartesian Coordinates of the shape to be rotated 
	* @return - True - If the shape was rotated, False otherwise 
	*/
	this.completeRotation =  function(pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3) {
			//If the shape is falling, not on top of another shape, and not at the bottom 
			if(this.isFalling == true && this.checkIfHitAnotherShape(10) == true && this.getMaxVal() < 19) {
				//Transform the coordinates using the three functions above 
				var new_coords = this.transform_coordinates(pivot_x,pivot_y,x_1,y_1,x_2,y_2,x_3,y_3);
				var new_coords1 = this.rotate_coordinates(new_coords[0],new_coords[1],new_coords[2],new_coords[3],new_coords[4],new_coords[5],new_coords[6],new_coords[7]);
				var new_coords2 = this.transform_coordinates_back(new_coords1[0],new_coords1[1],new_coords1[2],new_coords1[3],new_coords1[4],new_coords1[5],new_coords1[6],new_coords1[7],pivot_x,pivot_y);

				//Store the old block position in case the new coordinates are not valid 
				var old_block1_x_pos = this.block1_x_pos;
				var old_block1_y_pos = this.block1_y_pos;
				var old_block2_x_pos = this.block2_x_pos;
				var old_block2_y_pos = this.block2_y_pos;
				var old_block3_x_pos = this.block3_x_pos;
				var old_block3_y_pos = this.block3_y_pos;
				var old_block4_x_pos = this.block4_x_pos;
				var old_block4_y_pos = this.block4_y_pos;
				
				
				//Block out the old positions 
				tetrisGame.currentState[this.block1] = -1;
				tetrisGame.currentState[this.block2] = -1;
				tetrisGame.currentState[this.block3] = -1;
				tetrisGame.currentState[this.block4] = -1;
				
				//Set the new positions for a block with a pivot 2
				if(this.pivot == 2) {
					this.block2_x_pos = new_coords2[0];
					this.block2_y_pos = new_coords2[1];
					this.block1_x_pos = new_coords2[2];
					this.block1_y_pos = new_coords2[3];
					this.block3_x_pos = new_coords2[4];
					this.block3_y_pos = new_coords2[5];
					this.block4_x_pos = new_coords2[6];
					this.block4_y_pos = new_coords2[7];
				}
				
				//Set the new positions for a block with a pivot 3
				else if (this.pivot ==3) {
					this.block3_x_pos = new_coords2[0];
					this.block3_y_pos = new_coords2[1];
					this.block1_x_pos = new_coords2[2];
					this.block1_y_pos = new_coords2[3];
					this.block2_x_pos = new_coords2[4];
					this.block2_y_pos = new_coords2[5];
					this.block4_x_pos = new_coords2[6];
					this.block4_y_pos = new_coords2[7];
					
				}
				
				
			
				//Convert the cartesian values to the correspondin indicies of the currentState matrix
				this.toArrayVal();
				
				//If the new coordinates are valid (we do not hit another shape, the shape is within a valid range)
				if(this.checkIfHitAnotherShape(0) == true && this.getMaxVal() <= 19 && this.checkInBounds(this.block1_x_pos,this.block1_y_pos,this.block2_x_pos,this.block2_y_pos,this.block3_x_pos,this.block3_y_pos,this.block4_x_pos,this.block4_y_pos) == true) {
					
					
					// Set the new current position of the shape to be filled
					tetrisGame.currentState[this.block1] = this.shapeColor;
					tetrisGame.currentState[this.block2] = this.shapeColor;
					tetrisGame.currentState[this.block3] = this.shapeColor;
					tetrisGame.currentState[this.block4] = this.shapeColor;
					//Return true 
					return(true);
					
				
				}
				
				//If the  new coordinates are not valid 
				else {
					
					//The block might have been stopped from falling by checkHitAnotherShape(0), we should reset it 
					this.isFalling = true;
					
					//Reset the block positions to the old values 
					this.block1_x_pos = old_block1_x_pos;
					this.block1_y_pos = old_block1_y_pos;
					this.block2_x_pos = old_block2_x_pos;
					this.block2_y_pos = old_block2_y_pos;
					this.block3_x_pos = old_block3_x_pos;
					this.block3_y_pos = old_block3_y_pos;
					this.block4_x_pos = old_block4_x_pos;
					this.block4_y_pos = old_block4_y_pos;
					
					//Convert the cartesian coordinates to the corresponding block coordinates for the currentState Array 
					this.toArrayVal();
					
					//Draw the old shape again 
					tetrisGame.currentState[this.block1] = this.shapeColor;
					tetrisGame.currentState[this.block2] = this.shapeColor;
					tetrisGame.currentState[this.block3] = this.shapeColor;
					tetrisGame.currentState[this.block4] = this.shapeColor;
					//Return false 
					return(false);
				
				}
				
				
				
				
			

			}
			
			//If the shape is not falling, has hit another shape, or is at the bottom, return false 
			else {
				//Set the falling property to false to stop the shape from falling 
				this.isFalling = false;
				return(false);
			}

	}
	
	
	/*
	* @name - shiftLeftRight 
	* @description - Attemps to shift the shape right or left by the parameter passed in
	* @param -  shift - Value of shift 
	* @return - True - If the shape was shifted, false otherwise 
	*/
	this.shiftLeftRight = function(shift) {
		//If the shape is falling, has not hit another shape, and is not at the bottom
		if(this.isFalling == true && this.checkIfHitAnotherShape(10) == true && this.getMaxVal() < 19) {
			
			//If the shifted shape has not gone throuh a block, landed on another block, and the shift is in the valid tetrisBoard range 
			if(this.checkIfHitAnotherShape(shift) == true && this.checkShiftThroughBlock(shift) == true && this.getRightMaxVal() + shift <= 9 && this.getLeftMaxVal() + shift >= 0) {
			
				//Blank out the old values 
				tetrisGame.currentState[this.block1] = -1;
				tetrisGame.currentState[this.block2] = -1;
				tetrisGame.currentState[this.block3] = -1;
				tetrisGame.currentState[this.block4] = -1;
			
				//Shift the x coordinates by the shift 
				this.block1_x_pos = this.block1_x_pos + shift;
				this.block2_x_pos = this.block2_x_pos + shift;
				this.block3_x_pos = this.block3_x_pos + shift;
				this.block4_x_pos = this.block4_x_pos + shift;
				
				//Convert the cartesian coordinates to the block positions of the currentState array 
				this.toArrayVal();
				
				//Set the currenState array for the new block
				tetrisGame.currentState[this.block1] = this.shapeColor;
				tetrisGame.currentState[this.block2] = this.shapeColor;
				tetrisGame.currentState[this.block3] = this.shapeColor;
				tetrisGame.currentState[this.block4] = this.shapeColor;
				
				//Return true if the shape was shifted 
				return(true);
			}
			
			//If the shape was not shifted 
			else {
				//Reset the is falling property that might have been reset by the checkIfHitAnotherShape
				this.isFalling = true;
				//Return False 
				return(false);
			}	
		
		}
		//If the shape has hit the botoom, landed on another shape, or is not falling 
		else {
			//Set the is falling property to false 
			this.isFalling = false;
			//Return false 
			return(false);
		}
	}
	
	/*
	* @name - getMaxVal 
	* @description - Returns the maximum y-value of the current shape 
	* @param - 
	* @return - Returns the maximum y-value of the current shape 
	*/
	this.getMaxVal = function() {
			//Return the maximum y position
			return(Math.max(this.block1_y_pos,this.block2_y_pos,this.block3_y_pos,this.block4_y_pos));
	}
	
	/*
	* @name - getMinVal 
	* @description - Returns the minimum y-value of the current shape 
	* @param - 
	* @return - Returns the minimum y-value of the current shape 
	*/
	this.getMinVal = function() {
		//Return the minimum y position
		return(Math.min(this.block1_y_pos,this.block2_y_pos,this.block3_y_pos,this.block4_y_pos));
	}
	
	
	/*
	* @name - getLeftMaxVal
	* @description - Returns the maximum x-value of the current shape 
	* @param - 
	* @return - Returns the maximum x-value of the current shape 
	*/
	this.getLeftMaxVal = function() {
		//Return the minimum x position
		return(Math.min(this.block1_x_pos,this.block2_x_pos,this.block3_x_pos,this.block4_x_pos));
	}
	
	
	/*
	* @name - getRightMaxVal
	* @description - Returns the minimum x-value of the current shape 
	* @param - 
	* @return - Returns the minimum x-value of the current shape 
	*/
	this.getRightMaxVal = function() {
		//Return the maximum x position
		return(Math.max(this.block1_x_pos,this.block2_x_pos,this.block3_x_pos,this.block4_x_pos));
	}
	
	/*
	* @name - getAggergateHeight 
	* @description - Sums the heights of all columns of the tetrisBoard. Height is defined as the highest block in a column relative to the bottom. THis function is used for our AI 
	* @param - None 
	* @return - Sum of heights of columns of the tetris board 
	*/
	this.getAggregateHeight = function() {
		
		var sum =0;
		
		//Loop through the whole tetris board 
		for(var i =0; i < 10; i++) {
			for(var j=0; j < 20; j++) {
				//Convert the row,col value to a valid index for the currentState array 
				var string_row = j.toString();
				var string_col = i.toString();
				var num = parseInt(string_row + string_col);
				//Find the first shape in a column that is highest up the board 
				if(tetrisGame.currentState[num] != -1) {
					
					//Add 20 to sum if the shape is at row 0
					if(num < 10) {
						sum += 20;
					}
					//Add 20- height to sum if the shape is at rows 1-9. We have a different case to parse the hieght differently 
					else if (num < 100) {
						var num_to_string = num.toString();
						var index = num_to_string.substr(0,1);
						var index_to_num = parseInt(index);
						
						sum += (20 - index_to_num);
					}
					//Add 20- height to sum if the shape is at rows 9 -19. We have a different case to parse the hieght differently 
					else {
						var num_to_string = num.toString();
						var index = num_to_string.substr(0,2);
						var index_to_num = parseInt(index);
						sum += (20 - index_to_num);

					}
					//Break after finding the highest block in the column 
					break;
				}
				//If no block is found, sum 0 
				else {
					sum +=0;
				}
					
				
			}
			
		}
		//Return the sum of the heights of the columns 
		return(sum);
	}
	
	
	/*
	* @name - getCompleteLines 
	* @description - Returns the number of complete lines on the tetrisBoard. Used in our AI 
	* @param - None 
	* @return - Returns the number of complete linse on the tetrisBoard 
	*/
	this.getCompleteLines = function() {
		
		var complete_row =0;
		//Loop through all the rows 
		for(var i =0; i < 20; i++) {
			var shapes_in_row = 0;
			//Loop through columns 
			for(var j=0; j < 10; j++) {
				//Parse i,j value to currentState index 
				var string_index = i.toString() + j.toString();
				var index = parseInt(string_index);
				//If a nonzero value is found in a row, add one to the temp variable 
				if(tetrisGame.currentState[index] != -1) {
					shapes_in_row = shapes_in_row +1;
				}
			}
			//If a block is found in every single column of a row, add one to the complete row variable 
			if(shapes_in_row == 10) {
				complete_row = complete_row + 1;
			}
		}
		//Return the number of complete rows 
		return(complete_row);
	}
	
	
	/*
	* @name - getHoles 
	* @description - Gets the number of holes on the board. Holes are defined as one shape with no shape directly below it. We use this function for our AI 
	* @param - None 
	* @return - Returns the number of holes 
	*/
	this.getHoles = function() {
		var num_holes =0;
		//Loop through all the columns 
		for(var i =0; i < 10; i++) {
			//Looop through all the rows
			for(var j=0; j < 20; j++) {
				//Convert the i,j value to a proper index 
				var string_row = j.toString();
				var string_col = i.toString();
				var num = parseInt(string_row + string_col);
				//If we are not at the last column
				if(num + 10 < 200) {
					//If there is a block with no block directly below it, add one to num_holes 
					if(tetrisGame.currentState[num] != -1 && tetrisGame.currentState[num+10] == -1) {
						num_holes = num_holes + 1;
					}
				}
			}
		}
		//Return the number of holes 
		return(num_holes);
	}
	
	/*
	* @name - getColumnHeight 
	* @description - Helper function for the next functon below. Gets the height in a specified column 
	* @param - col_num - Column to get height of 
	* @return - Returns the height of the corresponding column 
	*/
	this.getColumnHeight = function(col_num) {
		
		//Loop through all the rows 
		for(var j=0; j < 20; j++) {
			//Convert the col, row value to a proper index for the currentState array 
			var string_row = j.toString();
			var string_col = col_num.toString();
			var num = parseInt(string_row + string_col);
			//Find the highest block in a column (farthest up)
			if(tetrisGame.currentState[num] != -1) {
				
				/*
				* Different cases, dependin on the height, because of the way we parse the row number 
				*/
				if(num < 10) {
					return(20);
				}
				else if (num < 100) {
					var num_to_string = num.toString();
					var index = num_to_string.substr(0,1);
					var index_to_num = parseInt(index);
					
					return(20 - index_to_num);
				}
				else {
					var num_to_string = num.toString();
					var index = num_to_string.substr(0,2);
					var index_to_num = parseInt(index);
					return(20 - index_to_num);

				}
			}
				
			
		}
		//If no shape is in the row, return 0
		return(0);
		
	}
	
	/*
	* @name - getBumpiness 
	* @description - Returns the bumpiness of the board. Bumpiness is the summ of the differences of the heights of consecutive columns. This is used in our AI 
	* @param - None 
	* @return - Returns the bumpiness of the tetris board. 
	*/
	this.getBumpiness = function() {
		var bumpiness = 0;
		//Loop through all the columns excluding the last one 
		for(var i =0; i < 9; i++) {
			
			/*
			*Take the difference of the height of the previous column and next, column 
			*/
			var prev_col_height = this.getColumnHeight(i);
			var next_col_height = this.getColumnHeight(i+1);
			var difference = prev_col_height - next_col_height;
			
			/*
			* Add the absolute value of the difference to the bumpiness variable 
			*/
			if(difference >=0) {
				bumpiness = bumpiness + difference;
				
			}
			else {
				bumpiness = bumpiness - difference;
			
			}
		}
		//Return the bumpinss 
		return(bumpiness);
	}
	
	/*
	* @name - determineScore 
	* @description - Takes a linear combination of the height, bumpiness, complete lines, and holes. We want to maximize this score. 
	* @param - None 
	* @return - Returns a linear combination of the height, bumpiness, complete lines, and holes. We want to maximize this score. 
	*/
	this.determineScore = function() {
			//We want to maximze this score. We take a linear combination of the number of completed lines, total height, number of holes, and bumpiness 
			return(0.70 *this.getCompleteLines() -0.5 * this.getAggregateHeight() -  0.3 * this.getHoles() - 0.1*this.getBumpiness());
	}
	
	
	/*
	* @name - calculateMaximumShift 
	* @description - Determines the shift that maximizes the score above. 
	* @param - None 
	* @return - arr - First index holds the maximum score value, while the second index holds the shift value 
	*/
	this.calculateMaximumShift = function() {

		//Arr to hold maximum score and shift value which maximizes the score 
		var arr = [];
		
		//Variable for max score 
		var max_score = -50000;
		//Variable for shift which maximizes the score 
		var max_shift =0;
		
		/*
		* Determine the valid shifts
		*/
		var valid_left_shift = this.getLeftMaxVal() - 0;
		var valid_right_shift=  9-this.getRightMaxVal();
		var temp = 0;
		
		//Loop through all valid left shifts 
		for(var i =0; i <=valid_left_shift; i++) {
			//Store the block values so we can return to them after we shift 
			var old_block1 = this.block1;
			var old_block2 = this.block2;
			var old_block3 = this.block3;
			var old_block4 = this.block4;
			//Shift the shape 
			this.shiftLeftRight(-i);
			//Shift the shape down until it can be shifted down no more 
			while(this.shiftDown()) {
			
			
			}
			//Determine the score after the transformations 
			temp = this.determineScore();
			//If the new score is greater, store it and the shift value 
			if(temp > max_score) {
				max_score = temp;
				max_shift = -i;
			}
			
			//Reset the is falling property that might have been reset whil shifting 
			this.isFalling = true;
			//Blank out the temporary shift block 
			tetrisGame.currentState[this.block1] = -1;
			tetrisGame.currentState[this.block2] = -1;
			tetrisGame.currentState[this.block3] = -1;
			tetrisGame.currentState[this.block4] = -1;
		
			//Get the old block values 
			this.block1 = old_block1;
			this.block2 = old_block2;
			this.block3 = old_block3;
			this.block4 = old_block4;
			
			//Convert the new block values to cartesian coordinates 
			this.toCartesian();
			
			//Draw the shape again at the old spot 
			tetrisGame.currentState[this.block1] = this.shapeColor;
			tetrisGame.currentState[this.block2] = this.shapeColor;
			tetrisGame.currentState[this.block3] = this.shapeColor;
			tetrisGame.currentState[this.block4] = this.shapeColor;
				
		}
		temp =0;
		//Loop through alll the valid right shifts 
		for(var j =0; j <=valid_right_shift; j++) {
			
			//Store the old block position, so we can go back to them 
			var old_block1 = this.block1;
			var old_block2 = this.block2;
			var old_block3 = this.block3;
			var old_block4 = this.block4;
			
			//Shift the block right 
			this.shiftLeftRight(j);
			//Shift the block down until it cannot be shifted anymore 
			while(this.shiftDown()) {
			
			
			}
			//Calculate the score 
			temp=this.determineScore();
			//If the new score, is greater than  the old maximum store it and the shift value 
			if(temp > max_score) {
				max_score = temp;
				max_shift = j;
			}
			
			//Reset the is falling property that might have been reset whil shifting 
			this.isFalling = true;
			//Blank out the temporary shift block 
			tetrisGame.currentState[this.block1] = -1;
			tetrisGame.currentState[this.block2] = -1;
			tetrisGame.currentState[this.block3] = -1;
			tetrisGame.currentState[this.block4] = -1;
		
			//Get the old block values 
			this.block1 = old_block1;
			this.block2 = old_block2;
			this.block3 = old_block3;
			this.block4 = old_block4;
			
			//Convert the new block values to cartesian coordinates 
			this.toCartesian();
			
			//Draw the shape again at the old spot 
			tetrisGame.currentState[this.block1] = this.shapeColor;
			tetrisGame.currentState[this.block2] = this.shapeColor;
			tetrisGame.currentState[this.block3] = this.shapeColor;
			tetrisGame.currentState[this.block4] = this.shapeColor;
		
		}
		//Store the maximum shift value and the maximum score value  and return them 
		arr[0] = max_score;
		arr[1] = max_shift;
		return(arr);
		
		
		
		
	}
	
	/*
	* @name - calculateRotation 
	* @description - Calculates the score for a rotation 
	* @param - None 
	* @return - Returns the score for a rotation 
	*/
	this.calculateRotation = function() {
		//Store score 
		var score = -10000;
		
		//Store old block positions 
		var old_block1 = this.block1;
		var old_block2 = this.block2;
		var old_block3 = this.block3;
		var old_block4 = this.block4;
		
		//If the shape has a pivot of 2, rotate it and shift it down until it cannot be shifted down anymore
		if(this.pivot == 2) {
			this.completeRotation(this.block2_x_pos,this.block2_y_pos,this.block1_x_pos,this.block1_y_pos,this.block3_x_pos,this.block3_y_pos,this.block4_x_pos,this.block4_y_pos);
			while(this.shiftDown()) {
		
		
			}
			//Store the score 
			score  = this.determineScore();
			
		}
		
		//If the shape has a pivot of 3, rotate it and shift it down until it cannot be shifted down anymore
		else if (this.pivot == 3) {
			this.completeRotation(this.block3_x_pos,this.block3_y_pos,this.block1_x_pos,this.block1_y_pos,this.block2_x_pos,this.block2_y_pos,this.block4_x_pos,this.block4_y_pos);
			while(this.shiftDown()) {
		
		
			}
			//Store the score 
			score = this.determineScore();
		}
		
		//Reset the isFalling property 
		this.isFalling = true;
		
		//Blank out the new positon 
		tetrisGame.currentState[this.block1] = -1;
		tetrisGame.currentState[this.block2] = -1;
		tetrisGame.currentState[this.block3] = -1;
		tetrisGame.currentState[this.block4] = -1;
	
		
		//Shift the blocks back to the old positon 
		this.block1 = old_block1;
		this.block2 = old_block2;
		this.block3 = old_block3;
		this.block4 = old_block4;
		
		//Convert the new coordinates to their cartesian counterparts 
		this.toCartesian();
		
		//Make the blocks visible at their old position
		tetrisGame.currentState[this.block1] = this.shapeColor;
		tetrisGame.currentState[this.block2] = this.shapeColor;
		tetrisGame.currentState[this.block3] = this.shapeColor;
		tetrisGame.currentState[this.block4] = this.shapeColor;
		
		//Return the score 	
		return(score);
	}
			

	


	
}


/*
* @name - AddShape 
* @description - Determines if the game ends, a row needs to be cleared, or a new shape needs to be added 
* @param - shapeType - Type of shape, position - Position of shape, id - ID of shape 
* @return - None 
*/
tetrisGame.AddShape = function(shapeType, position, id){
	
		//Variable to see if the game has ended 
		var end_game = false;
		
		//We clear any full rows here since the shape that will have cleared the row would have stopped falling 
		tetrisGame.clearRow();
		//If there is a shape in the first two rows, we end the game 
		for(var i=0; i < 20; i++) {
			if(this.currentState[i] !=-1) {
				end_game = true;
				
			}
		}
		//We end the game by alerting a message 
		if(end_game==true) {
			alert("END GAME!");
			alert("Your Score: " + tetrisGame.cleared_lines);
		}
		
		//If the game has not ended 
		else {
			//Create a new shape
			var shape = new Shape(shapeType,position,id);
			//Call the add shape method 
			shape.AddShape();
			
			//Increment Count for advanced mode 
			tetrisGame.incrementCount =0;
		}
	
	
}


/*
* @name - IncrementTime 
* @description - Calls the incrementTime method of the shapes object for all shapes. If we have entered advanced mode, a new shape is added every seven time increments 
* @param - None 
* @return -None 
*/
tetrisGame.IncrementTime = function(){
	//If the board is not initialized, initialize it 
	if(!this.initialized){this.Initialize();}
	
	//Increment the count 
	tetrisGame.incrementCount = tetrisGame.incrementCount+1;
	//Advanced mode. If we have cleared 1000 rows, and it has been seven time increments since the last shape was added 
	if(tetrisGame.cleared_lines >=1000 && tetrisGame.incrementCount == 7) {
		
		//Store the shape type 
		var type = Math.floor(Math.random() * 7);
	
		var valid_start_pos_arg1 = 0;
		var valid_start_pos_arg2 = 0;
		
		//Switch statement to get valid ranges for starting positions depending on the shape type 
		switch(type) {
			case 0:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 7;
				break;
			case 1:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 8;
				break;
			case 2:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 8;
				break;
			case 3:
				valid_start_pos_arg1 = 1;
				valid_start_pos_arg2 = 8;
				break;
			case 4:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 9;
				break;
			case 5:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 8;
				break;
			case 6:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 8;
				break;
			default:
				valid_start_pos_arg1 = 0;
				valid_start_pos_arg2 = 8;
		}
		
		//Randomize the shape position 
		var pos = Math.floor(Math.random() * (valid_start_pos_arg2-valid_start_pos_arg1)) + valid_start_pos_arg1;
		
		//Create a new shape 
		var shape = new Shape(type,pos,this.id_inc);
		//Call the add shape method 
		shape.AddShape();
		//increment the id 
		this.id_inc = this.id_inc + 1;
	}
	
	//Each timeIncrement, call the incrementTime method for all the shapes in tetrisGame shapes array 
	for(var i=0; i < this.shapes.length; i++) {
		this.shapes[i].incrementTime();
	}
	
	
	
}

/*
* @name - GetCurrentState 
* @description - Returns the currentState array 
* @param - None 
* @return - Returns the currentState array 
*/
tetrisGame.GetCurrentState = function(){
	//If the board is not initialized, initialized it
	if(!this.initialized){this.Initialize();}
	//Return the currentState array 
	return this.currentState;
}

/*
* @name - IsShapeFalling 
* @description - Checks if at least one shape in the shapes array is falling. 
* @param - None 
* @return - True - If a shape is falling, false otherwise 
*/
tetrisGame.IsShapeFalling = function(){
	//If the board is not initialized, initialize it 
	if(!this.initialized){this.Initialize();}
	//If at least on shape in the shape array is falling, return true 
	for(var i =0; i < this.shapes.length; i++) {
		if(this.shapes[i].isFalling == true) {
			return(true);
		}
	}
	//Else return false 
	return(false);
	
	
}

/*
* @name - Initialize 
* @description - Pushes empty shapes onto the currentState array 
* @param - None 
* @return - None 
*/
tetrisGame.Initialize = function(){
	//Push -1 into the currenState array for all values 
	for(var i = 0; i < 10; i++){
		for(var j = 0; j < 20; j++){
			this.currentState.push(-1);
		}
	}
	this.initialized = true;
}

/*
* @name - clearRow 
* @description - Checks if a row is full. If it is, the row is cleared and all shapes above the row fall to their correpsonding positions 
* @param - none 
* @return - none 
*/
tetrisGame.clearRow = function() {
	//Temp variable 
	var count = 0;
	//Will store the row that needs to be cleared 
	var clear_row = 0;
	//True if we need to clear a row 
	var clear = false;
	
	//Loop through all the rows 
	for(var i =0; i < 20; i++) {
		count = 0;
		//Loop through all the columns 
		for(var j=0; j < 10; j++) {
			//Convert the i,j value to an index in the currenState arrray 
			var string_row = j.toString();
			var string_col = i.toString();
			var num = parseInt(string_col + string_row);
			//If a block exists in the row, iterate the count 
			if(tetrisGame.currentState[num]!= -1) {
				count++;
			}
		}
		//If the count is 10, a row is fall, set the boolean to true and store the row number 
		if(count == 10) {
			clear_row = i;
			clear = true;
		}
			
	}
	
	//If we need to clear the row 
	if(clear == true) {
		
		//Update the users score 
		tetrisGame.cleared_lines = tetrisGame.cleared_lines + 1;
		//Loop through all the columns of the row that needs to be cleared 
		for(var k =0; k < 10; k ++) {
			var string_row = k.toString();
			var string_col = clear_row;
			var num = parseInt(string_col + string_row);
			//Loop through the tetris shapes array and find the corresponding block that needs to be cleared. Move the block off of the board so it does not interfere with the game 
			for(var l =0; l < tetrisGame.shapes.length; l++) {
				if(tetrisGame.shapes[l].block1 == num) {
					tetrisGame.shapes[l].block1 = -50;
				}
				else if(tetrisGame.shapes[l].block2 == num) {
					tetrisGame.shapes[l].block2 = -50;
				}
				else if(tetrisGame.shapes[l].block3 == num) {
					tetrisGame.shapes[l].block3 = -50;
				}
				else if(tetrisGame.shapes[l].block4 == num) {
					tetrisGame.shapes[l].block4 = -50;
				}
			}
			//Blank out the value in the currentState array for the row that needs to be cleared 
			tetrisGame.currentState[num] = -1;
		}
		//Loop through all the rows 
		for(var i =0; i < 20; i++) {
			//Loop through all the columns 
			for(var j=0; j < 10; j++) {
				//Convert the i,j value to an index in the currentState Array 
				var string_row = j.toString();
				var string_col = i.toString();
				var num = parseInt(string_col + string_row);
				//If there is a block above the row value that is cleared 
				if( i< clear_row && tetrisGame.currentState[num] !=-1) {
					//Push the block on the clump array, and push the true value (so that it is falling) it to the other array 
					clump.blocks.push(num);
					clump.block_falling.push(true);
					//Loop through all the shapes in the tetris array, find the corresponding block and shape that matches the block that is moving
					for(var k=0; k < tetrisGame.shapes.length; k++) {
						if(tetrisGame.shapes[k].block1 == num) {
								//Push the block id, block color, and block number onto appropriate arrays 
								clump.shape_index.push(k);
								clump.shape_color.push(tetrisGame.shapes[k].shapeColor);
								clump.block_index.push(1);
									
						}
						else if(tetrisGame.shapes[k].block2 == num) {
							//Push the block id, block color, and block number onto appropriate arrays 
								clump.shape_index.push(k);
								clump.shape_color.push(tetrisGame.shapes[k].shapeColor);
								clump.block_index.push(2);
									
						}
						else if(tetrisGame.shapes[k].block3 == num) {
							//Push the block id, block color, and block number onto appropriate arrays 
								clump.shape_index.push(k);
								clump.shape_color.push(tetrisGame.shapes[k].shapeColor);
								clump.block_index.push(3);
									
						}
						else if(tetrisGame.shapes[k].block4 == num) {
							//Push the block id, block color, and block number onto appropriate arrays 
								clump.shape_index.push(k);
								clump.shape_color.push(tetrisGame.shapes[k].shapeColor);
								clump.block_index.push(4);
									
						}
					
					}
				
				}
				
			}
		}
		//Variable to see if a block in the clump array is still moving 
		var still_shifting = true;
		//While a block in the clump array is still moving down 
		while(still_shifting) {
			//Loop backwards through the clump araray, so that values closer to the floor get shifted first 
			for(var j =clump.blocks.length-1; j >=0; j--) {
				//Loop through all the shapes in the tetrisGame shapes array 
				for(var i=0; i < tetrisGame.shapes.length; i++) {
					//Do not compare a block with its correspoding shape blocks 
					if(clump.shape_index[j]!= tetrisGame.shapes[i].id) {
						//If the clump_block value shifted hits any block of any shape, set the block falling property to false 
						if(tetrisGame.shapes[i].block1 == clump.blocks[j] + 10 || tetrisGame.shapes[i].block2 == clump.blocks[j] + 10|| tetrisGame.shapes[i].block3 == clump.blocks[j] + 10|| tetrisGame.shapes[i].block4 == clump.blocks[j] + 10) {
							clump.block_falling[j] = false;
						}
						
					}
				}
				
				//If the clump block has fallen out of the board, set the falling property to false 
				if(clump.blocks[j] + 10 >= 200) {
					clump.block_falling[j] = false;
				}
				
				for(var k=0; k < clump.blocks.length; k++) {
					for(l = 0; l < clump.blocks.length;l++) {
						//If the clump  block shifted has hit another clump block that is not falling, set the property of the clump block to false 
						if(clump.blocks[k] + 10 == clump.blocks[l] && clump.block_falling[l] ==false) {
							clump.block_falling[k] = false;
						}
					}
				}
				
				//If the clump block is still falling 
				if(clump.block_falling[j] == true) {
					//Block out the currentState array 
					tetrisGame.currentState[clump.blocks[j]] = -1;
					//Shift the block down 
					tetrisGame.currentState[clump.blocks[j] + 10] = clump.shape_color[j];
					
					/*
					* Update the block of the corresponding shape in the shapes array 
					*/
					if(clump.block_index[j] == 1) {
						tetrisGame.shapes[clump.shape_index[j]].block1 = clump.blocks[j] + 10;
					}
					else if(clump.block_index[j] == 2) {
						tetrisGame.shapes[clump.shape_index[j]].block2 = clump.blocks[j] + 10;
					}
					else if(clump.block_index[j] == 3) {
						tetrisGame.shapes[clump.shape_index[j]].block3 = clump.blocks[j] + 10;
					}
					else if(clump.block_index[j] == 4) {
						tetrisGame.shapes[clump.shape_index[j]].block4 = clump.blocks[j] + 10;
					}
					//Iterate the clump block value 
					clump.blocks[j] = clump.blocks[j] + 10;
				}
				
			}
			
			still_shifting = false;
			//If any block is still falling, set still_shifting to true 
			for(var p=0; p < clump.block_falling.length; p++) {
				if(clump.block_falling[p] == true) {
					still_shifting = true;
				}
			}
				
		}
		clump = {};
		//Once we are done shifting, reset everything 
		clump.blocks = [];
		clump.block_falling = [];
		clump.shape_index = [];
		clump.shape_color = [];
	    clump.block_index = [];
	}
		
}

//Clump object used for clearing rows 
var clump = {};
//Stores the index in the currentState array of a new falling block
clump.blocks = [];
//Stores true or false depnding on if the block is falling 
clump.block_falling = [];
//Stores the index in the shapes array of the block that is falling 
clump.shape_index = [];
//Stores the color of the block that is falling 
clump.shape_color = [];
//Stores the block number in the shape of the block that is falling 
clump.block_index = [];

