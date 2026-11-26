import { useState } from 'react'
import { Button, Modal, Radio } from 'antd'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { useTemplates } from '../templates/hooks'
import { STATUS_META } from '../templates/constants'
import styles from './SelectTemplateModal.module.css'

function tasksLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} задача`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} задачи`
  return `${n} задач`
}

interface Props {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onApply: (templateId: string) => void
}

export function SelectTemplateModal({ open, loading, onCancel, onApply }: Props) {
  const [selectedId, setSelectedId] = useState<string>()
  const { data, isLoading, isError } = useTemplates({ page: 1, pageSize: 50 })

  return (
    <Modal
      open={open}
      title="Выбор шаблона"
      onCancel={onCancel}
      width={640}
      destroyOnHidden
      afterClose={() => setSelectedId(undefined)}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="apply"
          type="primary"
          disabled={!selectedId}
          loading={loading}
          onClick={() => selectedId && onApply(selectedId)}
        >
          Применить
        </Button>,
      ]}
    >
      <p className={styles.subtitle}>Примените шаблон к вашему заводу</p>

      {isLoading && <p>Загрузка...</p>}
      {isError && <p>Не удалось загрузить шаблоны.</p>}

      <div className={styles.list}>
        {data?.items.map((t) => {
          const meta = STATUS_META[t.status]
          const selected = t.id === selectedId
          return (
            <div
              key={t.id}
              className={selected ? `${styles.item} ${styles.selected}` : styles.item}
              onClick={() => setSelectedId(t.id)}
            >
              <div>
                <div className={styles.name}>{t.name}</div>
                <div className={styles.description}>{t.description}</div>
              </div>
              <div className={styles.tasks}>{tasksLabel(t.tasksCount)}</div>
              <StatusBadge label={meta.label} tone={meta.tone} />
              <Radio checked={selected} />
            </div>
          )
        })}
      </div>
    </Modal>
  )
}