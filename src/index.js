import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { NextUIProvider } from '@nextui-org/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NextUIProvider>
    <ChakraProvider>
      <main className="dark text-foreground bg-background">
        <App />
      </main>
    </ChakraProvider>
  </NextUIProvider>
);
