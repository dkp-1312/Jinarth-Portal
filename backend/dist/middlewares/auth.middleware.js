import jwt from 'jsonwebtoken';
/**
 * Auth Middleware - Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach user to request
        req.user = decoded;
        console.log(`✓ Token verified for user: ${decoded.email} (Role: ${decoded.role})`);
        next();
    }
    catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message,
        });
    }
};
/**
 * Role-based Authorization Middleware
 */
export const authorize = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user?.role;
            // Convert single role to array
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            console.log(`Authorization check - User Role: ${userRole}, Allowed: ${rolesArray.join(', ')}`);
            if (!userRole) {
                return res.status(401).json({
                    success: false,
                    message: 'User role not found in token',
                });
            }
            if (!rolesArray.includes(userRole)) {
                console.warn(`Access denied for role: ${userRole}. Expected: ${rolesArray.join(', ')}`);
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${rolesArray.join(', ')}. Your role: ${userRole}`,
                });
            }
            console.log(`✓ Authorization granted for role: ${userRole}`);
            next();
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Authorization failed',
                error: error.message,
            });
        }
    };
};
