const express = require('express');
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// Render uchun port sozlamalari
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Web server port ${PORT} da yondi`);
});

// TOKEN va Kanal ma'lumotlari
const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";
const CHANNEL = "@avtomess";

// DIQQAT: polling: true bo'lishi shart!
const bot = new TelegramBot(TOKEN, { polling: true });

async function sendPrices(){
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
    const { data } = await axios.get(url, { timeout: 10000 });

    const btc = data.bitcoin.usd;
    const eth = data.ethereum.usd;
    const sol = data.solana.usd;

    const btcChange = data.bitcoin.usd_24h_change.toFixed(2);
    const ethChange = data.ethereum.usd_24h_change.toFixed(2);
    const solChange = data.solana.usd_24h_change.toFixed(2);

    const btcIcon = btcChange >= 0 ? "🟢" : "🔴";
    const ethIcon = ethChange >= 0 ? "🟢" : "🔴";
    const solIcon = solChange >= 0 ? "🟢" : "🔴";

    const message = `📊 CRYPTO MARKET\n\n₿ BTC: $${btc}\n${btcIcon} 24h: ${btcChange}%\n\n⟠ ETH: $${eth}\n${ethIcon} 24h: ${ethChange}%\n\n◎ SOL: $${sol}\n${solIcon} 24h: ${solChange}%\n\n⏱ ${new Date().toLocaleTimeString()}`;

    await bot.sendMessage(CHANNEL, message);
    console.log("Post yuborildi");

  } catch (err) {
    console.log("API yoki Bot xatosi:", err.message);
  }
}

// Har 60 soniyada narxlarni yuborish
setInterval(sendPrices, 60000);

console.log("Crypto bot polling rejimida ishga tushdi");
