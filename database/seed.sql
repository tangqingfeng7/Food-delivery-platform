-- 使用数据库
USE takeaway_db;

-- 插入测试用户 (密码: 123456, BCrypt加密后)
-- BCrypt hash for "123456": $2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK
INSERT INTO users (username, password, phone, email, address, role) VALUES
('张三', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13800138001', 'zhangsan@example.com', '北京市朝阳区建国路88号', 'USER'),
('李四', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13800138002', 'lisi@example.com', '北京市海淀区中关村大街1号', 'USER'),
('王五', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13800138003', 'wangwu@example.com', '上海市浦东新区陆家嘴环路1000号', 'USER');

-- 插入店铺商家用户 (密码: 123456)
INSERT INTO users (username, password, phone, email, role) VALUES
('老北京炸酱面馆管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000001', 'shop1@example.com', 'MERCHANT'),
('川香阁麻辣烫管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000002', 'shop2@example.com', 'MERCHANT'),
('日式拉面屋管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000003', 'shop3@example.com', 'MERCHANT'),
('粤式茶餐厅管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000004', 'shop4@example.com', 'MERCHANT'),
('意大利披萨屋管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000005', 'shop5@example.com', 'MERCHANT'),
('韩式炸鸡店管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000006', 'shop6@example.com', 'MERCHANT'),
('麦香园包子铺管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000007', 'shop7@example.com', 'MERCHANT'),
('星巴克咖啡管理员', '$2a$10$e/eoVA/H1C7VpY3e44u3pukUaX4cln6vKgYDHzNiJWi7bGot2QVqK', '13900000008', 'shop8@example.com', 'MERCHANT');

-- 插入分类
INSERT INTO categories (name, icon, color, sort_order) VALUES
('快餐便当', 'zap', 'from-orange-400 to-red-500', 1),
('火锅烧烤', 'flame', 'from-red-400 to-pink-500', 2),
('奶茶甜品', 'coffee', 'from-pink-400 to-purple-500', 3),
('中式正餐', 'soup', 'from-yellow-400 to-orange-500', 4),
('西餐', 'pizza', 'from-blue-400 to-cyan-500', 5),
('日韩料理', 'award', 'from-green-400 to-teal-500', 6);

-- 插入餐厅数据（owner_id 关联商家用户，用户ID 4-11 对应店铺 1-8）
INSERT INTO restaurants (name, description, image, logo, rating, review_count, delivery_time, delivery_fee, min_order, distance, address, phone, open_time, close_time, is_open, is_new, is_featured, category_id, owner_id, tags) VALUES
('老北京炸酱面馆', '传承百年老北京风味，正宗炸酱面，地道京味小吃', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100', 4.8, 1256, '25-35', 3.00, 20.00, 1.2, '北京市朝阳区建国路88号', '010-88888001', '10:00:00', '22:00:00', TRUE, TRUE, TRUE, 4, 4, '面食,北京菜,老字号'),
('川香阁麻辣烫', '正宗四川麻辣烫，麻辣鲜香，回味无穷', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100', 4.6, 892, '30-40', 4.00, 25.00, 2.1, '北京市朝阳区三里屯路19号', '010-88888002', '11:00:00', '23:00:00', TRUE, FALSE, TRUE, 2, 5, '川菜,麻辣,火锅'),
('日式拉面屋', '日本进口食材，传统手工拉面，浓郁豚骨汤底', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=100', 4.9, 2103, '20-30', 5.00, 30.00, 0.8, '北京市朝阳区望京西路50号', '010-88888003', '11:00:00', '22:00:00', TRUE, FALSE, TRUE, 6, 6, '日料,拉面,日式'),
('粤式茶餐厅', '正宗广式茶点，新鲜食材，精心烹制', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=100', 4.7, 1567, '35-45', 4.00, 35.00, 1.5, '北京市朝阳区国贸大厦B1层', '010-88888004', '07:00:00', '21:00:00', TRUE, TRUE, TRUE, 4, 7, '粤菜,早茶,茶餐厅'),
('意大利披萨屋', '纯正意式披萨，手工现做，薄脆可口', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100', 4.5, 756, '25-35', 6.00, 40.00, 2.3, '北京市朝阳区CBD中央商务区', '010-88888005', '11:00:00', '22:00:00', TRUE, FALSE, TRUE, 5, 8, '西餐,披萨,意大利'),
('韩式炸鸡店', '韩式秘制炸鸡，外酥里嫩，配送韩式泡菜', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=100', 4.8, 1890, '20-30', 3.00, 28.00, 1.0, '北京市朝阳区望京SOHO', '010-88888006', '11:00:00', '23:59:59', TRUE, FALSE, TRUE, 6, 9, '韩餐,炸鸡,韩式'),
('麦香园包子铺', '现蒸现卖，皮薄馅大，早餐首选', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100', 4.4, 567, '15-25', 2.00, 15.00, 0.5, '北京市朝阳区朝外大街甲6号', '010-88888007', '06:00:00', '14:00:00', TRUE, FALSE, FALSE, 1, 10, '快餐,早餐,包子'),
('星巴克咖啡', '全球知名咖啡品牌，提供优质咖啡和轻食', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100', 4.6, 2345, '15-25', 0.00, 30.00, 0.3, '北京市朝阳区建国门外大街1号', '010-88888008', '07:00:00', '22:00:00', TRUE, FALSE, TRUE, 3, 11, '咖啡,饮品,甜品');

-- 为餐厅1插入菜品分类
INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES
(1, '推荐', 1),
(1, '招牌面食', 2),
(1, '凉菜小吃', 3),
(1, '主食', 4),
(1, '饮品', 5);

-- 为餐厅1插入菜品
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(1, 1, '老北京炸酱面', '精选黄酱，手工面条，配以黄瓜丝、萝卜丝、豆芽等多种菜码', 28.00, 35.00, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 999, TRUE, FALSE, TRUE, 1),
(1, 1, '卤煮火烧', '传统老北京风味，猪肺、猪肠、豆腐、火烧，汤浓味美', 32.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 666, TRUE, FALSE, TRUE, 2),
(1, 2, '京酱肉丝', '选用里脊肉，配以甜面酱，肉丝嫩滑，酱香浓郁', 38.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 456, FALSE, FALSE, TRUE, 3),
(1, 3, '炸灌肠', '外酥里嫩，蘸蒜汁食用，经典老北京小吃', 18.00, NULL, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 789, FALSE, FALSE, TRUE, 4),
(1, 3, '豆汁焦圈', '正宗老北京豆汁，配焦圈和咸菜，地道早餐体验', 15.00, NULL, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 321, FALSE, TRUE, TRUE, 5),
(1, 2, '打卤面', '传统卤汤浇头，鸡蛋、木耳、黄花菜等配料丰富', 25.00, NULL, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 543, FALSE, FALSE, TRUE, 6),
(1, 4, '肉龙', '老北京特色主食，肉馅裹在面皮中蒸制而成', 22.00, NULL, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 234, FALSE, FALSE, TRUE, 7),
(1, 5, '北冰洋汽水', '经典北京饮料，橘子味，冰爽解渴', 6.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 876, FALSE, FALSE, TRUE, 8);

-- 为餐厅2插入菜品分类
INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES
(2, '推荐', 1),
(2, '荤菜', 2),
(2, '素菜', 3),
(2, '主食', 4),
(2, '饮品', 5);

-- 为餐厅2插入菜品
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(2, 6, '招牌麻辣烫', '精选各种食材，麻辣鲜香，汤底浓郁', 35.00, 42.00, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 1234, TRUE, FALSE, TRUE, 1),
(2, 6, '肥牛麻辣烫', '新鲜肥牛配麻辣汤底，鲜嫩可口', 45.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 987, TRUE, FALSE, TRUE, 2),
(2, 7, '鸭血豆腐', '新鲜鸭血搭配嫩豆腐，口感滑嫩', 12.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 654, FALSE, FALSE, TRUE, 3),
(2, 7, '午餐肉', '精选午餐肉，搭配麻辣汤底更美味', 8.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 543, FALSE, FALSE, TRUE, 4),
(2, 8, '土豆片', '新鲜土豆切片，口感脆嫩', 5.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 876, FALSE, FALSE, TRUE, 5),
(2, 8, '藕片', '莲藕切片，清脆爽口', 6.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 432, FALSE, FALSE, TRUE, 6),
(2, 9, '米饭', '精选东北大米，软糯可口', 3.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 1500, FALSE, FALSE, TRUE, 7),
(2, 10, '酸梅汤', '自制酸梅汤，酸甜解腻', 8.00, NULL, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 654, FALSE, FALSE, TRUE, 8);

-- 为餐厅3插入菜品分类
INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES
(3, '推荐', 1),
(3, '拉面', 2),
(3, '小食', 3),
(3, '饮品', 4);

-- 为餐厅3插入菜品
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(3, 11, '豚骨拉面', '浓郁豚骨汤底，叉烧、溏心蛋、海苔配料丰富', 42.00, 52.00, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 2345, TRUE, FALSE, TRUE, 1),
(3, 11, '味噌拉面', '日式味噌汤底，味道醇厚，营养丰富', 38.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 1876, TRUE, FALSE, TRUE, 2),
(3, 12, '酱油拉面', '清爽酱油汤底，经典日式风味', 35.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 1234, FALSE, FALSE, TRUE, 3),
(3, 12, '担担面', '麻辣鲜香，花生碎和肉末完美融合', 36.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 987, FALSE, TRUE, TRUE, 4),
(3, 13, '日式煎饺', '外皮酥脆，肉馅鲜美，蘸酱食用', 18.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 765, FALSE, FALSE, TRUE, 5),
(3, 13, '唐扬炸鸡块', '日式炸鸡块，外酥里嫩', 22.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 654, FALSE, FALSE, TRUE, 6),
(3, 14, '三得利乌龙茶', '日本进口乌龙茶，清爽解腻', 10.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 543, FALSE, FALSE, TRUE, 7),
(3, 14, '可尔必思', '日本乳酸菌饮料，酸甜可口', 12.00, NULL, 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 432, FALSE, FALSE, TRUE, 8);

-- 为其他餐厅也插入一些基础数据
INSERT INTO menu_categories (restaurant_id, name, sort_order) VALUES
(4, '推荐', 1), (4, '点心', 2), (4, '主菜', 3), (4, '饮品', 4),
(5, '推荐', 1), (5, '披萨', 2), (5, '意面', 3), (5, '饮品', 4),
(6, '推荐', 1), (6, '炸鸡', 2), (6, '小食', 3), (6, '饮品', 4),
(7, '推荐', 1), (7, '包子', 2), (7, '粥品', 3), (7, '饮品', 4),
(8, '推荐', 1), (8, '咖啡', 2), (8, '茶饮', 3), (8, '轻食', 4);

-- 餐厅4 粤式茶餐厅
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(4, 15, '虾饺皇', '鲜虾馅料，皮薄馅大，晶莹剔透', 32.00, 38.00, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 1567, TRUE, FALSE, TRUE, 1),
(4, 16, '叉烧包', '蜜汁叉烧馅，松软可口', 18.00, NULL, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 1234, TRUE, FALSE, TRUE, 2),
(4, 16, '蛋挞', '葡式蛋挞，蛋香浓郁', 12.00, NULL, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 987, FALSE, FALSE, TRUE, 3),
(4, 17, '干炒牛河', '嫩滑牛肉配宽河粉，镬气十足', 38.00, NULL, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400', 876, FALSE, FALSE, TRUE, 4);

-- 餐厅5 意大利披萨屋
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(5, 19, '玛格丽特披萨', '番茄、马苏里拉芝士、新鲜罗勒', 58.00, 68.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 876, TRUE, FALSE, TRUE, 1),
(5, 20, '意式肉酱面', '番茄肉酱，帕玛森芝士', 42.00, NULL, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 654, TRUE, FALSE, TRUE, 2),
(5, 20, '奶油培根意面', '浓郁奶油酱，烟熏培根', 45.00, NULL, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 543, FALSE, FALSE, TRUE, 3);

-- 餐厅6 韩式炸鸡店
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(6, 23, '招牌蜂蜜炸鸡', '外酥里嫩，蜂蜜甜辣酱，回味无穷', 68.00, 78.00, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 1890, TRUE, FALSE, TRUE, 1),
(6, 24, '原味炸鸡', '经典原味，酥脆可口', 58.00, NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 1456, TRUE, FALSE, TRUE, 2),
(6, 24, '辣味炸鸡', '韩式辣酱，香辣过瘾', 62.00, NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 1234, FALSE, FALSE, TRUE, 3),
(6, 25, '芝士球', '拉丝芝士，外酥里糯', 28.00, NULL, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 876, FALSE, TRUE, TRUE, 4);

-- 餐厅7 麦香园包子铺
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(7, 27, '鲜肉包', '新鲜猪肉馅，皮薄馅大', 3.00, NULL, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 2345, TRUE, FALSE, TRUE, 1),
(7, 28, '豆沙包', '细腻红豆沙，甜而不腻', 2.50, NULL, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 1876, FALSE, FALSE, TRUE, 2),
(7, 28, '韭菜鸡蛋包', '韭菜鸡蛋馅，鲜香可口', 3.00, NULL, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 1567, FALSE, FALSE, TRUE, 3),
(7, 29, '皮蛋瘦肉粥', '皮蛋瘦肉，软糯可口', 12.00, NULL, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400', 987, FALSE, FALSE, TRUE, 4);

-- 餐厅8 星巴克咖啡
INSERT INTO menu_items (restaurant_id, menu_category_id, name, description, price, original_price, image, sales, is_hot, is_new, is_available, sort_order) VALUES
(8, 31, '美式咖啡', '浓缩咖啡加水，经典美式', 28.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 3456, TRUE, FALSE, TRUE, 1),
(8, 32, '拿铁', '浓缩咖啡配蒸奶，丝滑口感', 32.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 2987, TRUE, FALSE, TRUE, 2),
(8, 32, '摩卡', '巧克力与咖啡的完美融合', 35.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 2345, FALSE, FALSE, TRUE, 3),
(8, 33, '抹茶拿铁', '日式抹茶配牛奶，清新回甘', 35.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1876, FALSE, TRUE, TRUE, 4),
(8, 34, '三明治', '新鲜蔬菜配火腿，营养健康', 28.00, NULL, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 1234, FALSE, FALSE, TRUE, 5);

-- 插入已完成的订单（用于评价）
INSERT INTO orders (order_no, user_id, restaurant_id, total_amount, delivery_fee, discount_amount, pay_amount, status, address, phone, remark, completed_at, created_at) VALUES
('ORD20260101000001ABCD', 1, 3, 80.00, 5.00, 0, 85.00, 'COMPLETED', '北京市朝阳区建国路88号', '13800138001', '不要香菜', '2026-01-01 13:30:00', '2026-01-01 12:00:00'),
('ORD20260102000002EFGH', 1, 1, 56.00, 3.00, 0, 59.00, 'COMPLETED', '北京市朝阳区建国路88号', '13800138001', NULL, '2026-01-02 19:30:00', '2026-01-02 18:00:00'),
('ORD20260103000003IJKL', 2, 3, 96.00, 5.00, 0, 101.00, 'COMPLETED', '北京市海淀区中关村大街1号', '13800138002', '多加葱', '2026-01-03 12:45:00', '2026-01-03 11:30:00'),
('ORD20260104000004MNOP', 2, 6, 126.00, 3.00, 0, 129.00, 'COMPLETED', '北京市海淀区中关村大街1号', '13800138002', NULL, '2026-01-04 20:00:00', '2026-01-04 19:00:00'),
('ORD20260105000005QRST', 3, 3, 84.00, 5.00, 0, 89.00, 'COMPLETED', '上海市浦东新区陆家嘴环路1000号', '13800138003', NULL, '2026-01-05 13:00:00', '2026-01-05 12:00:00'),
('ORD20260106000006UVWX', 1, 3, 42.00, 5.00, 0, 47.00, 'COMPLETED', '北京市朝阳区建国路88号', '13800138001', NULL, '2026-01-06 12:30:00', '2026-01-06 11:30:00'),
('ORD20260107000007YZAB', 2, 3, 78.00, 5.00, 0, 83.00, 'COMPLETED', '北京市海淀区中关村大街1号', '13800138002', '少盐', '2026-01-07 13:15:00', '2026-01-07 12:00:00'),
('ORD20260108000008CDEF', 3, 1, 60.00, 3.00, 0, 63.00, 'COMPLETED', '上海市浦东新区陆家嘴环路1000号', '13800138003', NULL, '2026-01-08 19:00:00', '2026-01-08 18:00:00');

-- 插入订单项
INSERT INTO order_items (order_id, menu_item_id, menu_item_name, menu_item_image, price, quantity) VALUES
(1, 17, '豚骨拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 42.00, 1),
(1, 18, '味噌拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 38.00, 1),
(2, 1, '老北京炸酱面', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 28.00, 2),
(3, 17, '豚骨拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 42.00, 2),
(3, 21, '日式煎饺', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 18.00, 1),
(4, 37, '招牌蜂蜜炸鸡', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 68.00, 1),
(4, 38, '原味炸鸡', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400', 58.00, 1),
(5, 17, '豚骨拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 42.00, 2),
(6, 17, '豚骨拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 42.00, 1),
(7, 17, '豚骨拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 42.00, 1),
(7, 19, '酱油拉面', 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400', 35.00, 1),
(8, 1, '老北京炸酱面', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', 28.00, 1),
(8, 2, '卤煮火烧', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', 32.00, 1);

-- 插入评价数据
INSERT INTO reviews (order_id, user_id, restaurant_id, taste_rating, packaging_rating, delivery_rating, overall_rating, content, images, is_anonymous, like_count, reply_content, reply_time, created_at) VALUES
(1, 1, 3, 5, 5, 5, 5.0, '豚骨汤底非常浓郁，面条筋道，叉烧入口即化！强烈推荐！', NULL, FALSE, 23, '感谢您的好评，欢迎再次光临！', '2026-01-01 15:00:00', '2026-01-01 14:00:00'),
(2, 1, 1, 5, 4, 5, 4.7, '正宗老北京味道，炸酱很香，面码给得很足！', NULL, FALSE, 15, '谢谢支持！', '2026-01-02 20:00:00', '2026-01-02 19:45:00'),
(3, 2, 3, 5, 5, 4, 4.7, '拉面很正宗，汤底醇厚，配料新鲜，就是配送稍微慢了一点', NULL, FALSE, 18, '感谢反馈，我们会改进配送速度！', '2026-01-03 14:00:00', '2026-01-03 13:00:00'),
(4, 2, 6, 5, 5, 5, 5.0, '炸鸡外酥里嫩，蜂蜜酱太好吃了！配送也很快，必点！', NULL, FALSE, 31, NULL, NULL, '2026-01-04 20:30:00'),
(5, 3, 3, 4, 5, 5, 4.7, '味道不错，包装很用心，下次还会再点', NULL, TRUE, 8, NULL, NULL, '2026-01-05 13:30:00'),
(6, 1, 3, 5, 4, 5, 4.7, '第N次点了，一如既往的好吃！', NULL, FALSE, 12, '感谢您的持续支持！', '2026-01-06 14:00:00', '2026-01-06 13:00:00'),
(7, 2, 3, 5, 5, 5, 5.0, '强烈推荐豚骨拉面！汤底浓郁，面条Q弹，太完美了', NULL, FALSE, 25, NULL, NULL, '2026-01-07 14:00:00'),
(8, 3, 1, 4, 4, 5, 4.3, '老北京风味，挺地道的，下次试试卤煮', NULL, FALSE, 6, NULL, NULL, '2026-01-08 19:30:00');

-- 插入评价点赞数据
INSERT INTO review_likes (review_id, user_id, created_at) VALUES
(1, 2, '2026-01-01 16:00:00'),
(1, 3, '2026-01-01 17:00:00'),
(2, 2, '2026-01-02 21:00:00'),
(3, 1, '2026-01-03 15:00:00'),
(4, 1, '2026-01-04 21:00:00'),
(4, 3, '2026-01-04 22:00:00'),
(7, 1, '2026-01-07 15:00:00');

-- 更新餐厅评分和评价数（根据实际评价数据）
UPDATE restaurants SET rating = 4.9, review_count = 5 WHERE id = 3;
UPDATE restaurants SET rating = 4.5, review_count = 2 WHERE id = 1;
UPDATE restaurants SET rating = 5.0, review_count = 1 WHERE id = 6;

-- 插入通知数据
INSERT INTO notifications (user_id, title, content, type, is_read, related_id) VALUES
(1, '欢迎使用美食速递', '感谢您注册美食速递，祝您用餐愉快！', 'SYSTEM', FALSE, NULL),
(1, '新年优惠活动', '新年期间全场满50减10，快来抢购！活动时间：1月1日-1月15日', 'PROMO', FALSE, NULL),
(1, '您有一张新优惠券', '恭喜您获得一张满30减5优惠券，快去使用吧！', 'PROMO', TRUE, NULL),
(2, '欢迎使用美食速递', '感谢您注册美食速递，祝您用餐愉快！', 'SYSTEM', FALSE, NULL),
(2, '周末特惠', '周末下单享8折优惠，仅限本周六日！', 'PROMO', FALSE, NULL),
(3, '欢迎使用美食速递', '感谢您注册美食速递，祝您用餐愉快！', 'SYSTEM', TRUE, NULL);

SELECT '数据初始化完成！' AS message;
