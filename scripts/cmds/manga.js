const axios=require("axios"); const fs=require("fs"); const path=require("path");
module.exports={ config:{ name:"manga", aliases:["manhwa","manhua"], version:"4.0-FIX", author:"Feng", role:0, category:"anime" },
onStart: async function({ api, event, args, message }){
let raw=args.join(" ").trim(); if(!raw) return message.reply("Use: -manga solo leveling 10");
let chap=parseFloat(raw.match(/(\d+(\.\d+)?)$/)?.[1]||1); let nameRaw=raw.replace(/\s*\d+(\.\d+)?\s*$/,"").toLowerCase().trim();
try{
let {data:sData}=await axios.get(`https://api.mangadex.org/manga?title=${encodeURIComponent(nameRaw)}&limit=5`,{timeout:20000});
if(!sData.data.length) throw new Error("Not found"); let mangaId=sData.data[0].id; let title=Object.values(sData.data[0].attributes.title)[0]||nameRaw;
let all=[]; let off=0; while(true){ let {data:c}=await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=500&offset=${off}`,{timeout:20000}); all=all.concat(c.data); if(c.data.length<500) break; off+=500; if(off>2000) break; }
let found=all.find(c=>parseFloat(c.attributes.chapter)===chap)||all.find(c=>c.attributes.chapter==String(chap))||all[chap-1]; if(!found) throw new Error(`Chap ${chap} not exist, total ${all.length}`);
let {data:server}=await axios.get(`https://api.mangadex.org/at-home/server/${found.id}`,{timeout:20000});
let host=server.baseUrl, hash=server.chapter.hash, pages=server.chapter.data;
await message.reply(`📖 ${title} Ch.${found.attributes.chapter} - ${pages.length} pages`);
const cache=path.join(__dirname,"cache"); if(!fs.existsSync(cache)) fs.mkdirSync(cache,{recursive:true});
for(let s=0;s<pages.length;s+=5){ let batch=pages.slice(s,s+5); let atts=[]; let paths=[]; for(let i=0;i<batch.length;i++){ try{ let p=path.join(cache,`mg_${Date.now()}_${i}.jpg`); let r=await axios.get(`${host}/data/${hash}/${batch[i]}`,{responseType:"arraybuffer",timeout:20000}); fs.writeFileSync(p,Buffer.from(r.data)); atts.push(fs.createReadStream(p)); paths.push(p); }catch{} } if(atts.length) await api.sendMessage({body:`[${s+1}/${pages.length}]`,attachment:atts},event.threadID); for(let pp of paths) try{fs.unlinkSync(pp);}catch{} await new Promise(r=>setTimeout(r,500)); }
}catch(e){ return message.reply(`❌ ${e.message}`); }
}};
