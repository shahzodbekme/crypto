const { Bot, InputFile, HttpError, GrammyError } = require("grammy");
const axios = require("axios");
require("dotenv").config();

// Bot sozlamalari
const bot = new Bot(process.env.BOT_TOKEN);
const ADMIN_ID = 123456789; // O'zingizning Telegram ID'ingizni yozing
let userCount = new Set(); // Oddiy statistika uchun (Bazaga ulasangiz yaxshi bo'ladi)

// 1. Linkni aniqlash (Regex)
const linkRegex = /https?:\/\/(www\.)?(instagram\.com|tiktok\.com|youtube\.com|youtu\.be|twitter\.com)\/.+/;

// 2. Admin Panel buyruqlari
bot.command("admin", async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) return;
    await ctx.reply(`📊 **Bot statistikasi:**\n\n👤 Foydalanuvchilar: ${userCount.size}\n⚡️ Server: Render Free`);
});

bot.command("start", async (ctx) => {
    userCount.add(ctx.from.id);
    await ctx.reply("🤖 **Universal Video Downloader**\n\nInstagram, TikTok va YouTube linkini yuboring!");
});

// 3. Asosiy Video Yuklash Mantiqi
bot.on("message:text", async (ctx) => {
    const url = ctx.message.text;
    if (!linkRegex.test(url)) return;

    userCount.add(ctx.from.id);
    const statusMsg = await ctx.reply("⏳ *Navbatga qo'shildi, yuklanmoqda...*", { parse_mode: "Markdown" });

    try {
        // Cobalt API orqali so'rov yuborish (Xotirani qiynamaydi)
        const response = await axios.post("https://api.cobalt.tools/api/json", {
            url: url,
            videoQuality: "720",
            filenameStyle: "basic"
        }, {
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            timeout: 20000 // 20 soniya kutish
        });

        const downloadUrl = response.data.url;

        if (downloadUrl) {
            // Videoni oqim (stream) ko'rinishida yuborish
            await ctx.replyWithVideo(new InputFile({ url: downloadUrl }), {
                caption: "✅ @sizning_kanalingiz orqali yuklandi",
                supports_streaming: true
            });
            await ctx.api.deleteMessage(ctx.chat.id, statusMsg.message_id);
        } else {
            throw new Error("Link topilmadi");
        }

    } catch (error) {
        console.error("Xatolik:", error.message);
        await ctx.api.editMessageText(
            ctx.chat.id, 
            statusMsg.message_id, 
            "❌ **Xatolik yuz berdi!**\n\n- Video juda katta bo'lishi mumkin.\n- Link shaxsiy (private) akkauntdan olingan.\n- Serverda yuklama ko'p."
        );
    }
});

// Xatoliklarni ushlash (Bot o'chib qolmasligi uchun)
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();
console.log("🚀 Bot muvaffaqiyatli ishga tushdi!");
