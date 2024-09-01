import {
  createBrowserRouter,
  RouterProvider,
  redirect
} from "react-router-dom";
import './App.css'
import QDIIGrounpedBySector from "./pages/qdii_premium_by_sector";
import { SWRConfig } from "swr";
import { Toast } from "@douyinfe/semi-ui";
import QDIIDetail from "./pages/qdii_detail";
import MobileFirstLayout from "./components/MobileLayout";
import QDIIArbitrary from "./pages/qdii_arbitrary";
// import Logo from "./components/logo";

const router = createBrowserRouter([
  {
    path: '/',
    loader: () => redirect('/qdii_premium_by_sector')
  },
  {
    path: '/qdii_premium_by_sector',
    element: <MobileFirstLayout title={import.meta.env.VITE_APP_TITLE} showBack={false} ><QDIIGrounpedBySector /></MobileFirstLayout>
  },
  {
    path: '/qdii_detail/:code',
    element:<MobileFirstLayout title={'QDII 溢价详情'}><QDIIDetail /></MobileFirstLayout>
  },
  {
    path: '/qdii_arbitrary/:index',
    element:<MobileFirstLayout title={'策略表现'}><QDIIArbitrary /></MobileFirstLayout>
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
