// 简单的 API 测试脚本
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// 测试用户凭证（需要先创建测试用户）
const DOCTOR_CREDENTIALS = {
  email: 'doctor@test.com',
  password: 'Test123456'
};

const PARENT_CREDENTIALS = {
  email: 'parent@test.com', 
  password: 'Test123456'
};

async function testVideoAPI() {
  try {
    console.log('🧪 开始测试视频 API...\n');

    // 1. 医生登录
    console.log('1. 医生登录...');
    const doctorLogin = await axios.post(`${BASE_URL}/auth/login`, DOCTOR_CREDENTIALS);
    const doctorToken = doctorLogin.data.accessToken;
    console.log('✅ 医生登录成功\n');

    // 2. 家长登录
    console.log('2. 家长登录...');
    const parentLogin = await axios.post(`${BASE_URL}/auth/login`, PARENT_CREDENTIALS);
    const parentToken = parentLogin.data.accessToken;
    console.log('✅ 家长登录成功\n');

    // 3. 测试医生获取视频列表（应该为空）
    console.log('3. 测试医生获取视频列表...');
    const myVideos = await axios.get(`${BASE_URL}/videos/mine`, {
      headers: { Authorization: `Bearer ${doctorToken}` }
    });
    console.log('✅ 医生视频列表:', myVideos.data);
    console.log('');

    // 4. 测试家长获取专家课程（应该为空）
    console.log('4. 测试家长获取专家课程...');
    const expertCourses = await axios.get(`${BASE_URL}/client/expert-courses`, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    console.log('✅ 专家课程列表:', expertCourses.data);
    console.log('');

    // 5. 测试权限控制 - 家长不能访问医生接口
    console.log('5. 测试权限控制...');
    try {
      await axios.get(`${BASE_URL}/videos/mine`, {
        headers: { Authorization: `Bearer ${parentToken}` }
      });
      console.log('❌ 权限控制失败：家长能访问医生接口');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 权限控制正常：家长无法访问医生接口');
      } else {
        console.log('❌ 意外错误:', error.message);
      }
    }

    // 6. 测试权限控制 - 医生不能访问家长接口
    try {
      await axios.get(`${BASE_URL}/client/expert-courses`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      console.log('❌ 权限控制失败：医生能访问家长接口');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ 权限控制正常：医生无法访问家长接口');
      } else {
        console.log('❌ 意外错误:', error.message);
      }
    }

    console.log('\n🎉 API 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testVideoAPI();
