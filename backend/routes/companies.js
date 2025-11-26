const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { body, validationResult } = require('express-validator');

// Middleware to verify admin
async function verifyAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// @route   GET /api/companies
// @desc    Get all companies
// @access  Admin
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/companies
// @desc    Create new company
// @access  Admin
router.post('/', [
    verifyAdmin,
    body('name').notEmpty().withMessage('Company name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, phone } = req.body;

        // Check if email already exists
        const { data: existing } = await supabase
            .from('companies')
            .select('email')
            .eq('email', email)
            .single();

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create auth user in Supabase
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'company',
                company_name: name
            }
        });

        if (authError) throw authError;

        // Create company record
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                id: authData.user.id,
                name,
                email,
                phone: phone || null
            })
            .select()
            .single();

        if (companyError) throw companyError;

        // Create user record
        await supabase.from('users').insert({
            id: authData.user.id,
            email,
            role: 'company',
            company_id: authData.user.id,
            company_name: name
        });

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'create',
            details: `Created company: ${name}`
        });

        res.status(201).json({
            success: true,
            data: company
        });

    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/companies/:id
// @desc    Update company
// @access  Admin
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const { id } = req.params;

        // Update company
        const { data, error } = await supabase
            .from('companies')
            .update({
                name,
                email,
                phone: phone || null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Update auth user if password changed
        if (password) {
            await supabase.auth.admin.updateUserById(id, {
                password
            });
        }

        // Update user record
        await supabase.from('users')
            .update({
                email,
                company_name: name
            })
            .eq('id', id);

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'update',
            details: `Updated company: ${name}`
        });

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/companies/:id
// @desc    Delete company
// @access  Admin
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Get company name for logging
        const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', id)
            .single();

        // Delete company (cascade will delete related records)
        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Delete auth user
        await supabase.auth.admin.deleteUser(id);

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'delete',
            details: `Deleted company: ${company?.name || 'Unknown'}`
        });

        res.json({
            success: true,
            message: 'Company deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
