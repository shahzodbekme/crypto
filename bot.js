const { Bot } = require("grammy");
const axios = require("axios");
require("dotenv").config();

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => ctx.reply("Salom! Video yuklash uchun link yuboring."));

bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!url.includes("http")) return;

    await ctx.reply("⏳ Video qayta ishlanmoqda...");

    try {
        const response = await axios.post("https://api.cobalt.tools/api/json", {
            url: url,
            videoQuality: "720"
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (response.data && response.data.url) {
            await ctx.replyWithVideo(response.data.url);
        } else {
            throw new Error("Video topilmadi");
        }
    } catch (error) {
        console.error("Xato:", error.message);
        ctx.reply("❌ Kechirasiz, bu videoni yuklab bo'lmadi. Linkni tekshiring yoki keyinroq urinib ko'ring.");
    }
});

bot.start({
    onStart: () => console.log("🚀 Bot muvaffaqiyatli ishga tushdi!")
});
