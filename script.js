// Global variables 
let currentEditingIndex = -1; 

// Initialize EmailJS with your public key 
(function(){ 
    emailjs.init("ticqJg3yi_7s1Vmse"); // Your EmailJS public key 
})(); 

// Main functionality 
document.addEventListener('DOMContentLoaded', function() { 
    // Add page transition class 
    document.body.classList.add('page-load'); 
    
    // Trigger animations after short delay 
    setTimeout(() => { 
        document.body.classList.remove('page-load'); 
    }, 50); 
    
    // Viewer count logic 
    let viewerCount = localStorage.getItem('viewerCount'); 
    viewerCount = viewerCount ? parseInt(viewerCount) + 1 : 1; 
    localStorage.setItem('viewerCount', viewerCount); 

    // Form submission handling 
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const service = document.getElementById('service').value;
            const date = document.getElementById('date').value;
            
            // Prepare email parameters
            const templateParams = {
                from_name: fullName,
                from_email: email,
                phone: phone,
                service: service,
                date: date,
                to_email: 'baluassociates.net@gmail.com' // Admin's email
            };
            
            // Send email using EmailJS with your credentials
            emailjs.send('service_2uda0ap', 'template_keddqvl', templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert(`Thank you, ${fullName}! Your consultation request for ${service} on ${date} has been sent. We will contact you shortly at ${email} or ${phone}.`);
                    consultationForm.reset();
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Sorry, there was an error sending your request. Please try again later.');
                });
        });
    }

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenu && mainNav) {
        mobileMenu.addEventListener('click', function() {
            mainNav.classList.toggle('open');
        });

        // Close menu when a nav link is clicked
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('open');
            });
        });
    }

    // GST Calculator Logic
    const amountInput = document.getElementById('amount');
    const gstRateSelect = document.getElementById('gst-rate');
    const calculateGstBtn = document.getElementById('calculate-gst');
    const resetGstBtn = document.getElementById('reset-gst');
    const gstAmountSpan = document.getElementById('gst-amount');
    const totalAmountSpan = document.getElementById('total-amount');

    if (calculateGstBtn) {
        calculateGstBtn.addEventListener('click', calculateGst);
    }

    if (resetGstBtn) {
        resetGstBtn.addEventListener('click', resetGst);
    }

    function calculateGst() {
        const amount = parseFloat(amountInput.value);
        const gstRate = parseFloat(gstRateSelect.value);

        if (isNaN(amount) || amount < 0) {
            alert("Please enter a valid amount.");
            return;
        }

        const gstAmount = amount * (gstRate / 100);
        const totalAmount = amount + gstAmount;

        gstAmountSpan.textContent = gstAmount.toFixed(2);
        totalAmountSpan.textContent = totalAmount.toFixed(2);
    }

    function resetGst() {
        amountInput.value = "0";
        gstRateSelect.value = "18"; // Default to 18%
        gstAmountSpan.textContent = "0.00";
        totalAmountSpan.textContent = "0.00";
    }
    
    // Review Form Submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        // Star rating functionality
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('reviewRating');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                ratingInput.value = rating;
                
                // Update star appearance
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
            
            // Hover effect
            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                stars.forEach(s => {
                    if (s.getAttribute('data-rating') <= rating) {
                        s.style.color = '#ffc107';
                    }
                });
            });
            
            star.addEventListener('mouseout', function() {
                stars.forEach(s => {
                    if (!s.classList.contains('active')) {
                        s.style.color = '#ddd';
                    }
                });
            });
        });
        
        // Form submission
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reviewerName').value;
            const email = document.getElementById('reviewerEmail').value;
            const rating = document.getElementById('reviewRating').value;
            const message = document.getElementById('reviewMessage').value;
            
            if (rating === '0') {
                alert('Please select a rating.');
                return;
            }
            
            // Prepare email parameters for review submission
            const templateParams = {
                from_name: name,
                from_email: email,
                rating: rating,
                message: message,
                to_email: 'baluassociates.net@gmail.com' // Admin's email
            };
            
            // Send email using EmailJS with your NEW credentials
            emailjs.send('service_04jaj2y', 'template_bwargqk', templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    alert(`Thank you, ${name}! Your review has been submitted successfully. We appreciate your feedback.`);
                    reviewForm.reset();
                    
                    // Reset star ratings
                    stars.forEach(s => {
                        s.classList.remove('active');
                        s.style.color = '#ddd';
                    });
                }, function(error) {
                    console.log('FAILED...', error);
                    alert('Sorry, there was an error submitting your review. Please try again later.');
                });
        });
    }
}); 

function getStatusColor(status) { 
    const colors = { 
        'Pending': '#ffd700', 
        'Upcoming': '#90EE90', 
        'Completed': '#6495ED', 
        'Cancelled': '#ff6961' 
    }; 
    return colors[status] || '#cccccc'; 
} 

// Add intersection observer for scroll animations 
const observer = new IntersectionObserver((entries) => { 
    entries.forEach(entry => { 
        if (entry.isIntersecting) { 
            entry.target.classList.add('visible'); 
        } 
    }); 
}, { threshold: 0.1 }); 

document.querySelectorAll('section').forEach(section => { 
    observer.observe(section); 
}); 

// Add mouse movement effects 
document.addEventListener('mousemove', (e) => { 
    const x = e.clientX / window.innerWidth; 
    const y = e.clientY / window.innerHeight; 
    
    document.documentElement.style.setProperty('--mouse-x', x); 
    document.documentElement.style.setProperty('--mouse-y', y); 
}); 

// Add floating animation to hero quick links 
document.addEventListener('DOMContentLoaded', function() { 
    const quickLinks = document.querySelectorAll('.hero-quick-links span'); 
    quickLinks.forEach((link, index) => { 
        link.style.setProperty('--delay', index); 
    }); 
    
    const statBoxes = document.querySelectorAll('.hero-stats .stat-box'); 
    statBoxes.forEach((box, index) => { 
        box.style.setProperty('--delay', index); 
    }); 
});

// ============================================
// CLIENT PORTAL FUNCTIONALITY
// ============================================

// Portal Configuration - Replace with your Google Apps Script Web App URL
const PORTAL_CONFIG = {
    SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
    RETENTION_DAYS: 365
};

// Portal storage keys
const PORTAL_STORAGE = {
    USER: 'portal_user_data',
    TOKEN: 'portal_auth_token'
};

// Current portal user
let portalUser = null;

// Open portal
function openPortal() {
    document.getElementById('client-portal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    checkPortalAuth();
}

// Close portal
function closePortal() {
    document.getElementById('client-portal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Check portal authentication
function checkPortalAuth() {
    const userData = localStorage.getItem(PORTAL_STORAGE.USER);
    if (userData) {
        portalUser = JSON.parse(userData);
        showPortalDashboard();
    } else {
        showPortalScreen('portalLogin');
    }
}

// Handle portal login
async function handlePortalLogin() {
    const email = document.getElementById('portalEmail').value.trim();
    const password = document.getElementById('portalPassword').value;
    const errorEl = document.getElementById('portalError');
    
    if (!email || !password) {
        errorEl.textContent = 'Please enter email and password';
        return;
    }
    
    errorEl.textContent = 'Logging in...';
    
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'login',
                email: email,
                password: password
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            portalUser = result.user;
            localStorage.setItem(PORTAL_STORAGE.USER, JSON.stringify(result.user));
            errorEl.textContent = '';
            document.getElementById('portalEmail').value = '';
            document.getElementById('portalPassword').value = '';
            showPortalDashboard();
        } else {
            errorEl.textContent = result.message || 'Login failed. Please check your credentials.';
        }
    } catch (error) {
        console.error('Portal login error:', error);
        errorEl.textContent = 'Connection error. Please check your internet connection.';
    }
}

// Handle portal logout
function handlePortalLogout() {
    localStorage.removeItem(PORTAL_STORAGE.USER);
    portalUser = null;
    showPortalScreen('portalLogin');
}

// Show portal dashboard
function showPortalDashboard() {
    if (portalUser.role === 'admin') {
        showAdminPortalDashboard();
    } else {
        showCompanyPortalDashboard();
    }
}

// Show admin portal dashboard
async function showAdminPortalDashboard() {
    showPortalScreen('portalAdminDash');
    document.getElementById('portalAdminEmail').textContent = portalUser.email;
    await loadPortalCompanies();
    await loadAllPortalFiles();
}

// Show company portal dashboard
async function showCompanyPortalDashboard() {
    showPortalScreen('portalCompanyDash');
    document.getElementById('portalCompanyEmail').textContent = portalUser.email;
    document.getElementById('portalCompanyName').textContent = portalUser.companyName;
    await loadCompanyPortalFiles();
}

// Show portal screen
function showPortalScreen(screenId) {
    document.querySelectorAll('.portal-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Load portal companies
async function loadPortalCompanies() {
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL + '?action=getCompanies');
        const result = await response.json();
        
        if (result.success) {
            displayPortalCompanies(result.companies);
            populatePortalCompanySelector(result.companies);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

// Display portal companies
function displayPortalCompanies(companies) {
    const container = document.getElementById('companiesList');
    container.innerHTML = '';
    
    if (companies.length === 0) {
        container.innerHTML = '<p style="color: #666;">No companies yet. Add your first company above.</p>';
        return;
    }
    
    companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.innerHTML = `
            <h4>${company.name}</h4>
            <p>ID: ${company.id.substring(0, 8)}...</p>
            ${company.domain ? `<p>Domain: ${company.domain}</p>` : ''}
            <p>Created: ${new Date(company.createdAt).toLocaleDateString()}</p>
            <button onclick="deletePortalCompany('${company.id}')">Delete</button>
        `;
        container.appendChild(card);
    });
}

// Populate portal company selector
function populatePortalCompanySelector(companies) {
    const selector = document.getElementById('companySelector');
    selector.innerHTML = '<option value="">Select Company</option>';
    
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company.id;
        option.textContent = company.name;
        selector.appendChild(option);
    });
}

// Add company
async function addCompany() {
    const name = document.getElementById('newCompanyName').value.trim();
    const domain = document.getElementById('newCompanyDomain').value.trim();
    
    if (!name) {
        alert('Please enter company name');
        return;
    }
    
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'addCompany',
                name: name,
                domain: domain,
                adminEmail: portalUser.email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('newCompanyName').value = '';
            document.getElementById('newCompanyDomain').value = '';
            await loadPortalCompanies();
            alert('Company added successfully!');
        } else {
            alert(result.message || 'Failed to add company');
        }
    } catch (error) {
        console.error('Error adding company:', error);
        alert('Error adding company. Please try again.');
    }
}

// Delete portal company
async function deletePortalCompany(companyId) {
    if (!confirm('Are you sure you want to delete this company and all its files?')) {
        return;
    }
    
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteCompany',
                companyId: companyId,
                adminEmail: portalUser.email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadPortalCompanies();
            await loadAllPortalFiles();
            alert('Company deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete company');
        }
    } catch (error) {
        console.error('Error deleting company:', error);
        alert('Error deleting company. Please try again.');
    }
}

// Upload portal files
async function uploadPortalFiles() {
    const companyId = document.getElementById('companySelector').value;
    const fileInput = document.getElementById('portalFileInput');
    const files = fileInput.files;
    
    if (!companyId) {
        alert('Please select a company');
        return;
    }
    
    if (files.length === 0) {
        alert('Please select files to upload');
        return;
    }
    
    const progressEl = document.getElementById('uploadProgress');
    progressEl.classList.add('active');
    progressEl.innerHTML = 'Preparing upload...';
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressEl.innerHTML = `Uploading ${i + 1} of ${files.length}: ${file.name}`;
        
        try {
            const base64 = await fileToBase64Portal(file);
            
            const response = await fetch(PORTAL_CONFIG.SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'uploadFile',
                    companyId: companyId,
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    content: base64,
                    uploadedBy: portalUser.email
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                successCount++;
            } else {
                failCount++;
                console.error('Upload failed for', file.name, result.message);
            }
        } catch (error) {
            failCount++;
            console.error('Error uploading', file.name, error);
        }
    }
    
    progressEl.innerHTML = `Upload complete! Success: ${successCount}, Failed: ${failCount}`;
    fileInput.value = '';
    await loadAllPortalFiles();
    
    setTimeout(() => {
        progressEl.classList.remove('active');
    }, 5000);
}

// Convert file to base64
function fileToBase64Portal(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Load all portal files (admin)
async function loadAllPortalFiles() {
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL + '?action=getAllFiles&email=' + portalUser.email);
        const result = await response.json();
        
        if (result.success) {
            displayPortalFiles(result.files, 'adminFilesList', true);
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Load company portal files
async function loadCompanyPortalFiles() {
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL + '?action=getCompanyFiles&email=' + portalUser.email);
        const result = await response.json();
        
        if (result.success) {
            displayPortalFiles(result.files, 'companyFilesList', false);
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Display portal files
function displayPortalFiles(files, containerId, isAdmin) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (files.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No files found</p>';
        return;
    }
    
    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'file-card';
        
        const expiresAt = new Date(file.expiresAt);
        const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
        
        card.innerHTML = `
            <h4>${file.filename}</h4>
            <div class="file-info">
                <p><strong>Company:</strong> ${file.companyName}</p>
                <p><strong>Size:</strong> ${formatPortalFileSize(file.size)}</p>
                <p><strong>Uploaded:</strong> ${new Date(file.uploadedAt).toLocaleDateString()}</p>
                <p><strong>Expires in:</strong> ${daysLeft} days</p>
            </div>
            <div class="file-actions">
                ${canPreviewPortalFile(file.mimeType) ? `<button class="btn-preview" onclick="previewPortalFile('${file.id}')">Preview</button>` : ''}
                <button class="btn-download" onclick="downloadPortalFile('${file.id}', '${file.filename}')">Download</button>
                ${isAdmin ? `<button class="btn-delete" onclick="deletePortalFile('${file.id}')">Delete</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// Check if file can be previewed
function canPreviewPortalFile(mimeType) {
    return mimeType && (
        mimeType.startsWith('image/') ||
        mimeType === 'application/pdf'
    );
}

// Format file size
function formatPortalFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Preview portal file
async function previewPortalFile(fileId) {
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL + '?action=getFileUrl&fileId=' + fileId + '&email=' + portalUser.email);
        const result = await response.json();
        
        if (result.success) {
            const modal = document.getElementById('filePreviewModal');
            const content = document.getElementById('filePreviewContent');
            
            if (result.mimeType.startsWith('image/')) {
                content.innerHTML = `<img src="${result.url}" alt="Preview">`;
            } else if (result.mimeType === 'application/pdf') {
                content.innerHTML = `<iframe src="${result.url}"></iframe>`;
            }
            
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } else {
            alert('Failed to load preview');
        }
    } catch (error) {
        console.error('Error previewing file:', error);
        alert('Error loading preview');
    }
}

// Close file preview
function closeFilePreview() {
    const modal = document.getElementById('filePreviewModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Download portal file
async function downloadPortalFile(fileId, filename) {
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL + '?action=getFileUrl&fileId=' + fileId + '&email=' + portalUser.email);
        const result = await response.json();
        
        if (result.success) {
            const a = document.createElement('a');
            a.href = result.url;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert('Failed to download file');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
    }
}

// Delete portal file (admin only)
async function deletePortalFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const response = await fetch(PORTAL_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'deleteFile',
                fileId: fileId,
                adminEmail: portalUser.email
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            await loadAllPortalFiles();
            alert('File deleted successfully!');
        } else {
            alert(result.message || 'Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    }
}

// Close portal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePortal();
        closeFilePreview();
    }
});
