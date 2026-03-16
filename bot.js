const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Render uchun Web Service qismi
app.get('/', (req, res) => {
  res.send('Bot is active and running!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server port ${PORT} da yondi`);
});

// Bot sozlamalari
const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

// polling: true - bot doim Telegram bilan aloqada bo'lishi uchun
const bot = new TelegramBot(TOKEN, { polling: true });

async function sendPrices() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
    const { data } = await axios.get(url, { timeout: 15000 });

    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;

    const btcChange = data.bitcoin.usd_24h_change.toFixed(2);
    const ethChange = data.ethereum.usd_24h_change.toFixed(2);
    const solChange = data.solana.usd_24h_change.toFixed(2);

    const btcIcon = btcChange >= 0 ? "🟢" : "🔴";
    const ethIcon = ethChange >= 0 ? "🟢" : "🔴";
    const solIcon = solChange >= 0 ? "🟢" : "🔴";

    const message = `📊 CRYPTO MARKET\n\n₿ BTC: $${btc}\n${btcIcon} 24h: ${btcChange}%\n\n⟠ ETH: $${eth}\n${ethIcon} 24h: ${ethChange}%\n\n◎ SOL: $${sol}\n${solIcon} 24h: ${solChange}%\n\n⏱ ${new Date().toLocaleTimeString('uz-UZ')}`;

    await bot.sendMessage(CHANNEL, message);
    console.log("Post yuborildi: " + new Date().toLocaleTimeString());

  } catch (err) {
    console.error("Xato yuz berdi:", err.message);
  }
}

// Bot yonganda darhol bir marta narxni yuborsin
sendPrices();

// Keyin har 60 soniyada qaytarsin
setInterval(sendPrices, 60000);

console.log("Crypto bot muvaffaqiyatli ishga tushdi...");

// Bot xatoga uchrab o'chib qolmasligi uchun
bot.on('polling_error', (error) => {
  console.log("Polling error:", error.code); 
});
