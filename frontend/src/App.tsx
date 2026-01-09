import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import RestaurantList from './pages/RestaurantList'
import RestaurantDetail from './pages/RestaurantDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'
import Favorites from './pages/Favorites'
import Addresses from './pages/Addresses'
import Notifications from './pages/Notifications'
import Help from './pages/Help'
import About from './pages/About'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import ToastContainer from './components/ui/Toast'
import ConfirmDialog from './components/ui/ConfirmDialog'

// 商家后台页面
import MerchantLayout from './components/MerchantLayout'
import MerchantLogin from './pages/merchant/MerchantLogin'
import MerchantRegister from './pages/merchant/MerchantRegister'
import MerchantDashboard from './pages/merchant/MerchantDashboard'
import MerchantShop from './pages/merchant/MerchantShop'
import MerchantMenu from './pages/merchant/MerchantMenu'
import MerchantOrders from './pages/merchant/MerchantOrders'

function App() {
  return (
    <Router>
      <ToastContainer />
      <ConfirmDialog />
      <AnimatePresence mode="wait">
        <Routes>
          {/* 用户端路由 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="restaurants" element={<RestaurantList />} />
            <Route path="restaurant/:id" element={<RestaurantDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="orders" element={<Orders />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<ProfileEdit />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<Help />} />
            <Route path="about" element={<About />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 商家后台路由 */}
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant/register" element={<MerchantRegister />} />
          <Route path="/merchant" element={<MerchantLayout />}>
            <Route index element={<MerchantDashboard />} />
            <Route path="shop" element={<MerchantShop />} />
            <Route path="menu" element={<MerchantMenu />} />
            <Route path="orders" element={<MerchantOrders />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  )
}

export default App
