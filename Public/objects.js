class Resources{

    constructor(x, y, size, resourceType, currentAmount, maxAmount, inUse){
    
    this.x = x;
    this.y = y;
    this.sz = size;
    this.resType = resourceType;
    this.currAmount = currentAmount;
    this.maxAmount = maxAmount;
    this.inUse = inUse;
    this.resourceName
    this.resourceButton
    }
  
    change_value(op, value){      
			if(op==1){
				if(this.currAmount<this.maxAmount){
					if (value<1)
						this.currAmount+=1
					else
						this.currAmount+=value
						
					if(this.currAmount>this.maxAmount)
					this.currAmount=this.maxAmount
				}
				else if(this.currAmount>this.maxAmount)
					this.currAmount=this.maxAmount

					let dataToSend={
						"playerId": playerId,
						"resourceType": this.resType,
						"newValue": this.currAmount
					}
					httpPost('/updateResourceValues', 'json', dataToSend, (dataReceived)=>{
						
						drawR()
					})

			}else if(op==-1){
				if(this.currAmount-value>=0){
					this.currAmount-=value
				}
				let dataToSend={
					"playerId": playerId,
					"resourceType": this.resType,
					"newValue": this.currAmount
				}
				httpPost('/updateResourceValues', 'json', dataToSend, (dataReceived)=>{
				
					drawR()
				})
			}
    }

		change_inUse(op, value){      
			if(op==1){
				if(this.currAmount-(this.inUse+value)>0){
						this.inUse+=value
				}

				let dataToSend={
					"playerId": playerId,
					"resourceType": this.resType,
					"inUse":this.inUse
				}
				httpPost('/updateInUse', 'json', dataToSend, (dataReceived)=>{
					drawR()
				})

		}else if(op==-1){
				this.inUse-=value
				console.log(value)

				let dataToSend={
					"playerId": playerId,
					"resourceType": this.resType,
					"inUse":this.inUse
				}
				httpPost('/updateInUse', 'json', dataToSend, (dataReceived)=>{
					drawR()
				})
			}
    }
  
  
    draw_resource(x,y){
      push()
        fill(0);
    
        let rType= this.resType
        loadJSON('/getResourceNames/'+rType, (dataReceived)=>{
          fill("black")
          this.resourceName= dataReceived[0].resourceName
          if(this.resType==4 || this.resType==2){
            let av= this.currAmount-this.inUse
            text(this.resourceName+': '+this.currAmount+'/'+this.maxAmount, x, y-10)
            text("Available: "+av, x, y+10)
          }
          else if(this.resType==3){
            text(this.resourceName+': '+this.currAmount+'/'+this.maxAmount, x, y)
          }else if(this.resType==1){
            text(this.resourceName+': '+this.currAmount, x, y)
          }
        });
      pop()
    }
}


class Mission{
  constructor(id, missionResource, reward, duration, successChance, missionType, state, x, y, w, h){
      this.id=id
      this.x=x
      this.y=y
      this.w=w
      this.h=h
      this.missionResource= missionResource
      this.reward= reward
      this.duration= duration
      this.successChance= successChance
      this.failTime= 0
      this.missionType= missionType
      this.state=state
      this.button
      if(this.missionResource==3){
          this.reward= int(1.2*this.reward)
      }
  }

  draw_mission(){
    loadJSON('/getResourceNames/'+this.missionResource, (dataReceived)=>{
      push()
        if(this.state==1){
          fill("black")
        }else if(this.state==2 || this.state==6){
          fill("blue")
        }else if(this.state==5){
          fill("green")
        }else if(this.state==4){
          fill("red")
        }
        text('Resource: '+ this.missionResource+' Type: '+this.missionType, this.x,this.y-10)
        text('Resource: '+dataReceived[0].resourceName+'; Reward: '+this.reward+'; Duration: '+this.duration+' minutes; Chance of success: '+this.successChance+'%', this.x, this.y)
      pop()
    });
  }

  start_mission(index){
		if(mission[index].state==1 && resource[3].currAmount-resource[3].inUse<=0){
			push()
				fill("red")
				textSize(15)
				textAlign(CENTER,BOTTOM)
				text("No available ships",mission[index].x,mission[index].y-17.5)
			pop()

			setTimeout(function(){
				clearScreen()
				background(250)
				drawR()
				refreshM()
			},1000)
		}

    if(mission[index].state==1 && resource[3].currAmount-resource[3].inUse>0){

      changeAvailableShips("decrease",1)
      let roll=random(100,0)
      // console.log(roll)
      let missionTime=0
      let failing=false
      mission[index].failTime=int(random(mission[index].duration/2, mission[index].duration/3))

      if(roll<=mission[index].successChance){
        missionTime=mission[index].duration
      }else{
        missionTime=mission[index].failTime
        failing=true
      }

      let dataToSend={
        "playerId": playerId,
        "mission": mission[index],
        "day":day(),
        "hour":hour(),
        "minute":minute(),
        "time":missionTime,
        "inUse": resource[3].inUse
      }
    
      httpPost('/startMission','JSON',dataToSend,(dataReceived)=>{
        if(failing==false){
          mission[index].state=2
          missionButton[index].text= 'Ongoing'
					if(gameState==3){
	          refreshM()
					}

          setTimeout(function(){
						missionButton[index].text='Collect'
            mission[index].state=5
  
            if(gameState==3){
							refreshM()
						}
          }, missionTime*1000*timeScale)
        }
        else{
          mission[index].state=6
          missionButton[index].text= 'Ongoing'
          if(gameState==3){
	          refreshM()
					}

          setTimeout(function(){
						missionButton[index].text='Mission Failed'
            mission[index].state=4
  
            if(gameState==3){
							refreshM()
						}
          },missionTime*1000*timeScale)
        }


        if(gameState==3){
					refreshM()
				}
      })
    }
    else if(mission[index].state==5){
      missionButton[index].text='Collect'
            
      missionButton[index].func=function(){
        changeAvailableShips("increase",1)

				let dataToSend={
					"playerId":playerId,
					"inUse":resource[3].inUse,
					"resourceType":resource[3].resType
				}
				httpPost('/updateInUse','JSON',dataToSend,(dataReceived)=>{
					resource[mission[index].missionResource-1].change_value(1,mission[index].reward)
					discardMission(mission[index].missionResource, mission[index].missionType)
				})
      }
    }
		else if(mission[index].state==4){
        missionButton[index].text='Mission Failed'
        
        missionButton[index].func=function(){
          resource[3].change_value(-1,1)
					changeAvailableShips("increase",1)

					let dataToSend={
						"playerId":playerId,
						"inUse":resource[3].inUse,
						"resourceType":resource[3].resType
					}
					httpPost('/updateInUse','JSON',dataToSend,(dataReceived)=>{

						discardMission(mission[index].missionResource, mission[index].missionType)
					})
        }
			}
  }
}





class Button{
  constructor(x, y, w, h, r, g, b, func, text){
    this.x=x
    this.y=y
    this.w=w
    this.h=h
    this.func=func
    
    this.origR=r
    this.origG=g
    this.origB=b
    this.r=this.origR
    this.g=this.origG
    this.b=this.origB

    this.text=text

  }

  draw_button(){
    push()
      fill(this.r,this.g,this.b)
      strokeWeight(1.5)
      textAlign(CENTER, CENTER)
      rect(this.x,this.y,this.w,this.h)
      fill("black")
      text(this.text, this.x+this.w/2, this.y+this.h/2)
    pop()
  }

  mouse_over(){
    if(mouseX>this.x&&mouseX<this.x+this.w && mouseY>this.y&&mouseY<this.y+this.h){
      this.r=this.origR-20
      this.g=this.origG-20
      this.b=this.origB-20
      return true
    }else{
      this.r=this.origR
      this.g=this.origG
      this.b=this.origB
      return false
    }
  }

  mouse_pressed(index){

      this.func(index)
  }
}





class Module {

  constructor(i, j, x, y, side, moduleType, del) {
    //indexes of 2Darray
    this.i=i;
    this.j=j;
    //canvas positions
    this.posX = x;
    this.posY = y;
    this.sd = side;
    this.r
    this.g
    this.b
    this.moduleType=moduleType;
    this.deleted = del;
  }

  draw_Module() {

    switch(this.moduleType){
      case 0: // Empty Space
        this.r=219
        this.g=219
        this.b=219
        break
      
      case 1: // Money Production
        this.r=255
        this.g=228
        this.b=41
        break
      
      case 2: // Crew Capacity
        this.r=197
        this.g=97
        this.b=0
        break
      
      case 3: // Material Capacity
        this.r=61
        this.g=60
        this.b=214
        break
      
      case 4: // Ship Capacity
        this.r=26
        this.g=87
        this.b=7
        break
      
      case 5: // Ship Construction
        this.r=179
        this.g=156
        this.b=0
        break
      
      case 6: // Communications Relay
        this.r=0
        this.g=255
        this.b=110
        break
      
      case 7: // Research Station
        this.r=158
        this.g=56
        this.b=255
        break
      
      case 8: // Mission Control
        this.r=71
        this.g=196
        this.b=255
        break
      
      case 9: // Probe Constructor
        this.r=73
        this.g=97
        this.b=72
        break
      
      case 10: // Connectors
        this.r=100
        this.g=100
        this.b=100
        break
      
      case 11: // Starter Module
        this.r=87
        this.g=9
        this.b=9
        break
    }

    if(this.deleted==0){
      fill(this.r,this.g,this.b)
      square(this.posX, this.posY, this.sd);
    }else{
      fill(219,219,219)
      square(this.posX, this.posY, this.sd);
    }
  } 

  is_over(mousex,mousey){
    if(mousex>this.posX && mousex<this.posX+this.sd && mousey>this.posY && mousey<this.posY+this.sd){
      return true;
    }else{
      return false;
    }
    
  }
  
}