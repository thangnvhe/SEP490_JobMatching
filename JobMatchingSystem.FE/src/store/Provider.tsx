import React from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { AuthEventProvider } from '@/components/AuthEventProvider';

interface StoreProviderProps {
  children: React.ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthEventProvider>
        {children}
      </AuthEventProvider>
    </Provider>
  );
};

export default StoreProvider;
