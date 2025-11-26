// ============================================
// BALU ASSOCIATES CLIENT PORTAL
// ============================================

// Data Storage - Using Supabase API (no localStorage)
const STORAGE_KEYS = {
    CURRENT_USER: 'portal_current_user'
};

// Initialize data from API
let companies = [];
let files = [];
let notifications = [];
let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
let activityLog = [];
let documentRequests = [];
let selectedFiles = [];
let currentPreviewFile = null;
let sessionTimeout = null;

// File categories
const FILE_CATEGORIES = ['Tax', 'GST', 'Financial', 'Legal', 'Audit', 'Other'];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (currentUser) {
        if (currentUser.role === 'admin') {
            showScreen('adminDashboard');
            loadAdminDashboard();
        } else {
            showScreen('companyDashboard');
            loadCompanyDashboard();
        }
        startSessionTimeout();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Populate category dropdowns
    populateCategoryDropdowns();
    
    // Set min date for expiry
    document.getElementById('uploadExpiry').min = new Date().toISOString().split('T')[0];
});

// No demo data - all data comes from Supabase API

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Add company form
    document.getElementById('addCompanyForm').addEventListener('submit', handleAddCompany);
    
    // Edit company form
    document.getElementById('editCompanyForm').addEventListener('submit', handleEditCompany);
    
    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    uploadZone.addEventListener('click', () => fileInput.click());
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !password) {
        errorEl.textContent = 'Please enter email and password';
        return;
    }
    
    errorEl.textContent = 'Logging in...';
    errorEl.style.color = '#666';
    
    try {
        console.log('Attempting login for:', email);
        const response = await API.Auth.login(email, password);
        console.log('Login response:', response);
        
        if (response.success) {
            currentUser = response.data.user;
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
            
            errorEl.textContent = 'Login successful! Loading dashboard...';
            errorEl.style.color = 'green';
            
            if (currentUser.role === 'admin') {
                showScreen('adminDashboard');
                loadAdminDashboard();
                showToast('Welcome, Admin!', 'success');
            } else {
                showScreen('companyDashboard');
                loadCompanyDashboard();
                showToast(`Welcome, ${currentUser.company_name}!`, 'success');
            }
            
            startSessionTimeout();
            errorEl.textContent = '';
        } else {
            errorEl.textContent = response.message || 'Login failed';
            errorEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'Error: ' + (error.message || 'Connection failed. Is the server running?');
        errorEl.style.color = 'red';
    }
}

// Logout
async function logout() {
    try {
        await API.Auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        showScreen('loginScreen');
        document.getElementById('loginForm').reset();
        showToast('Logged out successfully', 'success');
    }
}

// Show screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

async function loadAdminDashboard() {
    document.getElementById('adminEmail').textContent = currentUser.email;
    showToast('Loading dashboard...', 'info');
    
    // Load data from API in parallel for faster loading
    // Use try-catch to handle errors gracefully
    try {
        await Promise.all([
            loadCompaniesFromAPI().catch(e => console.error('Companies:', e)),
            loadFilesFromAPI().catch(e => console.error('Files:', e)),
            loadNotificationsFromAPI().catch(e => console.error('Notifications:', e)),
            loadActivityFromAPI().catch(e => console.error('Activity:', e)),
            loadRequestsFromAPI().catch(e => console.error('Requests:', e))
        ]);
        
        updateAdminStats();
        populateCompanySelectors();
        showToast('Dashboard loaded!', 'success');
    } catch (error) {
        console.error('Dashboard load error:', error);
        showToast('Some data failed to load', 'error');
    }
}

// Load companies from Supabase API
async function loadCompaniesFromAPI() {
    try {
        const response = await API.Companies.getAll();
        if (response.success) {
            companies = response.data || [];
            loadCompanies();
            updateAdminStats();
            populateCompanySelectors();
        }
    } catch (error) {
        console.error('Load companies error:', error);
    }
}

// Load files from Supabase API
async function loadFilesFromAPI() {
    try {
        const response = await API.Files.getAll();
        if (response.success) {
            files = response.data || [];
            loadAllFiles();
        }
    } catch (error) {
        console.error('Load files error:', error);
    }
}

// Load notifications from Supabase API
async function loadNotificationsFromAPI() {
    try {
        const response = await API.Notifications.getAll();
        if (response.success) {
            notifications = response.data || [];
            loadNotifications();
        }
    } catch (error) {
        console.error('Load notifications error:', error);
    }
}

// Load activity from Supabase API
async function loadActivityFromAPI() {
    try {
        const response = await API.Activity.getAll();
        if (response.success) {
            activityLog = response.data || [];
            loadActivityLog();
        }
    } catch (error) {
        console.error('Load activity error:', error);
    }
}

// Load requests from Supabase API
async function loadRequestsFromAPI() {
    try {
        const response = await API.Requests.getAll();
        if (response.success) {
            documentRequests = response.data || [];
            loadDocumentRequests();
        }
    } catch (error) {
        console.error('Load requests error:', error);
    }
}

function updateAdminStats() {
    document.getElementById('statCompanies').textContent = companies.length;
    document.getElementById('statFiles').textContent = files.length;
    document.getElementById('statNotifications').textContent = notifications.length;
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// Load companies
function loadCompanies() {
    const container = document.getElementById('companiesList');
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-building"></i>
                <p>No companies yet. Add your first company!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = companies.map(company => {
        const fileCount = files.filter(f => f.company_id === company.id || f.companyId === company.id).length;
        return `
            <div class="company-card" onclick="viewCompanyFiles('${company.id}')">
                <h3>${escapeHtml(company.name)}</h3>
                <p><i class="fas fa-envelope"></i> ${escapeHtml(company.email)}</p>
                ${company.phone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(company.phone)}</p>` : ''}
                <p class="file-count"><i class="fas fa-file"></i> ${fileCount} file${fileCount !== 1 ? 's' : ''}</p>
                <p class="meta"><i class="fas fa-calendar"></i> Created: ${formatDate(company.created_at || company.createdAt)}</p>
                <div class="company-actions">
                    <button onclick="event.stopPropagation(); viewCompanyFiles('${company.id}')" class="btn-view">
                        <i class="fas fa-folder-open"></i> Files
                    </button>
                    <button onclick="event.stopPropagation(); editCompany('${company.id}')" class="btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="event.stopPropagation(); deleteCompany('${company.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Show add company modal
function showAddCompanyModal() {
    document.getElementById('addCompanyForm').reset();
    openModal('addCompanyModal');
}

// Handle add company - Using real Supabase API
async function handleAddCompany(e) {
    e.preventDefault();
    
    const name = document.getElementById('newCompanyName').value.trim();
    const email = document.getElementById('newCompanyEmail').value.trim();
    const password = document.getElementById('newCompanyPassword').value;
    const phone = document.getElementById('newCompanyPhone').value.trim();
    
    if (!password || password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    showToast('Creating company...', 'info');
    
    try {
        const response = await API.Companies.create({ name, email, password, phone });
        
        if (response.success) {
            closeModal('addCompanyModal');
            await loadCompaniesFromAPI();
            showToast('Company added successfully! They can now login with: ' + email, 'success');
        } else {
            showToast(response.message || 'Failed to create company', 'error');
        }
    } catch (error) {
        console.error('Create company error:', error);
        showToast(error.message || 'Failed to create company', 'error');
    }
}

// View company files
function viewCompanyFiles(companyId) {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    
    const companyFiles = files.filter(f => f.companyId === companyId);
    
    document.getElementById('companyFilesTitle').textContent = `${company.name} - Files`;
    document.getElementById('companyFilesCount').textContent = `${companyFiles.length} file(s)`;
    
    const container = document.getElementById('companyFilesGrid');
    
    if (companyFiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No files shared with this company yet.</p>
                <button onclick="closeModal('companyFilesModal'); showTab('upload')" class="btn-primary" style="margin-top: 15px;">
                    <i class="fas fa-upload"></i> Upload Files
                </button>
            </div>
        `;
    } else {
        container.innerHTML = companyFiles.map(file => `
            <div class="file-card" onclick="previewFile('${file.id}')">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <h4>${escapeHtml(file.name)}</h4>
                <p class="file-meta"><i class="fas fa-calendar"></i> ${formatDate(file.uploadedAt)}</p>
                <p class="file-meta"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</p>
                <div class="file-actions">
                    <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="btn-preview">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button onclick="event.stopPropagation(); downloadFile('${file.id}')" class="btn-download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteFile('${file.id}'); viewCompanyFiles('${companyId}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    openModal('companyFilesModal');
}

// Edit company
function editCompany(id) {
    const company = companies.find(c => c.id === id);
    if (!company) return;
    
    document.getElementById('editCompanyId').value = company.id;
    document.getElementById('editCompanyName').value = company.name;
    document.getElementById('editCompanyEmail').value = company.email;
    document.getElementById('editCompanyPassword').value = '';
    document.getElementById('editCompanyPhone').value = company.phone || '';
    
    openModal('editCompanyModal');
}

// Handle edit company - Using real Supabase API
async function handleEditCompany(e) {
    e.preventDefault();
    
    const id = document.getElementById('editCompanyId').value;
    const name = document.getElementById('editCompanyName').value.trim();
    const email = document.getElementById('editCompanyEmail').value.trim();
    const password = document.getElementById('editCompanyPassword').value;
    const phone = document.getElementById('editCompanyPhone').value.trim();
    
    showToast('Updating company...', 'info');
    
    try {
        const updateData = { name, email, phone };
        if (password && password.length >= 6) {
            updateData.password = password;
        }
        
        const response = await API.Companies.update(id, updateData);
        
        if (response.success) {
            closeModal('editCompanyModal');
            await loadCompaniesFromAPI();
            showToast('Company updated successfully!', 'success');
        } else {
            showToast(response.message || 'Failed to update company', 'error');
        }
    } catch (error) {
        console.error('Update company error:', error);
        showToast(error.message || 'Failed to update company', 'error');
    }
}

// Delete company - Using real Supabase API
async function deleteCompany(id) {
    if (!confirm('Are you sure you want to delete this company? All files will also be deleted.')) {
        return;
    }
    
    showToast('Deleting company...', 'info');
    
    try {
        const response = await API.Companies.delete(id);
        
        if (response.success) {
            await loadCompaniesFromAPI();
            showToast('Company deleted successfully', 'success');
        } else {
            showToast(response.message || 'Failed to delete company', 'error');
        }
    } catch (error) {
        console.error('Delete company error:', error);
        showToast(error.message || 'Failed to delete company', 'error');
    }
    showToast('Company deleted successfully', 'success');
}



// Populate company selectors
function populateCompanySelectors() {
    const options = companies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    
    document.getElementById('uploadCompany').innerHTML = '<option value="">Choose a company</option>' + options;
    document.getElementById('filterCompany').innerHTML = '<option value="">All Companies</option>' + options;
    document.getElementById('notifyCompany').innerHTML = '<option value="">All Companies</option>' + options;
}

// Load all files
function loadAllFiles(companyId = '') {
    const container = document.getElementById('filesList');
    // Support both company_id (from API) and companyId (legacy)
    let filteredFiles = companyId 
        ? files.filter(f => (f.company_id || f.companyId) === companyId) 
        : files;
    
    if (!filteredFiles || filteredFiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No files uploaded yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredFiles.map(file => {
        // Support both company_id and companyId
        const fileCompanyId = file.company_id || file.companyId;
        const company = companies.find(c => c.id === fileCompanyId);
        // Get company name from file's companies relation or from companies array
        const companyName = file.companies?.name || (company ? company.name : 'Unknown');
        
        return `
            <div class="file-card" onclick="previewFile('${file.id}')">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <h4>${escapeHtml(file.name)}</h4>
                <p class="file-meta"><i class="fas fa-building"></i> ${escapeHtml(companyName)}</p>
                <p class="file-meta"><i class="fas fa-tag"></i> ${escapeHtml(file.category || 'General')}</p>
                <p class="file-meta"><i class="fas fa-calendar"></i> ${formatDate(file.uploaded_at || file.uploadedAt)}</p>
                <p class="file-meta"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</p>
                <div class="file-actions">
                    <button onclick="event.stopPropagation(); viewAdminFile('${file.id}')" class="btn-preview">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button onclick="event.stopPropagation(); downloadAdminFile('${file.id}')" class="btn-download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="event.stopPropagation(); deleteFile('${file.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter files
function filterFiles() {
    const companyId = document.getElementById('filterCompany').value;
    loadAllFiles(companyId);
}

// Handle file select
function handleFileSelect(fileList) {
    selectedFiles = Array.from(fileList);
    displaySelectedFiles();
}

// Display selected files
function displaySelectedFiles() {
    const container = document.getElementById('selectedFiles');
    
    if (selectedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = selectedFiles.map((file, index) => `
        <div class="selected-file">
            <span><i class="fas ${getFileIcon(file.type)}"></i> ${escapeHtml(file.name)}</span>
            <button onclick="removeSelectedFile(${index})">&times;</button>
        </div>
    `).join('');
}

// Remove selected file
function removeSelectedFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
}

// Upload files - Using real Supabase API with upload time tracking
async function uploadFiles() {
    const companyId = document.getElementById('uploadCompany').value;
    const category = document.getElementById('uploadCategory').value;
    const expiryDate = document.getElementById('uploadExpiry').value;
    
    if (!companyId) {
        showToast('Please select a company', 'error');
        return;
    }
    
    if (!category) {
        showToast('Please select a category', 'error');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showToast('Please select files to upload', 'error');
        return;
    }
    
    const progressContainer = document.getElementById('uploadProgress');
    const uploadCount = selectedFiles.length;
    const startTime = Date.now();
    
    progressContainer.innerHTML = `
        <div class="progress-bar"><div class="progress-fill" id="progressFill">0%</div></div>
        <p class="upload-status" id="uploadStatus">Starting upload...</p>
        <p class="upload-time" id="uploadTime">Time: 0s</p>
    `;
    
    // Update time every second
    const timeInterval = setInterval(() => {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const timeEl = document.getElementById('uploadTime');
        if (timeEl) timeEl.textContent = `Time: ${elapsed}s`;
    }, 1000);
    
    try {
        // Create FormData for API upload
        const formData = new FormData();
        formData.append('company_id', companyId);
        formData.append('category', category);
        if (expiryDate) formData.append('expiry_date', expiryDate);
        
        for (const file of selectedFiles) {
            formData.append('files', file);
        }
        
        document.getElementById('uploadStatus').textContent = `Uploading ${uploadCount} file(s)...`;
        document.getElementById('progressFill').style.width = '50%';
        document.getElementById('progressFill').textContent = '50%';
        
        const response = await API.Files.upload(formData);
        
        clearInterval(timeInterval);
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (response.success) {
            document.getElementById('progressFill').style.width = '100%';
            document.getElementById('progressFill').textContent = '100%';
            document.getElementById('uploadStatus').textContent = `✅ Upload complete!`;
            document.getElementById('uploadTime').textContent = `Total time: ${totalTime}s`;
            
            selectedFiles = [];
            displaySelectedFiles();
            document.getElementById('fileInput').value = '';
            document.getElementById('uploadCategory').value = '';
            document.getElementById('uploadExpiry').value = '';
            
            await loadFilesFromAPI();
            updateAdminStats();
            
            showToast(`${uploadCount} file(s) uploaded in ${totalTime}s`, 'success');
            
            setTimeout(() => {
                progressContainer.innerHTML = '';
            }, 3000);
        } else {
            throw new Error(response.message || 'Upload failed');
        }
    } catch (error) {
        clearInterval(timeInterval);
        console.error('Upload error:', error);
        document.getElementById('uploadStatus').textContent = `❌ Upload failed: ${error.message}`;
        showToast('Upload failed: ' + error.message, 'error');
    }
}

// Read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

// Delete file - Using real Supabase API
async function deleteFile(id) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    showToast('Deleting file...', 'info');
    
    try {
        const response = await API.Files.delete(id);
        
        if (response.success) {
            await loadFilesFromAPI();
            updateAdminStats();
            showToast('File deleted successfully', 'success');
        } else {
            showToast(response.message || 'Failed to delete file', 'error');
        }
    } catch (error) {
        console.error('Delete file error:', error);
        showToast(error.message || 'Failed to delete file', 'error');
    }
}

// Preview file
function previewFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    currentPreviewFile = file;
    document.getElementById('previewFileName').textContent = file.name;
    
    const content = document.getElementById('previewContent');
    
    if (file.type.includes('image') && file.dataUrl) {
        // Show actual image
        content.innerHTML = `<img src="${file.dataUrl}" alt="${file.name}" style="max-width: 100%; max-height: 70vh;">`;
    } else if (file.type.includes('pdf') && file.dataUrl) {
        // Show PDF in iframe
        content.innerHTML = `<iframe src="${file.dataUrl}" style="width: 100%; height: 70vh; border: none;"></iframe>`;
    } else if (file.type.includes('image')) {
        // Placeholder for image without data
        content.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-image"></i>
                <p>Image Preview</p>
                <small>${escapeHtml(file.name)}</small>
                <p class="preview-note">Upload a real file to see preview</p>
            </div>
        `;
    } else if (file.type.includes('pdf')) {
        // Placeholder for PDF without data
        content.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-pdf" style="color: #e74c3c;"></i>
                <p>PDF Document</p>
                <small>${escapeHtml(file.name)}</small>
                <p class="preview-note">Upload a real file to see preview</p>
            </div>
        `;
    } else if (file.type.includes('word') || file.type.includes('document')) {
        content.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-word" style="color: #2b579a;"></i>
                <p>Word Document</p>
                <small>${escapeHtml(file.name)}</small>
                <p class="preview-note">Download to view this file</p>
            </div>
        `;
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
        content.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file-excel" style="color: #217346;"></i>
                <p>Excel Spreadsheet</p>
                <small>${escapeHtml(file.name)}</small>
                <p class="preview-note">Download to view this file</p>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="preview-placeholder">
                <i class="fas fa-file"></i>
                <p>File Preview</p>
                <small>${escapeHtml(file.name)}</small>
                <p class="preview-note">Download to view this file</p>
            </div>
        `;
    }
    
    openModal('previewModal');
}

// Download current file
function downloadCurrentFile() {
    if (!currentPreviewFile) return;
    
    if (currentPreviewFile.dataUrl) {
        const link = document.createElement('a');
        link.href = currentPreviewFile.dataUrl;
        link.download = currentPreviewFile.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading ${currentPreviewFile.name}...`, 'success');
    } else {
        showToast('File data not available', 'error');
    }
}

// Send notification
function sendNotification() {
    const companyId = document.getElementById('notifyCompany').value;
    const subject = document.getElementById('notifySubject').value.trim();
    const message = document.getElementById('notifyMessage').value.trim();
    
    if (!subject || !message) {
        showToast('Please enter subject and message', 'error');
        return;
    }
    
    if (companyId) {
        // Send to specific company
        notifications.push({
            id: generateId(),
            companyId,
            subject,
            message,
            sentAt: new Date().toISOString(),
            read: false
        });
    } else {
        // Send to all companies
        companies.forEach(company => {
            notifications.push({
                id: generateId(),
                companyId: company.id,
                subject,
                message,
                sentAt: new Date().toISOString(),
                read: false
            });
        });
    }
    
    saveData();
    document.getElementById('notifySubject').value = '';
    document.getElementById('notifyMessage').value = '';
    loadNotifications();
    updateAdminStats();
    showToast('Notification sent successfully', 'success');
}

// Load notifications (admin view)
function loadNotifications() {
    const container = document.getElementById('notificationsList');
    
    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <p>No notifications sent yet.</p>
            </div>
        `;
        return;
    }
    
    const sorted = [...notifications].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    
    container.innerHTML = sorted.map(notif => {
        const company = companies.find(c => c.id === notif.companyId);
        return `
            <div class="notification-item">
                <h4>${escapeHtml(notif.subject)}</h4>
                <p>${escapeHtml(notif.message)}</p>
                <p class="meta">
                    <i class="fas fa-building"></i> ${company ? escapeHtml(company.name) : 'Deleted Company'} |
                    <i class="fas fa-clock"></i> ${formatDate(notif.sentAt)}
                </p>
            </div>
        `;
    }).join('');
}

// ============================================
// COMPANY FUNCTIONS
// ============================================

async function loadCompanyDashboard() {
    document.getElementById('companyName').textContent = currentUser.company_name || currentUser.name || 'Company';
    document.getElementById('companyEmail').textContent = currentUser.email;
    
    showToast('Loading your dashboard...', 'info');
    
    // Load data from API
    try {
        await Promise.all([
            loadCompanyFilesFromAPI(),
            loadCompanyNotificationsFromAPI(),
            loadCompanyRequestsFromAPI()
        ]);
        
        updateCompanyStats();
        showToast('Dashboard loaded!', 'success');
    } catch (error) {
        console.error('Company dashboard error:', error);
        showToast('Some data failed to load', 'error');
    }
}

// Load company files from API
async function loadCompanyFilesFromAPI() {
    try {
        const response = await API.Files.getAll();
        if (response.success) {
            // Files are already filtered by company_id on the backend for company users
            files = response.data || [];
            loadCompanyFilesDisplay();
        }
    } catch (error) {
        console.error('Load company files error:', error);
    }
}

// Load company notifications from API
async function loadCompanyNotificationsFromAPI() {
    try {
        const response = await API.Notifications.getAll();
        if (response.success) {
            notifications = response.data || [];
            loadCompanyNotifications();
        }
    } catch (error) {
        console.error('Load company notifications error:', error);
    }
}

// Load company requests from API
async function loadCompanyRequestsFromAPI() {
    try {
        const response = await API.Requests.getAll();
        if (response.success) {
            documentRequests = response.data || [];
            loadMyRequests();
        }
    } catch (error) {
        console.error('Load company requests error:', error);
    }
}

// Update company stats
function updateCompanyStats() {
    const companyFiles = files || [];
    const companyNotifs = notifications || [];
    const unreadNotifs = companyNotifs.filter(n => !n.read);
    
    document.getElementById('companyStatFiles').textContent = companyFiles.length;
    document.getElementById('companyStatDownloads').textContent = '0';
    document.getElementById('companyStatNotifications').textContent = unreadNotifs.length;
}

// Company tab switching
function showCompanyTab(tabName) {
    document.querySelectorAll('#companyDashboard .tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('#companyDashboard .tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// Load company files display
function loadCompanyFilesDisplay() {
    const container = document.getElementById('companyFilesList');
    const companyFiles = files || [];
    
    if (companyFiles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>No files available yet.</p>
                <p style="color: #666; font-size: 0.9rem;">Files uploaded by admin will appear here.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = companyFiles.map(file => `
        <div class="file-card">
            <div class="file-icon">
                <i class="fas ${getFileIcon(file.type)}"></i>
            </div>
            <h4>${escapeHtml(file.name)}</h4>
            <p class="file-meta"><i class="fas fa-tag"></i> ${escapeHtml(file.category || 'General')}</p>
            <p class="file-meta"><i class="fas fa-calendar"></i> ${formatDate(file.uploaded_at || file.uploadedAt)}</p>
            <p class="file-meta"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</p>
            <div class="file-actions">
                <button onclick="viewCompanyFile('${file.id}')" class="btn-preview">
                    <i class="fas fa-eye"></i> View
                </button>
                <button onclick="downloadCompanyFile('${file.id}')" class="btn-download">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `).join('');
}

// Alias for backward compatibility
function loadCompanyFiles() {
    loadCompanyFilesDisplay();
}

// Download file (admin)
function downloadFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    if (file.dataUrl) {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading ${file.name}...`, 'success');
    } else if (file.storage_path) {
        // Get file from Supabase storage
        const url = `https://kgdiqvpzghcyebunjzau.supabase.co/storage/v1/object/public/company-files/${file.storage_path}`;
        window.open(url, '_blank');
        showToast(`Opening ${file.name}...`, 'success');
    } else {
        showToast('File not available', 'error');
    }
}

// View admin file (opens in new tab)
function viewAdminFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    if (file.storage_path) {
        const url = `https://kgdiqvpzghcyebunjzau.supabase.co/storage/v1/object/public/company-files/${file.storage_path}`;
        window.open(url, '_blank');
        showToast(`Opening ${file.name}...`, 'success');
    } else if (file.dataUrl) {
        window.open(file.dataUrl, '_blank');
        showToast(`Opening ${file.name}...`, 'success');
    } else {
        showToast('File not available', 'error');
    }
}

// Download admin file
function downloadAdminFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    if (file.storage_path) {
        const url = `https://kgdiqvpzghcyebunjzau.supabase.co/storage/v1/object/public/company-files/${file.storage_path}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading ${file.name}...`, 'success');
    } else if (file.dataUrl) {
        const link = document.createElement('a');
        link.href = file.dataUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading ${file.name}...`, 'success');
    } else {
        showToast('File not available', 'error');
    }
}

// View company file
async function viewCompanyFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    // Mark as read
    try {
        await API.Files.markAsRead(id);
    } catch (error) {
        console.error('Mark as read error:', error);
    }
    
    // Open file
    if (file.storage_path) {
        const url = `https://kgdiqvpzghcyebunjzau.supabase.co/storage/v1/object/public/company-files/${file.storage_path}`;
        window.open(url, '_blank');
        showToast(`Opening ${file.name}...`, 'success');
    } else {
        showToast('File not available', 'error');
    }
}

// Download company file
function downloadCompanyFile(id) {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    if (file.storage_path) {
        const url = `https://kgdiqvpzghcyebunjzau.supabase.co/storage/v1/object/public/company-files/${file.storage_path}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Downloading ${file.name}...`, 'success');
    } else {
        showToast('File not available', 'error');
    }
}

// Load company notifications
function loadCompanyNotifications() {
    const container = document.getElementById('companyNotificationsList');
    const companyNotifs = notifications.filter(n => n.companyId === currentUser.id);
    
    if (companyNotifs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <p>No notifications yet.</p>
            </div>
        `;
        return;
    }
    
    const sorted = [...companyNotifs].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    
    container.innerHTML = sorted.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <h4>${escapeHtml(notif.subject)}</h4>
            <p>${escapeHtml(notif.message)}</p>
            <p class="meta"><i class="fas fa-clock"></i> ${formatDate(notif.sentAt)}</p>
        </div>
    `).join('');
    
    // Mark as read
    companyNotifs.forEach(n => n.read = true);
    saveData();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(type) {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-file-image';
    if (type.includes('word') || type.includes('document')) return 'fa-file-word';
    if (type.includes('sheet') || type.includes('excel')) return 'fa-file-excel';
    return 'fa-file';
}

function saveData() {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}


// ============================================
// NEW ENHANCED FEATURES
// ============================================

// Populate category dropdowns
function populateCategoryDropdowns() {
    const options = FILE_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    document.getElementById('uploadCategory').innerHTML = '<option value="">Choose category</option>' + options;
    document.getElementById('filterCategory').innerHTML = '<option value="">All Categories</option>' + options;
    document.getElementById('filterCompanyCategory').innerHTML = '<option value="">All Categories</option>' + options;
}

// Session timeout (30 minutes)
function startSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        showToast('Session expired. Please login again.', 'error');
        logout();
    }, 30 * 60 * 1000);
}

function resetSessionTimeout() {
    if (currentUser) {
        startSessionTimeout();
    }
}

// Reset timeout on user activity
document.addEventListener('click', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);

// Log activity
function logActivity(action, details) {
    activityLog.unshift({
        id: generateId(),
        action,
        details,
        user: currentUser ? currentUser.email : 'Unknown',
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 100 activities
    if (activityLog.length > 100) {
        activityLog = activityLog.slice(0, 100);
    }
    
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(activityLog));
}

// Search companies
document.getElementById('searchCompanies')?.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const filtered = companies.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.email.toLowerCase().includes(query)
    );
    displayCompaniesFiltered(filtered);
});

function displayCompaniesFiltered(filtered) {
    const container = document.getElementById('companiesList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No companies found</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(company => {
        const fileCount = files.filter(f => f.companyId === company.id).length;
        return `
            <div class="company-card" onclick="viewCompanyFiles('${company.id}')">
                <h3>${escapeHtml(company.name)}</h3>
                <p><i class="fas fa-envelope"></i> ${escapeHtml(company.email)}</p>
                <p><i class="fas fa-key"></i> ${escapeHtml(company.password)}</p>
                ${company.phone ? `<p><i class="fas fa-phone"></i> ${escapeHtml(company.phone)}</p>` : ''}
                <p class="file-count"><i class="fas fa-file"></i> ${fileCount} file${fileCount !== 1 ? 's' : ''}</p>
                <div class="company-actions">
                    <button onclick="event.stopPropagation(); viewCompanyFiles('${company.id}')" class="btn-view">
                        <i class="fas fa-folder-open"></i> Files
                    </button>
                    <button onclick="event.stopPropagation(); editCompany('${company.id}')" class="btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="event.stopPropagation(); deleteCompany('${company.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Export companies to CSV
function exportCompanies() {
    const csv = [
        ['Name', 'Email', 'Password', 'Phone', 'Files', 'Created'],
        ...companies.map(c => [
            c.name,
            c.email,
            c.password,
            c.phone || '',
            files.filter(f => f.companyId === c.id).length,
            formatDate(c.createdAt)
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    logActivity('export', 'Exported companies list');
    showToast('Companies exported successfully', 'success');
}

// Enhanced filter files
document.getElementById('searchFiles')?.addEventListener('input', filterFiles);

function filterFiles() {
    const query = document.getElementById('searchFiles')?.value.toLowerCase() || '';
    const companyId = document.getElementById('filterCompany').value;
    const category = document.getElementById('filterCategory').value;
    
    let filtered = files;
    
    if (query) {
        filtered = filtered.filter(f => f.name.toLowerCase().includes(query));
    }
    
    if (companyId) {
        filtered = filtered.filter(f => f.companyId === companyId);
    }
    
    if (category) {
        filtered = filtered.filter(f => f.category === category);
    }
    
    displayFilesFiltered(filtered);
}

function displayFilesFiltered(filtered) {
    const container = document.getElementById('filesList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No files found</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(file => {
        const company = companies.find(c => c.id === file.companyId);
        const isExpired = file.expiryDate && new Date(file.expiryDate) < new Date();
        const isExpiringSoon = file.expiryDate && new Date(file.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        return `
            <div class="file-card" onclick="previewFile('${file.id}')">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                </div>
                <h4>${escapeHtml(file.name)}</h4>
                ${file.category ? `<span class="file-badge ${file.category.toLowerCase()}">${file.category}</span>` : ''}
                ${isExpired ? '<span class="file-badge expired">Expired</span>' : ''}
                <p class="file-meta"><i class="fas fa-building"></i> ${company ? escapeHtml(company.name) : 'Unknown'}</p>
                <p class="file-meta"><i class="fas fa-calendar"></i> ${formatDate(file.uploadedAt)}</p>
                <p class="file-meta"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</p>
                ${file.expiryDate ? `<p class="file-meta ${isExpiringSoon ? 'expiry-soon' : ''} ${isExpired ? 'expiry-warning' : ''}">
                    <i class="fas fa-clock"></i> Expires: ${formatDate(file.expiryDate)}
                </p>` : ''}
                <div class="file-actions">
                    <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="btn-preview">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button onclick="event.stopPropagation(); deleteFile('${file.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Load activity log
function loadActivityLog() {
    const container = document.getElementById('activityList');
    
    if (activityLog.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>No activity yet</p></div>';
        return;
    }
    
    container.innerHTML = activityLog.map(activity => `
        <div class="activity-item ${activity.action}">
            <div class="activity-info">
                <strong>${escapeHtml(activity.user)}</strong>
                <p>${escapeHtml(activity.details)}</p>
            </div>
            <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
        </div>
    `).join('');
}

function clearActivityLog() {
    if (!confirm('Clear all activity logs?')) return;
    
    activityLog = [];
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(activityLog));
    loadActivityLog();
    showToast('Activity log cleared', 'success');
}

// Load document requests (admin view)
function loadDocumentRequests() {
    const container = document.getElementById('requestsList');
    
    if (documentRequests.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-file-import"></i><p>No requests yet</p></div>';
        return;
    }
    
    container.innerHTML = documentRequests.map(req => {
        const company = companies.find(c => c.id === req.companyId);
        return `
            <div class="request-item ${req.status}">
                <div class="request-header">
                    <h4>${escapeHtml(req.docType)}</h4>
                    <span class="request-status ${req.status}">${req.status}</span>
                </div>
                <p><strong>Company:</strong> ${company ? escapeHtml(company.name) : 'Unknown'}</p>
                <p><strong>Description:</strong> ${escapeHtml(req.description)}</p>
                <p class="request-meta">Requested on ${formatDate(req.requestedAt)}</p>
                ${req.status === 'pending' ? `
                    <button onclick="markRequestCompleted('${req.id}')" class="btn-primary" style="margin-top: 10px;">
                        <i class="fas fa-check"></i> Mark as Completed
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function markRequestCompleted(requestId) {
    const request = documentRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'completed';
        request.completedAt = new Date().toISOString();
        saveData();
        loadDocumentRequests();
        logActivity('request', `Completed document request: ${request.docType}`);
        showToast('Request marked as completed', 'success');
    }
}

// Company: Request document
document.getElementById('requestDocForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const docType = document.getElementById('requestDocType').value;
    const description = document.getElementById('requestDescription').value.trim();
    
    const newRequest = {
        id: generateId(),
        companyId: currentUser.id,
        docType,
        description,
        status: 'pending',
        requestedAt: new Date().toISOString()
    };
    
    documentRequests.push(newRequest);
    saveData();
    
    this.reset();
    loadMyRequests();
    logActivity('request', `Requested document: ${docType}`);
    showToast('Request sent successfully', 'success');
});

function loadMyRequests() {
    const container = document.getElementById('myRequestsList');
    const myRequests = documentRequests.filter(r => r.companyId === currentUser.id);
    
    if (myRequests.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-file-import"></i><p>No requests yet</p></div>';
        return;
    }
    
    container.innerHTML = myRequests.map(req => `
        <div class="request-item ${req.status}">
            <div class="request-header">
                <h4>${escapeHtml(req.docType)}</h4>
                <span class="request-status ${req.status}">${req.status}</span>
            </div>
            <p>${escapeHtml(req.description)}</p>
            <p class="request-meta">Requested on ${formatDate(req.requestedAt)}</p>
            ${req.completedAt ? `<p class="request-meta">Completed on ${formatDate(req.completedAt)}</p>` : ''}
        </div>
    `).join('');
}

// Company: Change password
document.getElementById('changePasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (current !== currentUser.password) {
        showToast('Current password is incorrect', 'error');
        return;
    }
    
    if (newPass !== confirm) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Update password
    const companyIndex = companies.findIndex(c => c.id === currentUser.id);
    if (companyIndex !== -1) {
        companies[companyIndex].password = newPass;
        currentUser.password = newPass;
        saveData();
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        this.reset();
        logActivity('security', 'Changed password');
        showToast('Password changed successfully', 'success');
    }
});

// Password strength indicator
document.getElementById('newPassword')?.addEventListener('input', function(e) {
    const password = e.target.value;
    const strengthBar = document.getElementById('passwordStrength');
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    let className = 'weak';
    let text = 'Weak';
    
    if (strength >= 3) {
        className = 'medium';
        text = 'Medium';
    }
    if (strength >= 4) {
        className = 'strong';
        text = 'Strong';
    }
    
    strengthBar.innerHTML = `
        <div class="password-strength-bar ${className}"></div>
        <div class="password-strength-text">${text}</div>
    `;
});

// Load login history
function loadLoginHistory() {
    const container = document.getElementById('loginHistoryList');
    const history = activityLog.filter(a => a.action === 'login' && a.user === currentUser.email).slice(0, 5);
    
    if (history.length === 0) {
        container.innerHTML = '<p style="color: #999;">No login history</p>';
        return;
    }
    
    container.innerHTML = history.map(h => `
        <div class="login-history-item">
            <div><i class="fas fa-sign-in-alt"></i> ${formatDateTime(h.timestamp)}</div>
        </div>
    `).join('');
}

// Search company files
document.getElementById('searchCompanyFiles')?.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    const category = document.getElementById('filterCompanyCategory').value;
    
    let filtered = files.filter(f => f.companyId === currentUser.id);
    
    if (query) {
        filtered = filtered.filter(f => f.name.toLowerCase().includes(query));
    }
    
    if (category) {
        filtered = filtered.filter(f => f.category === category);
    }
    
    displayCompanyFilesFiltered(filtered);
});

function displayCompanyFilesFiltered(filtered) {
    const container = document.getElementById('companyFilesList');
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No files found</p></div>';
        return;
    }
    
    container.innerHTML = filtered.map(file => {
        const isExpired = file.expiryDate && new Date(file.expiryDate) < new Date();
        const isExpiringSoon = file.expiryDate && new Date(file.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const isRead = file.readBy && file.readBy.includes(currentUser.id);
        
        return `
            <div class="file-card ${isRead ? '' : 'unread'}" onclick="markAsRead('${file.id}'); previewFile('${file.id}')">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.type)}"></i>
                    ${!isRead ? '<span class="new-badge">NEW</span>' : ''}
                </div>
                <h4>${escapeHtml(file.name)}</h4>
                ${file.category ? `<span class="file-badge ${file.category.toLowerCase()}">${file.category}</span>` : ''}
                ${isExpired ? '<span class="file-badge expired">Expired</span>' : ''}
                <p class="file-meta"><i class="fas fa-calendar"></i> ${formatDate(file.uploadedAt)}</p>
                <p class="file-meta"><i class="fas fa-hdd"></i> ${formatFileSize(file.size)}</p>
                ${file.expiryDate ? `<p class="file-meta ${isExpiringSoon ? 'expiry-soon' : ''} ${isExpired ? 'expiry-warning' : ''}">
                    <i class="fas fa-clock"></i> Expires: ${formatDate(file.expiryDate)}
                </p>` : ''}
                <div class="file-actions">
                    <button onclick="event.stopPropagation(); previewFile('${file.id}')" class="btn-preview">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button onclick="event.stopPropagation(); downloadFile('${file.id}')" class="btn-download">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Mark file as read
function markAsRead(fileId) {
    const file = files.find(f => f.id === fileId);
    if (file && currentUser.role === 'company') {
        if (!file.readBy) file.readBy = [];
        if (!file.readBy.includes(currentUser.id)) {
            file.readBy.push(currentUser.id);
            saveData();
            logActivity('view', `Viewed file: ${file.name}`);
        }
    }
}

// Format date time
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update saveData to include new data
// No saveData function needed - all data is saved to Supabase via API
