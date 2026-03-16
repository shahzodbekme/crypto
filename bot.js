const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot is strictly Alive with Queue System!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";

// Maksimal darajadagi kanallar va koinlar ro'yxati
const CHANNELS_CONFIG = [
  { id: "@avtomess", coin: "bitcoin", symbol: "₿ BTC" },
  { id: "@eth_kanalingiz", coin: "ethereum", symbol: "⟠ ETH" },
  { id: "@sol_kanalingiz", coin: "solana", symbol: "◎ SOL" },
  { id: "@ton_kanalingiz", coin: "the-open-network", symbol: "💎 TON" },
  // Yangi koin/kanallarni shu yerga qo'shib ketaverasiz
];

const bot = new TelegramBot(TOKEN, { polling: true });

// Kutish (delay) funksiyasi
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendPrices() {
  try {
    // 1. API uchun koinlar ID-larini yig'ish
    const coinIds = [...new Set(CHANNELS_CONFIG.map(c => c.coin))].join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    
    const { data } = await axios.get(url, { timeout: 15000 });
    const getIcon = (change) => (change >= 0 ? "+" : "-");

    console.log("Navbat boshlandi...");

    // 2. Queue (Navbat) mexanizmi
    for (const item of CHANNELS_CONFIG) {
      const coinData = data[item.coin];
      
      if (coinData) {
        const text = `${item.symbol}: $${coinData.usd} ${getIcon(coinData.usd_24h_change)}${coinData.usd_24h_change.toFixed(2)}%`;

        try {
          await bot.sendMessage(item.id, text);
          console.log(`Yuborildi: ${item.id}`);
        } catch (e) {
          console.error(`Xatolik ${item.id} da: ${e.message}`);
        }

        // Navbatni ushlab turish: Har bir xabardan keyin 0.5 soniya kutadi
        // Bu Telegram limitini buzmaslik uchun (max 30msg/sec)
        await sleep(500); 
      }
    }

    console.log("Barcha xabarlar navbat bilan yuborildi: " + new Date().toLocaleTimeString());

  } catch (err) {
    console.error("Narx olishda umumiy xatolik:", err.message);
  }
}

// Xato tutuvchilar
bot.on('polling_error', (error) => console.log("Polling error"));
process.on('uncaughtException', (err) => console.log('Bot crash prevention:', err.message));

// Har 60 soniyada ishga tushirish
setInterval(sendPrices, 60000);
sendPrices();
