module.exports = {
config: { name: "uidall", aliases: ["members","getall","listmem"], version: "1.0-ADMIN", author: "Feng", role: 1, category: "admin" },
onStart: async function({ api, event, message }){
try{
let info=await api.getThreadInfo(event.threadID);
let ids=info.participantIDs;
let msg=`📋 UIDALL - ${info.threadName} (${ids.length} members)\n━━━━━━━━━━━━━━\n`;
let count=0;
for(let id of ids){
try{
let user=await api.getUserInfo(id);
let name=user[id]?.name||"Unknown";
msg+=`${++count}. ${name} - ${id}\n`;
if(msg.length>3500){ await message.reply(msg); msg=""; await new Promise(r=>setTimeout(r,500)); }
}catch{}
}
if(msg) await message.reply(msg);
return message.reply(`✅ Done total ${ids.length}. Use for mass tag or backup.`);
}catch(e){ return message.reply(`❌ ${e.message}`); }
}
};
