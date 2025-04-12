
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { SavingsGoal } from '../models/goal';
import { AiTip, ChatMessage } from '../models/aiTip';
import { api } from '../services/api';
import { useToast } from '@/components/ui/use-toast';

type FinanceContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  aiTips: AiTip[];
  isLoading: boolean;
  addTransaction: (transaction: Partial<Transaction>) => Promise<Transaction>;
  createSavingsGoal: (goal: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  updateSavingsGoal: (goalId: string, amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [aiTips, setAiTips] = useState<AiTip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [transactionData, budgetData, goalData] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getSavingsGoals()
      ]);

      setTransactions(transactionData);
      setBudgets(budgetData);
      setSavingsGoals(goalData);
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addTransaction = async (transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      const newTransaction = await api.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      toast({
        title: 'Success',
        description: 'Transaction added successfully'
      });
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const createSavingsGoal = async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      const token = localStorage.getItem('finWiseToken');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please login first',
          variant: 'destructive'
        });
        throw new Error('No token found');
      }
      
      const newGoal = await api.createSavingsGoal(goal);
      setSavingsGoals(prev => [...prev, newGoal]);
      toast({
        title: 'Success',
        description: 'Savings goal created successfully'
      });
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create goal. Please try logging in again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateSavingsGoal = async (goalId: string, amount: number) => {
    try {
      const updatedGoal = await api.updateSavingsGoal(goalId, amount);
      setSavingsGoals(prev => 
        prev.map(goal => goal.id === goalId ? updatedGoal : goal)
      );
      toast({
        title: 'Success',
        description: 'Goal progress updated successfully'
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal progress',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      budgets,
      savingsGoals,
      aiTips,
      isLoading,
      addTransaction,
      createSavingsGoal,
      updateSavingsGoal,
      refreshData,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
