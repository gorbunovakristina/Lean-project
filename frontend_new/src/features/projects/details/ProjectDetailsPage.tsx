import { Link, useParams } from 'react-router-dom'
import { Table, Tabs } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { useProjectDetails } from './hooks'
import type { PlanTask, PlanTaskStatus } from './types'
import styles from './ProjectDetailsPage.module.css'

const STATUS_META: Record<
  PlanTaskStatus,
  { label: string; tone: 'green' | 'yellow' | 'gray' | 'red' }
> = {
  in_progress: { label: 'В работе', tone: 'green' },
  done: { label: 'Выполнено', tone: 'green' },
  not_started: { label: 'Не начато', tone: 'gray' },
  unassigned: { label: 'Не назначен', tone: 'red' },
}

const columns: TableColumnsType<PlanTask> = [
  { title: '№', dataIndex: 'order', width: 60 },
  { title: 'Задача', dataIndex: 'title' },
  { title: 'Роль', dataIndex: 'role', render: (v: string | null) => v ?? '—' },
  { title: 'Исполнитель', dataIndex: 'assignee', render: (v: string | null) => v ?? '—' },
  {
    title: 'Плановый срок',
    dataIndex: 'dueDate',
    render: (d: string) => dayjs(d).format('DD.MM.YYYY'),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    render: (s: PlanTaskStatus) => (
      <StatusBadge label={STATUS_META[s].label} tone={STATUS_META[s].tone} />
    ),
  },
]

function tasksLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} задача требует`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} задачи требуют`
  return `${n} задач требуют`
}

export function ProjectDetailsPage() {
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useProjectDetails(id)

  if (isLoading) return <p>Загрузка...</p>
  if (isError || !data) return <p>Не удалось загрузить проект.</p>

  const unassigned = data.tasks.filter((t) => t.status === 'unassigned').length

  return (
    <div>
      <Link to="/projects" className={styles.back}>
        ← Назад
      </Link>

      <h1 className={styles.title}>{data.name}</h1>
      <p className={styles.meta}>
        <span>Завод {data.factoryName}</span>
        <span>Отдел: {data.department}</span>
      </p>

      <Tabs
        items={[
          {
            key: 'plan',
            label: 'План задач',
            children: (
              <>
                <Table<PlanTask>
                  rowKey="id"
                  columns={columns}
                  dataSource={data.tasks}
                  pagination={{ pageSize: 4, hideOnSinglePage: true, align: 'end' }}
                />
                {unassigned > 0 && (
                  <div className={styles.banner}>
                    {tasksLabel(unassigned)} назначения исполнителя
                  </div>
                )}
              </>
            ),
          },
          { key: 'info', label: 'Информация', children: <p>Раздел в разработке</p> },
          { key: 'effect', label: 'Эффект', children: <p>Раздел в разработке</p> },
        ]}
      />
    </div>
  )
}