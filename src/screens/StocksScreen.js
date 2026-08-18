import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import PriceChart from "../components/PriceChart";
import { useWallet } from "../context/WalletContext";


// ✅ MOCK LIVE NSE MARKET
const STOCK_LIST = [
  { symbol: "RELIANCE", name: "Reliance", price: 2865 },
  { symbol: "TCS", name: "TCS", price: 3920 },
  { symbol: "INFY", name: "Infosys", price: 1640 },
  { symbol: "HDFC", name: "HDFC Bank", price: 1685 },
  { symbol: "ICICI", name: "ICICI Bank", price: 1120 },
];

export default function StocksScreen() {
  const { state, buyStock, sellStock } = useWallet();

  const [market, setMarket] = useState(STOCK_LIST);
  const [chartData, setChartData] = useState([STOCK_LIST[0].price]);
  const [selectedStock, setSelectedStock] = useState(STOCK_LIST[0]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return market;
    const q = search.toLowerCase();
    return market.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.symbol.toLowerCase().includes(q)
    );
  }, [market, search]);

  // ================= LIVE PRICE SIMULATION =================

  useEffect(() => {
    const interval = setInterval(() => {
      setMarket((prev) =>
        prev.map((stock) => {
          const move = (Math.random() - 0.5) * 15; // small real-looking movement
          const newPrice = Math.max(1, stock.price + move);

          return {
            ...stock,
            price: Number(newPrice.toFixed(2)),
            change: Number(move.toFixed(2)),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ================= CHART UPDATE =================

  useEffect(() => {
    const s = market.find(m => m.symbol === selectedStock.symbol);
    if (!s) return;

    setChartData((prev) => {
      const updated = [...prev, s.price];
      return updated.slice(-30); // keep last 30 points
    });
  }, [market]);

  // ================= BUY / SELL =================

  const handleBuy = (stock) => {
    const qty = 1;

    const res = buyStock({
      symbol: stock.symbol,
      priceINR: stock.price,
      qty,
    });

    if (!res?.ok) Alert.alert("Buy Failed", res?.msg);
  };

  const handleSell = (stock) => {
    const holding = state.stockHoldings?.[stock.symbol];

    if (!holding)
      return Alert.alert("Sell Failed", "No holdings for this stock");

    const qty = Math.min(holding.qty, 1);

    const res = sellStock({
      symbol: stock.symbol,
      priceINR: stock.price,
      qty,
    });

    if (!res?.ok) Alert.alert("Sell Failed", res?.msg);
  };

  // ================= UI =================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📈 Stocks</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.symbol}
        ListHeaderComponent={
          <>
            {/* Wallet */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>DEFINN Wallet</Text>
              <Text style={styles.bigText}>
                ₹ {state.balanceINR.toFixed(2)}
              </Text>
            </View>

            {/* Holdings */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Stocks</Text>

              {Object.keys(state.stockHoldings || {}).length === 0 ? (
                <Text style={{ color: "#555", marginTop: 6 }}>
                  No stock holdings yet.
                </Text>
              ) : (
                Object.entries(state.stockHoldings).map(([sym, h]) => (
                  <Text key={sym} style={{ marginTop: 6, fontWeight: "800" }}>
                    {sym} → Qty {h.qty} @ ₹{h.avgPrice.toFixed(2)}
                  </Text>
                ))
              )}
            </View>

            {/* 📊 Live Chart */}
            <PriceChart prices={chartData} />

            {/* Search */}
            <View style={styles.card}>
              <TextInput
                placeholder="Search stock..."
                value={search}
                onChangeText={setSearch}
                style={styles.search}
              />
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedStock(item)}>
            <View style={styles.marketRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900" }}>
                  {item.symbol} • {item.name}
                </Text>

                <Text style={{ color: "#444", marginTop: 2 }}>
                  ₹{item.price.toFixed(2)}
                </Text>

                <Text
                  style={{
                    fontWeight: "900",
                    marginTop: 2,
                    color: (item.change ?? 0) >= 0 ? "green" : "red",

                  }}
                >
                  {item.change >= 0 ? "+" : ""}
                  {(item.change ?? 0).toFixed(2)}

                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { marginTop: 0 }]}
                  onPress={() => handleBuy(item)}
                >
                  <Text style={styles.primaryBtnText}>Buy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sellBtn, { marginTop: 0 }]}
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
    marginBottom: 12
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

  search: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
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

  primaryBtn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 12,
  },

  primaryBtnText: { color: "#fff", fontWeight: "900" },

  sellBtn: {
    backgroundColor: "#d11",
    padding: 10,
    borderRadius: 12,
  },

  sellBtnText: { color: "#fff", fontWeight: "900" },
});
