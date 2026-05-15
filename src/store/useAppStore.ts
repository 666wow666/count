import { create } from 'zustand';
import { UserInput, StarChart, FortuneAnalysis } from '@/types';

interface AppState {
  userInput: UserInput | null;
  starChart: StarChart | null;
  fortuneAnalysis: FortuneAnalysis | null;
  isLoading: boolean;
  error: string | null;
  
  setUserInput: (input: UserInput) => void;
  setStarChart: (chart: StarChart) => void;
  setFortuneAnalysis: (analysis: FortuneAnalysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userInput: null,
  starChart: null,
  fortuneAnalysis: null,
  isLoading: false,
  error: null,
  
  setUserInput: (input) => set({ userInput: input }),
  setStarChart: (chart) => set({ starChart: chart }),
  setFortuneAnalysis: (analysis) => set({ fortuneAnalysis: analysis }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({
    userInput: null,
    starChart: null,
    fortuneAnalysis: null,
    isLoading: false,
    error: null
  })
}));
