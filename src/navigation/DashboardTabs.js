import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, Text } from "react-native";

import CryptoScreen from "../screens/CryptoScreen";
import PaymentScreen from "../screens/PaymentScreen";
import PortfolioScreen from "../screens/PortfolioScreen";
import StocksScreen from "../screens/StocksScreen";

const Tab = createBottomTabNavigator();

export default function DashboardTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerTitle: "DEFINN Dashboard",
        headerRight: () => (
          <Pressable
            onPress={() => setIsLoggedIn(false)}
            style={{ marginRight: 14 }}
          >
            <Text style={{ fontWeight: "700", color: "#d11" }}>Logout</Text>
          </Pressable>
        ),
      }}
    >
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Payment" component={PaymentScreen} />
      <Tab.Screen name="Crypto" component={CryptoScreen} />
      <Tab.Screen name="Stocks" component={StocksScreen} />
    </Tab.Navigator>
  );
}
