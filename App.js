import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";

import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { WalletProvider } from "./src/context/WalletContext";

export default function App() {
  return (
    <WalletProvider>
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </WalletProvider>
  );
}
