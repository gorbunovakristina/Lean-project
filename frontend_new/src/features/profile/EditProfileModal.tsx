import { useEffect } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import type { Profile, UpdateProfilePayload } from './types'

interface Props {
  open: boolean
  profile: Profile
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: UpdateProfilePayload) => void
}

export function EditProfileModal({ open, profile, loading, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<UpdateProfilePayload>()

  useEffect(() => {
    if (open) form.setFieldsValue({ fullName: profile.fullName, email: profile.email })
  }, [open, profile, form])

  return (
    <Modal
      open={open}
      title="Изменить профиль"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отменить
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={() => form.submit()}>
          Сохранить
        </Button>,
      ]}
    >
      <Form<UpdateProfilePayload> form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="fullName"
          label="ФИО"
          rules={[{ required: true, message: 'Введите ФИО' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный email' },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}