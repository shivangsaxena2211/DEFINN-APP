import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useWallet } from "../context/WalletContext";

export default function PortfolioScreen() {
  const { state } = useWallet();

  const summary = useMemo(() => {
    let cryptoValue = 0;
    let cryptoInvested = 0;

    Object.values(state.cryptoHoldings || {}).forEach((h) => {
      cryptoValue += h.qty * h.avgPrice; // simplified (demo)
      cryptoInvested += h.qty * h.avgPrice;
    });

    let stockValue = 0;
    let stockInvested = 0;

    Object.values(state.stockHoldings || {}).forEach((h) => {
      stockValue += h.qty * h.avgPrice;
      stockInvested += h.qty * h.avgPrice;
    });

    return {
      wallet: state.balanceINR,
      cryptoValue,
      stockValue,
      netWorth: state.balanceINR + cryptoValue + stockValue,
      cryptoPL: cryptoValue - cryptoInvested,
      stockPL: stockValue - stockInvested,
    };
  }, [state]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Portfolio</Text>

      {/* Net Worth */}
      <View style={styles.bigCard}>
        <Text style={styles.label}>Total Net Worth</Text>
        <Text style={styles.bigAmount}>₹ {summary.netWorth.toFixed(2)}</Text>
      </View>

      {/* Breakdown */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text>Wallet</Text>
          <Text style={styles.amount}>₹ {summary.wallet.toFixed(2)}</Text>
        </View>

        <View style={styles.card}>
          <Text>Crypto</Text>
          <Text style={styles.amount}>₹ {summary.cryptoValue.toFixed(2)}</Text>
        </View>

        <View style={styles.card}>
          <Text>Stocks</Text>
          <Text style={styles.amount}>₹ {summary.stockValue.toFixed(2)}</Text>
        </View>
      </View>

      {/* P&L */}
      <View style={styles.card}>
        <Text style={styles.label}>Profit / Loss</Text>

        <Text
          style={[
            styles.pl,
            { color: summary.cryptoPL >= 0 ? "green" : "red" },
          ]}
        >
          Crypto: ₹ {summary.cryptoPL.toFixed(2)}
        </Text>

        <Text
          style={[
            styles.pl,
            { color: summary.stockPL >= 0 ? "green" : "red" },
          ]}
        >
          Stocks: ₹ {summary.stockPL.toFixed(2)}
        </Text>
      </View>

      {/* Recent Trades */}
      <View style={styles.card}>
        <Text style={styles.label}>Recent Trades</Text>

        {state.trades.length === 0 ? (
          <Text style={{ color: "#555", marginTop: 6 }}>
            No trades yet.
          </Text>
        ) : (
          <FlatList
            data={state.trades.slice(0, 5)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.tradeRow}>
                {item.type} • {item.symbol.toUpperCase()} • ₹{item.totalINR.toFixed(2)}
              </Text>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 12 },

  bigCard: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",
  },

  label: { fontWeight: "900", fontSize: 16 },
  bigAmount: { fontSize: 32, fontWeight: "900", marginTop: 6 },

  row: { flexDirection: "row", gap: 10, marginBottom: 12 },

  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    padding: 14,
  },

  amount: { fontSize: 18, fontWeight: "900", marginTop: 4 },

  pl: { marginTop: 6, fontWeight: "900" },

  tradeRow: { marginTop: 6, fontWeight: "700" },
});
