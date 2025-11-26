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

// GET activity log
router.get('/', verifyToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        
        let query = supabase
            .from('activity_log')
            .select(`*, users(email, company_name)`)
            .order('timestamp', { ascending: false })
            .limit(limit);
        
        if (req.user.role === 'company') {
            query = query.eq('user_id', req.user.id);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE activity log (Admin only)
router.delete('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }
        
        const { error } = await supabase.from('activity_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        
        res.json({ success: true, message: 'Activity log cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
