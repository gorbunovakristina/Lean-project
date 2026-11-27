import { useMemo, useState } from 'react'
import { Button, Input, Table, Tabs, Tree, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import type { TableColumnsType } from 'antd'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { AddEmployeeModal } from './AddEmployeeModal'
import { useAddEmployee, useEmployeeRoles, useEmployees, useEnterprises } from './hooks'
import type { Employee, NewEmployee } from './types'
import styles from './EnterprisesPage.module.css'

const PAGE_SIZE = 10

const columns: TableColumnsType<Employee> = [
  { title: 'ФИО', dataIndex: 'fullName' },
  { title: 'Должность', dataIndex: 'position' },
  { title: 'Отдел', dataIndex: 'departmentName' },
  { title: 'Роль', dataIndex: 'role' },
  {
    title: 'Email',
    dataIndex: 'email',
    render: (email: string) => <a href={`mailto:${email}`}>{email}</a>,
  },
]

export function EnterprisesPage() {
  const [treeSearch, setTreeSearch] = useState('')
  const [selectedKey, setSelectedKey] = useState<string>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const debouncedSearch = useDebouncedValue(search)

  const { data: enterprises } = useEnterprises()
  const { data: roles } = useEmployeeRoles()
  const addEmployee = useAddEmployee()

  // ключи дерева: "e:<id завода>" и "d:<id цеха>"
  const enterpriseId = selectedKey?.startsWith('e:') ? selectedKey.slice(2) : undefined
  const departmentId = selectedKey?.startsWith('d:') ? selectedKey.slice(2) : undefined

  const { data, isFetching, isError } = useEmployees({
    search: debouncedSearch || undefined,
    enterpriseId,
    departmentId,
    page,
    pageSize: PAGE_SIZE,
  })

  const treeData = useMemo<DataNode[]>(() => {
    const q = treeSearch.trim().toLowerCase()
    return (enterprises ?? [])
      .map((e) => {
        const enterpriseMatches = e.name.toLowerCase().includes(q)
        const departments = e.departments.filter(
          (d) => enterpriseMatches || d.name.toLowerCase().includes(q),
        )
        return { e, departments, visible: enterpriseMatches || departments.length > 0 }
      })
      .filter((x) => !q || x.visible)
      .map(({ e, departments }) => ({
        key: `e:${e.id}`,
        title: e.name,
        children: departments.map((d) => ({ key: `d:${d.id}`, title: d.name })),
      }))
  }, [enterprises, treeSearch])

  const handleAdd = (values: NewEmployee) => {
    addEmployee.mutate(values, {
      onSuccess: () => {
        message.success('Сотрудник добавлен')
        setModalOpen(false)
        setPage(1)
      },
      onError: () => message.error('Не удалось добавить сотрудника'),
    })
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Предприятия и роли</h1>
          <p className={styles.subtitle}>Управление структурой заводов и назначение ролей</p>
        </div>
        <Button type="primary" size="large" onClick={() => setModalOpen(true)}>
          + Добавить сотрудника
        </Button>
      </div>

      <div className={styles.columns}>
        <aside className={styles.panel}>
          <h2 className={styles.panelTitle}>Предприятия</h2>
          <Input
            placeholder="Поиск по предприятию..."
            value={treeSearch}
            onChange={(e) => setTreeSearch(e.target.value)}
            allowClear
          />
          <div className={styles.tree}>
            {treeData.length === 0 ? (
              <p>Ничего не найдено</p>
            ) : (
              <Tree
                key={treeSearch}
                defaultExpandAll
                treeData={treeData}
                selectedKeys={selectedKey ? [selectedKey] : []}
                onSelect={(keys) => {
                  setSelectedKey(keys[0] as string | undefined) // повторный клик снимает фильтр
                  setPage(1)
                }}
              />
            )}
          </div>
        </aside>

        <section className={styles.panel}>
          <Tabs
            tabBarExtraContent={<Button>Редактировать</Button>}
            items={[
              {
                key: 'employees',
                label: 'Сотрудники',
                children: (
                  <>
                    <Input
                      className={styles.search}
                      placeholder="Поиск по сотрудникам..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                      }}
                      allowClear
                    />
                    {isError && <p>Не удалось загрузить сотрудников.</p>}
                    <Table<Employee>
                      rowKey="id"
                      columns={columns}
                      dataSource={data?.items}
                      loading={isFetching}
                      locale={{ emptyText: 'Сотрудники не найдены' }}
                      pagination={{
                        current: page,
                        pageSize: PAGE_SIZE,
                        total: data?.total ?? 0,
                        onChange: setPage,
                        showSizeChanger: false,
                        align: 'center',
                      }}
                    />
                  </>
                ),
              },
              {
                key: 'roles',
                label: 'Роли',
                children: (
                  <Table<{ name: string }>
                    rowKey="name"
                    columns={[{ title: 'Роль', dataIndex: 'name' }]}
                    dataSource={roles?.map((name) => ({ name }))}
                    pagination={false}
                  />
                ),
              },
            ]}
          />
        </section>
      </div>

      <AddEmployeeModal
        open={modalOpen}
        loading={addEmployee.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  )
}