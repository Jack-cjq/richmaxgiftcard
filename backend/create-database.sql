-- 创建新的礼品卡交易数据库
-- 如果数据库已存在，先删除（谨慎使用）
-- DROP DATABASE IF EXISTS giftcardtrade;

-- 创建新数据库
CREATE DATABASE giftcardtrade
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Chinese (Simplified)_China.utf8'
    LC_CTYPE = 'Chinese (Simplified)_China.utf8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 添加注释
COMMENT ON DATABASE giftcardtrade IS '礼品卡交易平台数据库';

