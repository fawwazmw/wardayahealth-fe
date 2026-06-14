import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Route, Routes, Outlet, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { LayoutDashboard, ClipboardList, BarChart3 } from "lucide-react";

import { authProvider, axiosInstance } from "./providers/authProvider";
import { Login, Register, ForgotPassword } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { CustomLayout } from "./components/CustomLayout";
import { App as AntdApp } from "antd";

import { LabTestCreate } from "./pages/clinicalDiagnostics/create.tsx";
import { LabTestEdit } from "./pages/clinicalDiagnostics/edit";
import { LabTestShow } from "./pages/clinicalDiagnostics/show";
import BatchUploadLabTests from "./pages/clinicalDiagnostics/batch-upload";
import ScanDocument from "./pages/clinicalDiagnostics/scan-document";
import ProfileSettings from "./pages/profile";

import { TestOrdersPage } from "./pages/testOrders";
import { ResultsPage } from "./pages/results";
import { ResultShow } from "./pages/results/show";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: "#40c2a8",
              colorInfo: "#40c2a8",
              colorSuccess: "#2fb178",
              colorWarning: "#d7b35b",
              colorBgContainer: "#0f1d1a",
              colorBgElevated: "#122421",
              colorBorder: "#213833",
              colorText: "#edf6f3",
              colorTextSecondary: "#8ea39d",
              borderRadius: 16,
              fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
            },
            components: {
              Layout: { bodyBg: "transparent", siderBg: "transparent" },
              Table: { headerBg: "#142723", rowHoverBg: "#162d28" },
              Card: { colorBgContainer: "#0f1d1a" },
            },
          }}
        >
          <AntdApp>
            <Refine
              dataProvider={dataProvider("", axiosInstance)}
              authProvider={authProvider}
              routerProvider={routerBindings}
              notificationProvider={useNotificationProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "wardayahealth-lims",
                disableTelemetry: true,
                title: {
                  text: "Wardayahealth",
                },
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: {
                    label: "Dashboard",
                    icon: <LayoutDashboard size={16} />,
                  },
                },
                {
                  name: "clinical-diagnostics",
                  list: "/test-orders",
                  create: "/clinical-diagnostics/create",
                  edit: "/clinical-diagnostics/edit/:id",
                  show: "/results/show/:id",
                  meta: {
                    label: "Test Orders",
                    icon: <ClipboardList size={16} />,
                  },
                },
                {
                  name: "results",
                  list: "/results",
                  show: "/results/show/:id",
                  meta: {
                    label: "Results",
                    icon: <BarChart3 size={16} />,
                  },
                },
              ]}
            >
              <Routes>
                {/* Authenticated Routes */}
                <Route
                  element={
                    <Authenticated key="authenticated" fallback={<NavigateToLogin />}>
                      <CustomLayout>
                        <Outlet />
                      </CustomLayout>
                    </Authenticated>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="/test-orders" element={<TestOrdersPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/results/show/:id" element={<ResultShow />} />
                  <Route path="/clinical-diagnostics">
                    <Route index element={<Navigate to="/test-orders" replace />} />
                    <Route path="create" element={<LabTestCreate />} />
                    <Route path="edit/:id" element={<LabTestEdit />} />
                    <Route path="show/:id" element={<LabTestShow />} />
                    <Route path="batch-upload" element={<BatchUploadLabTests />} />
                    <Route path="scan-document" element={<ScanDocument />} />
                  </Route>
                  <Route path="/profile" element={<ProfileSettings />} />
                  <Route path="*" element={<ErrorComponent />} />
                </Route>

                {/* Unauthenticated Routes */}
                <Route
                  element={
                    <Authenticated key="auth-pages" fallback={<Outlet />}>
                      <NavigateToHome />
                    </Authenticated>
                  }
                >
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler
                handler={({ autoGeneratedTitle }) =>
                  autoGeneratedTitle
                    .replace(/ \| Refine$/u, " | Wardayahealth")
                    .replace(/^Refine$/u, "Wardayahealth")
                }
              />
            </Refine>
          </AntdApp>
        </ConfigProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

const NavigateToLogin = () => {
  return <Navigate to="/login" replace />;
};

const NavigateToHome = () => {
  return <Navigate to="/" replace />;
};

export default App;
