const RolePermissions = {
  'Admin': ['ALL'],
  'HR Manager': [
    'VIEW_EMPLOYEE', 'EDIT_EMPLOYEE', 'CREATE_EMPLOYEE', 'DELETE_EMPLOYEE',
    'VIEW_ATTENDANCE'
  ],
  'Project Manager': [
    'VIEW_EMPLOYEE', 'CREATE_PROJECT', 'VIEW_PROJECT', 'EDIT_PROJECT',
    'CREATE_TASK', 'ASSIGN_TASK', 'VIEW_TASK', 'EDIT_TASK',
    'VIEW_DOCUMENT', 'UPLOAD_DOCUMENT'
  ],
  'Developer': [
    'VIEW_PROJECT', 'VIEW_TASK', 'EDIT_TASK_STATUS',
    'CHECKIN', 'CHECKOUT', 'PUSH_CODE', 'PULL_CODE',
    'VIEW_DOCUMENT'
  ],
  'Tester': [
    'VIEW_PROJECT', 'VIEW_TASK', 'EDIT_TASK_STATUS',
    'CHECKIN', 'CHECKOUT', 'PULL_CODE', 'VIEW_DOCUMENT'
  ]
};

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'User not authenticated or role missing' });
      }

      const userRole = req.user.role;
      const permissions = RolePermissions[userRole] || [];

      if (permissions.includes('ALL') || permissions.includes(requiredPermission)) {
        return next();
      }

      // Automatically log unathorized access (Will integrate with SecurityLog later in the request flow or within middleware itself)
      
      return res.status(403).json({ 
        message: 'Access denied: Insufficient permissions for this action',
        requiredPermission 
      });

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ message: 'Server error during permission validation' });
    }
  };
};

module.exports = { permissionMiddleware, RolePermissions };
