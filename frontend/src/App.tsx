import { Navigate, Route, Routes} from "react-router-dom"
import  HomePages  from "./pages/home/HomePages"
import SignUpPage  from "./pages/auth/singup/SignUpPage"
import  LoginPage  from "./pages/auth/login/LoginPage"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notification/NotificationPage "
import ProfilePage from "./pages/profiles/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner "




function App() {

const { data:authUser, isLoading } = useQuery({
  // we use queryKey to give a unique name to our query and refer to it later
  queryKey: ['authUser'],
  queryFn: async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if(data.error) return null
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      console.log("auth is here", data)
      return data
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  retry: false
})

if (isLoading) {
  return (
    <div className='h-screen flex justify-center items-center'>
      <LoadingSpinner size='lg' />
    </div>
  );

}
  return (
    <>
      <div className='flex max-w-6xl mx-auto'>
			{/* Common component, bc it's not wrapped with Routes */}
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePages /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
    </>
  )
}

export default App
