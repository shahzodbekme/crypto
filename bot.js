const { Bot } = require("grammy");
const axios = require("axios");
const http = require("http");
require("dotenv").config();

// Render uchun server
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is alive!");
}).listen(process.env.PORT || 3000);

const bot = new Bot(process.env.BOT_TOKEN);

// 1. Botga xabar kelayotganini tekshirish uchun middleware
bot.use(async (ctx, next) => {
    console.log(`--- YANGI XABAR ---`);
    console.log(`Kimdan: ${ctx.from?.first_name} (@${ctx.from?.username})`);
    console.log(`Matn: ${ctx.message?.text}`);
    await next();
});

bot.command("start", (ctx) => ctx.reply("Salom! Link yuboring, tekshirib ko'ramiz."));

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!url.startsWith("http")) return;

    const waitMsg = await ctx.reply("⏳ Qidirilmoqda...");

    try {
        console.log(`Cobalt'ga so'rov yuborilyapti: ${url}`);
        
       const response = await axios.post("https://api.cobalt.tools/api/json", {
    url: url,                // Foydalanuvchi yuborgan link
    videoQuality: "720",      // Sifat
    downloadMode: "video",   // Faqat video (audio emas)
    saveAudioOnly: false,    // Audio emasligini tasdiqlash
    filenameStyle: "basic"   // Fayl nomi formati
}, {
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
        "Origin": "https://cobalt.tools",
        "Referer": "https://cobalt.tools/"
    }
});

        console.log("Cobalt Javobi:", response.data);

        if (response.data && response.data.url) {
            await ctx.replyWithVideo(response.data.url);
            console.log("Video yuborildi!");
        } else {
            await ctx.reply("❌ Video topilmadi (API bo'sh qaytdi).");
        }
    } catch (error) {
        console.error("XATO YUZ BERDI:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            await ctx.reply(`API Xatosi: ${error.response.status}`);
        } else {
            console.error("Xabar:", error.message);
            await ctx.reply(`Tizim xatosi: ${error.message}`);
        }
    } finally {
        await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
    }
});

bot.start({
    onStart: (botInfo) => {
        console.log(`🚀 Bot @${botInfo.username} sifatida ishga tushdi!`);
    }
});
