const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
config: { 
name: "novel", 
aliases: ["read","novels","allnovel"], 
version: "9.0-ALL-SITES-RENDER", 
author: "Feng", 
role: 0, 
category: "books",
guide: "-novel martial peak 10 | -novel reverend insanity 1 | -novel solo leveling 1"
},

onStart: async function({ message, args }){
let raw = args.join(" ");
if(!raw) return message.reply("Use:\n-novel martial peak 2\n-novel reverend insanity 1\n-novel solo leveling 1");

let chap = parseInt(raw.match(/(\d+)\s*$/i)?.[1] || 1);
let name = raw.replace(/(?:chap|chapter|c)\s*\d+\s*$/i,"").replace(/\s*\d+\s*$/,"").trim().toLowerCase();
if(!name) return message.reply("Use: -novel martial peak 2");

await message.reply(`📚 Searching all sites for ${name} ${chap}...`);

let slug = name.replace(/[^a-z0-9]+/g,"-");

async function fetchWithProxies(targetUrl){
let proxies = [
targetUrl,
`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
];
for(let pUrl of proxies){
try{
let {data} = await axios.get(pUrl, { timeout: 15000, headers: { "User-Agent":"Mozilla/5.0 Chrome/120" } });
let html = typeof data === "string" ? data : data.contents || "";
if(!html || html.length < 400) continue;
return html;
}catch{ continue; }
}
return null;
}

async function extractText(html, selectors){
try{
const $ = cheerio.load(html);
$("script,style,nav,header,footer,iframe,.ads,.chapter-nav,.nav-links").remove();
for(let sel of selectors){
let t = $(sel).text();
if(t && t.trim().length > 500) return t.trim();
}
let body = $("body").text();
if(body.length > 1000) return body;
}catch{}
return null;
}

let SITES = [];

// REVEREND INSANITY
if(name.includes("reverend") || name.includes("insanity")){
SITES.push(
{url: "https://archive.org/download/reverend-insanity/Reverend%20Insanity.txt", type: "txt"},
{url: `https://asura-novel.com/reverend-insanity-chapter-${chap}`, sel: [".chapter-content",".entry-content","article"]},
{url: `https://reverend-insanity.fandom.com/wiki/Chapter_${chap}`, sel: [".page-content"]},
{url: `https://novelbuddy.com/novel/reverend-insanity/chapter-${chap}`, sel: ["#chr-content",".chapter-content"]}
);
}
// MARTIAL PEAK
else if(name.includes("martial peak")){
SITES.push(
{url: `https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-${chap}/`, sel: [".entry-content","article"]},
{url: `https://martialpeak.site/martial-peak-chapter-${chap}/`, sel: [".entry-content",".text-left"]},
{url: `https://novelbuddy.com/novel/martial-peak/chapter-${chap}`, sel: ["#chr-content"]},
{url: `https://readnovelfull.com/martial-peak/chapter-${chap}.html`, sel: ["#chr-content",".chapter-content"]},
{url: `https://ficlyn.com/novel/martial-peak/chapter-${chap}`, sel: [".chapter-content"]}
);
}
// GENERIC NOVELS - tries 6 sites
else {
SITES.push(
{url: `https://novelbuddy.com/novel/${slug}/chapter-${chap}`, sel: ["#chr-content",".chapter-content"]},
{url: `https://readnovelfull.com/${slug}/chapter-${chap}.html`, sel: ["#chr-content"]},
{url: `https://novelbin.com/b/${slug}/chapter-${chap}`, sel: ["#chr-content"]},
{url: `https://allnovelbin.com/novel/${slug}/chapter-${chap}`, sel: [".chapter-content"]},
{url: `https://novelfull.com/${slug}/chapter-${chap}.html`, sel: [".chapter-content"]}
);
}

let finalText = null;
let usedUrl = "";

for(let site of SITES){
let html = await fetchWithProxies(site.url);
if(!html) continue;

if(site.type === "txt"){
let m = html.match(new RegExp(`Chapter\\s*${chap}[^\\n]*\\n`, "i"));
if(m){
let st = html.indexOf(m[0]);
let en = html.indexOf(`Chapter ${chap+1}`, st+10);
finalText = html.substring(st, en===-1?st+15000:en);
usedUrl = site.url;
break;
}
}else{
let txt = await extractText(html, site.sel);
if(txt){
finalText = txt;
usedUrl = site.url;
break;
}
}
}

if(!finalText) return message.reply(`❌ All sites blocked for ${name} ${chap}\nTried ${SITES.length} sites.\nTry manual:\n- https://novelbuddy.com/novel/${slug}/chapter-${chap}\n- https://www.divinedaolibrary.com/story/martial-peak/martial-peak-chapter-${chap}/`);

finalText = finalText.replace(/Translator:.*|Editor:.*|Divine Dao Library.*|Read.*Patreon.*|Join.*Discord.*|Previous.*Next/gim,"").replace(/\n{3,}/g,"\n\n").trim().substring(0,12000);

let parts = [];
for(let i=0;i<finalText.length;i+=1800) parts.push(finalText.substring(i,i+1800));

await message.reply(`📖 ${name.toUpperCase()} - Chap ${chap}\nSource: ${usedUrl}\n━━━━━━━━━━━━━━\n\n${parts[0]}`);
for(let i=1;i<parts.length;i++){
await new Promise(r=>setTimeout(r,600));
await message.reply(parts[i]);
}
await message.reply(`✅ End Chap ${chap} | Next: -novel ${name} ${chap+1}`);
}
};
