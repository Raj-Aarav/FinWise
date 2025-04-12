
import React, { createContext, useContext, useState } from 'react';

const FinanceContext = createContext<any>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions] = useState([]);
  const [budgets] = useState([]);
  const [goals] = useState([]);
  const [aiTips] = useState([]);

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      goals,
      aiTips,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);
