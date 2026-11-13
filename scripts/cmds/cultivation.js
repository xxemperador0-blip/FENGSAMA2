const fs = require("fs");
const path = require("path");

const REALMS = [
  { name: "Mortal", maxQi: 100, power: 10 },
  { name: "Qi Condensation", maxQi: 500, power: 50 },
  { name: "Foundation Establishment", maxQi: 2000, power: 200 },
  { name: "Core Formation", maxQi: 8000, power: 800 },
  { name: "Nascent Soul", maxQi: 30000, power: 3000 },
  { name: "Soul Transformation", maxQi: 100000, power: 10000 },
  { name: "Void King", maxQi: 500000, power: 50000 },
  { name: "Origin King", maxQi: 2000000, power: 200000 },
  { name: "Great Emperor", maxQi: 10000000, power: 1000000 },
  { name: "True God", maxQi: 99999999, power: 9999999 }
];

const TECHNIQUES = ["Dragon Fist 👊", "Heavenly Sword 🗡️", "Void Palm 🖐️", "Nine Suns Art ☀️", "Shadow Step 👣", "Thunder Tribulation ⚡"];

module.exports = {
config: { 
name: "cultivation", 
aliases: ["cult","martial","xiulian","mrt","c"], // NOW -c WORKS
version: "2.0-ADMIN",
author: "Feng",
role: 0,
category: "game"
},

onStart: async function({ api, event, args, message }){
const dbPath = path.join(__dirname, "cache", "cultivation.json");
if(!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), {recursive:true});
if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));

let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
let uid = event.senderID;
let action = (args[0] || "profile").toLowerCase();

function getUser(id){
if(!db[id]){
db[id] = { name: id, qi: 10, realm: 0, power: 10, technique: TECHNIQUES[0], wins: 0, losses: 0, lastMeditate: 0, spiritStones: 100, banned: false };
}
return db[id];
}
function save(){ fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }
async function getName(id){ try{ let info=await api.getUserInfo(id); return info[id].name; }catch{ return id; } }

let user = getUser(uid);
let info = await api.getUserInfo(uid);
user.name = info[uid]?.name || uid;
if(user.banned) return message.reply("🚫 You are banned from cultivation world.");

// ===== ADMIN COMMANDS (role 1 = GC admin, role 2 = bot admin) =====
let threadInfo = null;
try{ threadInfo = await api.getThreadInfo(event.threadID); }catch{}
let isGCAdmin = threadInfo?.adminIDs?.some(a=>a.id===uid);
let isBotAdmin = global.GoatBot?.config?.admins?.includes(uid) || global.config?.admins?.includes(uid);

if(["admin","set","reset","ban","unban","addstone","setrealm"].includes(action)){
if(!isGCAdmin && !isBotAdmin) return message.reply("❌ Admin only: GC Admin or Bot Admin can use this.");

let targetID = Object.keys(event.mentions||{})[0] || args[1];
if(!targetID) return message.reply("Admin usage:\n-c admin reset @user\n-c admin setrealm @user <0-9>\n-c admin addstone @user <amount>\n-c admin ban @user\n-c admin unban @user");

let target = getUser(targetID);
let targetName = await getName(targetID);

if(action === "admin" && args[1] === "reset" || action === "reset"){
db[targetID] = { name: targetName, qi: 10, realm: 0, power: 10, technique: TECHNIQUES[0], wins: 0, losses: 0, lastMeditate: 0, spiritStones: 100, banned: false };
save();
return message.reply(`✅ RESET ${targetName} back to Mortal realm.`);
}

if(action === "setrealm" || (action==="admin" && args[1]==="setrealm")){
let realmNum = parseInt(args[3] || args[2]);
if(isNaN(realmNum) || realmNum <0 || realmNum>=REALMS.length) return message.reply(`Invalid realm 0-9: 0=Mortal, 9=True God`);
target.realm = realmNum;
target.power = REALMS[realmNum].power;
target.qi = 0;
save();
return message.reply(`✅ SET ${targetName} to ${REALMS[realmNum].name}`);
}

if(action === "addstone" || (action==="admin" && args[1]==="addstone")){
let amt = parseInt(args[3] || args[2]);
if(isNaN(amt)) return message.reply("Usage: -c admin addstone @user 1000");
target.spiritStones += amt;
save();
return message.reply(`✅ Added ${amt} stones to ${targetName}. Now: ${target.spiritStones}`);
}

if(action === "ban" || (action==="admin" && args[1]==="ban")){
target.banned = true; save();
return message.reply(`🚫 Banned ${targetName} from cultivation`);
}
if(action === "unban" || (action==="admin" && args[1]==="unban")){
target.banned = false; save();
return message.reply(`✅ Unbanned ${targetName}`);
}

return message.reply("Admin commands:\n-c admin reset @user\n-c admin setrealm @user 5\n-c admin addstone @user 1000\n-c admin ban @user\n-c admin unban @user");
}

// ===== NORMAL PLAYER COMMANDS =====
if(action === "p" || action === "profile" || action === "me"){
let realm = REALMS[user.realm];
let nextRealm = REALMS[user.realm+1];
let percent = Math.min(100, Math.floor((user.qi / realm.maxQi)*100));
let bar = "█".repeat(Math.floor(percent/10)) + "░".repeat(10-Math.floor(percent/10));
return message.reply(`🧘 PROFILE [shortcut: -c]\n━━━━━━━━━━━━━━\n👤 ${user.name}\n🌟 ${realm.name}\n⚡ ${user.power.toLocaleString()}\n🔮 Qi: ${user.qi}/${realm.maxQi}\n📊 [${bar}] ${percent}%\n💎 Stones: ${user.spiritStones}\n🥋 ${user.technique}\n⚔️ ${user.wins}W/${user.losses}L\n\nNext: ${nextRealm?.name||"MAX"}\n-c m = meditate\n-c b = breakthrough\n-c a @friend = attack`);
}

if(action === "m" || action === "meditate"){
let now = Date.now();
if(now - user.lastMeditate < 120000) return message.reply(`⏳ Wait ${Math.ceil((120000-(now-user.lastMeditate))/1000)}s`);
let gain = Math.floor(Math.random()*50)+20+(user.realm*20);
user.qi+=gain; user.lastMeditate=now; user.spiritStones+=5; save();
return message.reply(`🧘 +${gain} Qi! Total: ${user.qi}/${REALMS[user.realm].maxQi}${user.qi>=REALMS[user.realm].maxQi?"\n💥 Can breakthrough! -c b":""}`);
}

if(action === "b" || action === "breakthrough"){
let realm=REALMS[user.realm];
if(user.qi<realm.maxQi) return message.reply(`Need ${realm.maxQi} Qi, have ${user.qi}`);
let chance=0.7-(user.realm*0.05);
if(Math.random()<chance){
user.realm++; user.power=REALMS[user.realm].power; user.qi=0; user.spiritStones+=100*user.realm; save();
return message.reply(`💥 BREAKTHROUGH! Now ${REALMS[user.realm].name}! Power ${user.power}!`);
}else{ user.qi=Math.floor(user.qi*0.8); save(); return message.reply(`💔 Failed! Lost 20% Qi. Try again -c b`); }
}

if(action === "a" || action === "attack"){
let targetID=Object.keys(event.mentions||{})[0];
if(!targetID) return message.reply("Use: -c a @friend");
let target=getUser(targetID);
if(target.banned) return message.reply("Target is banned");
let targetName=await getName(targetID);
let up=user.power+Math.floor(Math.random()*user.power*0.3);
let tp=target.power+Math.floor(Math.random()*target.power*0.3);
if(up>tp){ user.wins++; target.losses++; user.spiritStones+=20; target.spiritStones=Math.max(0,target.spiritStones-10); save(); return message.reply(`⚔️ ${user.name} WINS vs ${targetName}! ${up} vs ${tp} power`); }
else{ target.wins++; user.losses++; target.spiritStones+=20; user.spiritStones=Math.max(0,user.spiritStones-10); save(); return message.reply(`⚔️ ${targetName} WINS vs you! ${tp} vs ${up}`); }
}

if(action === "lb" || action === "top"){
let all=Object.values(db).sort((a,b)=> b.realm - a.realm || b.power - a.power).slice(0,10);
let msg=`🏆 TOP CULTIVATORS\n━━━━━━━━━━━━━━\n`;
for(let i=0;i<all.length;i++){ msg+=`${i+1}. ${all[i].name} - ${REALMS[all[i].realm].name}\n`; }
return message.reply(msg);
}

if(action === "daily"){
if(user.lastDaily && Date.now()-user.lastDaily < 86400000) return message.reply("Daily claimed, wait 24h");
user.lastDaily=Date.now(); user.spiritStones+=200; user.qi+=100; save();
return message.reply(`🎁 +200 Stones +100 Qi!`);
}

return message.reply(`CULTIVATION - Shortcuts:\n-c p = profile\n-c m = meditate\n-c b = breakthrough\n-c a @user = attack\n-c lb = leaderboard\n-c daily\n\nAdmin:\n-c admin reset @user\n-c admin setrealm @user 5\n-c admin addstone @user 1000`);
}
};
