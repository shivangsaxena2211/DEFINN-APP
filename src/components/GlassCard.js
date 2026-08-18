import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";

export default function GlassCard({ children, style }) {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    marginBottom: 16,
  },
});
