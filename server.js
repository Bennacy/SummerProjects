const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql');
const app = express()
const port = 3000
let timeScale= 1 //speed(in seconds) at which things occur=> 1: one second; 60: one minute


app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

//creates instance to make connection to the sql database
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "stargrazer",
  //WORKING WITH MAMP ON MAC!!!
  //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});


db.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB!");
});	


app.post('/login',(req,res)=>{

	let username = req.body.username;
	let password = req.body.password;


	let sql = "SELECT playerId FROM Player WHERE name='"+username+"' AND pass='"+password+"' ";

	db.query(sql,(err,result)=>{
		if(err) throw err;
		res.send(result)
	});
});


app.get('/getResources/:playerId', (req, res) =>{
	let playerId = req.params.playerId;
	let sql = "SELECT * FROM player_resource WHERE playerId= '"+playerId+"'";

	db.query(sql,(err,result) =>{
		if(err) throw err;
		res.send(result);
	});
});


app.get('/getResourceNames/:rType', (req,res)=>{
	let resourceId= req.params.rType
	let sql= "SELECT resourceName FROM resource WHERE resourceId= '"+resourceId+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.get('/getPlaced/:playerId',(req,res)=>{
	let playerId= req.params.playerId	
	let sql= `select module.moduleId as mType, count(moduleType) AS 'COUNT' from module LEFT outer join player_module on module.moduleId=player_module.moduleType and playerId='${playerId}' and deleted=false group by module.moduleId;`

	db.query(sql,(err,result)=>{
		if(err) throw err
		
		res.send(result)
	})
})


app.get('/getEffect/:moduleId',(req,res)=>{
	let moduleId= req.params.moduleId

	let sql="select effect from module where moduleId='"+moduleId+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.post('/register',(req,res)=>{

	let username = req.body.username;
	let password = req.body.password;
	
	
	let sql = "SELECT playerId FROM Player WHERE name='"+username+"'";
	
		db.query(sql,(err,result)=>{
		if(err) throw err;

		let forCount=0
		
		if(result.length<1){ //no player with that name
			let sql = "INSERT INTO Player (`name`,`pass`) VALUES ('"+username+"','"+password+"')";
			db.query(sql,(err,result)=>{

			if(err) throw err;
				
				let sql = "SELECT playerId FROM Player WHERE name='"+username+"' AND pass='"+password+"'";
				db.query(sql,(err,result)=>{
					if(err) throw err;

					for (i = 1; i <= 4; i++){

					let pId=result[0].playerId
					let resourceType = i;
					let currentAmount;
					let maxAmount;
					let inUse = 0;

					if (i == 3){
						maxAmount = 1500;
						currentAmount = 350;
						
					}else if(i == 2){

						maxAmount = 750;
						currentAmount = 175;

					}else if(i == 4){

						maxAmount = 3;
						currentAmount = 1;

					}else if(i == 1){

						maxAmount = 99999999;
						currentAmount = 200;

					}

						let sql = "INSERT INTO player_resource (`playerId`,`resourceType`,`currentAmount`,`maxAmount`,`inUse`) VALUES ('"+pId+"','"+resourceType+"','"+currentAmount+"','"+maxAmount+"','"+inUse+"')";

						db.query(sql,(err,result)=>{
						if(err) throw err;

							if(forCount==0){
								forCount++
								let sql= "INSERT INTO player_module (`playerId`, `posX`, `posY`, `moduleType`, `deleted`) VALUES ('"+pId+"', 9, 5, 11, 0)"
								db.query(sql,(err,result)=>{
									if(err) throw err
								})
							}
						});
					}

						res.send(result);
					});
			});

		}else{
			result[0]="Existing"
			res.send(result);
		}
	});	
});


app.post('/createMission', (req,res)=>{
	let playerId= req.body.playerId
	let resource= req.body.resource
	let length= req.body.length
	
	let sql= "SELECT * FROM mission WHERE id='"+length+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err

		let missionTime= Math.floor(randomInt(result[0].maxTime, result[0].minTime))
		let missionReward= Math.floor(randomInt(result[0].maxReward, result[0].minReward))
		let successChance= Math.floor(randomInt(100, result[0].minChance))

		let sql= "INSERT INTO player_mission (`playerId`, `resourceType`, `reward`, `duration`, `failTime`, `successChance`, `missionType`, `state`) VALUES ('"+playerId+"', '"+resource+"', '"+missionReward+"', '"+missionTime+"', 0, '"+successChance+"', '"+length+"', 1)"
		
		db.query(sql,(err,result)=>{
			if(err) throw err;
		});
	})
	res.send()
})


app.post('/discardMission', (req,res)=>{
	let playerId= req.body.playerId
	let resource= req.body.resource
	let length= req.body.length
	let sql= "UPDATE player_mission SET state=3 WHERE (state=1 OR state=2 OR state=4 OR state=5 OR state=6) AND playerId='"+playerId+"' AND resourceType='"+resource+"' AND missionType='"+length+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send()
	})
})


app.get('/getMission/:playerId', (req,res)=>{
	let playerId= req.params.playerId
	let sql= "SELECT * FROM player_mission WHERE playerId='"+playerId+"' AND (state=1 OR state=2 OR state=4 OR state=5 OR state=6)"
	db.query(sql, (err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.post('/uploadMission', (req,res)=>{
	let playerId= req.body.playerId
	let mission= req.body.mission

	let sql= "INSERT INTO player_mission (`playerId`,`resourceType`,`reward`,`duration`,`active`,`failed`,`failTime`,`successChance`,`missionType`) VALUES ('"+playerId+"', '"+mission.missionResource+"', '"+mission.reward+"', '"+mission.duration+"', '"+mission.active+"', '"+mission.failed+"', '"+mission.failTime+"', '"+mission.successChance+"', '"+mission.missionType+"')"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.post('/startMission', (req, res)=>{
	let mission= req.body.mission
	let playerId= req.body.playerId
	let day= req.body.day
	let hour= req.body.hour
	let minute= req.body.minute
	let time= req.body.time
	let inUse= req.body.inUse
	
	console.log("\t",inUse)

	let sql
	if(time==mission.duration){
		sql= "UPDATE player_mission SET state=2, startDay='"+day+"', startHour='"+hour+"', startMin='"+minute+"' WHERE playerId='"+playerId+"' AND resourceType='"+mission.missionResource+"' AND missionType='"+mission.missionType+"' AND state='"+mission.state+"'"
	}else{
		sql= "UPDATE player_mission SET state=6, failTime='"+time+"', startDay='"+day+"', startHour='"+hour+"', startMin='"+minute+"', failTime='"+time+"' WHERE playerId='"+playerId+"' AND resourceType='"+mission.missionResource+"' AND missionType='"+mission.missionType+"' AND state='"+mission.state+"'"
	}

	
	if(time==mission.duration){
		db.query(sql,(err,result)=>{
			if(err) throw err
					
			let sql= "UPDATE player_resource SET inUse='"+inUse+"' WHERE playerId='"+playerId+"' AND resourceType=4"
			db.query(sql,(err,result)=>{
				if(err) throw err

				setTimeout(function(){
					let sql= "UPDATE player_mission SET state=5 WHERE playerId='"+playerId+"' AND resourceType='"+mission.missionResource+"' AND missionType='"+mission.missionType+"' AND state=2"
					db.query(sql,(err,result)=>{
						
						if(err) throw err

					})
				},time*1000*timeScale)
	
				res.send()
			})
		})
	}else{
		db.query(sql,(err,result)=>{
			if(err) throw err

			let sql= "UPDATE player_resource SET inUse='"+inUse+"' WHERE playerId='"+playerId+"' AND resourceType=4"
			db.query(sql,(err,result)=>{
				if(err) throw err

				setTimeout(function(){
					let sql= "UPDATE player_mission SET state=4 WHERE playerId='"+playerId+"' AND resourceType='"+mission.missionResource+"' AND missionType='"+mission.missionType+"' AND state=2"
					db.query(sql,(err,result)=>{

						if(err) throw err

					})
				},time*1000*timeScale)
	
				res.send()
			})
		})	
	}
})


app.post('/updateInUse',(req,res)=>{
	let playerId=req.body.playerId
	let inUse=req.body.inUse
	let type=req.body.resourceType


	let sql="UPDATE player_resource SET inUse='"+inUse+"' WHERE playerId='"+playerId+"' AND resourceType='"+type+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send()
	})
})


app.get('/getStartTime:mId',(req,res)=>{
	let mId=req.params.mId

	let sql="SELECT startDay, startHour, StartMin FROM player_mission WHERE missionId='"+mId+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		console.log(result[0])
		res.send(result)
	})
})


app.post('/updateResourceValues', (req, res)=>{
	let playerId=req.body.playerId
	let resourceType=req.body.resourceType
	let newValue=req.body.newValue

	let sql= "UPDATE player_resource SET CurrentAmount= '"+newValue+"' WHERE playerId= '"+playerId+"' AND ResourceType= '"+resourceType+"'"
	db.query(sql,(err,result)=>{
	
		if(err) throw err;

		res.send(result)
	})
})


app.get('/getMProd/:playerId',(req,res)=>{
	let playerId= req.params.playerId

	let sql="SELECT moneyProd FROM player WHERE playerId='"+playerId+"'"
	db.query(sql,(err,result)=>{
	
		if(err) throw err;

		res.send(result)
	})
})

app.post('/updateMProd',(req,res)=>{
	let playerId=req.body.playerId
	let effect=req.body.effect
	let first=req.body.first
	let op=req.body.op

	let increaseBy
	let addM=()=>{
		let sql="UPDATE player_resource SET currentAmount=currentAmount+'"+increaseBy+"' WHERE playerId='"+playerId+"' AND resourceType=1"
		db.query(sql,(err,result)=>{
			if(err) throw err

			res.send()
		})
	}

	if(op==1){
		let sql="UPDATE player SET moneyProd=moneyProd+'"+effect+"' WHERE playerId='"+playerId+"'"
		db.query(sql,(err,result)=>{
			if(err) throw err

			let sql="SELECT moneyProd FROM player WHERE playerId='"+playerId+"'"
			db.query(sql,(err,result)=>{
				increaseBy=result[0].moneyProd

				
			})
		})
	}else if(op==-1){
		let sql="UPDATE player SET moneyProd=moneyProd-'"+effect+"' WHERE playerId='"+playerId+"'"
		db.query(sql,(err,result)=>{
			if(err) throw err
			
			let sql="SELECT moneyProd FROM player WHERE playerId='"+playerId+"'"
			db.query(sql,(err,result)=>{
				increaseBy=result[0].moneyProd
			})
			
			res.send()
		})
	}
	if(first==true){
		setInterval(addM(),1000*timeScale)
	}else{
		clearInterval(addM)
		res.send()
	}
})


app.post('/updateMProd',(req,res)=>{
	let playerId=req.body.playerId

	
})












app.get('/getModule/:playerId',(req,res)=>{

	let playerId = req.params.playerId;

	let sql = "SELECT * FROM player_module WHERE playerId='"+playerId+"'";

	db.query(sql,(err,result)=>{

		if(err) throw err;

		res.send(result);

	});

});


app.post('/updateMaxCap',(req,res)=>{
	let playerId=req.body.playerId
	let building=req.body.building
	let oldMax=req.body.oldMax
	let resource=req.body.resource
	let op=req.body.op
	
	let sql="SELECT effect FROM module WHERE moduleId='"+building+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err


		if(op>0){
			let effect=result[0].effect
			let newMax=oldMax+effect
			
			let sql="UPDATE player_resource SET MaxAmount='"+newMax+"' WHERE playerId='"+playerId+"' AND resourceType='"+resource+"'"
			db.query(sql,(err,result)=>{
				if(err) throw err
				
				res.send(result)
			})
		}else if(op<0){
			let effect=result[0].effect
			let newMax=oldMax-effect

			let sql="UPDATE player_resource SET MaxAmount='"+newMax+"' WHERE playerId='"+playerId+"' AND resourceType='"+resource+"'"
			db.query(sql,(err,result)=>{
				if(err) throw err
				
				res.send(result)
			})
		}


	})
})


app.get('/getEffect/:mId',(req,res)=>{
	let moduleId=req.params.mId

	let sql="SELECT effect FROM module WHERE moduleId='"+moduleId+"'"
	
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.get('/getMCost/:moduleId',(req,res)=>{
	let moduleId= req.params.moduleId

	let sql= "SELECT * FROM module WHERE moduleId='"+moduleId+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})


app.get('/getModuleNames/:rType', (req,res)=>{
	let moduleId= req.params.rType
	let sql= "SELECT moduleName FROM module WHERE moduleId= '"+moduleId+"'"
	db.query(sql,(err,result)=>{
		if(err) throw err
		res.send(result)
	})
})

app.post('/insertModule',(req,res)=>{

	let moduleType = req.body.moduleType;
	let posX = req.body.x;
	let posY = req.body.y;
	let playerId = req.body.playerId;
	let deleted = req.body.deleted;
	
	
	let sql = "INSERT INTO player_module (`playerId`,`posX`,`posY`,`moduleType`,`deleted`) VALUES ('"+playerId+"','"+posX+"','"+posY+"','"+moduleType+"',0)";
	
	db.query(sql,(err,result)=>{
		 if(err) throw err;
	
		 res.send(result);
	
	});
	
	
}); 

app.post('/getModuleId',(req,res)=>{

	let X = req.body.posX;
	let Y = req.body.posY;
	let playerId = req.body.playerId;
	let deleted = req.body.deleted


	let sql = "SELECT moduleId FROM player_module WHERE (posX='"+X+"' AND posY='"+Y+"' AND playerId='"+playerId+"' AND deleted='"+deleted+"')";

	db.query(sql,(err,result)=>{
		if (err) throw err;
		res.send(result);

	});

});

app.post('/alterModule',(req,res)=>{

	let moduleId = req.body.moduleId;

	
	let sql = "UPDATE player_module SET moduleType = 0 WHERE (moduleId='"+moduleId+"')";

	
	db.query(sql,(err,result)=>{
		 if(err) throw err;

		 res.send(result);	
	});

});

app.post('/delModule',(req,res)=>{

	let moduleId = req.body.moduleId;

	
	let sql = "UPDATE player_module SET deleted = 1 WHERE (moduleId='"+moduleId+"')";

	
	db.query(sql,(err,result)=>{
		 if(err) throw err;

		 res.send(result);	
	});

});





app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) ) + min;
  }