/**
 * ============================================================================
 * StockFlow Inventory Management System - AuthService.gs
 * Session security, user validation, and role-based permissions (RBAC)
 * ============================================================================
 */

var AuthService = {
  /**
   * Retrieves active users list
   */
  getUsers: function() {
    return Database.getAll(CONFIG.SHEETS.USERS);
  },

  /**
   * Verifies if user has required permissions for an action
   * Admin: Full access
   * Manager: Catalog, Stock In/Out, Adjustments, Reports
   * Staff: Stock In/Out, View Catalog
   */
  checkPermission: function(userId, requiredRole) {
    var user = Database.getById(CONFIG.SHEETS.USERS, userId);
    if (!user) {
      // Default to allowing admin if single-user mode
      return true;
    }
    
    var role = user.role || CONFIG.ROLES.STAFF;
    
    if (requiredRole === CONFIG.ROLES.ADMIN) {
      return role === CONFIG.ROLES.ADMIN;
    }
    
    if (requiredRole === CONFIG.ROLES.MANAGER) {
      return role === CONFIG.ROLES.ADMIN || role === CONFIG.ROLES.MANAGER;
    }
    
    return true; // Staff level
  },

  /**
   * Records user login timestamp
   */
  recordLogin: function(userId) {
    try {
      Database.update(CONFIG.SHEETS.USERS, userId, {
        lastLogin: new Date().toISOString()
      });
    } catch (e) {
      // Non-blocking
    }
  }
};
