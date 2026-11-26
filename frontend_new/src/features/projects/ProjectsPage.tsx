import { useState } from 'react'
import { Button, DatePicker, Dropdown, Input, Progress, Select, Table, message } from 'antd'
import type { TableColumnsType } from 'antd'
import dayjs from 'dayjs'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { useCreateProject, useFactories, useProjects } from './hooks'
import { PAGE_SIZE, STATUS_META } from './constants'
import { SelectTemplateModal } from './SelectTemplateModal'
import type { Project, ProjectStatus } from './types'
import styles from './ProjectsPage.module.css'

const formatDate = (d: string) => dayjs(d).format('DD.MM.YYYY')

const columns: TableColumnsType<Project> = [
  {
    title: 'Название проекта',
    dataIndex: 'name',
    render: (_, p) => (
      <div>
        <div>{p.name}</div>
        <div className={styles.description}>{p.description}</div>
      </div>
    ),
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    align: 'center',
    render: (status: ProjectStatus) => (
      <StatusBadge label={STATUS_META[status].label} tone={STATUS_META[status].tone} />
    ),
  },
  {
    title: 'Завод',
    dataIndex: ['factory', 'name'],
    align: 'center',
  },
  {
    title: 'План / Факт',
    align: 'center',
    render: (_, p) => `${formatDate(p.planStart)} - ${formatDate(p.planEnd)}`,
  },
  {
    title: 'Прогресс',
    dataIndex: 'progress',
    align: 'center',
    render: (value: number) => (
      <div className={styles.progress}>
        <div>{value}%</div>
        <Progress percent={value} showInfo={false} size="small" />
      </div>
    ),
  },
  {
    title: '',
    width: 56,
    render: () => (
      <Dropdown
        menu={{
          items: [
            { key: 'open', label: 'Открыть' },
            { key: 'edit', label: 'Редактировать' },
          ],
        }}
        trigger={['click']}
      >
        <Button type="text">•••</Button>
      </Dropdown>
    ),
  },
]

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus>()
  const [factoryId, setFactoryId] = useState<string>()
  const [range, setRange] = useState<[string, string]>()
  const [page, setPage] = useState(1)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching, isError } = useProjects({
    search: debouncedSearch || undefined,
    status,
    factoryId,
    dateFrom: range?.[0],
    dateTo: range?.[1],
    page,
    pageSize: PAGE_SIZE,
  })
  const { data: factories } = useFactories()
  const createProject = useCreateProject()

  const handleApplyTemplate = (templateId: string) => {
    createProject.mutate(
      { templateId },
      {
        onSuccess: () => {
          message.success('Проект создан')
          setTemplateModalOpen(false)
          setPage(1)
        },
        onError: () => message.error('Не удалось создать проект'),
      },
    )
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Мои проекты</h1>
          <p className={styles.subtitle}>Список проектов на вашем заводе</p>
        </div>
        <Button type="primary" size="large" onClick={() => setTemplateModalOpen(true)}>
          + Создать проект
        </Button>
      </div>

      <div className={styles.filters}>
        <Input
          className={styles.search}
          placeholder="Поиск по проектам..."
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
            placeholder="Все заводы"
            allowClear
            value={factoryId}
            onChange={(v) => {
              setFactoryId(v)
              setPage(1)
            }}
            options={factories?.map((f) => ({ value: f.id, label: f.name }))}
          />
          <DatePicker.RangePicker
            placeholder={['Все даты', '']}
            format="DD.MM.YYYY"
            onChange={(dates) => {
              setRange(
                dates?.[0] && dates?.[1]
                  ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                  : undefined,
              )
              setPage(1)
            }}
          />
        </div>
      </div>

      {isError && <p>Не удалось загрузить проекты. Попробуйте обновить страницу.</p>}

      <Table<Project>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        loading={isFetching}
        locale={{ emptyText: 'Проекты не найдены' }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onChange: setPage,
          showSizeChanger: false,
          align: 'center',
        }}
      />

      <SelectTemplateModal
        open={templateModalOpen}
        loading={createProject.isPending}
        onCancel={() => setTemplateModalOpen(false)}
        onApply={handleApplyTemplate}
      />
    </div>
  )
}