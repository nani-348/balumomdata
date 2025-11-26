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

// GET requests
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = supabase.from('document_requests').select(`*, companies(name)`).order('requested_at', { ascending: false });
        
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

// POST request (Company only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({ success: false, message: 'Company only' });
        }
        
        const { doc_type, description } = req.body;
        
        const { data, error } = await supabase.from('document_requests').insert({
            company_id: req.user.company_id,
            doc_type,
            description
        }).select();
        
        if (error) throw error;
        
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'request',
            details: `Requested document: ${doc_type}`
        });
        
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT request status (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin only' });
        }
        
        const { status } = req.body;
        const { id } = req.params;
        
        const { data, error } = await supabase.from('document_requests').update({
            status,
            completed_at: status === 'completed' ? new Date().toISOString() : null
        }).eq('id', id).select();
        
        if (error) throw error;
        
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
