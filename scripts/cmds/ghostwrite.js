const axios = require("axios");
module.exports = {
config: { name: "ghostwrite", aliases: ["continue","gw","novelai"], version: "1.0-UNIQUE", author: "Feng", role: 0, category: "books" },
onStart: async function({ message, args }){
let story = args.join(" ");
if(!story) return message.reply("📖 GHOSTWRITE\n\nContinue any story with AI:\n\n-ghostwrite In a world where martial peak reached the void...\n\nOr reply to a novel chapter:\nReply to chapter with -ghostwrite continue next battle");

try{
let prompt = `You are a professional novel ghostwriter. Continue this story in a thrilling, detailed way (3 paragraphs, Tagalog-English mix ok). Story: ${story}`;

let {data} = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=You are a novel writer, immersive and detailed`, {timeout:25000});
let result = data.data || data.answer || data.result;
return message.reply(`✍️ GHOSTWRITE CONTINUATION:\n━━━━━━━━━━━━━━\n\n${result}\n\n━━━━━━━━━━━━━━\nReply -ghostwrite again to continue...`);
}catch(e){ return message.reply(`❌ ${e.message}`); }
}
};
