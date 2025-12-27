# Classified Database System - Setup Guide

## Quick Start for New Installations

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including the new `uuid` package for team invite codes.

### 2. Configure Environment

Create or update `backend/.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/safe-log-ai
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Start Services

**Terminal 1 - MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

**Terminal 2 - Masking Service:**
```bash
cd masking-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python app.py
```

**Terminal 3 - Backend:**
```bash
cd backend
node server.js
```

### 4. Test the System

```bash
# Test user type isolation
node test/test-user-types.js

# Test team management
node test/test-teams.js
```

---

## Migration Guide for Existing Installations

### Prerequisites

⚠️ **IMPORTANT**: Backup your database before proceeding!

```bash
mongodump --uri="mongodb://localhost:27017/safe-log-ai" --out=backup
```

### Step-by-Step Migration

#### 1. Update Code

Pull the latest changes and install new dependencies:

```bash
git pull
cd backend
npm install
```

#### 2. Migrate Users (Dry Run)

Preview what will change:

```bash
node scripts/migrate-users.js
```

Expected output:
```
🔍 DRY RUN MODE - No changes will be made

📊 Found X users to migrate

User: user@example.com
  Current userType: NOT SET
  Current teamId: NOT SET
  Current teamRole: NOT SET
  → Would migrate to: userType='private', teamId=null, teamRole='member'
```

#### 3. Apply User Migration

```bash
node scripts/migrate-users.js --live
```

Expected output:
```
⚠️  LIVE MODE - Changes will be applied!

✅ Migration complete! Migrated X users.
```

#### 4. Migrate Logs (Dry Run)

Preview log migration:

```bash
node scripts/migrate-logs.js
```

#### 5. Apply Log Migration

```bash
node scripts/migrate-logs.js --live
```

**Note**: If you have many logs, you may need to run this multiple times until all logs are migrated.

#### 6. Restart Backend

```bash
node server.js
```

#### 7. Verify Migration

Run the test suites:

```bash
node test/test-user-types.js
node test/test-teams.js
```

### Rollback (If Needed)

If something goes wrong:

```bash
mongorestore --uri="mongodb://localhost:27017/safe-log-ai" backup/safe-log-ai
```

---

## User Type Selection Guide

### For End Users

When signing up, users must choose a user type:

#### Public User
- **Best for**: Open-source projects, learning, community support
- **Cache behavior**: Shares solutions with all other public users
- **Privacy**: Error logs are masked but shared globally
- **Use case**: "I want to benefit from solutions others have found"

#### Private User (Default)
- **Best for**: Proprietary projects, sensitive codebases
- **Cache behavior**: Completely isolated, no sharing
- **Privacy**: Maximum privacy, logs never shared
- **Use case**: "I need complete privacy for my error logs"

#### Team User
- **Best for**: Organizations, development teams
- **Cache behavior**: Shares solutions only within team
- **Privacy**: Logs shared with team members only
- **Use case**: "I want to share solutions with my team but not publicly"

### Signup Examples

**Public User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "public@example.com",
    "password": "password123",
    "userType": "public"
  }'
```

**Private User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "private@example.com",
    "password": "password123",
    "userType": "private"
  }'
```

**Team User:**
```bash
# First, create a team or get an invite code
# Then signup with the invite code:
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "team@example.com",
    "password": "password123",
    "userType": "team",
    "inviteCode": "your-team-invite-code"
  }'
```

---

## Team Management Workflow

### Creating a Team

1. **Signup as any user type** (will be converted to team admin)
2. **Create team:**
```bash
curl -X POST http://localhost:3000/api/teams/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Engineering Team",
    "description": "Our development team"
  }'
```

3. **Save the invite code** from the response
4. **Share invite code** with team members

### Joining a Team

New users can join during signup:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "password123",
    "userType": "team",
    "inviteCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

Existing users can join:
```bash
curl -X POST http://localhost:3000/api/teams/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "inviteCode": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }'
```

### Managing Team Members

**View team members:**
```bash
curl -X GET http://localhost:3000/api/teams/my-team \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Remove a member (admin only):**
```bash
curl -X DELETE http://localhost:3000/api/teams/TEAM_ID/remove/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Leave team:**
```bash
curl -X DELETE http://localhost:3000/api/teams/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Indexes

The system creates the following indexes for optimal performance:

### User Collection
- `email` (unique)
- `(userType, teamId)` (compound)

### Team Collection
- `name` (unique)
- `inviteCode` (unique)

### ErrorLog Collection
- `(userType, teamId, fingerprint)` (compound) - For classified cache lookups
- `(userId, fingerprint)` (compound) - For private user queries

These indexes are created automatically when the models are first used.

---

## Monitoring & Maintenance

### Check Migration Status

```bash
# Check if any users need migration
mongo safe-log-ai --eval "db.users.find({userType: {$exists: false}}).count()"

# Check if any logs need migration
mongo safe-log-ai --eval "db.errorlogs.find({userType: {$exists: false}}).count()"
```

### Database Statistics

```bash
# Count users by type
mongo safe-log-ai --eval "db.users.aggregate([{$group: {_id: '$userType', count: {$sum: 1}}}])"

# Count logs by type
mongo safe-log-ai --eval "db.errorlogs.aggregate([{$group: {_id: '$userType', count: {$sum: 1}}}])"

# Count teams
mongo safe-log-ai --eval "db.teams.count()"
```

---

## Troubleshooting

### Issue: "Invalid user type" error during signup

**Solution**: Ensure `userType` is one of: `public`, `private`, or `team`

### Issue: "Invite code is required for team users"

**Solution**: Team users must provide a valid `inviteCode` during signup

### Issue: "Invalid invite code"

**Solution**: 
1. Verify the invite code is correct
2. Check that the team still exists
3. Ensure there are no extra spaces in the code

### Issue: Migration script shows "User not found" for logs

**Solution**: This is normal for orphaned logs. They will default to `private` type.

### Issue: Cache not sharing for public users

**Solution**: 
1. Verify both users have `userType: 'public'`
2. Check that fingerprints match (same error)
3. Ensure masking is consistent

### Issue: Team members can't see each other's logs

**Solution**:
1. Verify all members have the same `teamId`
2. Check that logs have `userType: 'team'` and correct `teamId`
3. Run log migration if upgrading from old version

---

## Security Best Practices

1. **JWT Secret**: Use a strong, unique secret in production
2. **Invite Codes**: Rotate team invite codes periodically
3. **User Type Selection**: Inform users about privacy implications
4. **Database Backups**: Regular backups before migrations
5. **Access Logs**: Monitor team access patterns
6. **Rate Limiting**: Consider adding rate limiting for API endpoints

---

## Performance Optimization

### For Large Teams

If you have teams with many members:

1. **Implement pagination** for member lists
2. **Cache team membership** in Redis
3. **Add indexes** on frequently queried fields

### For High Volume Logs

If you have many logs:

1. **Archive old logs** to separate collection
2. **Implement TTL indexes** for automatic cleanup
3. **Use aggregation pipelines** for analytics

---

## Next Steps

After successful setup:

1. ✅ Test all three user types
2. ✅ Create a test team
3. ✅ Submit test error logs
4. ✅ Verify cache behavior
5. ✅ Test team management operations
6. 📝 Update frontend to support user type selection
7. 📝 Add user type switching functionality
8. 📝 Implement team analytics dashboard

---

## Support

For issues or questions:
1. Check the [README.md](file:///e:/Safe-ai/README.md)
2. Review the [walkthrough.md](file:///C:/Users/S.nandhakumar/.gemini/antigravity/brain/03ed5b60-6088-4f10-9dcd-812c10d53849/walkthrough.md)
3. Run test suites to verify functionality
4. Check database indexes and migration status
