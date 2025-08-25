# Admin Panel Quick Test Checklist

## 🚀 Quick Start Testing Guide

### Prerequisites
- [ ] Server is running on port 5001
- [ ] Client is running on port 3000
- [ ] MongoDB is running
- [ ] Admin user exists: admin@castingplatform.com / admin123456

---

## 🔥 Critical Path Tests (Test These First)

### 1. Admin Login & Access
- [ ] Login with admin credentials
- [ ] Redirects to `/admin/dashboard`
- [ ] Admin layout loads correctly
- [ ] Sidebar shows all admin menu items

### 2. Dashboard Core Functionality
- [ ] 3 statistics cards display (Users, Castings, Applications)
- [ ] User distribution chart shows
- [ ] Casting status chart shows
- [ ] Recent activities list displays
- [ ] Quick action buttons work

### 3. Navigation Between Pages
- [ ] Click "مدیریت کاربران" → goes to user management
- [ ] Click "مدیریت کستینگ‌ها" → goes to casting management
- [ ] Click "مدیریت درخواست‌ها" → goes to application management
- [ ] Click "گزارشات و آمار" → goes to analytics
- [ ] Breadcrumb navigation works

---

## 📋 Page-by-Page Quick Tests

### Dashboard (`/admin/dashboard`)
- [ ] Page loads without errors
- [ ] All 3 stat cards show numbers
- [ ] Charts render properly
- [ ] Recent activities show
- [ ] Quick actions work

### User Management (`/admin/users`)
- [ ] User list loads
- [ ] Search works (try typing a name)
- [ ] Filters work (try role filter)
- [ ] Pagination works
- [ ] Click "View" on a user → goes to user details

### User Details (`/admin/users/:id`)
- [ ] User profile picture shows
- [ ] User information displays
- [ ] Statistics cards show
- [ ] Status change dropdown works
- [ ] "Back to User List" button works

### Casting Management (`/admin/castings`)
- [ ] Casting list loads
- [ ] Search works (try typing a title)
- [ ] Filters work (try status filter)
- [ ] Pagination works
- [ ] Click "View" on a casting → goes to casting details

### Casting Details (`/admin/castings/:id`)
- [ ] Casting information displays
- [ ] Photos show (if any)
- [ ] Statistics cards show
- [ ] Status change dropdown works
- [ ] Action buttons work

### Application Management (`/admin/applications`)
- [ ] Application list loads
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Click "View" on an application → goes to application details

### Application Details (`/admin/applications/:id`)
- [ ] Application information displays
- [ ] Talent and casting summaries show
- [ ] Status change dropdown works
- [ ] Action buttons work

### Analytics (`/admin/analytics`)
- [ ] Page loads without errors
- [ ] Metrics cards show
- [ ] Charts render
- [ ] Time range selector works
- [ ] Export buttons work

### Reports (`/admin/reports`)
- [ ] Reports list loads
- [ ] Search works
- [ ] Filters work
- [ ] Pagination works
- [ ] Action buttons work

### Pending Actions (`/admin/pending-actions`)
- [ ] Pending actions list loads
- [ ] Filters work
- [ ] Action buttons work
- [ ] Details show properly

### System Settings (`/admin/settings`)
- [ ] Settings sections load
- [ ] Form inputs work
- [ ] Save buttons work
- [ ] Reset button works

---

## 🐛 Common Issues to Check

### Data Loading Issues
- [ ] Check browser console for errors
- [ ] Verify API endpoints return data
- [ ] Check network tab for failed requests
- [ ] Verify MongoDB connection

### UI Issues
- [ ] Check for missing images/icons
- [ ] Verify RTL text alignment
- [ ] Check responsive design on mobile
- [ ] Verify hover effects work

### Functionality Issues
- [ ] Test search with different terms
- [ ] Test filters with different combinations
- [ ] Test pagination with large datasets
- [ ] Test bulk actions

---

## 📱 Mobile Testing Quick Check

### Mobile Responsiveness
- [ ] Open admin panel on mobile browser
- [ ] Check if sidebar collapses
- [ ] Verify tables adapt to mobile layout
- [ ] Test touch interactions
- [ ] Check text readability

### Tablet Testing
- [ ] Test on tablet browser
- [ ] Verify layout adapts properly
- [ ] Check touch interactions work

---

## 🔒 Security Quick Tests

### Access Control
- [ ] Try accessing admin pages without login
- [ ] Try accessing admin pages with non-admin user
- [ ] Test session timeout
- [ ] Test logout functionality

### Data Protection
- [ ] Verify passwords are not displayed
- [ ] Check error messages don't reveal sensitive info
- [ ] Verify API responses are secure

---

## ⚡ Performance Quick Tests

### Load Times
- [ ] Dashboard loads within 3 seconds
- [ ] List pages load within 2 seconds
- [ ] Search results appear quickly
- [ ] No significant lag during interactions

### Data Handling
- [ ] Large lists paginate properly
- [ ] Search doesn't cause lag
- [ ] Bulk operations complete timely
- [ ] Charts render smoothly

---

## 🎯 Priority Test Scenarios

### High Priority (Test First)
1. **Admin Login & Dashboard**
2. **User Management - View & Edit**
3. **Casting Management - View & Edit**
4. **Application Management - View & Edit**
5. **Navigation between all pages**

### Medium Priority
1. **Search & Filter functionality**
2. **Pagination**
3. **Bulk actions**
4. **Status changes**
5. **Analytics & Reports**

### Low Priority
1. **Export functionality**
2. **Advanced filters**
3. **Mobile responsiveness**
4. **Performance optimization**
5. **Accessibility features**

---

## 🚨 Critical Bugs to Watch For

### Showstoppers
- [ ] Admin can't login
- [ ] Dashboard doesn't load
- [ ] Can't view user/casting/application details
- [ ] Navigation doesn't work
- [ ] Data doesn't load

### Major Issues
- [ ] Search doesn't work
- [ ] Filters don't work
- [ ] Pagination broken
- [ ] Status changes don't save
- [ ] Bulk actions fail

### Minor Issues
- [ ] UI alignment issues
- [ ] Missing icons/images
- [ ] Hover effects don't work
- [ ] Mobile layout issues
- [ ] Performance lag

---

## 📝 Test Results Template

```
Test Date: _______________
Tester: _________________
Environment: ____________

✅ PASSED TESTS:
- [ ] Test 1
- [ ] Test 2

❌ FAILED TESTS:
- [ ] Test 1 - [Description of issue]
- [ ] Test 2 - [Description of issue]

⚠️ PARTIAL TESTS:
- [ ] Test 1 - [What works, what doesn't]

NOTES:
- [Additional observations]
- [Performance notes]
- [Browser-specific issues]
```

---

## 🔄 Retest Checklist

After fixes are implemented:
- [ ] Retest all failed tests
- [ ] Verify fixes don't break existing functionality
- [ ] Test related functionality
- [ ] Check for new issues introduced
- [ ] Update test results

---

## 📞 Emergency Contacts

If critical issues are found:
1. **Document the issue** with screenshots and steps
2. **Check browser console** for error messages
3. **Verify server logs** for backend issues
4. **Test on different browsers** to isolate issues
5. **Report immediately** with detailed information

---

## ✅ Final Sign-off Checklist

Before marking admin panel as ready:
- [ ] All critical path tests pass
- [ ] All major functionality works
- [ ] No showstopper bugs remain
- [ ] Performance is acceptable
- [ ] Security tests pass
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility confirmed
- [ ] Documentation updated
- [ ] Test results documented
