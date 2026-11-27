import { Button, Form, Input, Modal, Select } from 'antd'
import { useEmployeeRoles, useEnterprises } from './hooks'
import type { NewEmployee } from './types'

interface Props {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: NewEmployee) => void
}

export function AddEmployeeModal({ open, loading, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm<NewEmployee>()
  const { data: enterprises } = useEnterprises()
  const { data: roles } = useEmployeeRoles()

  return (
    <Modal
      open={open}
      title="Добавить сотрудника"
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      width={560}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отменить
        </Button>,
        <Button key="add" type="primary" loading={loading} onClick={() => form.submit()}>
          Добавить
        </Button>,
      ]}
    >
      <Form<NewEmployee> form={form} layout="vertical" onFinish={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
          <Form.Item
            name="fullName"
            label="ФИО"
            rules={[{ required: true, message: 'Введите ФИО' }]}
          >
            <Input placeholder="Введите ФИО" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Некорректный email' },
            ]}
          >
            <Input placeholder="Введите email" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select
              placeholder="Выберите роль"
              options={roles?.map((r) => ({ value: r, label: r }))}
            />
          </Form.Item>
          <Form.Item
            name="departmentId"
            label="Отдел"
            rules={[{ required: true, message: 'Выберите отдел' }]}
          >
            <Select
              placeholder="Выберите отдел"
              options={enterprises?.map((e) => ({
                label: e.name,
                options: e.departments.map((d) => ({ value: d.id, label: d.name })),
              }))}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}