import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Form, Input, InputNumber, Select, message } from 'antd'
import { useRoles, useSaveTemplate, useTemplateDetails } from './hooks'
import type { TemplateTask } from './types'
import styles from './TemplateBuilderPage.module.css'

type FormValues = Omit<TemplateTask, 'id'>

function tasksLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} задача`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} задачи`
  return `${n} задач`
}

export function TemplateBuilderPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useTemplateDetails(id)
  const { data: roles } = useRoles()
  const save = useSaveTemplate(id)

  const [form] = Form.useForm<FormValues>()
  const [tasks, setTasks] = useState<TemplateTask[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (data) setTasks(data.tasks)
  }, [data])

  const selectTask = (task: TemplateTask) => {
    setSelectedId(task.id)
    form.setFieldsValue(task)
  }

  const resetForm = () => {
    setSelectedId(null)
    form.resetFields()
  }

  const handleFinish = (values: FormValues) => {
    if (selectedId) {
      setTasks((prev) => prev.map((t) => (t.id === selectedId ? { ...t, ...values } : t)))
    } else {
      setTasks((prev) => [...prev, { id: `new-${Date.now()}`, ...values }])
    }
    resetForm()
  }

  const saveTemplate = (publish: boolean) => {
    save.mutate(
      { tasks, status: publish ? 'published' : undefined },
      {
        onSuccess: () => message.success(publish ? 'Шаблон опубликован' : 'Шаблон сохранён'),
        onError: () => message.error('Не удалось сохранить шаблон'),
      },
    )
  }

  if (isLoading) return <p>Загрузка...</p>
  if (isError || !data) return <p>Не удалось загрузить шаблон.</p>

  return (
    <div>
      <Link to="/templates" className={styles.back}>
        ← Назад к шаблонам
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{data.name}</h1>
          <p className={styles.subtitle}>Конструктор шаблона</p>
        </div>
        <div className={styles.actions}>
          <Button loading={save.isPending} onClick={() => saveTemplate(false)}>
            Сохранить
          </Button>
          <Button type="primary" loading={save.isPending} onClick={() => saveTemplate(true)}>
            Опубликовать
          </Button>
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Список задач</h2>
            <span className={styles.counter}>{tasksLabel(tasks.length)}</span>
          </div>

          <ul className={styles.taskList}>
            {tasks.map((task) => (
              <li
                key={task.id}
                className={
                  task.id === selectedId ? `${styles.task} ${styles.taskActive}` : styles.task
                }
                onClick={() => selectTask(task)}
              >
                <span className={styles.dot} />
                <div>
                  <div>{task.title}</div>
                  <div className={styles.role}>{task.role}</div>
                </div>
              </li>
            ))}
          </ul>

          <Button className={styles.addButton} onClick={resetForm}>
            + Добавить задачу
          </Button>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Настройки задачи</h2>
          <Form<FormValues> form={form} layout="vertical" onFinish={handleFinish}>
            <Form.Item
              name="title"
              label="Название задачи"
              rules={[{ required: true, message: 'Укажите название задачи' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="role"
              label="Роль исполнителя"
              rules={[{ required: true, message: 'Выберите роль исполнителя' }]}
            >
              <Select options={roles?.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
            <Form.Item name="dueDays" label="Срок выполнения">
              <InputNumber min={1} addonAfter="дн." style={{ width: '100%' }} />
            </Form.Item>

            <div className={styles.formActions}>
              <Button onClick={resetForm}>Отменить</Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </div>
          </Form>
        </section>
      </div>
    </div>
  )
}