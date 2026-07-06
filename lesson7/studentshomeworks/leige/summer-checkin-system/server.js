require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase 客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ==================== 任务接口 ====================

// 获取所有任务
app.get('/api/tasks', async (req, res) => {
  try {
    const { category, active } = req.query;
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }
    if (active === 'true') {
      query = query.eq('is_active', true);
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取单个任务
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 新增任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, category, description, is_active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: '任务名称不能为空' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title: title.trim(),
        category: category || '其他',
        description: description || '',
        is_active: is_active !== undefined ? is_active : true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 更新任务
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, category, description, is_active } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (is_active !== undefined) updates.is_active = is_active;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: '没有需要更新的字段' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: '任务不存在' });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: '任务已删除' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 打卡接口 ====================

// 获取今日打卡记录（含任务信息）
app.get('/api/checkins/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 获取所有启用的任务
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (tasksError) throw tasksError;

    // 获取今日打卡记录
    const { data: checkins, error: checkinsError } = await supabase
      .from('checkins')
      .select('*')
      .eq('checkin_date', today);

    if (checkinsError) throw checkinsError;

    // 合并任务和打卡记录
    const checkinMap = {};
    (checkins || []).forEach(c => {
      checkinMap[c.task_id] = c;
    });

    const result = (tasks || []).map(task => ({
      ...task,
      checkin: checkinMap[task.id] || null,
      is_done: checkinMap[task.id] ? checkinMap[task.id].is_done : false,
      note: checkinMap[task.id] ? checkinMap[task.id].note : ''
    }));

    res.json({ success: true, data: result, date: today });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 保存/更新打卡记录（upsert）
app.post('/api/checkins', async (req, res) => {
  try {
    const { task_id, is_done, note } = req.body;

    if (!task_id) {
      return res.status(400).json({ success: false, error: '缺少 task_id' });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('checkins')
      .upsert({
        task_id,
        checkin_date: today,
        is_done: is_done !== undefined ? is_done : false,
        note: note || ''
      }, {
        onConflict: 'task_id,checkin_date'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 获取历史打卡记录
app.get('/api/checkins/history', async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabase
      .from('checkins')
      .select('*, tasks(title, category)')
      .order('checkin_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (start_date) {
      query = query.gte('checkin_date', start_date);
    }
    if (end_date) {
      query = query.lte('checkin_date', end_date);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // 按日期分组
    const grouped = {};
    (data || []).forEach(item => {
      const date = item.checkin_date;
      if (!grouped[date]) {
        grouped[date] = { date, checkins: [], doneCount: 0, totalCount: 0 };
      }
      grouped[date].checkins.push(item);
      grouped[date].totalCount++;
      if (item.is_done) grouped[date].doneCount++;
    });

    // 计算每天完成率
    const result = Object.values(grouped).map(day => ({
      ...day,
      rate: day.totalCount > 0 ? Math.round((day.doneCount / day.totalCount) * 100) : 0
    }));

    res.json({
      success: true,
      data: result,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 统计接口 ====================

app.get('/api/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 并行获取所有需要的数据
    const [
      { data: tasks, error: tasksError },
      { data: allCheckins, error: checkinsError },
      { data: todayCheckins, error: todayError }
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('is_active', true),
      supabase.from('checkins').select('*'),
      supabase.from('checkins').select('*').eq('checkin_date', today)
    ]);

    if (tasksError) throw tasksError;
    if (checkinsError) throw checkinsError;
    if (todayError) throw todayError;

    const activeTasks = tasks || [];
    const all = allCheckins || [];
    const todayList = todayCheckins || [];

    // 今日统计
    const todayTotal = activeTasks.length;
    const todayDone = todayList.filter(c => c.is_done).length;
    const todayRate = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

    // 累计完成次数
    const totalDone = all.filter(c => c.is_done).length;

    // 连续打卡天数（从今天往前推）
    const dateSet = new Set();
    all.forEach(c => {
      if (c.is_done) dateSet.add(c.checkin_date);
    });
    const sortedDates = Array.from(dateSet).sort().reverse();
    let streak = 0;
    const checkDate = new Date(today);
    for (const d of sortedDates) {
      const expected = checkDate.toISOString().split('T')[0];
      if (d === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // 最近7天完成率
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDayStart = sevenDaysAgo.toISOString().split('T')[0];

    const recentCheckins = all.filter(c => c.checkin_date >= sevenDayStart);
    const recentDays = new Set(recentCheckins.map(c => c.checkin_date));
    const recentTotal = recentCheckins.length;
    const recentDone = recentCheckins.filter(c => c.is_done).length;
    const recentRate = recentTotal > 0 ? Math.round((recentDone / recentTotal) * 100) : 0;

    // 各分类完成次数
    const taskMap = {};
    activeTasks.forEach(t => { taskMap[t.id] = t; });

    const categoryStats = {};
    all.forEach(c => {
      if (!c.is_done) return;
      const task = taskMap[c.task_id];
      const cat = task ? task.category : '未知';
      if (!categoryStats[cat]) {
        categoryStats[cat] = 0;
      }
      categoryStats[cat]++;
    });

    const byCategory = Object.entries(categoryStats)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // 最佳打卡日（完成最多的那天）
    const dayCount = {};
    all.forEach(c => {
      if (!c.is_done) return;
      if (!dayCount[c.checkin_date]) {
        dayCount[c.checkin_date] = 0;
      }
      dayCount[c.checkin_date]++;
    });
    let bestDay = null;
    let bestCount = 0;
    Object.entries(dayCount).forEach(([date, count]) => {
      if (count > bestCount) {
        bestCount = count;
        bestDay = date;
      }
    });

    // 累计打卡天数
    const totalCheckinDays = dateSet.size;

    res.json({
      success: true,
      data: {
        today: {
          date: today,
          total: todayTotal,
          done: todayDone,
          rate: todayRate
        },
        total_tasks: activeTasks.length,
        total_done: totalDone,
        streak,
        total_checkin_days: totalCheckinDays,
        recent_7days: {
          start: sevenDayStart,
          end: today,
          total: recentTotal,
          done: recentDone,
          rate: recentRate,
          active_days: recentDays.size
        },
        by_category: byCategory,
        best_day: bestDay ? { date: bestDay, count: bestCount } : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== 启动服务 ====================

app.listen(PORT, () => {
  console.log(`✅ 幼升小暑期学习打卡系统已启动: http://localhost:${PORT}`);
});
