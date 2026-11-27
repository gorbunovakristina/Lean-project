import { useState } from 'react'
import { Avatar, Button, Switch, Tabs, message } from 'antd'
import { EditProfileModal } from './EditProfileModal'
import { useProfile, useUpdateNotifications, useUpdateProfile } from './hooks'
import type { NotificationSettings, UpdateProfilePayload } from './types'
import styles from './ProfilePage.module.css'

const NOTIFICATION_ITEMS: Array<{ key: keyof NotificationSettings; label: string }> = [
  { key: 'tasks', label: 'Уведомления о задачах' },
  { key: 'projects', label: 'Уведомления о проектах' },
  { key: 'weekly', label: 'Еженедельная сводка' },
]

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const updateProfile = useUpdateProfile()
  const updateNotifications = useUpdateNotifications()
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) return <p>Загрузка...</p>
  if (isError || !profile) return <p>Не удалось загрузить профиль.</p>

  const { notifications } = profile
  const allOn = notifications.tasks && notifications.projects && notifications.weekly

  const saveNotifications = (next: NotificationSettings) => {
    updateNotifications.mutate(next, {
      onError: () => message.error('Не удалось сохранить настройки'),
    })
  }

  const handleEdit = (values: UpdateProfilePayload) => {
    updateProfile.mutate(values, {
      onSuccess: () => {
        message.success('Профиль обновлён')
        setEditOpen(false)
      },
      onError: () => message.error('Не удалось обновить профиль'),
    })
  }

  const initials = profile.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.user}>
          <Avatar size={96} className={styles.avatar}>
            {initials}
          </Avatar>
          <div>
            <div className={styles.name}>{profile.fullName}</div>
            <div className={styles.position}>{profile.position}</div>
            <div className={styles.email}>{profile.email}</div>
          </div>
        </div>

        <Button className={styles.editButton} onClick={() => setEditOpen(true)}>
          Изменить профиль
        </Button>

        <section className={styles.card}>
          <Tabs
            items={[
              {
                key: 'main',
                label: 'Основное',
                children: (
                  <dl className={styles.details}>
                    <dt>Должность</dt>
                    <dd>{profile.position}</dd>
                    <dt>Отдел</dt>
                    <dd>{profile.department}</dd>
                    <dt>Завод</dt>
                    <dd>{profile.factory}</dd>
                  </dl>
                ),
              },
            ]}
          />
        </section>
      </div>

      <section className={`${styles.card} ${styles.notifications}`}>
        <div className={styles.notificationsHeader}>
          <span>Уведомления</span>
          <Switch
            checked={allOn}
            loading={updateNotifications.isPending}
            onChange={(on) => saveNotifications({ tasks: on, projects: on, weekly: on })}
          />
        </div>
        {NOTIFICATION_ITEMS.map((item) => (
          <div key={item.key} className={styles.notificationRow}>
            <span>{item.label}</span>
            <Switch
              checked={notifications[item.key]}
              onChange={(on) => saveNotifications({ ...notifications, [item.key]: on })}
            />
          </div>
        ))}
      </section>

      <EditProfileModal
        open={editOpen}
        profile={profile}
        loading={updateProfile.isPending}
        onCancel={() => setEditOpen(false)}
        onSubmit={handleEdit}
      />
    </div>
  )
}