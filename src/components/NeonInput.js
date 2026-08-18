import { StyleSheet, TextInput } from "react-native";
import { COLORS } from "../theme/colors";

export default function NeonInput(props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={COLORS.muted}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
});
