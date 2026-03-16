const express = require('express');
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Crypto & Stocks Bot is Active!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));

const TOKEN = "8263789071:AAGDkuduxX0qOfpU9uKIRYJYz_9IEYA6LWg";

const CHANNELS_CONFIG = [
  { id: "@avtomess", coin: "bitcoin", symbol: "₿ BTC" },
  { id: "@avtomess", coin: "ethereum", symbol: "⟠ ETH" },
  { id: "@avtomess", coin: "solana", symbol: "◎ SOL" },
  { id: "@avtomess", coin: "the-open-network", symbol: "💎 TON" },
  { id: "@avtomess", coin: "binancecoin", symbol: "🔶 BNB" },
  { id: "@avtomess", coin: "ripple", symbol: "✖️ XRP" },
  { id: "@avtomess", coin: "cardano", symbol: "₳ ADA" },
  { id: "@avtomess", coin: "dogecoin", symbol: "🐕 DOGE" },
  { id: "@avtomess", coin: "tron", symbol: "💎 TRX" },
  { id: "@avtomess", coin: "avalanche-2", symbol: "🔺 AVAX" },
  { id: "@avtomess", coin: "polkadot", symbol: "🔘 DOT" },
  { id: "@avtomess", coin: "chainlink", symbol: "🔗 LINK" },
  { id: "@avtomess", coin: "near", symbol: "Ⓝ NEAR" },
  { id: "@avtomess", coin: "matic-network", symbol: "🟣 MATIC" },
  { id: "@avtomess", coin: "litecoin", symbol: "Ł LTC" },
  { id: "@avtomess", coin: "uniswap", symbol: "🦄 UNI" },
  { id: "@avtomess", coin: "stellar", symbol: "🚀 XLM" },
  { id: "@avtomess", coin: "monero", symbol: "🔒 XMR" },
  { id: "@avtomess", coin: "ethereum-classic", symbol: "⟠ ETC" },
  { id: "@avtomess", coin: "okb", symbol: "🟦 OKB" },

  // --- AKSIYALAR ---
  { id: "@avtomess", coin: "apple-tokenized-stock-bittrex", symbol: "🍏 APPLE" },
  { id: "@avtomess", coin: "tesla-tokenized-stock-bittrex", symbol: "⚡ TESLA" },
  { id: "@avtomess", coin: "nvidia-tokenized-stock-bittrex", symbol: "🎮 NVIDIA" },
  { id: "@avtomess", coin: "amazon-tokenized-stock-bittrex", symbol: "📦 AMAZON" },
  { id: "@avtomess", coin: "microsoft-tokenized-stock-bittrex", symbol: "💻 MSFT" },
  { id: "@avtomess", coin: "google-tokenized-stock-bittrex", symbol: "🔍 GOOGLE" },
  { id: "@avtomess", coin: "meta-platforms-tokenized-stock-bittrex", symbol: "♾️ META" },
  { id: "@avtomess", coin: "netflix-tokenized-stock-bittrex", symbol: "🎬 NETFLIX" },
  { id: "@avtomess", coin: "alibaba-tokenized-stock-bittrex", symbol: "🏮 ALIBABA" },
  { id: "@avtomess", coin: "coinbase-global-tokenized-stock-bittrex", symbol: "🏦 COINBASE" },
  { id: "@avtomess", coin: "oil-tokenized-stock-bittrex", symbol: "🛢 NEFT (Oil)" },

  // --- METALLAR ---
  { id: "@avtomess", coin: "pax-gold", symbol: "🟡 OLTIN (Gold)" },
  { id: "@avtomess", coin: "tether-silver", symbol: "⚪ KUMUSH (Silver)" },

  // --- AI ---
  { id: "@avtomess", coin: "fetch-ai", symbol: "🤖 FET (AI)" },
  { id: "@avtomess", coin: "render-token", symbol: "🎨 RNDR" },
  { id: "@avtomess", coin: "the-graph", symbol: "📊 GRT" },
  { id: "@avtomess", coin: "singularitynet", symbol: "🧠 AGIX" },
  { id: "@avtomess", coin: "ocean-protocol", symbol: "🌊 OCEAN" },
  { id: "@avtomess", coin: "bittensor", symbol: "🕸️ TAO" },
  { id: "@avtomess", coin: "akash-network", symbol: "☁️ AKT" },
  { id: "@avtomess", coin: "worldcoin-wld", symbol: "👁️ WLD" },

  // --- TON & MEMS ---
  { id: "@avtomess", coin: "notcoin", symbol: "🔳 NOT" },
  { id: "@avtomess", coin: "hamster-kombat", symbol: "🐹 HMSTR" },
  { id: "@avtomess", coin: "dogs", symbol: "🦴 DOGS" },
  { id: "@avtomess", coin: "pepe", symbol: "🐸 PEPE" },
  { id: "@avtomess", coin: "shiba-inu", symbol: "🐕 SHIB" },
  { id: "@avtomess", coin: "bonk", symbol: "🦴 BONK" },
  { id: "@avtomess", coin: "floki", symbol: "⚔️ FLOKI" },
  { id: "@avtomess", coin: "dogwifhat", symbol: "👒 WIF" },
  { id: "@avtomess", coin: "catizen", symbol: "🐈 CATI" },

  // --- L1 & L2 ---
  { id: "@avtomess", coin: "aptos", symbol: "🪐 APT" },
  { id: "@avtomess", coin: "sui", symbol: "💧 SUI" },
  { id: "@avtomess", coin: "optimism", symbol: "🔴 OP" },
  { id: "@avtomess", coin: "arbitrum", symbol: "💙 ARB" },
  { id: "@avtomess", coin: "celestia", symbol: "🌌 TIA" },
  { id: "@avtomess", coin: "sei-network", symbol: "🚢 SEI" },
  { id: "@avtomess", coin: "injective-protocol", symbol: "💉 INJ" },
  { id: "@avtomess", coin: "fantom", symbol: "👻 FTM" },
  { id: "@avtomess", coin: "cosmos", symbol: "⚛️ ATOM" },
  { id: "@avtomess", coin: "kaspa", symbol: "💎 KAS" }
];

const bot = new TelegramBot(TOKEN, { polling: true });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendPrices() {
  try {
    // 20 tadan bo'laklab so'rash (Chunking)
    const chunkSize = 20;
    for (let i = 0; i < CHANNELS_CONFIG.length; i += chunkSize) {
      const chunk = CHANNELS_CONFIG.slice(i, i + chunkSize);
      const coinIds = [...new Set(chunk.map(c => c.coin))].join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`;
      
      try {
        const { data } = await axios.get(url, { timeout: 15000 });
        const getIcon = (change) => (change >= 0 ? "📈 +" : "📉 ");

        for (const item of chunk) {
          const coinData = data[item.coin];
          if (!coinData || coinData.usd === undefined) continue;

          const change = coinData.usd_24h_change ? coinData.usd_24h_change.toFixed(2) : "0.00";
          const text = `${item.symbol}: $${coinData.usd} (${getIcon(coinData.usd_24h_change)}${change}%)`;

          try {
            await bot.sendMessage(item.id, text);
          } catch (e) {
            console.error(`Xato: ${item.id}`);
          }
          await sleep(800); // Telegram spamga tushmasligi uchun
        }
      } catch (apiErr) {
        console.error("API xatosi:", apiErr.message);
      }
      await sleep(2000); // Bo'laklar orasida 2s kutish
    }
  } catch (err) {
    console.error("Global xato:", err.message);
  }
}

setInterval(sendPrices, 90000); // 1.5 minutda bir marta (63 ta uchun ideal)
sendPrices();
