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
];

const bot = new TelegramBot(TOKEN, { polling: true });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendPrices() {
  try {
    const coinIds = [...new Set(CHANNELS_CONFIG.map(c => c.coin))].join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
    
    // API dan ma'lumot olish
    const response = await axios.get(url, { timeout: 15000 });
    const data = response.data;

    const getIcon = (change) => (change >= 0 ? "+" : "-");

    console.log("Navbat boshlandi...");

    for (const item of CHANNELS_CONFIG) {
      const coinData = data[item.coin];
      
      // AGAR NARX KELMAGAN BO'LSA (Masalan TON'da muammo bo'lsa)
      if (!coinData || coinData.usd === undefined) {
        console.log(`⚠️ ${item.coin} narxi olinmadi, bu safar tashlab ketildi.`);
        continue; // Shu koinni tashlab, keyingi kanalga o'tadi
      }

      // Agar narx bo'lsa, xabarni tayyorlash va yuborish
      const text = `${item.symbol}: $${coinData.usd} ${getIcon(coinData.usd_24h_change)}${coinData.usd_24h_change.toFixed(2)}%`;

      try {
        await bot.sendMessage(item.id, text);
        console.log(`✅ Yuborildi: ${item.id}`);
      } catch (e) {
        console.error(`❌ Xatolik ${item.id} da: ${e.message}`);
      }

      await sleep(500); 
    }

    console.log("Sikl yakunlandi: " + new Date().toLocaleTimeString());

  } catch (err) {
    // Agar API umuman ishlamasa yoki internet uzilsa ham bot o'chmaydi
    console.error("Narx olishda umumiy xatolik (API ishlamayapti):", err.message);
  }
}

bot.on('polling_error', (error) => console.log("Polling error"));
process.on('uncaughtException', (err) => console.log('Bot crash prevention:', err.message));

setInterval(sendPrices, 60000);
sendPrices();
