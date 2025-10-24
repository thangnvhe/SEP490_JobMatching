import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Import các component trang (sẽ tạo sau)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Cấu hình router
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
]);

// Component chính để render router
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
