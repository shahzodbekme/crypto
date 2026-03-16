const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is strictly Alive!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";

// Kanallar ro'yxati (Bularni o'zingizniki bilan almashtiring)
const CHANNELS = {
  bitcoin: "@avtomess",
  ethereum: "@eth_kanalingiz",
  solana: "@sol_kanalingiz",
  ton: "@ton_kanalingiz"
};

const bot = new TelegramBot(TOKEN, { 
  polling: { interval: 300, autoStart: true } 
});

async function sendPrices() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,the-open-network&vs_currencies=usd&include_24hr_change=true";
    const { data } = await axios.get(url, { timeout: 15000 });

    const getIcon = (change) => (change >= 0 ? "+" : "-");

    // Xabarlarni yuborish uchun yordamchi funksiya
    // Bu funksiya bitta kanaldagi xatoni deb bot to'xtab qolmasligini ta'minlaydi
    const safeSend = async (channel, text) => {
      try {
        if (channel && channel.startsWith("@")) {
          await bot.sendMessage(channel, text);
        }
      } catch (e) {
        console.error(`${channel} kanaliga yuborishda xatolik: ${e.message}`);
      }
    };

    // Har bir koinni alohida yuboramiz
    await safeSend(CHANNELS.bitcoin, `₿ BTC: $${data.bitcoin.usd} ${getIcon(data.bitcoin.usd_24h_change)}${data.bitcoin.usd_24h_change.toFixed(2)}%`);
    await safeSend(CHANNELS.ethereum, `⟠ ETH: $${data.ethereum.usd} ${getIcon(data.ethereum.usd_24h_change)}${data.ethereum.usd_24h_change.toFixed(2)}%`);
    await safeSend(CHANNELS.solana, `◎ SOL: $${data.solana.usd} ${getIcon(data.solana.usd_24h_change)}${data.solana.usd_24h_change.toFixed(2)}%`);
    await safeSend(CHANNELS.ton, `💎 TON: $${data['the-open-network'].usd} ${getIcon(data['the-open-network'].usd_24h_change)}${data['the-open-network'].usd_24h_change.toFixed(2)}%`);

    console.log("Xabarlar tarqatildi: " + new Date().toLocaleTimeString());

  } catch (err) {
    console.error("Narxlarni olishda xatolik:", err.message);
  }
}

// Global xato tutuvchilar
bot.on('polling_error', (error) => console.log("Telegram ulanish xatosi:", error.code));
process.on('uncaughtException', (err) => console.log('Kutilmagan xato ushlandi:', err.message));

setInterval(sendPrices, 60000);
sendPrices();
