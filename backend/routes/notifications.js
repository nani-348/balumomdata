const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

async function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: 'No token' });
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ success: false, message: 'Invalid token' });
        
        const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
        req.user = { ...user, ...userData };
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = supabase.from('notifications').select('*').order('sent_at', { ascending: false });
        
        if (req.user.role === 'company') {
            query = query.eq('company_id', req.user.company_id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST notification (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }
        
        const { company_id, subject, message } = req.body;
        
        const { data, error } = await supabase.from('notifications').insert({
            company_id,
            subject,
            message
        }).select();
        
        if (error) throw error;
        
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'notification',
            details: `Sent notification: ${subject}`
        });
        
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
