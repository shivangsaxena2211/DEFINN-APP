import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "@definn_wallet_state_v1";

const WalletContext = createContext(null);

const defaultState = {
  balanceINR: 5000, // demo start balance
  cryptoHoldings: {}, // { btc: { qty, avgPrice }, eth: {...} }
  stockHoldings: {},  // { tcs: { qty, avgPrice }, ... }
  trades: [],         // unified history
};

export function WalletProvider({ children }) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(JSON.parse(raw));
      } catch (e) {
        console.log("Wallet load error:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save state
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const api = useMemo(() => {
    const addMoney = (amount) => {
      const amt = Number(amount);
      if (!amt || amt <= 0) return false;
      setState((s) => ({ ...s, balanceINR: s.balanceINR + amt }));
      return true;
    };

    const resetWallet = async () => {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState(defaultState);
    };

    // ==== CRYPTO BUY/SELL ====
    const buyCrypto = ({ symbol, priceINR, qty }) => {
      const q = Number(qty);
      const p = Number(priceINR);
      if (!symbol || q <= 0 || p <= 0) return { ok: false, msg: "Invalid trade" };

      const cost = q * p;
      if (state.balanceINR < cost) return { ok: false, msg: "Insufficient INR balance" };

      setState((s) => {
        const sym = symbol.toLowerCase();
        const prev = s.cryptoHoldings[sym] || { qty: 0, avgPrice: 0 };

        const newQty = prev.qty + q;
        const newAvg =
          newQty === 0 ? 0 : (prev.qty * prev.avgPrice + q * p) / newQty;

        const trade = {
          id: Date.now().toString(),
          type: "CRYPTO_BUY",
          symbol: sym,
          qty: q,
          priceINR: p,
          totalINR: cost,
          ts: new Date().toISOString(),
        };

        return {
          ...s,
          balanceINR: s.balanceINR - cost,
          cryptoHoldings: {
            ...s.cryptoHoldings,
            [sym]: { qty: newQty, avgPrice: newAvg },
          },
          trades: [trade, ...s.trades],
        };
      });

      return { ok: true };
    };

    const sellCrypto = ({ symbol, priceINR, qty }) => {
      const q = Number(qty);
      const p = Number(priceINR);
      if (!symbol || q <= 0 || p <= 0) return { ok: false, msg: "Invalid trade" };

      const sym = symbol.toLowerCase();
      const holding = state.cryptoHoldings[sym];
      if (!holding || holding.qty < q) return { ok: false, msg: "Not enough holdings" };

      const credit = q * p;

      setState((s) => {
        const prev = s.cryptoHoldings[sym];
        const remainingQty = prev.qty - q;

        const trade = {
          id: Date.now().toString(),
          type: "CRYPTO_SELL",
          symbol: sym,
          qty: q,
          priceINR: p,
          totalINR: credit,
          ts: new Date().toISOString(),
        };

        const nextHoldings = { ...s.cryptoHoldings };
        if (remainingQty <= 0) delete nextHoldings[sym];
        else nextHoldings[sym] = { ...prev, qty: remainingQty };

        return {
          ...s,
          balanceINR: s.balanceINR + credit,
          cryptoHoldings: nextHoldings,
          trades: [trade, ...s.trades],
        };
      });

      return { ok: true };
    };

    // ==== STOCK BUY/SELL (for later) ====
    const buyStock = ({ symbol, priceINR, qty }) => {
      const q = Number(qty);
      const p = Number(priceINR);
      if (!symbol || q <= 0 || p <= 0) return { ok: false, msg: "Invalid trade" };

      const cost = q * p;
      if (state.balanceINR < cost) return { ok: false, msg: "Insufficient INR balance" };

      setState((s) => {
        const sym = symbol.toLowerCase();
        const prev = s.stockHoldings[sym] || { qty: 0, avgPrice: 0 };
        const newQty = prev.qty + q;
        const newAvg =
          newQty === 0 ? 0 : (prev.qty * prev.avgPrice + q * p) / newQty;

        const trade = {
          id: Date.now().toString(),
          type: "STOCK_BUY",
          symbol: sym,
          qty: q,
          priceINR: p,
          totalINR: cost,
          ts: new Date().toISOString(),
        };

        return {
          ...s,
          balanceINR: s.balanceINR - cost,
          stockHoldings: { ...s.stockHoldings, [sym]: { qty: newQty, avgPrice: newAvg } },
          trades: [trade, ...s.trades],
        };
      });

      return { ok: true };
    };

    const sellStock = ({ symbol, priceINR, qty }) => {
      const q = Number(qty);
      const p = Number(priceINR);
      if (!symbol || q <= 0 || p <= 0) return { ok: false, msg: "Invalid trade" };

      const sym = symbol.toLowerCase();
      const holding = state.stockHoldings[sym];
      if (!holding || holding.qty < q) return { ok: false, msg: "Not enough holdings" };

      const credit = q * p;

      setState((s) => {
        const prev = s.stockHoldings[sym];
        const remainingQty = prev.qty - q;

        const trade = {
          id: Date.now().toString(),
          type: "STOCK_SELL",
          symbol: sym,
          qty: q,
          priceINR: p,
          totalINR: credit,
          ts: new Date().toISOString(),
        };

        const nextHoldings = { ...s.stockHoldings };
        if (remainingQty <= 0) delete nextHoldings[sym];
        else nextHoldings[sym] = { ...prev, qty: remainingQty };

        return {
          ...s,
          balanceINR: s.balanceINR + credit,
          stockHoldings: nextHoldings,
          trades: [trade, ...s.trades],
        };
      });

      return { ok: true };
    };

    return {
      state,
      addMoney,
      buyCrypto,
      sellCrypto,
      buyStock,
      sellStock,
      resetWallet,
    };
  }, [state, loaded]);

  return <WalletContext.Provider value={api}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
