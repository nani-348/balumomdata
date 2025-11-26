const supabase = require('./supabase');

// Helper function to upload file to Supabase Storage
async function uploadToStorage(fileBuffer, fileName, companyId, mimeType) {
    try {
        const filePath = `${companyId}/${Date.now()}-${fileName}`;
        
        const { data, error } = await supabase.storage
            .from('company-files')
            .upload(filePath, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('company-files')
            .getPublicUrl(filePath);

        return {
            path: filePath,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error uploading to storage:', error);
        throw error;
    }
}

// Helper function to delete file from Supabase Storage
async function deleteFromStorage(filePath) {
    try {
        const { error } = await supabase.storage
            .from('company-files')
            .remove([filePath]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting from storage:', error);
        throw error;
    }
}

// Helper function to get file URL
function getFileUrl(filePath) {
    const { data } = supabase.storage
        .from('company-files')
        .getPublicUrl(filePath);
    
    return data.publicUrl;
}

module.exports = {
    uploadToStorage,
    deleteFromStorage,
    getFileUrl
};
