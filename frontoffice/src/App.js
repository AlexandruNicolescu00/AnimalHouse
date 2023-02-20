import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Forum from './pages/Forum';
import Marketplace from './pages/Marketplace';
import Services from './pages/Services';
import ServiceDetails from './components/Service/ServiceDetails';
import Navbar from './components/Navbar/Navbar'
import LoginRegisterPage from './pages/LoginRegisterPage';
import PostDetails from './components/Forum/PostDetails';
import ProductDetails from './components/Marketplace/ProductDetails';
import ManageCart from './pages/ManageCart';
import PersonalArea from './pages/PersonalArea';
import Bills from './components/PersonalArea/Bills';
import ManageBookings from './pages/ManageBookings';
import Footer from './components/Footer/Footer';
import ManagePets from './pages/ManagePets';
import ManagePosts from './pages/ManagePosts';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen">
      <Navbar />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/forum' element={<Forum />} />
        <Route path='/forum/:id' element={<PostDetails />} />
        <Route path='/marketplace' element={<Marketplace />} />
        <Route path='/marketplace/:id' element={<ProductDetails />} />
        <Route path='/services' element={<Services />} />
        <Route path='/services/:id' element={<ServiceDetails />} />
        <Route path='/marketplace/cart' element={<ManageCart />} />
        <Route path='/myarea' element={<PersonalArea />}>
          <Route path='/myarea/bills' element={<Bills />} />
          <Route path='/myarea/bookings' element={<ManageBookings />} />
          <Route path='/myarea/pets' element={<ManagePets />} />
          <Route path='/myarea/forum' element={<ManagePosts />} />
        </Route>
        <Route path='/login' element={<LoginRegisterPage login={true} />} />
        <Route path='/signup' element={<LoginRegisterPage signup={true} />} />
      </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
