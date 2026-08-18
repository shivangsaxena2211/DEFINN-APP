import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { GRADIENTS } from "../theme/gradients";

export default function PrimaryButton({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={GRADIENTS.primary} style={styles.btn}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  text: {
    color: "#000",
    fontWeight: "900",
    letterSpacing: 0.8,
  },
});
