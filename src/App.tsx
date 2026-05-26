import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import {
  RequireAdmin,
  RequireContributor,
  RequireContributorPasswordResolved,
} from "./auth/guards";
import { ThemeProvider } from "./lib/theme";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { AdminIocs } from "./pages/admin/Iocs";
import { AdminMalware } from "./pages/admin/Malware";
import { AdminOrganisationDetails } from "./pages/admin/OrganisationDetails";
import { AdminOrganisations } from "./pages/admin/Organisations";
import { AdminOverview } from "./pages/admin/Overview";
import { AdminStats } from "./pages/admin/Stats";
import { AdminThreatActors } from "./pages/admin/ThreatActors";
import { BecomeContributor } from "./pages/BecomeContributor";
import { ContributorChangePassword } from "./pages/contributor/ChangePassword";
import { ContributorIocs } from "./pages/contributor/Iocs";
import { ContributorIocNew } from "./pages/contributor/IocNew";
import { ContributorMalware } from "./pages/contributor/Malware";
import { ContributorMalwareNew } from "./pages/contributor/MalwareNew";
import { ContributorOverview } from "./pages/contributor/Overview";
import { ContributorThreatActorNew } from "./pages/contributor/ThreatActorNew";
import { ContributorThreatActors } from "./pages/contributor/ThreatActors";
import { PublicDashboard } from "./pages/public/Dashboard";
import { PublicIocs } from "./pages/public/Iocs";
import { PublicIocDetails } from "./pages/public/IocDetails";
import { PublicThreatActors } from "./pages/public/ThreatActors";
import { PublicThreatActorDetails } from "./pages/public/ThreatActorDetails";
import { PublicMalware } from "./pages/public/Malware";
import { PublicMalwareDetails } from "./pages/public/MalwareDetails";
import { PublicBlockchain } from "./pages/public/Blockchain";
import { PublicChat } from "./pages/public/Chat";
import { PublicRegister } from "./pages/public/Register";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PublicDashboard />} />
      <Route path="/iocs" element={<PublicIocs />} />
      <Route path="/ioccs" element={<Navigate to="/iocs" replace />} />
      <Route path="/iocs/:id" element={<PublicIocDetails />} />
      <Route path="/threat-actors" element={<PublicThreatActors />} />
      <Route path="/threat-actors/:id" element={<PublicThreatActorDetails />} />
      <Route path="/malware" element={<PublicMalware />} />
      <Route path="/malware/:id" element={<PublicMalwareDetails />} />
      <Route path="/blockchain" element={<PublicBlockchain />} />
      <Route path="/chat" element={<PublicChat />} />
      <Route path="/register" element={<PublicRegister />} />
      <Route path="/become-contributor" element={<BecomeContributor />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminOverview />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/organisations"
        element={
          <RequireAdmin>
            <AdminOrganisations />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/organisations/:id"
        element={
          <RequireAdmin>
            <AdminOrganisationDetails />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/iocs"
        element={
          <RequireAdmin>
            <AdminIocs />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/malware"
        element={
          <RequireAdmin>
            <AdminMalware />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/threat-actors"
        element={
          <RequireAdmin>
            <AdminThreatActors />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/stats"
        element={
          <RequireAdmin>
            <AdminStats />
          </RequireAdmin>
        }
      />
      <Route
        path="/contributor"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorOverview />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/change-password"
        element={
          <RequireContributor>
            <ContributorChangePassword />
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/iocs"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorIocs />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/iocs/new"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorIocNew />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/malware"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorMalware />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/malware/new"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorMalwareNew />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/threat-actors"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorThreatActors />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route
        path="/contributor/threat-actors/new"
        element={
          <RequireContributor>
            <RequireContributorPasswordResolved>
              <ContributorThreatActorNew />
            </RequireContributorPasswordResolved>
          </RequireContributor>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
