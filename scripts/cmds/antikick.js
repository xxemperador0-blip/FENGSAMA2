module.exports = {
config: { name: "autokick", aliases: ["antiraid","antispam"], version: "1.0-ADMIN", author: "Feng", role: 1, category: "admin" },
onStart: async function({ message, args }){
if(!global.autokick) global.autokick={};
let thread=message.threadID || args[1];
if(!global.autokick[thread]) global.autokick[thread]={enabled:false, badwords:["puta","bobo","tangina"]};

if(args[0]==="on"){
global.autokick[thread].enabled=true;
return message.reply("✅ AUTOKICK ON - Bot will kick users spamming bad words");
}
if(args[0]==="off"){
global.autokick[thread].enabled=false;
return message.reply("❌ AUTOKICK OFF");
}
if(args[0]==="add"){
let word=args.slice(1).join(" ").toLowerCase();
global.autokick[thread].badwords.push(word);
return message.reply(`Added badword: ${word}\nList: ${global.autokick[thread].badwords.join(", ")}`);
}
if(args[0]==="list"){
return message.reply(`Badwords: ${global.autokick[thread].badwords.join(", ")}\nStatus: ${global.autokick[thread].enabled?"ON":"OFF"}`);
}
return message.reply("Use:\n-autokick on\n-autokick off\n-autokick add <word>\n-autokick list");
},
onChat: async function({ api, event }){
if(!global.autokick) return;
let cfg=global.autokick[event.threadID];
if(!cfg || !cfg.enabled) return;
let body=(event.body||"").toLowerCase();
if(cfg.badwords.some(w=>body.includes(w))){
try{
await api.removeUserFromGroup(event.senderID, event.threadID);
api.sendMessage(`🚫 Auto-kicked @${event.senderID} for bad word`,event.threadID,()=>{},{[event.senderID]:""});
}catch(e){ api.sendMessage(`⚠️ Would kick @${event.senderID} but bot is not admin`,event.threadID,()=>{},{[event.senderID]:""}); }
}
}
};
