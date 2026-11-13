const axios=require("axios");
module.exports={ config:{ name:"anime", aliases:["ani","anilist"], version:"1.0", author:"Feng", role:0, category:"anime" },
onStart: async function({ message, args }){
let q=args.join(" "); if(!q) return message.reply("Use: -anime solo leveling");
try{
let {data}=await axios.post("https://graphql.anilist.co",{query:`query($s:String){Media(search:$s,type:ANIME){title{romaji english} description episodes status averageScore coverImage{large} trailer{id site} nextAiringEpisode{episode airingAt} } }`,variables:{s:q}},{timeout:15000});
let m=data.data.Media; if(!m) return message.reply("Not found");
let desc=m.description?m.description.replace(/<[^>]+>/g,"").substring(0,800):"No desc";
return message.reply(`🎬 ${m.title.english||m.title.romaji}\n⭐ Score: ${m.averageScore||"N/A"} | Eps: ${m.episodes||"?"} | Status: ${m.status}\n\n${desc}\n\nCover: ${m.coverImage.large}\n${m.trailer?`Trailer: https://youtu.be/${m.trailer.id}`:""}`);
}catch(e){ return message.reply(`❌ ${e.message}`); }
}};
