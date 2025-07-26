-- Clear existing data
DELETE FROM HandoverMaterial;
DELETE FROM HandoverReport;
DELETE FROM Material;

-- Create materials for Báo cáo bếp
INSERT INTO Material (name, reportType, isOnFood, isActive, createdAt, updatedAt) VALUES
('Gạo', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Thịt heo', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Thịt bò', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Cá', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Rau cải', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Hành lá', 'BAO_CAO_BEP', true, true, NOW(), NOW()),
('Dầu ăn', 'BAO_CAO_BEP', false, true, NOW(), NOW()),
('Nước mắm', 'BAO_CAO_BEP', false, true, NOW(), NOW()),
('Muối', 'BAO_CAO_BEP', false, true, NOW(), NOW()),
('Đường', 'BAO_CAO_BEP', false, true, NOW(), NOW());

-- Create materials for Báo cáo nước
INSERT INTO Material (name, reportType, isOnFood, isActive, createdAt, updatedAt) VALUES
('Coca Cola', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Pepsi', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Sprite', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Fanta', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Nước suối', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Trà đá', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Cà phê', 'BAO_CAO_NUOC', false, true, NOW(), NOW()),
('Sữa tươi', 'BAO_CAO_NUOC', false, true, NOW(), NOW());

-- Create handover reports for today
INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt) VALUES
(CURDATE(), 'BAO_CAO_BEP', 'GO_VAP', 'Báo cáo bếp Today', NOW(), NOW()),
(CURDATE(), 'BAO_CAO_NUOC', 'GO_VAP', 'Báo cáo nước Today', NOW(), NOW());

-- Get report IDs
SET @kitchen_report_id = LAST_INSERT_ID() - 1;
SET @drink_report_id = LAST_INSERT_ID();

-- Create handover materials for kitchen report (Báo cáo bếp)
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update, ca chiều update thực tế
(@kitchen_report_id, 'Gạo', 'NGUYEN_VAT_LIEU', 
 0, 0, 0, 0,  -- Ca sáng: không update (0)
 50, 20, 15, 55,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 43
(@kitchen_report_id, 'Thịt heo', 'NGUYEN_VAT_LIEU',
 30, 15, 5, 40,  -- Ca sáng: báo cáo sai
 43, 10, 8, 45,  -- Ca chiều: thực tế tồn đầu là 43 (không khớp với tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Case 3: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 35
(@kitchen_report_id, 'Thịt bò', 'NGUYEN_VAT_LIEU',
 25, 20, 5, 40,  -- Ca sáng: báo cáo sai
 35, 12, 7, 40,  -- Ca chiều: thực tế tồn đầu là 35 (ít hơn tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case - all shifts have data
(@kitchen_report_id, 'Cá', 'NGUYEN_VAT_LIEU',
 20, 10, 8, 22,
 22, 15, 12, 25,
 25, 5, 10, 20,
 NOW(), NOW()),

-- Normal case - food item
(@kitchen_report_id, 'Rau cải', 'NGUYEN_VAT_LIEU',
 5, 8, 6, 7,
 7, 5, 4, 8,
 8, 3, 5, 6,
 NOW(), NOW()),

-- Non-food item
(@kitchen_report_id, 'Dầu ăn', 'NGUYEN_VAT_LIEU',
 10, 5, 3, 12,
 12, 2, 4, 10,
 10, 1, 2, 9,
 NOW(), NOW());

-- Create handover materials for drink report (Báo cáo nước)
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update
(@drink_report_id, 'Coca Cola', 'NUOC_UONG',
 0, 0, 0, 0,  -- Ca sáng: không update
 100, 50, 30, 120,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Báo cáo sai
(@drink_report_id, 'Pepsi', 'NUOC_UONG',
 80, 20, 15, 85,  -- Ca sáng: báo cáo sai
 90, 30, 25, 95,  -- Ca chiều: không khớp với morningEnding
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case
(@drink_report_id, 'Nước suối', 'NUOC_UONG',
 50, 20, 15, 55,
 55, 25, 20, 60,
 60, 10, 15, 55,
 NOW(), NOW());

-- Create reports for yesterday
INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt) VALUES
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'BAO_CAO_BEP', 'GO_VAP', 'Báo cáo bếp Yesterday', NOW(), NOW()),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'BAO_CAO_NUOC', 'GO_VAP', 'Báo cáo nước Yesterday', NOW(), NOW());

-- Get yesterday report IDs
SET @yesterday_kitchen_report_id = LAST_INSERT_ID() - 1;
SET @yesterday_drink_report_id = LAST_INSERT_ID();

-- Create handover materials for yesterday kitchen report
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update, ca chiều update thực tế
(@yesterday_kitchen_report_id, 'Gạo', 'NGUYEN_VAT_LIEU', 
 0, 0, 0, 0,  -- Ca sáng: không update (0)
 50, 20, 15, 55,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 43
(@yesterday_kitchen_report_id, 'Thịt heo', 'NGUYEN_VAT_LIEU',
 30, 15, 5, 40,  -- Ca sáng: báo cáo sai
 43, 10, 8, 45,  -- Ca chiều: thực tế tồn đầu là 43 (không khớp với tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Case 3: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 35
(@yesterday_kitchen_report_id, 'Thịt bò', 'NGUYEN_VAT_LIEU',
 25, 20, 5, 40,  -- Ca sáng: báo cáo sai
 35, 12, 7, 40,  -- Ca chiều: thực tế tồn đầu là 35 (ít hơn tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case - all shifts have data
(@yesterday_kitchen_report_id, 'Cá', 'NGUYEN_VAT_LIEU',
 20, 10, 8, 22,
 22, 15, 12, 25,
 25, 5, 10, 20,
 NOW(), NOW()),

-- Normal case - food item
(@yesterday_kitchen_report_id, 'Rau cải', 'NGUYEN_VAT_LIEU',
 5, 8, 6, 7,
 7, 5, 4, 8,
 8, 3, 5, 6,
 NOW(), NOW()),

-- Non-food item
(@yesterday_kitchen_report_id, 'Dầu ăn', 'NGUYEN_VAT_LIEU',
 10, 5, 3, 12,
 12, 2, 4, 10,
 10, 1, 2, 9,
 NOW(), NOW());

-- Create handover materials for yesterday drink report
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update
(@yesterday_drink_report_id, 'Coca Cola', 'NUOC_UONG',
 0, 0, 0, 0,  -- Ca sáng: không update
 100, 50, 30, 120,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Báo cáo sai
(@yesterday_drink_report_id, 'Pepsi', 'NUOC_UONG',
 80, 20, 15, 85,  -- Ca sáng: báo cáo sai
 90, 30, 25, 95,  -- Ca chiều: không khớp với morningEnding
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case
(@yesterday_drink_report_id, 'Nước suối', 'NUOC_UONG',
 50, 20, 15, 55,
 55, 25, 20, 60,
 60, 10, 15, 55,
 NOW(), NOW());

-- Create reports for 2 days ago
INSERT INTO HandoverReport (date, reportType, branch, note, createdAt, updatedAt) VALUES
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'BAO_CAO_BEP', 'GO_VAP', 'Báo cáo bếp Two days ago', NOW(), NOW()),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'BAO_CAO_NUOC', 'GO_VAP', 'Báo cáo nước Two days ago', NOW(), NOW());

-- Get 2 days ago report IDs
SET @two_days_ago_kitchen_report_id = LAST_INSERT_ID() - 1;
SET @two_days_ago_drink_report_id = LAST_INSERT_ID();

-- Create handover materials for 2 days ago kitchen report
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update, ca chiều update thực tế
(@two_days_ago_kitchen_report_id, 'Gạo', 'NGUYEN_VAT_LIEU', 
 0, 0, 0, 0,  -- Ca sáng: không update (0)
 50, 20, 15, 55,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 43
(@two_days_ago_kitchen_report_id, 'Thịt heo', 'NGUYEN_VAT_LIEU',
 30, 15, 5, 40,  -- Ca sáng: báo cáo sai
 43, 10, 8, 45,  -- Ca chiều: thực tế tồn đầu là 43 (không khớp với tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Case 3: Ca sáng báo cáo sai - Tồn cuối 40, nhưng Tồn đầu ca chiều là 35
(@two_days_ago_kitchen_report_id, 'Thịt bò', 'NGUYEN_VAT_LIEU',
 25, 20, 5, 40,  -- Ca sáng: báo cáo sai
 35, 12, 7, 40,  -- Ca chiều: thực tế tồn đầu là 35 (ít hơn tồn cuối ca sáng)
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case - all shifts have data
(@two_days_ago_kitchen_report_id, 'Cá', 'NGUYEN_VAT_LIEU',
 20, 10, 8, 22,
 22, 15, 12, 25,
 25, 5, 10, 20,
 NOW(), NOW()),

-- Normal case - food item
(@two_days_ago_kitchen_report_id, 'Rau cải', 'NGUYEN_VAT_LIEU',
 5, 8, 6, 7,
 7, 5, 4, 8,
 8, 3, 5, 6,
 NOW(), NOW()),

-- Non-food item
(@two_days_ago_kitchen_report_id, 'Dầu ăn', 'NGUYEN_VAT_LIEU',
 10, 5, 3, 12,
 12, 2, 4, 10,
 10, 1, 2, 9,
 NOW(), NOW());

-- Create handover materials for 2 days ago drink report
INSERT INTO HandoverMaterial (
  handoverReportId, materialName, materialType,
  morningBeginning, morningReceived, morningIssued, morningEnding,
  afternoonBeginning, afternoonReceived, afternoonIssued, afternoonEnding,
  eveningBeginning, eveningReceived, eveningIssued, eveningEnding,
  createdAt, updatedAt
) VALUES
-- Case 1: Ca sáng không update
(@two_days_ago_drink_report_id, 'Coca Cola', 'NUOC_UONG',
 0, 0, 0, 0,  -- Ca sáng: không update
 100, 50, 30, 120,  -- Ca chiều: update thực tế
 0, 0, 0, 0,  -- Ca tối: chưa có dữ liệu
 NOW(), NOW()),

-- Case 2: Báo cáo sai
(@two_days_ago_drink_report_id, 'Pepsi', 'NUOC_UONG',
 80, 20, 15, 85,  -- Ca sáng: báo cáo sai
 90, 30, 25, 95,  -- Ca chiều: không khớp với morningEnding
 0, 0, 0, 0,  -- Ca tối
 NOW(), NOW()),

-- Normal case
(@two_days_ago_drink_report_id, 'Nước suối', 'NUOC_UONG',
 50, 20, 15, 55,
 55, 25, 20, 60,
 60, 10, 15, 55,
 NOW(), NOW());

-- Show summary
SELECT 
  'Materials' as table_name, COUNT(*) as count FROM Material
UNION ALL
SELECT 
  'Handover Reports' as table_name, COUNT(*) as count FROM HandoverReport
UNION ALL
SELECT 
  'Handover Materials' as table_name, COUNT(*) as count FROM HandoverMaterial; 