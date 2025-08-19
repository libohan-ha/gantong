<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>超级管理员控制台</h1>
      <p>账号与角色总控</p>
    </div>

    <div class="admin-content">
      <!-- 用户管理卡片 -->
      <div class="management-card">
        <div class="card-header">
          <h2>用户管理</h2>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户..."
              style="width: 200px; margin-right: 10px;"
              clearable
            />
            <el-button type="primary" @click="() => { console.log('按钮被点击了'); showCreateDialog = true }">
              新建用户
            </el-button>
            <el-button @click="exportUsers">
              导出用户
            </el-button>
          </div>
        </div>

        <!-- 批量操作栏 -->
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

        <!-- 用户列表 -->
        <el-table
          ref="tableRef"
          :data="filteredUsers"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="role" label="角色">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)">
                {{ getRoleDisplayName(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="enabled" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
                {{ scope.row.enabled ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="350">
            <template #default="scope">
              <el-button
                size="small"
                @click="editUser(scope.row)"
                :disabled="scope.row.role === 'SUPER_ADMIN'"
              >
                编辑角色
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="resetPassword(scope.row)"
              >
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

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalUsers"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 新建用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建用户"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="createForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="createForm.password" type="password" />
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
        <el-button type="primary" @click="createUser" :loading="creating">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑用户角色"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ editingUser?.email || editingUser?.phone }}</span>
        </el-form-item>
        <el-form-item label="当前角色">
          <el-tag :type="getRoleTagType(editingUser?.role)">
            {{ getRoleDisplayName(editingUser?.role) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="newRole" style="width: 100%">
            <el-option label="家长" value="PARENT" />
            <el-option label="医生" value="DOCTOR" />
            <el-option label="学校管理员" value="SCHOOL_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="updateUserRole" :loading="updating">
          更新
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量修改角色对话框 -->
    <el-dialog
      v-model="showBatchRoleDialog"
      title="批量修改角色"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="选中用户">
          <span>{{ selectedUsers.length }} 个用户</span>
        </el-form-item>
        <el-form-item label="新角色">
          <el-select v-model="batchRole" style="width: 100%">
            <el-option label="家长" value="PARENT" />
            <el-option label="医生" value="DOCTOR" />
            <el-option label="学校管理员" value="SCHOOL_ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBatchRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="batchChangeRole" :loading="batchUpdating">
          批量修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'

// 接口定义
interface User {
  id: number
  email?: string
  phone?: string
  role: string
  createdAt: string
  enabled?: boolean
}

interface CreateUserForm {
  email: string
  phone: string
  password: string
  role: string
}

// 响应式数据
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const batchUpdating = ref(false)
const users = ref<User[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalUsers = ref(0)
const selectedUsers = ref<User[]>([])

// 对话框状态
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showBatchRoleDialog = ref(false)
const editingUser = ref<User | null>(null)
const newRole = ref('')
const batchRole = ref('PARENT')

// 表格引用
const tableRef = ref()

// 表单数据
const createForm = ref<CreateUserForm>({
  email: '',
  phone: '',
  password: '',
  role: 'PARENT'
})

const createFormRef = ref<FormInstance>()

// 表单验证规则
const createRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 计算属性
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.email?.toLowerCase().includes(query) ||
    user.phone?.includes(query) ||
    getRoleDisplayName(user.role).includes(query)
  )
})

// 工具函数
const getRoleDisplayName = (role: string) => {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': '超级管理员',
    'HOSPITAL_ADMIN': '医院管理员',
    'DOCTOR': '医生',
    'PARENT': '家长',
    'SCHOOL_ADMIN': '学校管理员'
  }
  return roleMap[role] || role
}

const getRoleTagType = (role: string) => {
  const typeMap: Record<string, string> = {
    'SUPER_ADMIN': 'danger',
    'HOSPITAL_ADMIN': 'warning',
    'DOCTOR': 'success',
    'PARENT': 'info',
    'SCHOOL_ADMIN': 'primary'
  }
  return typeMap[role] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// API 调用函数
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
    const data = await response.json()
    users.value = data
    totalUsers.value = data.length
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 事件处理函数
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
    
    const response = await fetch('http://localhost:3000/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(createForm.value)
    })
    
    if (response.ok) {
      ElMessage.success('用户创建成功')
      showCreateDialog.value = false
      createFormRef.value.resetFields()
      await fetchUsers()
    } else {
      ElMessage.error('用户创建失败')
    }
  } catch (error) {
    ElMessage.error('用户创建失败')
  } finally {
    creating.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  newRole.value = user.role
  showEditDialog.value = true
}

const updateUserRole = async () => {
  if (!editingUser.value) return
  
  updating.value = true
  try {
    const response = await fetch(`http://localhost:3000/admin/users/${editingUser.value.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ role: newRole.value })
    })
    
    if (response.ok) {
      ElMessage.success('角色更新成功')
      showEditDialog.value = false
      await fetchUsers()
    } else {
      ElMessage.error('角色更新失败')
    }
  } catch (error) {
    ElMessage.error('角色更新失败')
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
        type: 'warning'
      }
    )

    const response = await fetch(`http://localhost:3000/admin/users/${user.id}/reset-password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      const result = await response.json()
      ElMessage.success(`密码重置成功！临时密码：${result.tempPassword}`)
    } else {
      const error = await response.json()
      ElMessage.error(error.message || '密码重置失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
    }
  }
}

const toggleUserStatus = async (user: User) => {
  const action = user.enabled ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 ${user.email || user.phone} 吗？`,
      `${action}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await fetch(`http://localhost:3000/admin/users/${user.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ enabled: !user.enabled })
    })

    if (response.ok) {
      const result = await response.json()
      ElMessage.success(result.message)
      await fetchUsers()
    } else {
      const error = await response.json()
      ElMessage.error(error.message || `用户${action}失败`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`用户${action}失败`)
    }
  }
}

const exportUsers = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

// 选择相关函数
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
  selectedUsers.value = []
}

// 删除用户
const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.email || user.phone} 吗？此操作不可恢复！`,
      '删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await fetch(`http://localhost:3000/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (response.ok) {
      ElMessage.success('用户删除成功')
      await fetchUsers()
    } else {
      const error = await response.json()
      ElMessage.error(error.message || '用户删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('用户删除失败')
    }
  }
}

// 批量操作函数
const batchEnable = async () => {
  await batchOperation('enable', '启用')
}

const batchDisable = async () => {
  await batchOperation('disable', '停用')
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await batchOperation('delete', '删除')
  } catch (error) {
    // 用户取消
  }
}

const batchChangeRole = async () => {
  await batchOperation('changeRole', '修改角色', batchRole.value)
  showBatchRoleDialog.value = false
}

const batchOperation = async (action: string, actionName: string, role?: string) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }

  batchUpdating.value = true
  try {
    const userIds = selectedUsers.value.map(user => user.id)
    const body: any = { action, userIds }
    if (role) body.role = role

    const response = await fetch('http://localhost:3000/admin/users/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      const result = await response.json()
      ElMessage.success(result.message)
      clearSelection()
      await fetchUsers()
    } else {
      const error = await response.json()
      ElMessage.error(error.message || `批量${actionName}失败`)
    }
  } catch (error) {
    ElMessage.error(`批量${actionName}失败`)
  } finally {
    batchUpdating.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchUsers()
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
</style>
