import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Landing            from './pages/Landing'
import Login              from './pages/Login'
import Dashboard          from './pages/Dashboard'
import Events             from './pages/Events'
import Members            from './pages/Members'
import Communities        from './pages/Communities'
import Settings           from './pages/Settings'
import PublicRegistration from './pages/PublicRegistration'
// Event Planning Module
import EventDashboard  from './pages/events/EventDashboard'
import EventProposal   from './pages/events/EventProposal'
import EventTeam       from './pages/events/EventTeam'
import EventTasks      from './pages/events/EventTasks'
import EventTimeline   from './pages/events/EventTimeline'
import EventAgenda     from './pages/events/EventAgenda'
import EventBudget     from './pages/events/EventBudget'
import EventRisks      from './pages/events/EventRisks'
import './App.css'

const P = ({ children }) => (
  <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/"                      element={<Landing />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/register/:eventId"     element={<PublicRegistration />} />

          {/* Core App */}
          <Route path="/dashboard"   element={<P><Dashboard /></P>} />
          <Route path="/events"      element={<P><Events /></P>} />
          <Route path="/members"     element={<P><Members /></P>} />
          <Route path="/communities" element={<P><Communities /></P>} />
          <Route path="/settings"    element={<P><Settings /></P>} />

          {/* Event Planning Module */}
          <Route path="/events/:id"            element={<P><EventDashboard /></P>} />
          <Route path="/events/:id/proposal"   element={<P><EventProposal /></P>} />
          <Route path="/events/:id/team"       element={<P><EventTeam /></P>} />
          <Route path="/events/:id/tasks"      element={<P><EventTasks /></P>} />
          <Route path="/events/:id/timeline"   element={<P><EventTimeline /></P>} />
          <Route path="/events/:id/agenda"     element={<P><EventAgenda /></P>} />
          <Route path="/events/:id/budget"     element={<P><EventBudget /></P>} />
          <Route path="/events/:id/risks"      element={<P><EventRisks /></P>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
