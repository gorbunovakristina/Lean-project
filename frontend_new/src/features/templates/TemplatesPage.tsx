import { useState } from 'react'
import { Button, Dropdown, Input, Pagination, Select } from 'antd'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { useTemplateCategories, useTemplates } from './hooks'
import { PAGE_SIZE, STATUS_META } from './constants'
import type { Template, TemplateStatus } from './types'
import styles from './TemplatesPage.module.css'

// 1 задача, 2-4 задачи, 5+ задач
function tasksLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} задача`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} задачи`
  return `${n} задач`
}

function TemplateCard({ template }: { template: Template }) {
  const meta = STATUS_META[template.status]
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{template.name}</h3>
        <p className={styles.cardDescription}>{template.description}</p>
        <p className={styles.cardTasks}>Содержит {tasksLabel(template.tasksCount)}</p>
        <StatusBadge label={meta.label} tone={meta.tone} />
      </div>
      <div className={styles.cardFooter}>
        <Button>Открыть</Button>
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Редактировать' },
              { key: 'copy', label: 'Дублировать' },
              { key: 'delete', label: 'Удалить', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text">•••</Button>
        </Dropdown>
      </div>
    </div>
  )
}

export function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>()
  const [status, setStatus] = useState<TemplateStatus>()
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching, isError } = useTemplates({
    search: debouncedSearch || undefined,
    categoryId,
    status,
    page,
    pageSize: PAGE_SIZE,
  })
  const { data: categories } = useTemplateCategories()

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Библиотека шаблонов</h1>
          <p className={styles.subtitle}>Готовые шаблоны проектов с набором задач и ролей</p>
        </div>
        <Button type="primary" size="large">
          + Создать шаблон
        </Button>
      </div>

      <div className={styles.filters}>
        <Input
          className={styles.search}
          placeholder="Поиск по шаблонам..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          allowClear
        />
        <Select
          className={styles.select}
          placeholder="Все категории"
          allowClear
          value={categoryId}
          onChange={(v) => {
            setCategoryId(v)
            setPage(1)
          }}
          options={categories?.map((c) => ({ value: c.id, label: c.name }))}
        />
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
      </div>

      {isError && <p>Не удалось загрузить шаблоны. Попробуйте обновить страницу.</p>}

      {data && data.items.length === 0 && !isFetching && <p>Шаблоны не найдены</p>}

      <div className={styles.grid} style={{ opacity: isFetching ? 0.6 : 1 }}>
        {data?.items.map((t) => <TemplateCard key={t.id} template={t} />)}
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
  )
}