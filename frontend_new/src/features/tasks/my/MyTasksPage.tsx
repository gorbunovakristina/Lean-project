import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Pagination, Select, Tabs, Upload, message } from 'antd'
import dayjs from 'dayjs'
import { StatusBadge } from '../../../shared/ui/StatusBadge'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import { useProfile } from '../../profile/hooks'
import { useCompleteMyTask, useMyTasks } from './hooks'
import type { MyTask, MyTaskDeadline, MyTaskStatus, MyTaskTab } from './types'
import styles from './MyTasksPage.module.css'

const PAGE_SIZE = 3

const STATUS_META: Record<MyTaskStatus, { label: string; tone: 'green' | 'yellow' | 'gray' }> = {
  in_progress: { label: 'В работе', tone: 'green' },
  review: { label: 'На проверке', tone: 'yellow' },
  done: { label: 'Выполнено', tone: 'gray' },
}

const DEADLINE_OPTIONS: Array<{ value: MyTaskDeadline; label: string }> = [
  { value: 'overdue', label: 'Просрочены' },
  { value: 'week', label: 'На этой неделе' },
  { value: 'later', label: 'Позже' },
]

function daysLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} день`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дня`
  return `${n} дней`
}

function dueHint(date: string) {
  const diff = dayjs(date).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (diff === 0) return 'сегодня'
  if (diff > 0) return `через ${daysLabel(diff)}`
  return `просрочено на ${daysLabel(-diff)}`
}

export function MyTasksPage() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const isHead = profile?.role === 'head'

  const [tab, setTab] = useState<MyTaskTab>('active')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<MyTaskStatus>()
  const [deadline, setDeadline] = useState<MyTaskDeadline>()
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<MyTask | null>(null)
  const [reportFileName, setReportFileName] = useState<string>()

  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching, isError } = useMyTasks({
    tab,
    search: debouncedSearch || undefined,
    status,
    deadline,
    page,
    pageSize: PAGE_SIZE,
  })
  const complete = useCompleteMyTask()

  const selectTask = (task: MyTask) => {
    setSelected(task)
    setReportFileName(undefined)
  }

  const handleComplete = () => {
    if (!selected) return
    complete.mutate(
      { id: selected.id, reportFileName },
      {
        onSuccess: () => {
          message.success('Задача выполнена')
          setSelected(null)
        },
        onError: () => message.error('Не удалось завершить задачу'),
      },
    )
  }

  return (
    <div>
      <Tabs
        activeKey={tab}
        onChange={(key) => {
          if (key === 'department') {
            navigate('/tasks/department')
            return
          }
          setTab(key as MyTaskTab)
          setSelected(null)
          setPage(1)
        }}
        items={[
          { key: 'active', label: 'Мои задачи' },
          { key: 'history', label: 'История' },
          ...(isHead ? [{ key: 'department', label: 'Задачи отдела' }] : []),
        ]}
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
        </div>
      </div>

      {isError && <p>Не удалось загрузить задачи. Попробуйте обновить страницу.</p>}
      {data && data.items.length === 0 && !isFetching && <p>Задачи не найдены</p>}

      <div className={selected ? `${styles.layout} ${styles.withPanel}` : styles.layout}>
        <div>
          <div className={styles.list} style={{ opacity: isFetching ? 0.6 : 1 }}>
            {data?.items.map((t) => {
              const meta = STATUS_META[t.status]
              const active = selected?.id === t.id
              return (
                <div
                  key={t.id}
                  className={active ? `${styles.card} ${styles.cardActive}` : styles.card}
                  onClick={() => selectTask(t)}
                >
                  <div className={styles.cardTitle}>{t.title}</div>
                  <div className={styles.cardProject}>Проект: {t.projectName}</div>
                  <StatusBadge label={meta.label} tone={meta.tone} />
                  <div className={styles.cardDue}>До {dayjs(t.dueDate).format('DD.MM.YYYY')}</div>
                </div>
              )
            })}
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
        </div>

        {selected && (
          <aside className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Детали задачи</h2>
              <Button type="text" onClick={() => setSelected(null)}>
                ✕
              </Button>
            </div>

            <div className={styles.taskName}>{selected.title}</div>
            <div className={styles.muted}>Проект: {selected.projectName}</div>

            <div className={styles.label}>Описание</div>
            <div>{selected.description}</div>

            <div className={styles.label}>Срок выполнения</div>
            <div>До {dayjs(selected.dueDate).format('DD.MM.YYYY')}</div>
            <div className={styles.muted}>({dueHint(selected.dueDate)})</div>

            <div className={styles.label}>Постановщик</div>
            <div>{selected.assignerName}</div>

            <div className={styles.label}>Файлы</div>
            <div className={styles.files}>
              {selected.files.length === 0 && <span className={styles.muted}>Нет файлов</span>}
              {selected.files.map((f) => (
                <div key={f.name}>
                  <div>{f.name}</div>
                  <div className={styles.muted}>{f.size}</div>
                </div>
              ))}
            </div>

            {selected.status !== 'done' && (
              <>
                <div className={styles.label}>Отчет о выполнении</div>
                <Upload.Dragger
                  key={selected.id}
                  maxCount={1}
                  beforeUpload={(file) => {
                    setReportFileName(file.name)
                    return false // файл не отправляется, пока нет бэкенда
                  }}
                  onRemove={() => setReportFileName(undefined)}
                >
                  <p>Перетащите файл сюда или выберите файл</p>
                </Upload.Dragger>

                <Button
                  type="primary"
                  block
                  className={styles.complete}
                  loading={complete.isPending}
                  onClick={handleComplete}
                >
                  Выполнено
                </Button>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}