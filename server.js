const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 3001;
let survivors = {};
let survivorIdCounter = 1;
let leaderboard = [];
app.post("/api/survivors", (req, res) => {
  const id = survivorIdCounter++;
  const survivor = {
    id,
    name: req.body.name || "Unknown",
    hunger: 100,
    health: 100,
    morale: 100,
    shelter: 0,
    allies:0,
    day: 1,
    score: 0,
    status: "alive",
    createdAt: new Date(),
    decisions: [],
  };
  survivors[id] = survivor;
  console.log("Survivor created sucessfully");
  res.status(201).json({
    message: "Survivor created sucessfully",
    survivor: survivor,
  });
});
app.post("/api/survivors/:id/decisions", (req, res) => {
  const survivor = survivors[req.params.id];
  if (!survivor) {
    return res.status(404).json({
      message: "Survivor not found",
      error: true,
    });
  }
  if (survivor.status !=='alive') {
    return res.status(400).json({
      message: "Survivor died or escaped",
      error: true,
    });
  }
  const decision = req.body.decision;
  let message = " ";
  let scoreGain = 0;
  const decisionLog = { day: survivor.day, decision, result: " " };
  switch(decision) {
    case 'food':
      const foodChance = Math.random();
      if (foodChance > 0.6) {
        message = "Food fpund";
        survivor.hunger = 100;
        scoreGain = 20;
      } else {
        message = "Food not found";
        survivor.health -= 25;
        survivor.hunger-=10;
        scoreGain -= 10;
      }
      break;
    case 'shelter':
      if (survivor.hunger < 30) {
        message = "cannot build shelter too hungry collapsed";
        survivor.shelter=Math.min(100,survivor.shelter+30);
        survivor.health -= 20;
        survivor.hunger-=10;
        scoreGain -= 10;
      } else {
        message = " build shelter ";
        survivor.hunger -= 10;
        scoreGain = 20;
      }
      break;
    case 'allies':
      const allyChance=Math.random();
      if(allyChance>0.5)
      {
        message='found a group';
        survivor.allies+=1;
        survivor.morale=100;
        scoreGain=25;
      }else{
        message='not found a group';
        survivor.health-=10;
        survivor.morale=-10;
        scoreGain-=25;
      }
      break;
    case 'rest':
      message='Rested for a day';
      survivor.health=Math.min(100,survivor.health+25);
      survivor.hunger
      scoreGain=20;
      break;
    default:
      return res.json({
        message:'Invalid Choice',
        error:true
      })
  }
  survivor.hunger=Math.max(0,survivor.hunger-10);
  survivor.health=Math.max(0,survivor.health-10);
  survivor.morale=Math.max(0,survivor.morale-10);
  survivor.day+=1;
  survivor.score+=scoreGain;
  if(survivor.health<30)
  {
   survivor.status='dead';
  }else if(survivor.day>=14 && survivor.health>30)
  {
    survivor.status='escaped';
  }



  decisionLog.result=message;
  survivor.decisions.push(decisionLog);
 console.log(`Day:${survivor.day}`)
  res.json({
    message:message,
    scoreGain:scoreGain,
    survivor:survivor
  })

});

app.get('/api/leaderboard',(req,res)=>{
  const sortedLeaderboard=leaderboard
  .sort((a,b)=>b.score-a.score)
  .slice(0,10);
  console.log(`Get leaderboard`);
  res.json({
    leaderboard:sortedLeaderboard,
    length:leaderboard.length
  })
});
app.post('/api/leaderboard',(req,res)=>{
  const entry={
    id:Date.now(),
    name:req.body.name,
    score:req.body.score,
    days:req.body.days,
    survived:req.body.survived,
    timeStamp:new Date()
  }
  leaderboard.push(entry);
  console.log("Added entry to leaderboard");
  res.json({
    message:'Added entry to leaderboard',
    entry:entry
  })
})
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});