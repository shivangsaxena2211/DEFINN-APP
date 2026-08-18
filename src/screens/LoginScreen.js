import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // demo login (hackathon)
    if (email.trim() && password.trim()) {
      setIsLoggedIn(true);
    } else {
      alert("Enter email & password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>DEFINN</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Don’t have an account? Signup</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  logo: { fontSize: 42, fontWeight: "900", textAlign: "center" },
  subtitle: { textAlign: "center", marginTop: 8, marginBottom: 20, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 12, marginTop: 6 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "800" },
  link: { marginTop: 16, textAlign: "center", color: "#2563eb", fontWeight: "700" },
});
