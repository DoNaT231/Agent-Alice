import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ChatPage } from './components/chat/ChatPage'
import { AppShell, ProtectedLayout, RootRedirect } from './components/layout/ProtectedLayout'
import { ProjectPage } from './components/projects/ProjectPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
            <Route path="/projects/:projectId" element={<ProjectPage />} />
            <Route path="/projects/:projectId/chat/:conversationId" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
