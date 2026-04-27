import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import BBSObservation from "./pages/BBSObservation";
import NearMissForm from "./pages/NearMissForm";
import ContactSupport from "./pages/ContactSupport";
import SafetyQuiz from "./pages/SafetyQuiz";
import EmContact from "./pages/EmContact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminBBS from "./pages/AdminBBS";
import AdminNearMiss from "./pages/AdminNearMiss";
import InspectionChecklist from "./pages/InspectionChecklist";
import SafetyHuddle from "./pages/SafetyHuddle";
import AdminHuddle from "./pages/AdminHuddle";
import AdminInspection from "./pages/AdminInspection";
import SubmissionRequirements from "./pages/SubmissionRequirements";
import DocumentLibrary from "./pages/DocumentLibrary";
import DocumentFolderView from "./pages/DocumentFolderView";
import DocumentView from "./pages/DocumentView";
import DocumentVersionView from "./pages/DocumentVersionView";
import TrainingScanner from "./pages/TrainingScanner";
import LeaderWalk from "./pages/LeaderWalk";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/bbs" element={<BBSObservation />} />
        <Route path="/nearmiss" element={<NearMissForm />} />
        <Route path="/support" element={<ContactSupport />} />
        <Route path="/safetyquiz" element={<SafetyQuiz />} />
        <Route path="/emcontact" element={<EmContact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/bbs" element={<AdminBBS />} />
        <Route path="/admin/nearmiss" element={<AdminNearMiss />} />
        <Route path="/admin/huddle" element={<AdminHuddle />} />
        <Route path="/inspection" element={<InspectionChecklist />} />
        <Route path="/huddle" element={<SafetyHuddle />} />
        <Route path="/admin/inspection" element={<AdminInspection />} />
        <Route path="/admin/submission-requirements" element={<SubmissionRequirements />} />
        <Route path="/leaderwalk" element={<LeaderWalk />} />
        <Route path="/documents" element={<DocumentLibrary />} />
        <Route path="/documents/folder/:folderId" element={<DocumentFolderView />} />
        <Route path="/documents/view/:documentId" element={<DocumentView />} />
        <Route path="/documents/version/:versionId" element={<DocumentVersionView />} />
        <Route path="/training-scanner" element={<TrainingScanner />} />
      </Routes>
    </BrowserRouter>
  );
}