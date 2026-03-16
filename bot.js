const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is strictly Alive!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

// Polling xatolarini tutish uchun sozlama
const bot = new TelegramBot(TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  }
});

async function sendPrices() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,the-open-network&vs_currencies=usd&include_24hr_change=true";
    
    // API dan ma'lumot olishda 15 soniya kutish limiti
    const { data } = await axios.get(url, { timeout: 15000 });

    const getIcon = (change) => (change >= 0 ? "📈" : "📉");

    const message = 
      `₿ BTC: $${data.bitcoin.usd}  ${getIcon(data.bitcoin.usd_24h_change)} ${data.bitcoin.usd_24h_change.toFixed(2)}%\n\n` +
      `⟠ ETH: $${data.ethereum.usd}  ${getIcon(data.ethereum.usd_24h_change)} ${data.ethereum.usd_24h_change.toFixed(2)}%\n\n` +
      `◎ SOL: $${data.solana.usd}  ${getIcon(data.solana.usd_24h_change)} ${data.solana.usd_24h_change.toFixed(2)}%\n\n` +
      `💎 TON: $${data['the-open-network'].usd}  ${getIcon(data['the-open-network'].usd_24h_change)} ${data['the-open-network'].usd_24h_change.toFixed(2)}%`;

    await bot.sendMessage(CHANNEL, message, { 
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [[{ text: "📊 Batafsil grafika", url: "https://t.me/avtomess" }]]
      }
    });
    
    console.log("Muvaffaqiyatli yuborildi: " + new Date().toLocaleTimeString());

  } catch (err) {
    // Agar API xato bersa, bot o'chib qolmaydi, shunchaki konsolga yozadi
    console.error("Xatolik yuz berdi (API yoki Tarmoq):", err.message);
  }
}

// Polling xatolarini tutish (Bot to'xtab qolmasligi uchun eng muhimi)
bot.on('polling_error', (error) => {
  console.log("Telegram Polling xatosi:", error.code); 
});

// Xatolarni global darajada tutish
process.on('uncaughtException', (err) => {
  console.log('Kutilmagan xato (Crash oldi olindi):', err);
});

setInterval(sendPrices, 60000);
sendPrices();
