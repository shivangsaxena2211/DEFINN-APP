import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardTabs from "./DashboardTabs";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>

          <Stack.Screen name="Signup">
            {(props) => <SignupScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="Dashboard">
          {(props) => <DashboardTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
