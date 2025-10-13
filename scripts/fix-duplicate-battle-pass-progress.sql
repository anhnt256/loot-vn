-- Fix duplicate UserBattlePass records
-- Keep the record with higher experience, or latest createdAt if same experience

-- Step 1: Find and delete duplicates, keeping only one record per (userId, seasonId, branch)
DELETE ubp1 FROM UserBattlePass ubp1
INNER JOIN UserBattlePass ubp2 
WHERE 
  ubp1.userId = ubp2.userId 
  AND ubp1.seasonId = ubp2.seasonId
  AND ubp1.branch = ubp2.branch
  AND (
    ubp1.experience < ubp2.experience
    OR (ubp1.experience = ubp2.experience AND ubp1.id < ubp2.id)
  );

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE UserBattlePass 
ADD UNIQUE KEY unique_user_season_branch (userId, seasonId, branch);

