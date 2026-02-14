<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>超级管理员控制台</h1>
      <p>账号与角色总控</p>
    </div>

    <div class="admin-content">
      <div class="management-card">
        <div class="card-header">
          <h2>用户管理</h2>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户..."
              style="width: 220px; margin-right: 10px"
              clearable
            />
            <el-button type="primary" @click="showCreateDialog = true">新建用户</el-button>
            <el-button @click="fetchUsers">刷新</el-button>
          </div>
        </div>

        <div v-if="selectedUsers.length > 0" class="batch-actions">
          <span class="selected-info">已选择 {{ selectedUsers.length }} 个用户</span>
          <el-button-group>
            <el-button size="small" @click="batchEnable">批量启用</el-button>
            <el-button size="small" @click="batchDisable">批量停用</el-button>
            <el-button size="small" @click="showBatchRoleDialog = true">批量改角色</el-button>
            <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
          </el-button-group>
          <el-button size="small" @click="clearSelection">取消选择</el-button>
        </div>

        <el-table
          ref="tableRef"
          :data="pagedUsers"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机号" min-width="140" />
          <el-table-column prop="role" label="角色" width="140">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)">
                {{ getRoleDisplayName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                {{ scope.row.enabled ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="330">
            <template #default="scope">
              <el-button
                size="small"
                @click="editUser(scope.row)"
                :disabled="scope.row.role === 'SUPER_ADMIN'"
              >
                编辑角色
              </el-button>
              <el-button size="small" type="warning" @click="resetPassword(scope.row)">
                重置密码
              </el-button>
              <el-button
                size="small"
                :type="scope.row.enabled ? 'danger' : 'success'"
                @click="toggleUserStatus(scope.row)"
                :disabled="scope.row.role === 'SUPER_ADMIN'"
              >
                {{ scope.row.enabled ? '停用' : '启用' }}
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteUser(scope.row)"
                :disabled="scope.row.role === 'SUPER_ADMIN'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredUsers.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <div class="management-card" style="margin-top: 24px">
        <div class="card-header">
          <h2>论坛管理</h2>
          <div class="header-actions">
            <el-input
              v-model="postsQuery"
              placeholder="搜索帖子标题/内容/作者"
              style="width: 260px; margin-right: 10px"
              clearable
              @keyup.enter="fetchPosts"
            />
            <el-button type="primary" @click="fetchPosts">查询</el-button>
          </div>
        </div>

        <el-table :data="forumPosts" style="width: 100%" v-loading="postsLoading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="title" label="标题" min-width="260" />
          <el-table-column label="作者" width="180">
            <template #default="scope">
              {{ scope.row.author?.email || scope.row.author?.phone || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="分类" width="140">
            <template #default="scope">
              {{ scope.row.category?.name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" width="200">
            <template #default="scope">
              {{ new Date(scope.row.createdAt).toLocaleString('zh-CN') }}
            </template>
          </el-table-column>
          <el-table-column label="回复/点赞" width="120">
            <template #default="scope">
              {{ `${scope.row.stats?.replies || 0} / ${scope.row.stats?.likes || 0}` }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteForumPost(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="postsPage"
            v-model:page-size="postsPageSize"
            :page-sizes="[10, 20, 50]"
            :total="postsTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePostsSizeChange"
            @current-change="handlePostsCurrentChange"
          />
        </div>
      </div>
    </div>

    <el-dialog v-model="showCreateDialog" title="新建用户" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="createForm.role" style="width: 100%">
            <el-option label="家长" value="PARENT" />
            <el-option label="医生" value="DOCTOR" />
            <el-option label="学校管理员" value="SCHOOL_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="createUser">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑角色" width="420px">
      <div style="margin-bottom: 12px">
        用户：{{ editingUser?.email || editingUser?.phone || '-' }}
      </div>
      <el-select v-model="newRole" style="width: 100%">
        <el-option label="家长" value="PARENT" />
        <el-option label="医生" value="DOCTOR" />
        <el-option label="学校管理员" value="SCHOOL_ADMIN" />
      </el-select>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="updateUserRole">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showBatchRoleDialog" title="批量修改角色" width="420px">
      <div style="margin-bottom: 12px">将对 {{ selectedUsers.length }} 个用户生效</div>
      <el-select v-model="batchRole" style="width: 100%">
        <el-option label="家长" value="PARENT" />
        <el-option label="医生" value="DOCTOR" />
        <el-option label="学校管理员" value="SCHOOL_ADMIN" />
      </el-select>
      <template #footer>
        <el-button @click="showBatchRoleDialog = false">取消</el-button>
        <el-button type="primary" :loading="batchUpdating" @click="batchChangeRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import api from '@/services/api'
import { HospitalForumService, type HospitalPostItem } from '@/services/hospital-forum'

type UserRole = 'SUPER_ADMIN' | 'DOCTOR' | 'PARENT' | 'SCHOOL_ADMIN'
type BatchAction = 'delete' | 'enable' | 'disable' | 'changeRole'

interface User {
  id: number
  email?: string
  phone?: string
  role: UserRole
  createdAt: string
  enabled: boolean
}

interface CreateUserForm {
  email: string
  phone: string
  password: string
  role: Exclude<UserRole, 'SUPER_ADMIN'>
}

interface BatchOperationResponse {
  message: string
}

const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const batchUpdating = ref(false)

const users = ref<User[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedUsers = ref<User[]>([])

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showBatchRoleDialog = ref(false)
const editingUser = ref<User | null>(null)
const newRole = ref<Exclude<UserRole, 'SUPER_ADMIN'>>('PARENT')
const batchRole = ref<Exclude<UserRole, 'SUPER_ADMIN'>>('PARENT')

const tableRef = ref<{ clearSelection: () => void } | null>(null)

const createForm = ref<CreateUserForm>({
  email: '',
  phone: '',
  password: '',
  role: 'PARENT',
})

const createFormRef = ref<FormInstance>()

const createRules = {
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter((user) => {
    return (
      user.email?.toLowerCase().includes(query) ||
      user.phone?.includes(query) ||
      getRoleDisplayName(user.role).includes(query)
    )
  })
})

const pagedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

const getRoleDisplayName = (role: UserRole) => {
  const roleMap: Record<UserRole, string> = {
    SUPER_ADMIN: '超级管理员',
    DOCTOR: '医生',
    PARENT: '家长',
    SCHOOL_ADMIN: '学校管理员',
  }
  return roleMap[role] ?? role
}

const getRoleTagType = (role: UserRole) => {
  const typeMap: Record<UserRole, string> = {
    SUPER_ADMIN: 'danger',
    DOCTOR: 'success',
    PARENT: 'info',
    SCHOOL_ADMIN: 'primary',
  }
  return typeMap[role] ?? 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

type ApiError = {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as ApiError)?.response?.data?.message
  if (Array.isArray(message)) {
    return message.join('；')
  }
  if (typeof message === 'string' && message.trim()) {
    return message
  }
  return fallback
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const { data } = await api.get<User[]>('/admin/users')
    users.value = data
    currentPage.value = 1
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '获取用户列表失败'))
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

const createUser = async () => {
  if (!createFormRef.value) return

  try {
    const valid = await createFormRef.value.validate()
    if (!valid) return

    creating.value = true
    await api.post('/admin/users', createForm.value)
    ElMessage.success('用户创建成功')
    showCreateDialog.value = false
    createFormRef.value.resetFields()
    await fetchUsers()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '用户创建失败'))
  } finally {
    creating.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  newRole.value = user.role === 'SUPER_ADMIN' ? 'PARENT' : user.role
  showEditDialog.value = true
}

const updateUserRole = async () => {
  if (!editingUser.value) return

  updating.value = true
  try {
    await api.patch(`/admin/users/${editingUser.value.id}/role`, { role: newRole.value })
    ElMessage.success('角色更新成功')
    showEditDialog.value = false
    await fetchUsers()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '角色更新失败'))
  } finally {
    updating.value = false
  }
}

const resetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${user.email || user.phone} 的密码吗？`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const { data } = await api.patch<{ tempPassword: string }>(`/admin/users/${user.id}/reset-password`)
    ElMessage.success(`密码重置成功，临时密码：${data.tempPassword}`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error, '密码重置失败'))
    }
  }
}

const toggleUserStatus = async (user: User) => {
  const action = user.enabled ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 ${user.email || user.phone} 吗？`, `${action}用户`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const { data } = await api.patch<{ message: string }>(`/admin/users/${user.id}/status`, {
      enabled: !user.enabled,
    })
    ElMessage.success(data.message)
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error, `用户${action}失败`))
    }
  }
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
  selectedUsers.value = []
}

const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.email || user.phone} 吗？此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await api.delete(`/admin/users/${user.id}`)
    ElMessage.success('用户删除成功')
    await fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error, '用户删除失败'))
    }
  }
}

const batchEnable = async () => {
  await batchOperation('enable', '启用')
}

const batchDisable = async () => {
  await batchOperation('disable', '停用')
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await batchOperation('delete', '删除')
  } catch {
    // 用户取消
  }
}

const postsLoading = ref(false)
const postsQuery = ref('')
const forumPosts = ref<HospitalPostItem[]>([])
const postsPage = ref(1)
const postsPageSize = ref(10)
const postsTotal = ref(0)

const fetchPosts = async () => {
  postsLoading.value = true
  try {
    const params: Record<string, number | string> = {
      page: postsPage.value,
      pageSize: postsPageSize.value,
      sortBy: 'latestReply',
    }
    if (postsQuery.value) params.q = postsQuery.value

    const res = await HospitalForumService.listPosts(params)
    forumPosts.value = res.items
    postsTotal.value = res.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '加载论坛数据失败'))
  } finally {
    postsLoading.value = false
  }
}

const handlePostsSizeChange = (size: number) => {
  postsPageSize.value = size
  postsPage.value = 1
  fetchPosts()
}

const handlePostsCurrentChange = (page: number) => {
  postsPage.value = page
  fetchPosts()
}

const deleteForumPost = async (row: HospitalPostItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除帖子“${row.title}”吗？此操作不可恢复。`, '删除帖子', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await HospitalForumService.deletePost(row.id)
    ElMessage.success('帖子已删除')
    fetchPosts()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(getErrorMessage(error, '删除失败'))
    }
  }
}

const batchChangeRole = async () => {
  await batchOperation('changeRole', '修改角色', batchRole.value)
  showBatchRoleDialog.value = false
}

const batchOperation = async (action: BatchAction, actionName: string, role?: Exclude<UserRole, 'SUPER_ADMIN'>) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }

  batchUpdating.value = true
  try {
    const userIds = selectedUsers.value.map((user) => user.id)
    const body: { action: BatchAction; userIds: number[]; role?: Exclude<UserRole, 'SUPER_ADMIN'> } = {
      action,
      userIds,
    }
    if (role) body.role = role

    const { data } = await api.post<BatchOperationResponse>('/admin/users/batch', body)
    ElMessage.success(data.message)
    clearSelection()
    await fetchUsers()
  } catch (error) {
    ElMessage.error(getErrorMessage(error, `批量${actionName}失败`))
  } finally {
    batchUpdating.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchPosts()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.admin-header p {
  color: #666;
  font-size: 16px;
}

.management-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  background: #f8f9fa;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f0f9ff;
  border-bottom: 1px solid #e1f5fe;
}

.selected-info {
  color: #1976d2;
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
    gap: 8px;
  }

  .batch-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
