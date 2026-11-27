import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { clearToken } from '../features/auth/authStorage'
import styles from './MainLayout.module.css'

const menu = [
  { to: '/enterprises', label: 'Предприятия' },
  { to: '/templates', label: 'Шаблоны' },
  { to: '/projects', label: 'Проекты' },
  { to: '/tasks', label: 'Задачи' },
  { to: '/profile', label: 'Профиль' },
]

export function MainLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logout = () => {
    clearToken()
    queryClient.clear() // чтобы следующий пользователь не увидел чужие данные
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Lean Project</div>
        <nav className={styles.nav}>
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className={styles.logout} onClick={logout}>
          Выйти
        </button>
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}