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
  // --- TOP KRIPTO (Asosiylar) ---
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

  // --- AKSIYALAR (Tokenized Stocks) ---
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

  // --- METALLAR ---
  { id: "@avtomess", coin: "pax-gold", symbol: "🟡 OLTIN (Gold)" },
  { id: "@avtomess", coin: "tether-silver", symbol: "⚪ KUMUSH (Silver)" },

  // --- AI & TEXNOLOGIYA (Sun'iy Intellekt) ---
  { id: "@avtomess", coin: "fetch-ai", symbol: "🤖 FET (AI)" },
  { id: "@avtomess", coin: "render-token", symbol: "🎨 RNDR" },
  { id: "@avtomess", coin: "the-graph", symbol: "📊 GRT" },
  { id: "@avtomess", coin: "singularitynet", symbol: "🧠 AGIX" },
  { id: "@avtomess", coin: "ocean-protocol", symbol: "🌊 OCEAN" },
  { id: "@avtomess", coin: "bittensor", symbol: "🕸️ TAO" },
  { id: "@avtomess", coin: "akash-network", symbol: "☁️ AKT" },
  { id: "@avtomess", coin: "worldcoin-wld", symbol: "👁️ WLD" },

  // --- TON EKOTIZIMI VA MEMLAR ---
  { id: "@avtomess", coin: "notcoin", symbol: "🔳 NOT" },
  { id: "@avtomess", coin: "hamster-kombat", symbol: "🐹 HMSTR" },
  { id: "@avtomess", coin: "dogs", symbol: "🦴 DOGS" },
  { id: "@avtomess", coin: "pepe", symbol: "🐸 PEPE" },
  { id: "@avtomess", coin: "shiba-inu", symbol: "🐕 SHIB" },
  { id: "@avtomess", coin: "bonk", symbol: "🦴 BONK" },
  { id: "@avtomess", coin: "floki", symbol: "⚔️ FLOKI" },
  { id: "@avtomess", coin: "dogwifhat", symbol: "👒 WIF" },
  { id: "@avtomess", coin: "catizen", symbol: "🐈 CATI" },

  // --- LAYER 1 & LAYER 2 (Yangi tarmoqlar) ---
  { id: "@avtomess", coin: "aptos", symbol: "🪐 APT" },
  { id: "@avtomess", coin: "sui", symbol: "💧 SUI" },
  { id: "@avtomess", coin: "optimism", symbol: "🔴 OP" },
  { id: "@avtomess", coin: "arbitrum", symbol: "💙 ARB" },
  { id: "@avtomess", coin: "celestia", symbol: "🌌 TIA" },
  { id: "@avtomess", coin: "sei-network", symbol: "🚢 SEI" },
  { id: "@avtomess", coin: "injective-protocol", symbol: "💉 INJ" },
  { id: "@avtomess", coin: "fantom", symbol: "👻 FTM" },
  { id: "@avtomess", coin: "cosmos", symbol: "⚛️ ATOM" },
  { id: "@avtomess", coin: "kaspa", symbol: "💎 KAS" },

  // --- DEFI VA BOSHQALAR ---
  { id: "@avtomess", coin: "aave", symbol: "👻 AAVE" },
  { id: "@avtomess", coin: "maker", symbol: "🏗️ MKR" },
  { id: "@avtomess", coin: "lido-dao", symbol: "💧 LDO" },
  { id: "@avtomess", coin: "jupiter-exchange-solana", symbol: "🪐 JUP" },
  { id: "@avtomess", coin: "pancakeswap-token", symbol: "🥞 CAKE" },
  { id: "@avtomess", coin: "thorchain", symbol: "⚡ RUNE" },
  { id: "@avtomess", coin: "pyth-network", symbol: "🔮 PYTH" },
  { id: "@avtomess", coin: "helium", symbol: "🎈 HNT" },
  { id: "@avtomess", coin: "quant-network", symbol: "🔑 QNT" },
  { id: "@avtomess", coin: "vechain", symbol: "🔗 VET" },
  { id: "@avtomess", coin: "algorand", symbol: "🅰️ ALGO" },
  { id: "@avtomess", coin: "fantom", symbol: "👻 FTM" },
  { id: "@avtomess", coin: "eos", symbol: "📑 EOS" },
  { id: "@avtomess", coin: "flow", symbol: "🌊 FLOW" },
  { id: "@avtomess", coin: "theta-token", symbol: "🎥 THETA" },
  { id: "@avtomess", coin: "multiversx-egld", symbol: "🌐 EGLD" },
  { id: "@avtomess", coin: "tezos", symbol: "ꜩ XTZ" },
  { id: "@avtomess", coin: "chiliz", symbol: "🌶️ CHZ" },
  { id: "@avtomess", coin: "axie-infinity", symbol: "👾 AXS" },
  { id: "@avtomess", coin: "the-sandbox", symbol: "🏝️ SAND" },
  { id: "@avtomess", coin: "decentraland", symbol: "🏛️ MANA" },
  { id: "@avtomess", coin: "gala", symbol: "🎮 GALA" },
  { id: "@avtomess", coin: "mina-protocol", symbol: "☁️ MINA" },
  { id: "@avtomess", coin: "iota", symbol: "🤖 IOTA" },
  { id: "@avtomess", coin: "neo", symbol: "💚 NEO" },
  { id: "@avtomess", coin: "stacks", symbol: "🥞 STX" },
  { id: "@avtomess", coin: "hedera-hashgraph", symbol: "ℏ HBAR" },
  { id: "@avtomess", coin: "kucoin-shares", symbol: "🏦 KCS" },
  { id: "@avtomess", coin: "gatechain-token", symbol: "🏦 GT" },
  { id: "@avtomess", coin: "ethena", symbol: "🏛️ ENA" },
  { id: "@avtomess", coin: "mantle", symbol: "🧤 MNT" },
  { id: "@avtomess", coin: "pendle", symbol: "💧 PENDLE" },
  { id: "@avtomess", coin: "synthetix-network-token", symbol: "⚔️ SNX" },
  { id: "@avtomess", coin: "curve-dao-token", symbol: "🌈 CRV" },
  { id: "@avtomess", coin: "frax-share", symbol: "❄️ FXS" },
  { id: "@avtomess", coin: "rocket-pool", symbol: "🚀 RPL" },
  { id: "@avtomess", coin: "dydx", symbol: "📈 DYDX" },
  { id: "@avtomess", coin: "1inch", symbol: "🦄 1INCH" },
  { id: "@avtomess", coin: "compound-governance-token", symbol: "🏦 COMP" },
  { id: "@avtomess", coin: "zcash", symbol: "🛡️ ZEC" }
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

setInterval(sendPrices, 90000);
sendPrices();
