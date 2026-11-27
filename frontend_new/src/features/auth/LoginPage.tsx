import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Input, message } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { login } from './api'
import { getToken, setToken } from './authStorage'
import type { LoginPayload } from './types'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string>()

  const from = (location.state as { from?: string } | null)?.from ?? '/projects'

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token)
      navigate(from, { replace: true })
    },
    onError: () => setError('Неверный логин или пароль'),
  })

  // уже вошли: на страницу входа не пускаем
  if (getToken()) return <Navigate to="/projects" replace />

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход в систему</h1>
        <p className={styles.subtitle}>Пожалуйста, войдите в свой аккаунт</p>

        <Form<LoginPayload>
          layout="vertical"
          className={styles.form}
          onFinish={(values) => {
            setError(undefined)
            loginMutation.mutate(values)
          }}
        >
          {error && <Alert type="error" message={error} showIcon className={styles.alert} />}

          <Form.Item name="login" rules={[{ required: true, message: 'Введите логин или почту' }]}>
            <Input placeholder="Логин или почта" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password placeholder="Пароль" autoComplete="current-password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loginMutation.isPending}
          >
            Войти
          </Button>
        </Form>

        <Button
          type="link"
          className={styles.forgot}
          onClick={() => message.info('Восстановление пароля пока не реализовано')}
        >
          Забыли пароль?
        </Button>
      </div>
    </div>
  )
}