const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Get user metadata
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching user data'
            });
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: data.user.id,
            action: 'login',
            details: `${userData.role === 'admin' ? 'Admin' : userData.company_name} logged in`
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: userData.role,
                    company_id: userData.company_id,
                    company_name: userData.company_name
                },
                session: data.session
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password (Admin only - companies cannot change their own password)
// @access  Admin only
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword, userId } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify current session
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Get user role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        // Only admin can change passwords
        if (userData.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin can change passwords. Contact your administrator.'
            });
        }

        // Admin changing their own password
        if (!userId || userId === user.id) {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error updating password'
                });
            }
        } else {
            // Admin changing company password
            const { error } = await supabase.auth.admin.updateUserById(userId, {
                password: newPassword
            });

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Error updating password'
                });
            }
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: user.id,
            action: 'security',
            details: userId && userId !== user.id ? `Admin changed password for user ${userId}` : 'Admin changed own password'
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
