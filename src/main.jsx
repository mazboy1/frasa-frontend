// src/main.jsx - FINAL FIXED VERSION
import React from 'react'
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Aos from 'aos';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ✅ FIX: TAMBAH .jsx PADA IMPORT
import router from './routes/router.jsx';
import AuthProvider from './utilities/providers/AuthProvider';

const queryClient = new QueryClient()
Aos.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>  
)