import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import POSPage from './pages/pos/POSPage';
import KDSPage from './pages/kds/KDSPage';
import HotelPage from './pages/hotel/HotelPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ReportsPage from './pages/reports/ReportsPage';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<POSPage />} />
                    <Route path="kds" element={<KDSPage />} />
                    <Route path="hotel" element={<HotelPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
