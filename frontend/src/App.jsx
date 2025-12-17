import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Step1Form from './pages/Step1Form';
import Step2Download from './pages/Step2Download';
import Step3Instructions from './pages/Step3Instructions';
import Step4Upload from './pages/Step4Upload';
import SuccessParams from './pages/SuccessParams';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/krok-1" replace />} />
          <Route path="krok-1" element={<Step1Form />} />
          <Route path="krok-2" element={<Step2Download />} />
          <Route path="krok-3" element={<Step3Instructions />} />
          <Route path="krok-4" element={<Step4Upload />} />
          <Route path="sukces" element={<SuccessParams />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
