import {
  createBrowserRouter,
  RouterProvider,
  redirect
} from "react-router-dom";
import './App.css'
import QDIIGrounpedBySector from "./pages/qdii_premium_by_sector";
import { SWRConfig } from "swr";
import { Toast } from "@douyinfe/semi-ui";


const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect('/qdii_premium_by_sector')
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
  return <SWRConfig value={{
    onError: (error) => {
      Toast.error({ content: String(error) })
    }
  }}>

    <RouterProvider router={router} />
  </SWRConfig>
}

export default App
