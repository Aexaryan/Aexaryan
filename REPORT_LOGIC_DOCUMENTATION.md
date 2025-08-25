# Report Creation Logic Documentation

## Overview

The report system is designed to ensure that when a user creates a report against content (casting, blog, news) or another user, the report is properly targeted to the **owner** of that content/account, not the content itself.

## Data Structure

### Report Model Fields

```javascript
{
  reporter: ObjectId,        // Creator ID - who created the report
  targetId: ObjectId,        // Target ID - owner of content/account being reported
  contentId: ObjectId,       // Content ID - the actual content being reported (optional)
  targetModel: String,       // Always "User" (since we target content owners)
  reportType: String,        // Type of content: 'casting', 'blog', 'news', 'user', 'application'
  category: String,          // Report category
  title: String,             // Report title
  description: String,       // Report description
  status: String,            // Report status
  // ... other fields
}
```

## Report Creation Logic

### 1. User Report
**When:** User reports another user directly

```javascript
// Input
reportType: 'user'
targetId: 'user123' // ID of user being reported

// Logic
contentOwner = await User.findById(targetId)
reportData.targetId = contentOwner._id        // Target: the reported user
reportData.contentId = null                   // No content ID (direct user report)
reportData.targetModel = 'User'
```

**Result:** Report targets the reported user directly

### 2. Casting Report
**When:** User reports a casting

```javascript
// Input
reportType: 'casting'
targetId: 'casting456' // ID of casting being reported

// Logic
casting = await Casting.findById(targetId).populate('castingDirector')
contentOwner = casting.castingDirector
reportData.targetId = contentOwner._id        // Target: casting director
reportData.contentId = targetId               // Content: the casting
reportData.targetModel = 'User'
```

**Result:** Report targets the casting director (owner of the casting)

### 3. Blog Report
**When:** User reports a blog

```javascript
// Input
reportType: 'blog'
targetId: 'blog789' // ID of blog being reported

// Logic
blog = await Blog.findById(targetId).populate('author')
contentOwner = blog.author
reportData.targetId = contentOwner._id        // Target: blog author
reportData.contentId = targetId               // Content: the blog
reportData.targetModel = 'User'
```

**Result:** Report targets the blog author (owner of the blog)

### 4. News Report
**When:** User reports a news article

```javascript
// Input
reportType: 'news'
targetId: 'news101' // ID of news being reported

// Logic
news = await News.findById(targetId).populate('author')
contentOwner = news.author
reportData.targetId = contentOwner._id        // Target: news author
reportData.contentId = targetId               // Content: the news
reportData.targetModel = 'User'
```

**Result:** Report targets the news author (owner of the news)

### 5. Application Report
**When:** User reports an application

```javascript
// Input
reportType: 'application'
targetId: 'app202' // ID of application being reported

// Logic
application = await Application.findById(targetId).populate('talent')
contentOwner = application.talent
reportData.targetId = contentOwner._id        // Target: talent (applicant)
reportData.contentId = targetId               // Content: the application
reportData.targetModel = 'User'
```

**Result:** Report targets the talent (owner of the application)

## Validation Rules

### 1. Self-Reporting Prevention
Users cannot report their own content:

```javascript
if (contentOwner._id.toString() === req.user._id.toString()) {
  return res.status(400).json({ 
    error: 'شما نمی‌توانید محتوای خود را گزارش کنید' 
  });
}
```

### 2. Content Existence Validation
Ensure the reported content exists and has an owner:

```javascript
if (!casting) {
  return res.status(400).json({ error: 'کستینگ یافت نشد' });
}
if (!casting.castingDirector) {
  return res.status(400).json({ error: 'کستینگ فاقد مدیر است' });
}
```

### 3. Spam Prevention
Prevent multiple reports on the same target within 24 hours:

```javascript
const recentReport = await Report.findOne({
  reporter: req.user._id,
  targetId,
  reportType,
  createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});
```

## Example Scenarios

### Scenario 1: Hami Ali's Casting Report
```
Reporter: John Doe
Content: Casting "Movie Project X" (ID: casting123)
Target: Hami Ali (casting director)
Result: Hami Ali sees report in "Reports Against Me"
```

### Scenario 2: Blog Report
```
Reporter: Jane Smith
Content: Blog "Acting Tips" (ID: blog456)
Target: Blog Author (who wrote the blog)
Result: Blog Author sees report in "Reports Against Me"
```

### Scenario 3: User Report
```
Reporter: Alice Johnson
Content: null (direct user report)
Target: Bob Wilson (the reported user)
Result: Bob Wilson sees report in "Reports Against Me"
```

## API Endpoints

### Create Report
```
POST /api/reports
{
  "reportType": "casting",
  "targetId": "casting123",
  "category": "inappropriate_content",
  "title": "Inappropriate content in casting",
  "description": "This casting contains inappropriate content..."
}
```

### Get Reports Against Me
```
GET /api/reports/against-me
```

### Get Report Details
```
GET /api/reports/:id
```

## Database Queries

### Find Reports Against User
```javascript
const reports = await Report.find({ targetId: req.user._id })
  .populate('reporter', 'firstName lastName email')
  .populate('contentId', 'title slug excerpt')
  .sort({ createdAt: -1 });
```

### Find User's Own Reports
```javascript
const reports = await Report.find({ reporter: req.user._id })
  .populate('targetId', 'firstName lastName email')
  .sort({ createdAt: -1 });
```

## Logging

The system includes comprehensive logging for debugging:

```javascript
console.log(`=== REPORT CREATION LOG ===`);
console.log(`Reporter (Creator): ${req.user.firstName} ${req.user.lastName} (${req.user._id})`);
console.log(`Report Type: ${reportType}`);
console.log(`Content ID: ${targetId}`);
console.log(`Target (Owner): ${contentOwner.firstName} ${contentOwner.lastName} (${contentOwner._id})`);
console.log(`Category: ${category}`);
console.log(`Title: ${title}`);
console.log(`========================`);
```

## Benefits

1. **Proper Targeting**: Reports always target the content owner, not the content itself
2. **Clear Accountability**: Content owners are responsible for their content
3. **User Experience**: Users can see and respond to reports against them
4. **Admin Efficiency**: Admins can easily identify who to contact about reports
5. **Prevention**: Self-reporting is prevented
6. **Spam Protection**: Multiple reports are limited to prevent abuse

## Summary

The report system ensures that:
- ✅ **Creator ID** (reporter) is always stored
- ✅ **Target ID** (content owner) is always correctly identified
- ✅ **Content ID** (original content) is stored for reference
- ✅ **Self-reporting** is prevented
- ✅ **Content owners** can see reports against them
- ✅ **Admins** can easily manage and resolve reports
