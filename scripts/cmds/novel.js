const axios = require("axios"); const cheerio = require("cheerio");
module.exports = { config: { name: "novel", aliases: ["read"], version: "10.1-ALL", author: "Feng", role: 0, category: "books" },
onStart: async function({ message, args }){
let raw=args.join(" "); if(!raw) return message.reply("Use: -novel martial peak 1 | -novel search solo leveling");
let chap=parseInt(raw.match(/(\d+)\s*$/i)?.[1]||1); let name=raw.replace(/\s*\d+\s*$/,"").trim().toLowerCase(); 
if(name.startsWith("search ")){ let q=name.replace("search ",""); return message.reply(`🔍 Search results for ${q}:\nhttps://novelbuddy.com/search?q=${encodeURIComponent(q)}`); }
let slug=name.replace(/[^a-z0-9]+/g,"-");
async function getHtml(u){ let ps=[u,`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`]; for(let p of ps){ try{ let {data}=await axios.get(p,{timeout:15000,headers:{"User-Agent":"Mozilla/5.0"}}); let h=typeof data==="string"?data:data.contents||""; if(h.length>500) return h; }catch{} } return null; }
let sites=[`https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-${chap}/`,`https://novelbuddy.com/novel/${slug}/chapter-${chap}`,`https://readnovelfull.com/${slug}/chapter-${chap}.html`];
let final=null; for(let u of sites){ let html=await getHtml(u); if(!html) continue; const $=cheerio.load(html); $("script,style,nav,footer").remove(); let t=$(".entry-content,#chr-content,.chapter-content").text(); if(t && t.length>500){ final=t; break; } }
if(!final) return message.reply(`❌ Not found ${name} ${chap}`);
final=final.substring(0,9000); let parts=[]; for(let i=0;i<final.length;i+=1800) parts.push(final.substring(i,i+1800));
for(let p of parts){ await message.reply(p); await new Promise(r=>setTimeout(r,400)); }
await message.reply(`✅ Next: -novel ${name} ${chap+1}`);
}};
