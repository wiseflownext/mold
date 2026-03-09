-- 模具管家 数据库表结构 (参考文档，实际由Prisma migrate生成)

-- 用户表
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  role_id INT NOT NULL,
  workshop_id INT,
  phone VARCHAR(20),
  status INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  app_mode VARCHAR(20) DEFAULT 'worker',
  is_preset BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 角色权限表
CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  menu_key VARCHAR(100) NOT NULL,
  actions VARCHAR(255) NOT NULL,
  UNIQUE KEY (role_id, menu_key)
);

-- 数据字典类型
CREATE TABLE dict_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE
);

-- 数据字典项
CREATE TABLE dict_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  value VARCHAR(100) NOT NULL,
  sort INT DEFAULT 0,
  status INT DEFAULT 1
);

-- 操作日志
CREATE TABLE operation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  target_id INT,
  detail TEXT,
  ip VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_module_target (module, target_id)
);

-- 客户表
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(50) UNIQUE,
  contact VARCHAR(50),
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- 产品表
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  part_no VARCHAR(100),
  model VARCHAR(100),
  customer_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- 模具表(核心)
CREATE TABLE molds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_no VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT '在库',
  location VARCHAR(50) DEFAULT '仓库',
  design_life DECIMAL(12,2),
  life_unit VARCHAR(20) DEFAULT '米',
  total_usage DECIMAL(12,2) DEFAULT 0,
  maintenance_cycle INT,
  inspection_cycle INT,
  next_maintenance_date DATETIME,
  next_inspection_date DATETIME,
  first_use_date DATETIME,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_deleted (is_deleted)
);

-- 模具-产品关联表
CREATE TABLE mold_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  product_id INT NOT NULL,
  UNIQUE KEY (mold_id, product_id)
);

-- 验收表
CREATE TABLE acceptances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL UNIQUE,
  mold_no VARCHAR(100) NOT NULL,
  mold_type VARCHAR(20) NOT NULL,
  result VARCHAR(20) NOT NULL,
  design_life DECIMAL(12,2),
  report_file_id INT,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 使用记录表
CREATE TABLE usage_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  product_id INT,
  amount DECIMAL(12,2) NOT NULL,
  use_date DATETIME NOT NULL,
  user_id INT NOT NULL,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold_date (mold_id, use_date)
);

-- 领用归还记录表
CREATE TABLE borrow_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  type VARCHAR(10) NOT NULL,
  user_id INT NOT NULL,
  workshop VARCHAR(50),
  machine VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id)
);

-- 保养记录表
CREATE TABLE maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  date DATETIME NOT NULL,
  content TEXT NOT NULL,
  user_id INT NOT NULL,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id)
);

-- 维修工单表
CREATE TABLE repair_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT '待处理',
  reporter_id INT NOT NULL,
  handler_id INT,
  handle_desc TEXT,
  cost DECIMAL(10,2),
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id),
  INDEX idx_status (status)
);

-- 鉴定记录表
CREATE TABLE inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  date DATETIME NOT NULL,
  result VARCHAR(20) NOT NULL,
  new_cycle_value DECIMAL(12,2),
  next_date DATETIME,
  inspector VARCHAR(100) NOT NULL,
  report_file_id INT,
  remark TEXT,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id)
);

-- 告警表
CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  mold_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT '未处理',
  handler_id INT,
  handled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type_status (type, status)
);

-- 告警规则表
CREATE TABLE alert_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(30) NOT NULL UNIQUE,
  threshold VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE
);

-- 照片表
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  repair_order_id INT,
  file_id INT NOT NULL,
  remark VARCHAR(255),
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id)
);

-- 状态变更记录表
CREATE TABLE status_changes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mold_id INT NOT NULL,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  reason TEXT,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mold (mold_id)
);

-- 文件记录表
CREATE TABLE file_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  size INT,
  mime_type VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
