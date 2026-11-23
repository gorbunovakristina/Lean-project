import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { PageStub } from '../shared/ui/PageStub'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PageStub title="Авторизация" />} />

      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<PageStub title="Мои проекты" />} />
        <Route path="templates" element={<PageStub title="Библиотека шаблонов" />} />
        <Route path="enterprises" element={<PageStub title="Справочник предприятий" />} />
        <Route path="tasks">
          <Route index element={<Navigate to="my" replace />} />
          <Route path="my" element={<PageStub title="Мои задачи" />} />
          <Route path="department" element={<PageStub title="Задачи моего отдела" />} />
        </Route>
        <Route path="profile" element={<PageStub title="Профиль пользователя" />} />
      </Route>
    </Routes>
  )
}