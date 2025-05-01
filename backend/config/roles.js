const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    SELLER: 'SELLER',
    CUSTOMER: 'CUSTOMER'
};

const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: [
        'manage_users',
        'manage_roles',
        'manage_products',
        'manage_categories',
        'manage_orders',
        'manage_payments',
        'view_analytics',
        'manage_settings',
    ],
    [ROLES.ADMIN]: [
        'manage_products',
        'manage_categories',
        'manage_orders',
        'manage_payments',
        'view_analytics',
    ],
    [ROLES.SELLER]: [
        'manage_own_products',
        'view_own_orders',
        'view_own_analytics',
    ],
    [ROLES.CUSTOMER]: [
        'view_products',
        'place_orders',
        'view_own_orders',
        'manage_own_profile',
    ],
};

const hasPermission = (role, permission) => {
    return PERMISSIONS[role]?.includes(permission) || false;
};

module.exports = {
    ROLES,
    PERMISSIONS,
    hasPermission,
}; 