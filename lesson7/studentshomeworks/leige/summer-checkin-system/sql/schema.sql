-- Supabase PostgreSQL Schema
-- 幼升小暑期学习打卡与成长记录系统

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT '其他',
    description TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 打卡记录表
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_done BOOLEAN DEFAULT FALSE,
    note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 同一个 task_id 在同一天只能有一条打卡记录
    UNIQUE(task_id, checkin_date)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkins_task_id ON checkins(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(is_active);

-- 自动更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 tasks 表添加更新触发器
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为 checkins 表添加更新触发器
DROP TRIGGER IF EXISTS update_checkins_updated_at ON checkins;
CREATE TRIGGER update_checkins_updated_at
    BEFORE UPDATE ON checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入一些示例任务
INSERT INTO tasks (title, category, description) VALUES
    ('拼音练习', '拼音', '每天练习拼音字母和拼读'),
    ('识字练习', '识字', '认识5个新汉字'),
    ('数学口算', '数学', '完成10道口算题'),
    ('绘本阅读', '阅读', '阅读一本绘本并复述故事'),
    ('英语启蒙', '英语', '学习3个英语单词'),
    ('户外运动', '运动', '跳绳或跑步30分钟'),
    ('写字练习', '写字', '练习写5个字，注意笔画顺序'),
    ('整理书包', '生活习惯', '自己整理书包和文具');
