import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AddTask from './pages/AddTask';
import About from './pages/About';
import EditTask from './pages/EditTask';
import Register from './pages/Register';
import Login from './pages/Login';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <>
    <Navbar /> 
    <div className="p-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add" element={<PrivateRoute> 
                                      <AddTask /> 
                                    </PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute> 
                                         <EditTask />
                                        </PrivateRoute>} />
      </Routes>
    </div>
    </>
  );
}

export default App;
