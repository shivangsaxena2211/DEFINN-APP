import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";

import { useWallet } from "../context/WalletContext";

const CONTACTS = [
  { id: 1, name: "Aman" },
  { id: 2, name: "Riya" },
  { id: 3, name: "Rahul" },
];

export default function PaymentScreen() {
  const { state, addMoney } = useWallet();

  const [amt, setAmt] = useState("1000");
  const [sendAmt, setSendAmt] = useState("");
  const [receiver, setReceiver] = useState("");
  const [history, setHistory] = useState([]);

  // QR states
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // ========== ADD MONEY ==========
  const handleAddMoney = () => {
    const ok = addMoney(amt);
    if (!ok) return alert("Enter valid amount");

    setHistory(h => [
      { type: "ADD", amount: amt, to: "Wallet" },
      ...h
    ]);
  };

  // ========== SEND MONEY ==========
  const handleSend = (name, amount) => {
    if (!amount || Number(amount) <= 0)
      return alert("Enter valid amount");

    if (Number(amount) > state.balanceINR)
      return alert("Insufficient balance");

    addMoney(-Number(amount));

    setHistory(h => [
      { type: "SEND", amount, to: name },
      ...h
    ]);

    setSendAmt("");
    setReceiver("");
  };

  return (
    <View style={{ flex: 1 }}>

      {/* 📷 REAL QR SCANNER */}
      {showScanner && permission?.granted && (
        <View style={StyleSheet.absoluteFillObject}>
          <CameraView
            style={{ flex: 1 }}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              if (scanned) return;

              setScanned(true);
              setShowScanner(false);
              setReceiver(data); 
            }}
          />
        </View>
      )}

      {/* 📜 SCROLLABLE CONTENT */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >

        <Text style={styles.title}>💳 Wallet</Text>

        {/* Balance */}
        <View style={styles.card}>
          <Text style={styles.big}>₹ {state.balanceINR.toFixed(2)}</Text>
          <Text style={{ color: "#555", marginTop: 4 }}>
            Main DEFINN Balance
          </Text>
        </View>

        {/* Add Money */}
        <View style={styles.card}>
          <Text style={styles.label}>Add Money</Text>

          <TextInput
            value={amt}
            onChangeText={setAmt}
            keyboardType="numeric"
            style={styles.input}
            placeholder="Enter amount"
          />

          <TouchableOpacity style={styles.btn} onPress={handleAddMoney}>
            <Text style={styles.btnText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Send Money */}
        <View style={styles.card}>
          <Text style={styles.label}>Send Money</Text>

          <TextInput
            value={receiver}
            onChangeText={setReceiver}
            placeholder="Receiver name / QR data"
            style={styles.input}
          />

          <TextInput
            value={sendAmt}
            onChangeText={setSendAmt}
            keyboardType="numeric"
            placeholder="Amount"
            style={[styles.input, { marginTop: 8 }]}
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={() => handleSend(receiver || "Unknown", sendAmt)}
          >
            <Text style={styles.btnText}>Send</Text>
          </TouchableOpacity>
        </View>

        {/* QR Pay */}
        <View style={styles.card}>
          <Text style={styles.label}>QR Payment</Text>

          <TouchableOpacity
            style={styles.qrBtn}
            onPress={async () => {
              const perm = await requestPermission();

              if (!perm.granted) {
                alert("Camera permission required");
                return;
              }

              setScanned(false);
              setShowScanner(true);
            }}
          >
            <Text style={styles.qrText}>📷 Scan QR & Pay</Text>
          </TouchableOpacity>
        </View>

        {/* Contacts */}
        <View style={styles.card}>
          <Text style={styles.label}>Quick Contacts</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {CONTACTS.map(c => (
              <TouchableOpacity
                key={c.id}
                style={styles.contact}
                onPress={() => handleSend(c.name, 200)}
              >
                <Text style={{ fontWeight: "900" }}>{c.name}</Text>
                <Text style={{ color: "#555", fontSize: 12 }}>
                  Pay ₹200
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* History */}
        <View style={styles.card}>
          <Text style={styles.label}>Transactions</Text>

          {history.length === 0 ? (
            <Text style={{ color: "#555" }}>
              No transactions yet.
            </Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(_, i) => i.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Text style={{ marginTop: 6, fontWeight: "700" }}>
                  {item.type === "ADD" ? "➕ Added" : "➡ Sent"} ₹
                  {item.amount} {item.to ? `to ${item.to}` : ""}
                </Text>
              )}
            />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ================= STYLES =================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },

  title: {
    fontSize: 24,
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
  },

  big: { fontSize: 28, fontWeight: "900" },

  label: { fontWeight: "900", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    color: "#111",
  },

  btn: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "900",
    textAlign: "center",
  },

  qrBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  qrText: { fontWeight: "900" },

  contact: {
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    minWidth: 80,
  },
});
