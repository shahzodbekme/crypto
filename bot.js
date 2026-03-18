const { Bot, InlineKeyboard } = require("grammy");
const cron = require("node-cron");
const http = require("http");
const fs = require("fs");
require("dotenv").config();

// 1. RENDER UCHUN SERVER (Cron-job orqali botni uyg'oq saqlash uchun)
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("Birthday Bot is Active!\n");
}).listen(process.env.PORT || 3000);

// 2. BOTNI SOZLASH
const bot = new Bot(process.env.BOT_TOKEN);
const DATA_FILE = "users_data.json";

// Ma'lumotlarni yuklash (Server o'chib yonsa ham saqlanib qolishi uchun)
let users = {};
if (fs.existsSync(DATA_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (e) {
        console.log("Faylni o'qishda xato, yangi ro'yxat tuziladi.");
        users = {};
    }
}

// Ma'lumotlarni saqlash funksiyasi
function saveUsers() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
}

// 3. ASOSIY MENYU
const mainMenu = new InlineKeyboard()
    .text("📅 Sana kiritish", "set_birthday")
    .text("📊 Holatni ko'rish", "check_status");

bot.command("start", (ctx) => {
    ctx.reply(`Salom ${ctx.from.first_name}! 👋\nMen tug'ilgan kuningizgacha qolgan vaqtni hisoblab boraman va har kuni 09:00 da eslatma yuboraman.`, {
        reply_markup: mainMenu
    });
});

// 4. TUGMALARGA JAVOB
bot.callbackQuery("set_birthday", (ctx) => {
    ctx.reply("Tug'ilgan kuningizni mana bu formatda yozing:\n\n**KK.OO.YYYY**\n(Masalan: `25.12.2000`)", { parse_mode: "Markdown" });
});

bot.callbackQuery("check_status", (ctx) => {
    const userId = ctx.from.id;
    if (!users[userId]) {
        return ctx.reply("Siz hali tug'ilgan kuningizni kiritmagansiz. 📅");
    }
    const info = calculateRemaining(users[userId].date);
    ctx.reply(`📅 Sizning sanangiz: ${users[userId].date}\n⏳ Tug'ilgan kuningizga **${info.days} kun** qoldi!`, { parse_mode: "Markdown" });
});

// 5. SANANI QABUL QILISH VA TEKSHIRISH
bot.on("message:text", (ctx) => {
    const text = ctx.message.text;
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/; // Format: 00.00.0000

    if (dateRegex.test(text)) {
        users[ctx.from.id] = {
            chatId: ctx.chat.id,
            name: ctx.from.first_name,
            date: text
        };
        saveUsers(); // Faylga yozish
        ctx.reply(`✅ Rahmat! ${text} sanasi saqlandi.\nEndi har kuni soat 09:00 da eslatma yuboraman.`);
    } else {
        ctx.reply("Iltimos, sanani to'g'ri formatda yuboring: **KK.OO.YYYY**", { parse_mode: "Markdown" });
    }
});

// 6. VAQTNI HISOBLASH FUNKSIYASI
function calculateRemaining(birthdayStr) {
    const [d, m, y] = birthdayStr.split('.').map(Number);
    const now = new Date();
    
    // Toshkent vaqti bilan solishtirish (UTC+5)
    let nextBday = new Date(now.getFullYear(), m - 1, d);
    
    // Agar bu yilgi tug'ilgan kun o'tib ketgan bo'lsa, kelasi yilnikini olamiz
    if (nextBday < now) {
        nextBday.setFullYear(now.getFullYear() + 1);
    }

    const diff = nextBday - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { days };
}

// 7. HAR KUNI SOAT 09:00 DA AVTOMATIK XABAR (Cron Job)
cron.schedule("0 9 * * *", () => {
    console.log("Eslatmalar yuborish boshlandi...");
    
    for (const userId in users) {
        const user = users[userId];
        const info = calculateRemaining(user.date);
        
        let message = `🔔 Eslatma: Tug'ilgan kuningizga **${info.days} kun** qoldi!`;
        
        // Agar aynan bugun bo'lsa
        if (info.days === 0 || info.days === 366) {
            message = `🥳 BUGUN SIZNING TUG'ILGAN KUNINGIZ! \n\n${user.name}, tabriklaymiz! Umringiz uzoq bo'lsin! 🎂🎉`;
        }

        bot.api.sendMessage(user.chatId, message, { parse_mode: "Markdown" })
            .catch(err => console.error(`Xabar ketmadi (${user.name}):`, err.message));
    }
}, {
    timezone: "Asia/Tashkent"
});

// 8. BOTNI ISHGA TUSHIRISH
bot.start({
    onStart: () => console.log("🚀 Tug'ilgan kun boti muvaffaqiyatli ishga tushdi!")
});
