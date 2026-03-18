const { Bot } = require("grammy");
const axios = require("axios");
const http = require("http");
require("dotenv").config();

// Render uchun server
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot ishlayapti...");
}).listen(process.env.PORT || 3000);

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Salom! Video linkini yuboring (TikTok, Instagram yoki YouTube)."));

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!url.startsWith("http")) return;

    const waitMsg = await ctx.reply("⏳ Video tayyorlanmoqda...");

    try {
        // Bu API Cobalt emas, mutlaqo boshqa xizmat
        const res = await axios.get(`https://api.vkrdownloader.com/server?vkr=${url}`);
        
        // API dan kelgan ma'lumotni tekshiramiz
        if (res.data && res.data.data && res.data.data.url) {
            const videoUrl = res.data.data.url;
            
            await ctx.replyWithVideo(videoUrl, {
                caption: "✅ Video tayyor!"
            });
        } else {
            throw new Error("Video topilmadi");
        }

    } catch (error) {
        console.error("Xato:", error.message);
        ctx.reply("❌ Kechirasiz, bu videoni yuklab bo'lmadi. Linkni tekshiring yoki boshqa link yuboring.");
    } finally {
        await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
    }
});

bot.start({
    onStart: () => console.log("🚀 Bot muvaffaqiyatli ishga tushdi!")
});
