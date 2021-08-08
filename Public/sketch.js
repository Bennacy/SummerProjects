
let side = 52;
let gridEnable=false;
let erasing= false;
let deleted = 0;
let moduleType=0;
let clearedErase=false
let buildingShip=false
let moneyToCollect
let timeScale=1 //speed(in seconds) at which things occur=> 1: one second; 60: one minute   ->!If switched here should be switched on the server side to match!<-

// Arrays initialization
let resource= [];
let mission= [];
let missionButton= [];
let modules=[];
let moduleCost=[]
let crewCost=[]
let moduleName=[]
let placedModule=[]
let maxPlace=[]
let moduleBuildButton=[]
let arrtiles = [];

let playerId;
let cv;
let mainSceneEnable = false;
let resourceType;
let currentAmount;
let maxAmount;
let currMCost
let currCCost
let inUse;
let registering
let firstLoad= true
let mainLoop= true
let visitedB=false

// Button initialization
let loginBtn
let registerBtn
let signupBtn
let registerBackBtn
let missionScreenB
let buildScreenB
let buildShipB
let collectMB
let profileButton
let logoffButton


// Input initialization
let nameInput
let passInput
let suNameInput
let suPassInput

// Timers initialization (In seconds)
let mainLoopTimer= 60

let moneyTimer
let loopCounter= 0
let gameState=0




function preload(){
  for(let i=1; i<=10; i++){
    let modType=i
    loadJSON('/getMCost/'+modType,(dataReceived)=>{ // Old name, returns everything on the module table from the database
      moduleCost[i]=dataReceived[0].matCost
      moduleName[i]=dataReceived[0].moduleName
      maxPlace[i]=dataReceived[0].maxPlace
			crewCost[i]=dataReceived[0].crewCost
    })
  }
}

function setup() {
  cv = createCanvas(windowWidth, windowHeight);
  cv.position((windowWidth * 0.5) - width / 2, (windowHeight * 0.5) - height / 2);
  timer()
}


function draw() {
  switch(gameState){
    case 0: // Initial log-in screen
      loginScene()
      noLoop()
      break

    case 1: // Main menu
      if (mainLoop== true){
        loopCounter++
        mainLoop= false
        console.log("looped " + loopCounter)
        main_Scene()
      }
      break
  }
}


function main_scene_setup(){
  nameInput.remove();
  passInput.remove();
  loginBtn.remove();
  signupBtn.remove();
	moneyTimer=0
	moneyToCollect=0

  loadJSON('/getPlaced/'+playerId,(dataReceived)=>{ // Get a list of how many modules of each type are built
    for(let i=0; i<dataReceived.length; i++){
      placedModule[i]=dataReceived[i].COUNT
    }

    setTimeout(drawR(),20) // Ensures that the resources are drawn last
  })

	setInterval(function(){ // For every "minute" the player is active on the page and they have at least one money production module, money to collect increases
		if(placedModule[0]>0)
			moneyTimer++
	},1000*timeScale)

  logoffButton= new Button(width/2-width/20,height/2-height/20, width/10,height/10, 210,210,210, logOff, 'Log Off')
  profileButton= new Button(width/60,height/17, ((width/2)-(19*48/2))-width/40,height/15, 210,210,210, playerProfile, 'Profile')
  missionScreenB= new Button(width-200-15, height-90, 200, 75, 200,200,200, mission_Scene, "Missions")
  buildScreenB= new Button(15, height-90, 200, 75, 200,200,200, building_Scene, "Modules")
	collectMB= new Button(width/2-50,height/17+48, 100,35, 255,255,255, collectMoney, 'Collect Money')

  mainLoop= true
  gameState= 1
  loop()
}


function main_Scene() {
    clearScreen()
    createCanvas(windowWidth, windowHeight);
    background('#dbdbdb')
    moduleType=0
    gridEnable=false
    side= 48
    create_Grid()
    drawR()
}


function playerProfile(){
  if(gameState<4){
    clearScreen()
    background(100);
    gameState = 4;
  }
  else if(gameState==4){
    clearScreen()
    background(219)
    create_Grid()
    drawR()
    gameState=1
  }
}


function logOff(){
  clearScreen()
  gameState=0
}


function collectMoney(){
	loadJSON('/getEffect/'+1,(dataReceived)=>{ // This money increases up to a maximum of 10 "minutes" after which it stays consistant, and can be collected at most every 3 "minutes"
		multiplier=dataReceived[0].effect
		if(moneyTimer>10){
			moneyTimer=10
		}

		moneyToCollect=moneyTimer*multiplier*placedModule[0]
		moneyTimer=0

		resource[0].change_value(1,moneyToCollect)
		collectMB.text=('+'+moneyToCollect)

		setTimeout(function(){collectMB.text='Collect Money'},1000)
	})
}


function keyPressed(){
  if(gameState>0){
    switch(keyCode){
      case 49: // 1 => Sets Money to max
        resource[0].change_value(1,int(resource[0].maxAmount))
        break
      
      case 50: // 2 => Sets Crew to max
      resource[1].change_value(1,int(resource[1].maxAmount))
      break
    
      case 51: // 3 => Sets Materials to max
      resource[2].change_value(1,int(resource[2].maxAmount))
      break

      case 52: // 4 => Sets Ships to max
        resource[3].change_value(1,int(resource[3].maxAmount))
        break

			case 53: // 5 => Sets Ships to 0 (testing build ship button)
				resource[3].change_value(-1,3)
				break
    }
  }
  switch(gameState){
    case 0:
      if(keyCode==RETURN && registering==false) // Log-in inputs
        do_Login()
        
      if(keyCode==RETURN && registering==true)  // Register inputs
        do_Register()
      break
    
    case 1:
      switch(keyCode){
        case 82: // R -> Refresh screen
          main_Scene()
          break
      }
      break

    case 2:
      switch(keyCode){
        case 46: // DEL -> Delete modules on click
          if (erasing == false){
            erasing= true
          }
          else if (erasing == true){
            erasing= false
            clearedErase=false
          }
          break

      }
      break

    case 3:
      switch(keyCode){
        // case 77: // M -> Reroll missions
        
        // for(let j=2; j<4; j++){ // j: Mission resource (Crew, Materials)
        //   for (let i=1; i<4; i++){ // i: Mission length (Short, Medium, Long)
        //     for(let mI=0; mI<mission.length;mI++){
        //       if(mission[mI].state==1){
        //         if(mission[mI].missionResource==j && mission[mI].missionType==i && mission[mI].state==1)
        //           discardMission(j,i)
        //       }
        //     }
        //   }
        // }
        // main_Scene()
        // break
      }
  }
}


function mousePressed(){
  if(gameState==3){
    for(let i=0; i<missionButton.length; i++){
      if(missionButton[i].mouse_over()){
        missionButton[i].mouse_pressed(i)
      }
    }

		if(buildShipB.mouse_over()){
			buildShipB.mouse_pressed()
		}
  }

  if(gameState==4){
    if(logoffButton.mouse_over())
      logoffButton.mouse_pressed()
  }

  if(gameState>0){
    if(profileButton.mouse_over())
      profileButton.mouse_pressed()
  }

	if(gameState>0 && gameState<4){
		if(collectMB.mouse_over())
			collectMB.mouse_pressed()
	}

  if(gameState==2){
    for(let i=0; i<moduleBuildButton.length; i++){
      if(moduleBuildButton[i].mouse_over()){
        moduleBuildButton[i].mouse_pressed(i+1)
      }
    }
  }

  if(gameState>0){  

    if(missionScreenB.mouse_over()){
      missionScreenB.mouse_pressed('')
    }
    
    if(buildScreenB.mouse_over()){
      buildScreenB.mouse_pressed('')
    }
    
    if(gridEnable==true && erasing == false){
      
      for (let i = 0; i < arrtiles.length; i++) {
        for (let j = 0; j < arrtiles[i].length; j++) {

          if(arrtiles[i][j].is_over(mouseX,mouseY) && (arrtiles[i][j].moduleType==0 || arrtiles[i][j].deleted==1)){ // Test if mouse is over grid
            
            // console.log('id: ',moduleType,'\nplaced: ',placedModule[moduleType-1],'\nmax: ',maxPlace[moduleType])

            if(placedModule[moduleType-1]<maxPlace[moduleType]){ // Check if not at limit of placed modules
						
              if(currMCost<=resource[2].currAmount && currCCost<=resource[1].currAmount-resource[1].inUse){ // If has enough materials and available crew
                if(i<18 && j<10){ // Bug that would't allow players to place modules on edges, bad fix
                  if((arrtiles[i+1][j].moduleType!=0 && arrtiles[i+1][j].deleted==0) || (arrtiles[i-1][j].moduleType!=0 && arrtiles[i-1][j].deleted==0) ||
                  (arrtiles[i][j+1].moduleType!=0 && arrtiles[i][j+1].deleted==0) || (arrtiles[i][j-1].moduleType!=0 && arrtiles[i][j-1].deleted==0)){ // If connected to other modules

                    arrtiles[i][j].moduleType=moduleType;
                    arrtiles[i][j].deleted=0;
                    resource[2].change_value(-1,currMCost)
										resource[1].change_inUse(1,currCCost)
                    
                    let dataToSend={
                      "moduleType":moduleType,
                      "x":i,
                      "y":j,
                      "playerId":playerId,
                      "deleted":deleted
                    }

                    httpPost('/insertModule',"json",dataToSend,(dataReceived)=>{
                      placedModule[moduleType-1]++

                      if(moduleType==2 ||moduleType==3 || moduleType==4){ // If one of the three capacity upgrades
                        let dataToSend={
                          "playerId":playerId,
                          "building":moduleType,
                          "oldMax":resource[moduleType-1].maxAmount,
                          "resource":moduleType,
                          "op":1
                        }
                        httpPost('/updateMaxCap','JSON',dataToSend,(dataReceived)=>{
                          loadJSON('/getEffect/'+moduleType,(dataReceived)=>{

                            resource[moduleType-1].maxAmount+=dataReceived[0].effect
                            drawR()
                          })
                        })
                      }
                    });
                    draw_Grid()
                    
                  }else{
                    push()
                      fill("crimson")
                      textSize(30)
                      textAlign(CENTER, TOP)
                      text("Modules must be connected",width/2,height/2-5.5*side)
                      setTimeout(function(){
												if(gameState==2){
													clearScreen()
													background(220)
													drawR()
													draw_Grid();
												}
                      },2000)
                    pop()
                    break
                  }
                }else{ // Modules from the edges or the screen, still bad fix, not testing if connected
                  arrtiles[i][j].moduleType=moduleType;
                  arrtiles[i][j].deleted=0;
									resource[1].change_inUse(1,currCCost)
                  
                  let dataToSend={
                    "moduleType":moduleType,
                    "x":i,
                    "y":j,
                    "playerId":playerId,
                    "deleted":deleted
                  }

                  httpPost('/insertModule',"json",dataToSend,(dataReceived)=>{
                    placedModule[moduleType-1]++
                    if(moduleType==2 ||moduleType==3 || moduleType==4){
                      let dataToSend={
                        "playerId":playerId,
                        "building":moduleType,
                        "oldMax":resource[moduleType-1].maxAmount,
                        "resource":moduleType,
                        "op":1
                      }
                      httpPost('/updateMaxCap','JSON',dataToSend,(dataReceived)=>{
                        loadJSON('/getEffect/'+moduleType,(dataReceived)=>{

                          resource[moduleType-1].maxAmount+=dataReceived[0].effect
                          drawR()
                        })
                      })
                    }
                  });
                  draw_Grid()
                  console.log(arrtiles[i][j])
                }
              }else
							if(currMCost>resource[2].currAmount){
                push()
                  fill("crimson")
                  textSize(30)
                  textAlign(CENTER, TOP)
                  text("Not enough materials!",width/2,height/2-5.5*side)
                  setTimeout(function(){
										if(gameState==2){
											clearScreen()
											background(220)
											drawR()
											draw_Grid();
										}
                  },2000)
                pop()
                break
              }else
							if(currCCost>resource[1].currAmount-resource[1].inUse){
                push()
                  fill("crimson")
                  textSize(30)
                  textAlign(CENTER, TOP)
                  text("Not enough available crew!",width/2,height/2-5.5*side)
                  setTimeout(function(){
										if(gameState==2){
											clearScreen()
											background(220)
											drawR()
											draw_Grid();
										}
                  },2000)
                pop()
                break
							}

              draw_Grid();
              break;

            }else{
              push()
              fill("crimson")
              textSize(30)
              textAlign(CENTER, TOP)
              text("Max module limit reached",width/2,height/2-5.5*side)
              setTimeout(function(){
								if(gameState==2){
									clearScreen()
									background(220)
									drawR()
									draw_Grid();
								}
              },2000)
            pop()
            break;
            }
          }else if(arrtiles[i][j].is_over(mouseX,mouseY)==true && arrtiles[i][j].deleted==0){
            push()
              fill("crimson")
              textSize(30)
              textAlign(CENTER, TOP)
              text("There is already a building in that spot",width/2,height/2-5.5*side)
              setTimeout(function(){
								if(gameState==2){
									clearScreen()
									background(220)
									drawR()
									draw_Grid();
								}
              },2000)
            pop()
            break;
          }
          }
        }
      }
    }
    if (erasing== true){
      for (let i = 0; i < arrtiles.length; i++) {
        for (let j = 0; j < arrtiles[i].length; j++) {
          
          if(arrtiles[i][j].is_over(mouseX,mouseY) && arrtiles[i][j].moduleType> 0 && arrtiles[i][j].deleted == 0){

            if(arrtiles[i][j].moduleType== 11){ // Trying to delete the middle module
              push()
                fill("crimson")
                textSize(30)
                textAlign(CENTER, TOP)
                text("The starting module cannot be destroyed",width/2,height/2-5.5*side)
                setTimeout(function(){
									if(gameState==2){
											clearScreen()
											background(220)
											drawR()
											draw_Grid();
										}
								},2000)
              pop()
            }else{
              arrtiles[i][j].deleted=1
							resource[1].change_inUse(-1,crewCost[arrtiles[i][j].moduleType]) // Set the crewmembers used by module back to available

              let moduleId
              let moduleInfo={
                "posX" :arrtiles[i][j].i,
                "posY" :arrtiles[i][j].j,
                "playerId" :playerId,
                "deleted" :0
              }
              httpPost('/getModuleId','json',moduleInfo,(modId)=>{
                moduleId=modId[0].moduleId; 
                placedModule[(arrtiles[i][j].moduleType)-1]--
                
                erase_Module(moduleId)

                if(arrtiles[i][j].moduleType==2 || arrtiles[i][j].moduleType==3 || arrtiles[i][j].moduleType==4){
                  let dataToSend={
                    "playerId":playerId,
                    "building":arrtiles[i][j].moduleType,
                    "oldMax":resource[arrtiles[i][j].moduleType-1].maxAmount,
                    "resource":arrtiles[i][j].moduleType,
                    "op":-1
                  }

                  
                  httpPost('/updateMaxCap','JSON',dataToSend,(dataReceived)=>{
                    loadJSON('/getEffect/'+arrtiles[i][j].moduleType,(dataReceived)=>{

                      resource[(arrtiles[i][j].moduleType)-1].maxAmount-=dataReceived[0].effect
                      drawR()
                    })
                  })
                }
                // else if(arrtiles[i][j].moduleType==1){
                  
                //   loadJSON('/getEffect/'+arrtiles[i][j].moduleType,(dataReceived)=>{
                //     let dataToSend={
                //       "playerId":playerId,
                //       "effect":dataReceived[0].effect,
                //       "first":firstMoneyProd,
                //       "op":-1
                //     }
                    
                //     httpPost('/updateMProd','JSON',dataToSend,(dataReceived)=>{
                      
                //     })
                //   })
                // }
              })

              loop()
              draw_Grid()
              break
            }
          }
        }
      }
    }
  }


function timer(){
  setInterval(function(){
    if(gameState==3){
      for(let i=0; i<missionButton.length; i++){
        missionButton[i].mouse_over() // Darkens the button
        missionButton[i].draw_button()
      }
    }
  },15)

  setInterval(function(){
    if(gameState==4){
      logoffButton.mouse_over()
      logoffButton.draw_button()
    }
  })

  setInterval(function(){
    if(gameState>0){
      profileButton.mouse_over()
      profileButton.draw_button()
    }
  },15)

  setInterval(function(){
    if(gameState==2){

      if(erasing==true){
				clearedErase=false
        push()
          fill("red")
          textSize(30)
          textAlign(CENTER, TOP)
          text("Erasing",width/2,height/2+6.5*side)
        pop()
      }else if(clearedErase==false){
        clearedErase=true
        clearScreen()
        background(220)
        drawR()
        draw_Grid();
      }
    }
  },15)

	setInterval(function(){
		if(gameState>0 && gameState<4){
			if(moneyTimer>2){
				collectMB.func=collectMoney
				collectMB.mouse_over()
				collectMB.draw_button()
			}else{ // Money not available to collect, darken button with no function
				collectMB.r=150
				collectMB.g=150
				collectMB.b=150
				collectMB.func=function(){}
				collectMB.draw_button()
			}
		}
	})

	setInterval(function(){
		if(gameState==3){
			if(placedModule[4]==0 || resource[3].currAmount==resource[3].maxAmount){ // If there are no ship constructors, or the ships array is full, darkens button
				buildShipB.r=180
				buildShipB.g=180
				buildShipB.b=180
				buildShipB.func= function(){
					if(resource[3].currAmount==resource[3].maxAmount){
						push()
							fill("red")
							textSize(15)
							textAlign(CENTER)
							text("Hangar bay already full",buildShipB.x+buildShipB.w/2,buildShipB.y-15)
						pop()
						setTimeout(function(){
							if(gameState==3)
							refreshM()
						},1500)
					}else if(placedModule[4]==0){
						push()
							fill("red")
							textSize(15)
							textAlign(CENTER)
							text("No ship construction modules active",buildShipB.x+buildShipB.w/2,buildShipB.y-15)
						pop()
						setTimeout(function(){
							if(gameState==3)
							refreshM()
						},1500)
					}
				}
			}else{
				buildShipB.r=240
				buildShipB.g=240
				buildShipB.b=240
				buildShipB.mouse_over()
				buildShipB.func=buildShip
			}
			buildShipB.draw_button()
		}
	},15)

  
  setInterval(function(){
    if(gameState==2){
      for(let i=0; i<moduleBuildButton.length; i++){
        moduleBuildButton[i].mouse_over()
        moduleBuildButton[i].draw_button()
      }
    }
  },15)

  setInterval(function(){
    if(gameState>0){
      missionScreenB.mouse_over()
      missionScreenB.draw_button()
      buildScreenB.mouse_over()
      buildScreenB.draw_button()
    }
  },15)

  setInterval(function(){
    if(gameState==1){
      mainLoop= true
    }
  },mainLoopTimer*1000) // Every minute the main screen reloads
}


function clearScreen(){
  clear()
}




// v Different scenes v // [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
// [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]


function building_Scene(){
  if(gameState==1 || gameState==3){ // If on the main screen or the missions screen
    clearScreen()

    background(220);
    visitedB=true
    erasing=false
    drawR()
    gameState=2
    side=32

    let buttonWidth=150
    let buttonHeight=55
    
    for(let i=0; i<10; i++){
      let cArray=moduleColor(i+1)

      if(i<5){
        moduleBuildButton[i]= new Button (50, height/2-((buttonHeight+25)*(-i+2)), buttonWidth, buttonHeight, cArray[0],cArray[1],cArray[2], place_module, (moduleName[i+1]+'\nMaterial cost: '+moduleCost[i+1]+'\nCrew requirement: '+crewCost[i+1]))
      }else{
        moduleBuildButton[i]= new Button (width-buttonWidth-50, height/2-((buttonHeight+25)*(-i+7)), buttonWidth, buttonHeight, cArray[0],cArray[1],cArray[2], place_module, (moduleName[i+1]+'\nMaterial cost: '+moduleCost[i+1]+'\nCrew requirement: '+crewCost[i+1]))
      }
    }

    create_Grid()

		setTimeout(function(){
			push()
				fill("red")
				textSize(15)
				textAlign(CENTER, TOP)
				text("Press 'delete' to toggle erasing mode",width/2,height/2-5.5*side)
			pop()
		},75)


  }else if(gameState==2){ // Return to main screen
    clearScreen()
    gridEnable=false
    erasing=false
    gameState=1
    main_Scene()
  }
}


function refreshM(){
	clearScreen()
	background(235)
  drawR()
  for(let i=0; i<mission.length; i++){
    mission[i].draw_mission()
  }
	buildShipB= new Button(width/2-75, height/2+150, 150, 50, 240,240,240, buildShip, 'Build Ship\nMoney Cost:1000') // Button to build new ships

}

function buildShip(){
	if(buildingShip==false && resource[0].currAmount>=1000){
		let multiplier= placedModule[4]
		resource[0].change_value(-1,1000)
		buildingShip=true
		let bar=0
		let drawBar

		drawBar=setInterval(function(){ // Pointless bar, kinda fun
			if(gameState==3){
				bar+=buildShipB.w/((1000*5*timeScale/multiplier)/100)
				rect(buildShipB.x, buildShipB.y+buildShipB.h, bar, 10)
			}
		},100)


		setTimeout(function(){
			resource[3].change_value(1,1)

			buildingShip=false
			clearInterval(drawBar)
			if(gameState==3)refreshM()
		},(1000*5*timeScale)/multiplier)


	}else if(buildingShip== true){
		push()
			fill("red")
			textSize(15)
			textAlign(CENTER, BOTTOM)
			text("Another ship is already under construction",buildShipB.x+buildShipB.w/2,buildShipB.y-5)
		pop()
		setTimeout(function(){
      if(gameState==3){
        refreshM()
      }
		},1500)
	}else if(resource[0].currAmount<1000){
		push()
			fill("red")
			textSize(15)
			textAlign(CENTER, BOTTOM)
			text("Not enough money to buy a new ship",buildShipB.x+buildShipB.w/2,buildShipB.y-5)
		pop()
		setTimeout(function(){
      if(gameState==3){
        refreshM()
      }
		},1500)
	}
}


function mission_Scene(){
  if(gameState==1 || gameState==2){
    gridEnable=false
    erasing=false
    gameState=3
    refreshM()

  }else if(gameState==3){
    clearScreen()
    gameState=1
    main_Scene()
  }
}


function drawR(){
    fill(255)
    let squareCounter= 1;

    let initX= (width/2) - (19*48/2)
    let endX= initX + 19*48
    let length= (endX-initX)/4
    let boxY=height/17

    for(let i = initX; squareCounter <= 4; i += length){ //boxes where the resources are displayed
      squareCounter++;
      rect(i, boxY, length, height/15);
    }
    
    textAlign(CENTER, CENTER)

    for(let i = 0, initIndex=0, x=initX+length/2; i< resource.length; i++){

      resource[i].draw_resource(x,boxY+height/30);
      initIndex++
      x+=length
    }
}


function loginScene() {
  registering= false
  background(220);
  nameInput = createInput('');
  nameInput.position(windowWidth/2 - nameInput.size().width/2, windowHeight/2.5 - nameInput.size().height);
  passInput = createInput('');
  passInput.position(windowWidth/2 - passInput.size().width/2, windowHeight/2.5 + passInput.size().height);
  loginBtn = createButton('Login');
  loginBtn.position(passInput.position().x, passInput.position().y+passInput.size().height*1.5);
  loginBtn.mousePressed(do_Login);
  signupBtn = createButton('Sign up');
  signupBtn.position(passInput.position().x+passInput.size().width-signupBtn.size().width, passInput.position().y+passInput.size().height*1.5);
  signupBtn.mousePressed(do_Register);
}


function do_Register(){

  if (registering==false){ // If moved from Log-in page to Register page
    registering= true
    background(220)

    nameInput.remove();
    passInput.remove();
    loginBtn.remove();
    signupBtn.remove();
  
    suNameInput = createInput('');
    suNameInput.position(windowWidth/2 - suNameInput.size().width/2, windowHeight/2.5 - suNameInput.size().height);
    suPassInput = createInput('');
    suPassInput.position(windowWidth/2 - suPassInput.size().width/2, windowHeight/2.5 + suPassInput.size().height);
  
    registerBtn = createButton('Register');
    registerBtn.position(suPassInput.position().x+suPassInput.size().width-registerBtn.size().width, suPassInput.position().y+suPassInput.size().height*1.55);
    registerBtn.mousePressed(do_Register);

    registerBackBtn= createButton('Back')
    registerBackBtn.position(suPassInput.position().x, suPassInput.position().y+suPassInput.size().height*1.5)
    registerBackBtn.mousePressed(function(){
      suNameInput.remove();
      suPassInput.remove();
      registerBtn.remove();
      registerBackBtn.remove();
      loginScene()
    })

    
  }else{ // If on Register page and clicking to register
    let newUsername = suNameInput.value();
    let newPassword = suPassInput.value();
    let player

    if (newUsername !='' && newPassword !=''){
      player = {
        "username": newUsername,
        "password": newPassword
      }

      httpPost('/register', 'json', player, (dataReceived) => {

        if (dataReceived[0]== "Existing"){ // Trying to register with an existing username
          clearScreen()
          push()
            fill("crimson")
            textAlign(CENTER, CENTER)
            text("Username taken", suNameInput.position().x+ suNameInput.size().width/2, suNameInput.position().y+suNameInput.size().height*1.5)
            suNameInput.value('')
            suPassInput.value('')
          pop()
        }else{ // Successful register
          playerId = dataReceived[0].playerId;
          suNameInput.remove();
          suPassInput.remove();
          registerBtn.remove();
          registerBackBtn.remove()

          for(let j=2; j<4; j++){ // j: Mission resource (Crew, Materials)
            for (let i=1; i<4; i++){ // i: Mission length (Short, Medium, Long)
              createMission(j,i)
            }
          }

          loadResource()
          main_scene_setup()
        }
      });
    }else{
      if(newUsername ==''){
        clearScreen()
        background(220)

        push()
          stroke("red")
          strokeWeight(3)
          noFill()
          rect(suNameInput.position().x, suNameInput.position().y, suNameInput.size().width, suNameInput.size().height)
        pop()
      }else{
        clearScreen()
        background(220)

        push()
          stroke("red")
          strokeWeight(3)
          noFill()
          rect(suPassInput.position().x, suPassInput.position().y, suPassInput.size().width, suPassInput.size().height)
        pop()
      }
    }
  }
}


function do_Login() {

  let username = nameInput.value();
  let password = passInput.value();

  let player = {
    "username": username,
    "password": password
  }

  httpPost('/login','json', player, (dataReceived) => {

    if (dataReceived.length==0){ // No match in the database
      push()
        fill("crimson")
        textAlign(CENTER, CENTER)
        text("Incorrect username or password", nameInput.position().x+ nameInput.size().width/2, nameInput.position().y+nameInput.size().height*1.5)
        passInput.value('')
      pop()
    }
    else{
      playerId = dataReceived[0].playerId;
      getMission()
      loadResource()

      main_scene_setup()
    }
  });
}


function loadResource(){
  loadJSON('/getResources/'+playerId, (dataReceived)=>{
    for(let i = 0; i < dataReceived.length; i++){
      resource[i] = new Resources ((width/4)+(i*width/6), (height/10), 10, dataReceived[i].ResourceType, dataReceived[i].CurrentAmount, dataReceived[i].MaxAmount, dataReceived[i].inUse)
    }
    main_Scene()
  });
}


// v Mission start v // [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
// [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]


function createMission(resource, length){
  let dataToSend={
    "playerId":playerId,
    "resource":resource,
    "length":length
  }
  httpPost('/createMission','JSON',dataToSend,dataReceived=>{
    getMission()
  })
}


function getMission(){
  loadJSON('/getMission/'+playerId, (dataReceived)=>{
    let counter=1

    for(let i=0; i<dataReceived.length; i++){ // Display 3 missions on each side, still unsorted though
      if(counter<4){
        mission[i]= new Mission(dataReceived[i].missionId, dataReceived[i].resourceType, dataReceived[i].reward, dataReceived[i].duration, dataReceived[i].successChance, dataReceived[i].missionType, dataReceived[i].state, width/4, height/2-100+i*100, 100, 30)
      }else{
        mission[i]= new Mission(dataReceived[i].missionId, dataReceived[i].resourceType, dataReceived[i].reward, dataReceived[i].duration, dataReceived[i].successChance, dataReceived[i].missionType, dataReceived[i].state, 3*width/4, height/2-100+(i-3)*100, 100, 30)
      }

      
      if(mission[i].state==1){
        missionButton[i]= new Button(mission[i].x-mission[i].w/2, mission[i].y+10, mission[i].w, mission[i].h, 240,240,240, mission[i].start_mission, 'Start Mission!')
      }else if(mission[i].state==2 || mission[i].state==6){
        missionButton[i]= new Button(mission[i].x-mission[i].w/2, mission[i].y+10, mission[i].w, mission[i].h, 240,240,240, mission[i].start_mission, 'Ongoing')
      }else if(mission[i].state==5){
        missionButton[i]= new Button(mission[i].x-mission[i].w/2, mission[i].y+10, mission[i].w, mission[i].h, 240,240,240, mission[i].start_mission, 'Collect')
      }else if(mission[i].state==4){
        missionButton[i]= new Button(mission[i].x-mission[i].w/2, mission[i].y+10, mission[i].w, mission[i].h, 240,240,240, mission[i].start_mission, 'Mission Failed')
      }
      counter++
    }

    for(let i=0; i<mission.length; i++){
      if(mission[i].state==2){
        loadJSON('/getStartTime'+mission[i].id, (dataReceived)=>{
          
          let timePassed=0
          let timeRemaining=0
          let currD=day()
          let currH=hour()
          let currM=minute()

          timePassed=currM-dataReceived[0].StartMin + ((currH*60)-(dataReceived[0].startHour*60)) + ((currD-dataReceived[0].startDay)*24*60)
          timeRemaining=mission[i].duration-timePassed

          if(timeRemaining>0){
            setTimeout(function(){
              mission[i].state=5
              missionButton[i].text='Collect'
    
              // missionButton[i].func=function(){
              //   resource[mission[i].missionResource-1].change_value(1,mission[i].reward)
              //   discardMission(mission[i].missionResource, mission[i].missionType)
              // }
              if (gameState==3){
                refreshM()
              }
            }, timeRemaining*1000*timeScale)
          }else{
            mission[i].state=5
            missionButton[i].text='Collect'
  
            // missionButton[i].func=function(){
            //   resource[mission[i].missionResource-1].change_value(1,mission[i].reward)
            //   discardMission(mission[i].missionResource, mission[i].missionType)
            // }
            if (gameState==3){
              refreshM()
            }

          }
          
    // sortMission(mission.length) Didnt't work :(
        })
      }else if(mission[i].state==6){
        loadJSON('/getStartTime'+mission[i].id, (dataReceived)=>{
          
          let timePassed=0
          let timeRemaining=0
          let currD=day()
          let currH=hour()
          let currM=minute()

          timePassed=currM-dataReceived[0].StartMin + ((currH*60)-(dataReceived[0].startHour*60)) + ((currD-dataReceived[0].startDay)*24*60) // Converts everything to minutes
          timeRemaining=mission[i].failTime-timePassed

          if(timeRemaining>0){
            setTimeout(function(){
              mission[i].state=4
              missionButton[i].text='Mission Failed'
    
              // missionButton[i].func=function(){
              //   discardMission(mission[i].missionResource, mission[i].missionType)
              // }
    
              if (gameState==3){
                refreshM()
              }
            }, timeRemaining*1000*timeScale)
          }else{
            mission[i].state=4
            missionButton[i].text='Mission Failed'
  
            // missionButton[i].func=function(){
            //   discardMission(mission[i].missionResource, mission[i].missionType)
            // }
  
            if (gameState==3){
              refreshM()
            }
          }
        })
      }
    }

    
    if (gameState==3){
      refreshM()
    }
  
  })
}


function discardMission(resource, length){
  let dataToSend={
    "playerId":playerId,
    "resource":resource,
    "length":length
  }
  httpPost('/discardMission','JSON',dataToSend,(dataReceived)=>{
    createMission(resource, length)
  })
}


function swap(arr, xp, yp)
{
    let temp = arr[xp];
    arr[xp] = arr[yp];
    arr[yp] = temp;
}


function sortMission(n){ // Pointless
  let i, j;
  for (i = 0; i < n-1; i++)
  {
      for (j = 0; j < n-i-1; j++)
      {
          if (mission[j].missionResource > mission[j+1].missionResource)
          {
            swap(mission,j,j+1);
            swap(missionButton,j,j+1)   
          }
      }
  }

  for (i = 0; i < n-1; i++)
  {
      for (j = 0; j < n-i-1; j++)
      {
          if (mission[j].missionType > mission[j+1].missionType && mission[j].missionResource== mission[j+1].missionResource)
          {
            swap(mission,j,j+1);
            swap(missionButton,j,j+1)    
          }
      }
  }
  main_Scene()
}


function changeAvailableShips(op, value){
  let available=0
  
  available= resource[3].currAmount-resource[3].inUse

  if(op=="increase"){
    resource[3].inUse-=value
  }
  if(op=="decrease"){
    if(available-value <= resource[3].currAmount){
      resource[3].inUse+=value
    }
  }
}





// v Building/Grid start v // [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]
// [][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][][]


function create_Grid(){

  let x=0;
  let y=0;
  let COL=19;
  let ROW =11;

  for (let i = 0; i < COL; i++) {
    arrtiles[i] = [];

    if(i==0){
      //starting point in width
      x= (width/2) - (COL*side/2);
    }else{
      x=x+side;
    }

    for (let j = 0; j < ROW; j++) {

      //starting point in height
      if(j==0){
        y=(height/2) - (ROW*side/2) + side;
      }else{
        y=y+side;
      }

      arrtiles[i][j] = new Module(i,j,x,y, side, 0, 0);
    }
  }

  loadJSON('/getModule/'+playerId,(dataReceived)=>{

    module = dataReceived;
    
    for(let i=0;i<module.length;i++){
      arrtiles[module[i].posX][module[i].posY].moduleType = module[i].moduleType;

      arrtiles[module[i].posX][module[i].posY].deleted = module[i].deleted;
    }
    draw_Grid();
  })
}


function draw_Grid(){
  for (let i = 0; i < arrtiles.length; i++) {
    for (let j = 0; j < arrtiles[i].length; j++) {
      if(gameState==2){
        arrtiles[i][j].draw_Module()
      }else{
        push()
          noStroke()
          arrtiles[i][j].draw_Module()
        pop()
      }
    }
  }
}


function erase_Module(moduleId){

  let dataToSend={
    "moduleId":moduleId,
  }

  httpPost('/delModule',"json",dataToSend,(dataReceived)=>{
    draw_Grid()
 
   });
}


function getMCost(modType){
  loadJSON('/getMCost/'+modType,(dataReceived)=>{
    currMCost=dataReceived[0].matCost
    return dataReceived[0].matCost
  })
}


function place_module(index){
  gridEnable=true
  erasing=false
  moduleType=index
	currCCost=crewCost[index]
  currMCost=moduleCost[index]
}


function moduleColor(moduleType){ // Modules and their buttons have the same color
  let colorArray=[]
  
  let r
  let g
  let b
  switch(moduleType){
    case 0: // Empty Space
      r=219
      g=219
      b=219
      break
    
    case 1: // Money Production
      r=255
      g=228
      b=41
      break
    
    case 2: // Crew Capacity
      r=197
      g=97
      b=0
      break
    
    case 3: // Material Capacity
      r=61
      g=60
      b=214
      break
    
    case 4: // Ship Capacity
      r=26
      g=87
      b=7
      break
    
    case 5: // Ship Construction
      r=179
      g=156
      b=0
      break
    
    case 6: // Communications Relay
      r=0
      g=255
      b=110
      break
    
    case 7: // Research Station
      r=158
      g=56
      b=255
      break
    
    case 8: // Mission Control
      r=71
      g=196
      b=255
      break
    
    case 9: // Probe Constructor
      r=73
      g=97
      b=72
      break
    
    case 10: // Connectors
      r=100
      g=100
      b=100
      break
    
    case 11: // Starter Module
      r=87
      g=9
      b=9
      break
  }
  colorArray[0]=r
  colorArray[1]=g
  colorArray[2]=b
  return colorArray
}