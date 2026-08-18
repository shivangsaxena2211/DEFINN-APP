import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function PriceChart({ prices }) {
  const screenWidth = Dimensions.get("window").width - 32;

  if (!prices || prices.length === 0) return null;

  const trimmed =
    prices.length > 40
      ? prices.filter((_, i) => i % 3 === 0)
      : prices;

  return (
    <View style={{ marginBottom: 14 }}>
      <LineChart
        data={{
          labels: trimmed.map((_, i) => ""),
          datasets: [
            {
              data: trimmed,
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth}
        height={200}
        withDots={false}          // 👈 cleaner
        withInnerLines={false}   // 👈 remove clutter
        withOuterLines={false}
        withVerticalLabels={false}

        chartConfig={{
          backgroundGradientFrom: "#0f0f0f",
          backgroundGradientTo: "#0f0f0f",

          decimalPlaces: 2,

          color: () => "#22c55e",   // nice green
          labelColor: () => "#aaa",

          propsForBackgroundLines: {
            stroke: "#222",
          },

          propsForLabels: {
            fontSize: 10,
          },
        }}

        style={{
          borderRadius: 16,
          paddingRight: 20,
        }}

        bezier
      />
    </View>
  );
}
