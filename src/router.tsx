import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Holdings } from "./pages/Holdings";
import { Business } from "./pages/Business";
import { BusinessReportDetail } from "./pages/BusinessReportDetail";
import { Transactions } from "./pages/Transactions";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "holdings", element: <Holdings /> },
      { path: "transactions", element: <Transactions /> },
      { path: "business", element: <Business /> },
      { path: "business/:year/:month", element: <BusinessReportDetail /> },
      // Legacy redirects so old links keep working.
      { path: "reports", element: <Navigate to="/business" replace /> },
      {
        path: "reports/:year/:month",
        element: <RedirectReportToBusiness />,
      },
    ],
  },
]);

import { useParams } from "react-router-dom";
function RedirectReportToBusiness() {
  const { year, month } = useParams();
  return <Navigate to={`/business/${year}/${month}`} replace />;
}
