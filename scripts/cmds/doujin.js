const axios=require("axios");
module.exports={ config:{ name:"doujin", aliases:["nhentai"], version:"5.0-RENDER", author:"Feng", role:0, category:"nsfw" },
onStart: async function({ api, event, args, message }){
let id=(args[0]||"").replace(/[^0-9]/g,"")||String(Math.floor(Math.random()*300000)+1);
try{
let url=`https://nhentai.net/api/gallery/${id}`; let data; try{ let r=await axios.get(url,{timeout:10000,headers:{"User-Agent":"Mozilla/5.0"}}); data=r.data; }catch{ let r=await axios.get(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,{timeout:15000}); data=typeof r.data==="string"?JSON.parse(r.data):r.data; }
let title=data.title.pretty||data.title.english; let tags=(data.tags||[]).filter(t=>t.type==="tag").slice(0,10).map(t=>t.name).join(", ");
return api.sendMessage(`📚 ${title}\nID: ${id} | Pages: ${data.num_pages}\nTags: ${tags}\nRead: https://nhentai.net/g/${id}/`,event.threadID);
}catch(e){ return message.reply(`❌ ID ${id} not found`); }
}};
