const axios = require("axios"); 
const fs = require("fs"); 
const path = require("path");

module.exports = { 
config: { name: "manga", aliases: ["manhwa","manhua"], version: "4.0-FIX-CHAP-FOUND", author: "Feng", role: 0, category: "anime" }, 
onStart: async function({ api, event, args, message }) { 
let raw = args.join(" ").trim(); 
if(!raw) return message.reply("Usage: -manga solo leveling 5"); 
let chap = parseFloat(raw.match(/(\d+(\.\d+)?)$/)?.[1] || 1); 
let nameRaw = raw.replace(/\s*\d+(\.\d+)?\s*$/,"").toLowerCase().trim(); 

let loadMsg; try{ loadMsg = await message.reply(`📚 Searching ${nameRaw} ch.${chap}...`);}catch{}

try { 
// 1. Search manga
let {data: sData} = await axios.get(`https://api.mangadex.org/manga?title=${encodeURIComponent(nameRaw)}&limit=5`, {timeout:20000});
if(!sData.data.length) throw new Error(`Not found: ${nameRaw}`);
let mangaId = sData.data[0].id; 
let title = sData.data[0].attributes.title.en || Object.values(sData.data[0].attributes.title)[0] || nameRaw;

// 2. Get ALL chapters (loop until all)
let allChaps = []; let offset = 0;
while(true){
let {data: cData} = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=500&offset=${offset}`, {timeout:20000});
allChaps = allChaps.concat(cData.data);
if(cData.data.length < 500) break;
offset+=500;
if(offset>2000) break;
}

// 3. SMART chapter finder
let found = null;
// Exact match 10 -> 10
found = allChaps.find(c => parseFloat(c.attributes.chapter) === chap);
// Float match 10.5
if(!found) found = allChaps.find(c => c.attributes.chapter == String(chap));
// Closest match if not exact
if(!found){
let nums = allChaps.map(c=>parseFloat(c.attributes.chapter)).filter(n=>!isNaN(n)).sort((a,b)=>a-b);
let closest = nums.reduce((a,b)=> Math.abs(b-chap) < Math.abs(a-chap) ? b : a, nums[0]);
found = allChaps.find(c=>parseFloat(c.attributes.chapter)===closest);
}
if(!found) throw new Error(`Chapter ${chap} not exist. Available: ${allChaps.length} chapters, first=${allChaps[0]?.attributes.chapter} last=${allChaps[allChaps.length-1]?.attributes.chapter}`);

let {data: server} = await axios.get(`https://api.mangadex.org/at-home/server/${found.id}`, {timeout:20000});
let host = server.baseUrl, hash = server.chapter.hash, pages = server.chapter.data; 

if(loadMsg) api.unsendMessage(loadMsg.messageID); 
await message.reply(`📖 ${title} Ch.${found.attributes.chapter} - ${pages.length} pages (requested ${chap})`); 

const cacheDir = path.join(__dirname, "cache"); 
if(!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir,{recursive:true});

for(let start=0; start<pages.length; start+=5){ 
let batch = pages.slice(start, start+5); let attachments=[]; let paths=[];
for(let i=0;i<batch.length;i++){
try{
let p = path.join(cacheDir, `mg_${Date.now()}_${i}.jpg`);
let r = await axios.get(`${host}/data/${hash}/${batch[i]}`, { responseType:"arraybuffer", timeout:20000, headers:{Referer:"https://mangadex.org/"}});
fs.writeFileSync(p, Buffer.from(r.data)); attachments.push(fs.createReadStream(p)); paths.push(p);
}catch{}
}
if(attachments.length) await api.sendMessage({body:`[${start+1}/${pages.length}]`, attachment:attachments}, event.threadID);
for(let pp of paths) try{ fs.unlinkSync(pp);}catch{}
await new Promise(r=>setTimeout(r,600));
}
await message.reply(`✅ Done Ch.${found.attributes.chapter}`);
}catch(e){ 
if(loadMsg) try{ api.unsendMessage(loadMsg.messageID);}catch{}
return message.reply(`❌ ${e.message}`);
}
}};
