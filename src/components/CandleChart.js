import { View } from "react-native";
import { Grid, LineChart } from "react-native-svg-charts";

export default function CandleChart({ data }) {
  if (!data || data.length === 0) return null;

  const closes = data.map((c) => c.close ?? c); // supports both formats

  return (
    <View style={{ height: 220, marginVertical: 10 }}>
      <LineChart
        style={{ flex: 1 }}
        data={closes}
        svg={{ stroke: "#2ecc71", strokeWidth: 2 }}
        contentInset={{ top: 20, bottom: 20 }}
      >
        <Grid />
      </LineChart>
    </View>
  );
}
