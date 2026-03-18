const { Bot } = require("grammy");
const axios = require("axios");
const http = require("http");
require("dotenv").config();

// 1. Render uchun oddiy server (Portni band qilish uchun)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Bot is running!\n");
}).listen(process.env.PORT || 3000);

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Salom! Video yuklash uchun link yuboring (YouTube, Instagram, TikTok)."));

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!url.startsWith("http")) return;

    const waitMsg = await ctx.reply("⏳ Video qayta ishlanmoqda...");

    try {
        // Cobalt API ga so'rov
     const response = await axios.post("https://api.cobalt.tools/api/json", {
    url: url,
    videoQuality: "720",
    downloadMode: "video"
}, {
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }
});

        if (response.data && response.data.url) {
            // Videoni yuborish
            await ctx.replyWithVideo(response.data.url, {
                caption: "✅ Video tayyor!"
            });
        } else {
            ctx.reply("❌ Cobalt videoni topa olmadi.");
        }
    } catch (error) {
        console.error("Xato tafsiloti:", error.response?.data || error.message);
        ctx.reply("❌ Xatolik: Videoni yuklab bo'lmadi. Link noto'g'ri yoki API band.");
    } finally {
        // "Yuklanmoqda" xabarini o'chirish
        await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
    }
});

bot.catch((err) => {
    console.error("Botda global xato:", err);
});

bot.start({
    onStart: () => console.log("🚀 Bot muvaffaqiyatli ishga tushdi!")
});
