import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import Login from './pages/Login';
import CategoriesPage from './pages/Categories';
import ProductsPage from './pages/Products';
import CustomersPage from './pages/Customers';
import OrdersPage from './pages/Orders';
import PrivateRoute from './routes/PrivateRoute';
import { ToastProvider } from "./toast/ToastProvider";

function App() {
  return (
    <>
    <ToastProvider>
    <Navbar /> 
    <div className="p-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
      </Routes>
    </div>
    </ToastProvider>
    </>
  );
}

export default App;
