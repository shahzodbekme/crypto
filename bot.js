const { Bot, GrammyError, HttpError } = require("grammy");
const axios = require("axios");
const http = require("http"); // Port uchun kerak
require("dotenv").config();

// 1. Render o'chib qolmasligi uchun soxta server yaratamiz
http.createServer((req, res) => {
    res.write("Bot is running!");
    res.end();
}).listen(process.env.PORT || 3000);

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Salom! Video yuklash uchun link yuboring."));

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!url.includes("http")) return;

    const waitMsg = await ctx.reply("⏳ Video qayta ishlanmoqda...");

    try {
        const response = await axios.post("https://api.cobalt.tools/api/json", {
            url: url,
            videoQuality: "720"
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Referer": "https://cobalt.tools/"
            }
        });

        if (response.data && response.data.url) {
            await ctx.replyWithVideo(response.data.url);
        } else {
            throw new Error("Video topilmadi");
        }
    } catch (error) {
        console.error("Xato:", error.message);
        ctx.reply("❌ Xatolik: Videoni yuklab bo'lmadi. Linkni tekshiring.");
    } finally {
        // "Yuklanmoqda" xabarini o'chirish
        await ctx.api.deleteMessage(ctx.chat.id, waitMsg.message_id).catch(() => {});
    }
});

// Xatoliklarni ushlash
bot.catch((err) => {
    console.error("Botda xato:", err.message);
});

bot.start({
    onStart: () => console.log("🚀 Bot muvaffaqiyatli ishga tushdi!")
});
