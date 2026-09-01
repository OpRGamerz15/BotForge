import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import ProjectStudio from './pages/ProjectStudio'
import Servers from './pages/Servers'
import Builds from './pages/Builds'
import Files from './pages/Files'
import Updates from './pages/Updates'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Overview />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId/*" element={<ProjectStudio />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/builds" element={<Builds />} />
          <Route path="/files" element={<Files />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
