const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000; // Render odatda 10000 portni ishlatadi

// Render uchun "tiriklik" yo'lagi
app.get('/', (req, res) => {
  res.status(200).send('Bot is Alive!');
});

// Serverni ishga tushirish (0.0.0.0 majburiy!)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server is running on port ${PORT}`);
});

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

// Pollingni yoqamiz
const bot = new TelegramBot(TOKEN, { polling: true });

async function sendPrices() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
    const { data } = await axios.get(url);

    const message = `📊 CRYPTO MARKET\n\n` +
      `₿ BTC: $${data.bitcoin.usd} (${data.bitcoin.usd_24h_change.toFixed(2)}%)\n` +
      `⟠ ETH: $${data.ethereum.usd} (${data.ethereum.usd_24h_change.toFixed(2)}%)\n` +
      `◎ SOL: $${data.solana.usd} (${data.solana.usd_24h_change.toFixed(2)}%)\n\n` +
      `⏱ ${new Date().toLocaleTimeString('uz-UZ')}`;

    await bot.sendMessage(CHANNEL, message);
    console.log("Xabar yuborildi!");
  } catch (err) {
    console.log("Xato yuz berdi:", err.message);
  }
}

// Bot yonganda darhol yuborsin
sendPrices();
// Har 2 daqiqada (120000 ms) takrorlansin (Render bepul tarifida tez-tez so'rov yuborishni cheklashi mumkin)
setInterval(sendPrices, 60000);

// Crash bo'lmasligi uchun xatolarni tutish
bot.on('polling_error', (error) => console.log('Polling xatosi:', error.code));
