import { NavLink, Outlet } from 'react-router-dom'
import styles from './MainLayout.module.css'

const menu = [
  { to: '/enterprises', label: 'Предприятия' },
  { to: '/templates', label: 'Шаблоны' },
  { to: '/projects', label: 'Проекты' },
  { to: '/tasks', label: 'Задачи' },
  { to: '/profile', label: 'Профиль' },
]

export function MainLayout() {
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
      </aside>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}