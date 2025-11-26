const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const { uploadToStorage, deleteFromStorage, getFileUrl } = require('../config/storage');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Middleware to verify token
async function verifyToken(req, res, next) {
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
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = { ...user, ...userData };
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// @route   GET /api/files
// @desc    Get files (admin: all, company: their files)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = supabase
            .from('files')
            .select(`
                *,
                companies (name)
            `)
            .order('uploaded_at', { ascending: false });

        // If company user, filter by company_id
        if (req.user.role === 'company') {
            query = query.eq('company_id', req.user.company_id);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/files/upload
// @desc    Upload files to Google Drive
// @access  Admin
router.post('/upload', verifyToken, upload.array('files', 10), async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { company_id, category, expiry_date } = req.body;

        if (!company_id || !category) {
            return res.status(400).json({
                success: false,
                message: 'Company ID and category are required'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files provided'
            });
        }

        const uploadedFiles = [];

        for (const file of req.files) {
            // Upload to Supabase Storage
            const storageFile = await uploadToStorage(
                file.buffer,
                file.originalname,
                company_id,
                file.mimetype
            );

            // Save metadata to Supabase
            const { data: fileRecord, error } = await supabase
                .from('files')
                .insert({
                    company_id,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    category,
                    expiry_date: expiry_date || null,
                    storage_path: storageFile.path,
                    uploaded_by: req.user.id
                })
                .select()
                .single();

            if (error) throw error;

            // Add public URL to response
            fileRecord.url = storageFile.url;
            uploadedFiles.push(fileRecord);
        }

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'upload',
            details: `Uploaded ${uploadedFiles.length} file(s)`
        });

        res.status(201).json({
            success: true,
            data: uploadedFiles
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Admin
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { id } = req.params;

        // Get file info
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Delete from Supabase Storage
        await deleteFromStorage(file.storage_path);

        // Delete from Supabase database
        const { error } = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Log activity
        await supabase.from('activity_log').insert({
            user_id: req.user.id,
            action: 'delete',
            details: `Deleted file: ${file.name}`
        });

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/files/:id/mark-read
// @desc    Mark file as read
// @access  Company
router.post('/:id/mark-read', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'company') {
            return res.status(403).json({
                success: false,
                message: 'Company access required'
            });
        }

        const { id } = req.params;

        // Get current read_by array
        const { data: file } = await supabase
            .from('files')
            .select('read_by, name')
            .eq('id', id)
            .single();

        const readBy = file.read_by || [];
        
        if (!readBy.includes(req.user.id)) {
            readBy.push(req.user.id);

            // Update file
            await supabase
                .from('files')
                .update({ read_by: readBy })
                .eq('id', id);

            // Log activity
            await supabase.from('activity_log').insert({
                user_id: req.user.id,
                action: 'view',
                details: `Viewed file: ${file.name}`
            });
        }

        res.json({
            success: true,
            message: 'File marked as read'
        });

    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
