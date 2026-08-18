import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import PriceChart from "../components/PriceChart";

import {
  WalletConnectModal,
  useWalletConnectModal,
} from "@walletconnect/modal-react-native";




import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

const WC_PROJECT_ID = "b2baa7c61f28541b48db3ee62c304fa6";

const providerMetadata = {
  name: "DEFINN",
  description: "DEFINN Crypto Trading",
  url: "https://definn.app",
  icons: ["https://walletconnect.com/walletconnect-logo.png"],
  redirect: {
    native: "exp://",
    universal: "https://walletconnect.com",
  },
};

export default function CryptoScreen() {
  const { open, provider, isConnected, address } = useWalletConnectModal();
  const { state, buyCrypto, sellCrypto } = useWallet();

  const [market, setMarket] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ethBalance, setEthBalance] = useState(null);
  const [search, setSearch] = useState("");

  // ✅ CHART STATE
  const [chartData, setChartData] = useState([]);

  const filtered = useMemo(() => {
    if (!search.trim()) return market;
    const q = search.trim().toLowerCase();
    return market.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [market, search]);

  // ================= MARKET =================

  const fetchMarket = async () => {
    try {
      setLoading(true);
      const url =
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=25&page=1&sparkline=false";
      const res = await fetch(url);
      const data = await res.json();
      setMarket(Array.isArray(data) ? data : []);
    } catch (e) {
      alert("Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  };

  // ================= CHART =================

  const fetchChart = async (coinId) => {
    try {
      const r = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=inr&days=7`
      );
      const d = await r.json();

      if (d?.prices) {
        setChartData(d.prices.map((p) => p[1]));
      }
    } catch (e) {
      console.log("Chart error:", e);
    }
  };

  // ================= ETH BAL =================

  const fetchEthBalance = async () => {
    try {
      if (!provider || !address) return;
      const ethersProvider = new ethers.BrowserProvider(provider);
      const bal = await ethersProvider.getBalance(address);
      const eth = ethers.formatEther(bal);
      setEthBalance(Number(eth).toFixed(4));
    } catch (e) {
      console.log("Balance error:", e);
      setEthBalance(null);
    }
  };

  // ================= INIT =================

  useEffect(() => {
    fetchMarket();
    fetchChart("bitcoin"); // default chart
  }, []);

  useEffect(() => {
    if (isConnected) fetchEthBalance();
    else setEthBalance(null);
  }, [isConnected, provider, address]);

  // ================= BUY / SELL =================

  const handleBuy = (coin) => {
    const qty = coin.symbol.toLowerCase() === "btc" ? 0.001 : 0.01;

    const result = buyCrypto({
      symbol: coin.symbol,
      priceINR: coin.current_price,
      qty,
    });

    if (!result?.ok)
      Alert.alert("Buy Failed", result?.msg || "Error");
  };

  const handleSell = (coin) => {
    const holding =
      state.cryptoHoldings?.[coin.symbol.toLowerCase()];

    if (!holding)
      return Alert.alert(
        "Sell Failed",
        "You have no holdings for this coin."
      );

    const qty = Math.min(holding.qty, holding.qty * 0.5);

    const result = sellCrypto({
      symbol: coin.symbol,
      priceINR: coin.current_price,
      qty,
    });

    if (!result?.ok)
      Alert.alert("Sell Failed", result?.msg || "Error");
  };

  // ================= UI =================

  return (
  <View style={styles.container}>
    <WalletConnectModal
      projectId={WC_PROJECT_ID}
      providerMetadata={providerMetadata}
    />

    <Text style={styles.title}>🪙Crypto</Text>

    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      style={{ marginTop: 10 }}
      ListHeaderComponent={
        <>
          {/* DEFINN Wallet */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DEFINN Wallet</Text>
            <Text style={styles.bigText}>
              ₹ {state.balanceINR.toFixed(2)}
            </Text>
            <Text style={{ color: "#555", marginTop: 4 }}>
              
            </Text>
          </View>

          {/* MetaMask */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connect Wallet</Text>

            {!isConnected ? (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => open()}
              >
                <Text style={styles.primaryBtnText}>
                  Connect Your Crypto Wallet
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.smallLabel}>Connected ✅</Text>
                <Text numberOfLines={1} style={styles.address}>
                  {address}
                </Text>

                <View style={styles.rowBetween}>
                  <Text style={styles.balance}>
                    ETH Balance: {ethBalance ?? "--"}
                  </Text>

                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={fetchEthBalance}
                  >
                    <Text style={styles.outlineBtnText}>
                      Refresh
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Holdings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Holdings</Text>

            {Object.keys(state.cryptoHoldings || {}).length === 0 ? (
              <Text style={{ color: "#555", marginTop: 6 }}>
                No crypto holdings yet.
              </Text>
            ) : (
              Object.entries(state.cryptoHoldings).map(([sym, h]) => (
                <Text
                  key={sym}
                  style={{ marginTop: 6, fontWeight: "800" }}
                >
                  {sym.toUpperCase()} → Qty {h.qty.toFixed(6)} @ ₹
                  {h.avgPrice.toFixed(2)}
                </Text>
              ))
            )}
          </View>

          {/* Chart */}
          <PriceChart prices={chartData} />

          {/* Search */}
          <View style={styles.card}>
            <TextInput
              placeholder="Search coin (BTC, ETH, Solana...)"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
              placeholderTextColor="#777"
            />
          </View>

          {/* Reload button */}
          <View style={[styles.card, { alignItems: "center" }]}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={fetchMarket}
            >
              <Text style={styles.outlineBtnText}>
                Reload Market
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => fetchChart(item.id)}>
          <View style={styles.marketRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontWeight: "900" }}>
                {item.symbol.toUpperCase()} • {item.name}
              </Text>

              <Text style={{ color: "#444", marginTop: 2 }}>
                ₹{item.current_price}
              </Text>

              <Text
                style={{
                  marginTop: 2,
                  fontWeight: "900",
                  color:
                    item.price_change_percentage_24h >= 0
                      ? "green"
                      : "red",
                }}
              >
                {item.price_change_percentage_24h?.toFixed(2)}%
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { marginTop: 0, paddingVertical: 10 },
                ]}
                onPress={() => handleBuy(item)}
              >
                <Text style={styles.primaryBtnText}>Buy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sellBtn,
                  { marginTop: 0, paddingVertical: 10 },
                ]}
                onPress={() => handleSell(item)}
              >
                <Text style={styles.sellBtnText}>Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
);

}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  cardTitle: { fontSize: 16, fontWeight: "900" },
  bigText: { fontSize: 24, fontWeight: "900", marginTop: 8 },

  smallLabel: {
    marginTop: 10,
    color: "#444",
    fontWeight: "700",
  },

  address: { marginTop: 4, color: "#111" },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  balance: { fontWeight: "800" },

  primaryBtn: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },

  primaryBtnText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },

  sellBtn: {
    backgroundColor: "#d11",
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
  },

  sellBtnText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },

  outlineBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  outlineBtnText: { fontWeight: "900" },

  search: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    color: "#111",
  },

  marketRow: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
