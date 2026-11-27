import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Dropdown, Input, Modal, Pagination, Select, Tabs, message } from 'antd'
import dayjs from 'dayjs'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { useAssignees, useAssignTask, useTasks } from './hooks'
import type { Task, TaskDeadline, TaskScope, TaskStatus } from './types'
import styles from './TasksPage.module.css'

const PAGE_SIZE = 4

const STATUS_META: Record<
  TaskStatus,
  { label: string; tone: 'green' | 'yellow' | 'gray' | 'red' }
> = {
  in_progress: { label: 'В работе', tone: 'green' },
  not_started: { label: 'Не начато', tone: 'gray' },
  unassigned: { label: 'Не назначен', tone: 'red' },
  review: { label: 'На проверке', tone: 'yellow' },
}

const DEADLINE_OPTIONS: Array<{ value: TaskDeadline; label: string }> = [
  { value: 'overdue', label: 'Просрочены' },
  { value: 'week', label: 'На этой неделе' },
  { value: 'later', label: 'Позже' },
]

interface CardProps {
  task: Task
  onAssign: (task: Task) => void
}

function TaskCard({ task, onAssign }: CardProps) {
  const meta = STATUS_META[task.status]
  const unassigned = task.assignee === null

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.cardTitle}>{task.title}</div>
        <div className={styles.cardDescription}>{task.description}</div>
        <div className={styles.cardProject}>Проект: {task.projectName}</div>
      </div>
      <div className={styles.center}>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <div className={styles.center}>До {dayjs(task.dueDate).format('DD.MM.YYYY')}</div>
      <div className={styles.center}>{task.assignee?.name ?? ''}</div>
      <div className={styles.center}>
        {unassigned ? (
          <Button onClick={() => onAssign(task)}>Назначить</Button>
        ) : (
          <Button onClick={() => message.info('Страница задачи пока не реализована')}>
            Открыть
          </Button>
        )}
      </div>
      <Dropdown
        menu={{
          items: [
            { key: 'open', label: 'Открыть' },
            { key: 'edit', label: 'Редактировать' },
          ],
          onClick: () => message.info('Пока не реализовано'),
        }}
        trigger={['click']}
      >
        <Button type="text" danger={unassigned}>
          •••
        </Button>
      </Dropdown>
    </div>
  )
}

export function TasksPage({ scope }: { scope: TaskScope }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus>()
  const [deadline, setDeadline] = useState<TaskDeadline>()
  const [assigneeId, setAssigneeId] = useState<string>()
  const [page, setPage] = useState(1)

  const [assignTarget, setAssignTarget] = useState<Task | null>(null)
  const [newAssigneeId, setNewAssigneeId] = useState<string>()

  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching, isError } = useTasks({
    scope,
    search: debouncedSearch || undefined,
    status,
    deadline,
    assigneeId: scope === 'department' ? assigneeId : undefined,
    page,
    pageSize: PAGE_SIZE,
  })
  const { data: assignees } = useAssignees()
  const assign = useAssignTask()

  const closeAssignModal = () => {
    setAssignTarget(null)
    setNewAssigneeId(undefined)
  }

  const handleAssign = () => {
    if (!assignTarget || !newAssigneeId) return
    assign.mutate(
      { id: assignTarget.id, assigneeId: newAssigneeId },
      {
        onSuccess: () => {
          message.success('Исполнитель назначен')
          closeAssignModal()
        },
        onError: () => message.error('Не удалось назначить исполнителя'),
      },
    )
  }

  return (
    <div>
      <Tabs
        activeKey={scope}
        onChange={(key) => navigate(`/tasks/${key}`)}
        items={[
          { key: 'my', label: 'Мои задачи' },
          { key: 'department', label: 'Задачи отдела' },
        ]}
        tabBarExtraContent={
          <Button
            type="primary"
            size="large"
            onClick={() => message.info('Создание задачи пока не реализовано')}
          >
            + Создать задачу
          </Button>
        }
      />

      <div className={styles.filters}>
        <Input
          className={styles.search}
          placeholder="Поиск по задачам..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          allowClear
        />
        <div className={styles.selects}>
          <Select
            className={styles.select}
            placeholder="Все статусы"
            allowClear
            value={status}
            onChange={(v) => {
              setStatus(v)
              setPage(1)
            }}
            options={Object.entries(STATUS_META).map(([value, m]) => ({
              value,
              label: m.label,
            }))}
          />
          <Select
            className={styles.select}
            placeholder="Все сроки"
            allowClear
            value={deadline}
            onChange={(v) => {
              setDeadline(v)
              setPage(1)
            }}
            options={DEADLINE_OPTIONS}
          />
          {scope === 'department' && (
            <Select
              className={styles.select}
              placeholder="Все сотрудники"
              allowClear
              value={assigneeId}
              onChange={(v) => {
                setAssigneeId(v)
                setPage(1)
              }}
              options={assignees?.map((a) => ({ value: a.id, label: a.name }))}
            />
          )}
        </div>
      </div>

      {isError && <p>Не удалось загрузить задачи. Попробуйте обновить страницу.</p>}
      {data && data.items.length === 0 && !isFetching && <p>Задачи не найдены</p>}

      <div className={styles.list} style={{ opacity: isFetching ? 0.6 : 1 }}>
        {data?.items.map((t) => <TaskCard key={t.id} task={t} onAssign={setAssignTarget} />)}
      </div>

      <div className={styles.pagination}>
        <Pagination
          current={page}
          pageSize={PAGE_SIZE}
          total={data?.total ?? 0}
          onChange={setPage}
          showSizeChanger={false}
          hideOnSinglePage
        />
      </div>

      <Modal
        open={assignTarget !== null}
        title="Назначить исполнителя"
        onCancel={closeAssignModal}
        footer={[
          <Button key="cancel" onClick={closeAssignModal}>
            Отмена
          </Button>,
          <Button
            key="ok"
            type="primary"
            disabled={!newAssigneeId}
            loading={assign.isPending}
            onClick={handleAssign}
          >
            Назначить
          </Button>,
        ]}
      >
        <p>{assignTarget?.title}</p>
        <Select
          style={{ width: '100%' }}
          placeholder="Выберите сотрудника"
          value={newAssigneeId}
          onChange={setNewAssigneeId}
          options={assignees?.map((a) => ({ value: a.id, label: a.name }))}
        />
      </Modal>
    </div>
  )
}