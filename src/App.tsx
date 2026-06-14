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
import { LayoutDashboard, Users, ClipboardList, BarChart3 } from "lucide-react";

import { authProvider, axiosInstance } from "./providers/authProvider";
import { Login, Register, ForgotPassword } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { CustomLayout } from "./components/CustomLayout";
import { App as AntdApp } from "antd";

import { LabTestList } from "./pages/clinicalDiagnostics/list";
import { LabTestCreate } from "./pages/clinicalDiagnostics/create";
import { LabTestEdit } from "./pages/clinicalDiagnostics/edit";
import { LabTestShow } from "./pages/clinicalDiagnostics/show";
import BatchUploadLabTests from "./pages/clinicalDiagnostics/batch-upload";
import ScanDocument from "./pages/clinicalDiagnostics/scan-document";
import ProfileSettings from "./pages/profile";

import { PatientsPage } from "./pages/patients";
import { PatientShow } from "./pages/patients/show";
import { HospitalPatients } from "./pages/patients/hospital";
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
              colorPrimary: "#e91e8c",
              colorBgContainer: "#1a1f2e",
              colorBgElevated: "#1f2437",
              colorBorder: "#2a2f3e",
              colorText: "#e5e7eb",
              colorTextSecondary: "#9ca3af",
              borderRadius: 10,
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
            },
            components: {
              Layout: { bodyBg: "transparent", siderBg: "transparent" },
              Table: { headerBg: "#1f2437", rowHoverBg: "#252b3b" },
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
                projectId: "averywell-lims",
                disableTelemetry: true,
                title: {
                  text: "Averywell",
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
                  name: "patients",
                  list: "/patients",
                  meta: {
                    label: "Patients",
                    icon: <Users size={16} />,
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
                  <Route path="/patients" element={<PatientsPage />} />
                  <Route path="/patients/hospital/:hospitalId" element={<HospitalPatients />} />
                  <Route path="/patients/:id" element={<PatientShow />} />
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
              <DocumentTitleHandler />
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
