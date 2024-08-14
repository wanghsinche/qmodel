import {
  createBrowserRouter,
  RouterProvider,
  redirect
} from "react-router-dom";
import './App.css'
import QDIIGrounpedBySector from "./pages/qdii_premium_by_sector";


const router = createBrowserRouter([
  {
    path: '/',
    loader: ()=>redirect('/qdii_premium_by_sector')
  },
  {
    path: '/qdii_premium_by_sector',
    element: <QDIIGrounpedBySector />
  },
  {
    path: '/payment_result',
    element: <div>Payment Result</div>
  }
]);

function App() {
  return <RouterProvider router={router} />
}

export default App
