const { Bot, InlineKeyboard } = require("grammy");
const cron = require("node-cron");
const http = require("http");
require("dotenv").config();

// Render uchun server (o'chib qolmasligi uchun)
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Birthday Bot is running!");
}).listen(process.env.PORT || 3000);

const bot = new Bot(process.env.BOT_TOKEN);

// Foydalanuvchilar ma'lumotlarini saqlash (Vaqtinchalik, server o'chsa o'chadi)
// Aslida bazaga (MongoDB/PostgreSQL) ulash yaxshi, lekin hozircha shunday:
const users = {}; 

// Menyu tugmalari
const mainMenu = new InlineKeyboard()
    .text("📅 Sana kiritish", "set_birthday").row()
    .text("📊 Holatni ko'rish", "check_status");

bot.command("start", (ctx) => {
    ctx.reply("Assalomu alaykum! Men tug'ilgan kuningizgacha qancha vaqt qolganini hisoblab beraman va har kuni eslatib turaman.\n\nPastdagi tugmani bosing:", {
        reply_markup: mainMenu
    });
});

// Tugmani bosganda javob berish
bot.callbackQuery("set_birthday", (ctx) => {
    ctx.reply("Tug'ilgan kuningizni quyidagi formatda yuboring:\n\n**KK.OO.YYYY**\nMasalan: `15.05.1995`", { parse_mode: "Markdown" });
});

bot.callbackQuery("check_status", (ctx) => {
    const userId = ctx.from.id;
    if (!users[userId]) {
        return ctx.reply("Siz hali sanani kiritmagansiz.");
    }
    const info = calculateRemaining(users[userId].date);
    ctx.reply(`Sizning tug'ilgan kuningiz: ${users[userId].date}\n\nQoldi: ${info.days} kun, ${info.months} oy va ${info.years} yil.`);
});

// Sanani qabul qilish
bot.on("message:text", (ctx) => {
    const text = ctx.message.text;
    const regex = /^\d{2}\.\d{2}\.\d{4}$/; // KK.OO.YYYY formatini tekshirish

    if (regex.test(text)) {
        users[ctx.from.id] = {
            chatId: ctx.chat.id,
            date: text
        };
        ctx.reply(`Rahmat! Sanangiz saqlandi: ${text}\nMen har kuni ertalab sizga eslatma yuboraman. ✅`);
    } else if (text.includes("http")) {
        ctx.reply("Kechirasiz, hozircha video yuklash funksiyasi to'xtatilgan.");
    }
});

// Vaqtni hisoblash funksiyasi
function calculateRemaining(birthdayStr) {
    const [day, month, year] = birthdayStr.split('.').map(Number);
    const now = new Date();
    let nextBirthday = new Date(now.getFullYear(), month - 1, day);

    if (nextBirthday < now) {
        nextBirthday.setFullYear(now.getFullYear() + 1);
    }

    const diff = nextBirthday - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // Oddiy kunlarni hisoblash
    return {
        days: days,
        months: Math.floor(days / 30), // Taxminiy
        years: now.getFullYear() - year
    };
}

// HAR KUNI ERTALAB SOAT 09:00 DA HABAR YUBORISH (Cron Job)
cron.schedule("0 9 * * *", () => {
    console.log("Eslatmalar yuborilmoqda...");
    for (const userId in users) {
        const user = users[userId];
        const info = calculateRemaining(user.date);
        
        let message = `🎉 Tug'ilgan kuningizga ${info.days} kun qoldi!`;
        if (info.days === 0) message = "🥳 BUGUN SIZNING TUG'ILGAN KUNINGIZ! Tabriklaymiz! 🎂";
        
        bot.api.sendMessage(user.chatId, message).catch(err => console.error(err));
    }
}, {
    timezone: "Asia/Tashkent"
});

bot.start();
