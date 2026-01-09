import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <Navbar />
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 pt-20"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}

export default Layout
