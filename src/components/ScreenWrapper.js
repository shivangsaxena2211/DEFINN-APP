import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { GRADIENTS } from "../theme/gradients";

export default function ScreenWrapper({ children }) {
  return (
    <LinearGradient colors={GRADIENTS.background} style={styles.container}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
});
