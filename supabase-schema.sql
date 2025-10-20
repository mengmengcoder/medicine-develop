-- 药物研发平台 Supabase 数据库架构
-- 创建时间: 2025-10-20
-- 项目: 多属性协同优化与全流程智能药物研发平台

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. 用户表 (users)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'researcher' CHECK (role IN ('admin', 'researcher', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 分子生成任务表 (molecule_generation_tasks)
CREATE TABLE molecule_generation_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  parameters JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. 多目标优化任务表 (multi_objective_optimization_tasks)
CREATE TABLE multi_objective_optimization_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  objectives JSONB NOT NULL DEFAULT '{}',
  constraints JSONB,
  algorithm TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. 虚拟筛选任务表 (virtual_screening_tasks)
CREATE TABLE virtual_screening_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  compound_library TEXT NOT NULL,
  target_protein TEXT NOT NULL,
  screening_parameters JSONB NOT NULL DEFAULT '{}',
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. 分子数据表 (molecules)
CREATE TABLE molecules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES molecule_generation_tasks(id) ON DELETE CASCADE,
  smiles TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  structure_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 模型管理表 (models)
CREATE TABLE models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('generation', 'optimization', 'screening')),
  version TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  file_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 任务日志表 (task_logs)
CREATE TABLE task_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('generation', 'optimization', 'screening')),
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 文件存储表 (files)
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  storage_path TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_molecule_tasks_user_id ON molecule_generation_tasks(user_id);
CREATE INDEX idx_molecule_tasks_status ON molecule_generation_tasks(status);
CREATE INDEX idx_optimization_tasks_user_id ON multi_objective_optimization_tasks(user_id);
CREATE INDEX idx_screening_tasks_user_id ON virtual_screening_tasks(user_id);
CREATE INDEX idx_molecules_task_id ON molecules(task_id);
CREATE INDEX idx_molecules_smiles_trgm ON molecules USING gin(smiles gin_trgm_ops);
CREATE INDEX idx_models_type ON models(type);
CREATE INDEX idx_models_is_active ON models(is_active);
CREATE INDEX idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX idx_task_logs_created_at ON task_logs(created_at);

-- 创建全文搜索索引
CREATE INDEX idx_molecules_smiles_search ON molecules USING gin(to_tsvector('english', smiles));

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要更新时间的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_molecule_tasks_updated_at BEFORE UPDATE ON molecule_generation_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_optimization_tasks_updated_at BEFORE UPDATE ON multi_objective_optimization_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_screening_tasks_updated_at BEFORE UPDATE ON virtual_screening_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建搜索分子的函数
CREATE OR REPLACE FUNCTION search_molecules(
  query_text TEXT,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  smiles TEXT,
  properties JSONB,
  task_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.smiles,
    m.properties,
    mgt.name as task_name
  FROM molecules m
  LEFT JOIN molecule_generation_tasks mgt ON m.task_id = mgt.id
  WHERE m.smiles ILIKE '%' || query_text || '%'
     OR mgt.name ILIKE '%' || query_text || '%'
  ORDER BY m.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 创建获取用户任务统计的函数
CREATE OR REPLACE FUNCTION get_user_task_stats(user_id_param UUID)
RETURNS TABLE(
  total_tasks BIGINT,
  completed_tasks BIGINT,
  running_tasks BIGINT,
  failed_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH all_tasks AS (
    SELECT status FROM molecule_generation_tasks WHERE user_id = user_id_param
    UNION ALL
    SELECT status FROM multi_objective_optimization_tasks WHERE user_id = user_id_param
    UNION ALL
    SELECT status FROM virtual_screening_tasks WHERE user_id = user_id_param
  )
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'running') as running_tasks,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_tasks
  FROM all_tasks;
END;
$$ LANGUAGE plpgsql;

-- 启用行级安全 (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE molecule_generation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE multi_objective_optimization_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_screening_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE molecules ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略：用户只能查看自己的信息，管理员可以查看所有
CREATE POLICY "用户只能查看自己的信息" ON users FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "用户只能更新自己的信息" ON users FOR UPDATE USING (auth.uid() = id);

-- 任务表策略：用户只能查看和管理自己的任务
CREATE POLICY "用户查看自己的任务" ON molecule_generation_tasks FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "用户创建任务" ON molecule_generation_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户更新自己的任务" ON molecule_generation_tasks FOR UPDATE USING (auth.uid() = user_id);

-- 为其他任务表创建相同的策略（简化示例）
CREATE POLICY "用户查看优化任务" ON multi_objective_optimization_tasks FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "用户创建优化任务" ON multi_objective_optimization_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户查看筛选任务" ON virtual_screening_tasks FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "用户创建筛选任务" ON virtual_screening_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 分子数据策略：用户只能查看自己任务生成的分子
CREATE POLICY "用户查看分子数据" ON molecules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM molecule_generation_tasks mgt 
    WHERE mgt.id = molecules.task_id 
    AND (mgt.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin')
  )
);

-- 插入示例数据
INSERT INTO users (email, name, role) VALUES 
('admin@drug-discovery.com', '系统管理员', 'admin'),
('researcher@drug-discovery.com', '研究员张三', 'researcher'),
('viewer@drug-discovery.com', '查看者李四', 'viewer');

INSERT INTO models (name, type, version, description, parameters, file_path, is_active) VALUES 
('GPT-Mol', 'generation', '1.0.0', '基于GPT的分子生成模型', '{"max_length": 100, "temperature": 0.8}', '/models/gpt-mol-v1.pt', true),
('NSGA-II', 'optimization', '2.0.0', '多目标遗传算法', '{"population_size": 100, "generations": 1000}', '/models/nsga2-v2.py', true),
('AutoDock', 'screening', '4.2.6', '分子对接软件', '{"scoring_function": "vina"}', '/models/autodock', true);

-- 注释说明
COMMENT ON TABLE users IS '平台用户管理表';
COMMENT ON TABLE molecule_generation_tasks IS '分子生成任务表';
COMMENT ON TABLE multi_objective_optimization_tasks IS '多目标优化任务表';
COMMENT ON TABLE virtual_screening_tasks IS '虚拟筛选任务表';
COMMENT ON TABLE molecules IS '分子数据表';
COMMENT ON TABLE models IS 'AI模型管理表';
COMMENT ON TABLE task_logs IS '任务日志表';
COMMENT ON TABLE files IS '文件存储表';