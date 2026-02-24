// API Base URL will be loaded from config.js

// Get token from storage
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// API Request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        },
        ...options
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        alert(error.message);
        throw error;
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Load user info
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    }
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.dataset.section;

            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${sectionName}-section`).classList.add('active');

            // Update page title
            document.getElementById('pageTitle').textContent = 
                sectionName.charAt(0).toUpperCase() + sectionName.slice(1);

            // Load data for section
            if (sectionName === 'news') loadNews();
            else if (sectionName === 'publications') loadPublications();
            else if (sectionName === 'projects') loadProjects();
            else if (sectionName === 'members') loadMembers();
        });
    });
}

// Load Dashboard Stats
async function loadDashboardStats() {
    try {
        const [news, publications, projects, members] = await Promise.all([
            apiRequest('/news?limit=1'),
            apiRequest('/publications?limit=1'),
            apiRequest('/projects'),
            apiRequest('/members')
        ]);

        document.getElementById('totalNews').textContent = news.pagination?.total || 0;
        document.getElementById('totalPublications').textContent = publications.pagination?.total || 0;
        document.getElementById('totalProjects').textContent = projects.data?.length || 0;
        document.getElementById('totalMembers').textContent = members.data?.length || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===== NEWS MANAGEMENT =====
async function loadNews() {
    const container = document.getElementById('newsContent');
    container.innerHTML = '<div class="loading">Loading news...</div>';

    try {
        const response = await apiRequest('/news?page=1&limit=50');
        const news = response.data;

        if (news.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No news found. Click "Add News" to create one.</p>
                </div>
            `;
            return;
        }

        const table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${news.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td><span style="text-transform: capitalize;">${item.category}</span></td>
                            <td>${new Date(item.publishedDate).toLocaleDateString()}</td>
                            <td>${item.isPublished ? '✅ Published' : '⏸️ Draft'}</td>
                            <td>
                                <button class="action-btn btn-edit" onclick="editNews('${item._id}')">Edit</button>
                                <button class="action-btn btn-delete" onclick="deleteNews('${item._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = table;
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading news</div>';
    }
}

function openNewsModal(id = null) {
    const modal = document.getElementById('modal');
    const isEdit = id !== null;

    const modalContent = `
        <div class="modal-header">
            <h2>${isEdit ? 'Edit' : 'Add'} News</h2>
            <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="newsForm" onsubmit="saveNews(event, '${id}')">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required id="news-title">
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required id="news-category">
                    <option value="announcement">Announcement</option>
                    <option value="conference">Conference</option>
                    <option value="publication">Publication</option>
                    <option value="event">Event</option>
                    <option value="achievement">Achievement</option>
                </select>
            </div>
            <div class="form-group">
                <label>Image (cover)</label>
                <input type="file" name="image" id="news-image" accept="image/jpeg,image/png,image/gif">
                <div id="news-current-image"></div>
                <small style="color: var(--gray); font-size: 0.85rem;">JPG, PNG, GIF. Max 5MB</small>
            </div>
            <div class="form-group">
                <label>Content *</label>
                <textarea name="content" required id="news-content"></textarea>
            </div>
            <div class="form-group">
                <label>Excerpt</label>
                <textarea name="excerpt" id="news-excerpt"></textarea>
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" name="tags" id="news-tags" placeholder="iot, 5g, research">
            </div>
            <div class="form-group">
                <label>Published Date</label>
                <input type="date" name="publishedDate" id="news-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="isPublished" id="news-published" checked> Publish immediately
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('modalContent').innerHTML = modalContent;

    if (isEdit) {
        loadNewsData(id);
    }

    modal.classList.add('show');
}

async function loadNewsData(id) {
    try {
        const response = await apiRequest(`/news/${id}`);
        const news = response.data;

        document.getElementById('news-title').value = news.title;
        document.getElementById('news-category').value = news.category;
        document.getElementById('news-content').value = news.content;
        document.getElementById('news-excerpt').value = news.excerpt || '';
        document.getElementById('news-tags').value = news.tags?.join(', ') || '';
        document.getElementById('news-date').value = new Date(news.publishedDate).toISOString().split('T')[0];
        document.getElementById('news-published').checked = news.isPublished;
        if (news.image) {
            const imgWrap = document.getElementById('news-current-image');
            if (imgWrap) imgWrap.innerHTML = `<p style="margin-top:0.5rem;">Ảnh hiện tại: <a href="${API_BASE_URL.replace('/api','')}${news.image}" target="_blank">Xem</a></p>`;
        }
    } catch (error) {
        alert('Error loading news data');
        closeModal();
    }
}

async function saveNews(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    formData.set('tags', formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(Boolean).join(',') : '');
    if (!formData.get('image')?.size) formData.delete('image');

    try {
        if (id && id !== 'null') {
            await apiRequest(`/news/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiRequest('/news', {
                method: 'POST',
                body: formData
            });
        }

        closeModal();
        loadNews();
        alert('News saved successfully!');
    } catch (error) {
        alert('Error saving news');
    }
}

async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
        await apiRequest(`/news/${id}`, { method: 'DELETE' });
        loadNews();
        alert('News deleted successfully!');
    } catch (error) {
        alert('Error deleting news');
    }
}

function editNews(id) {
    openNewsModal(id);
}

// ===== PUBLICATIONS MANAGEMENT =====
async function loadPublications() {
    const container = document.getElementById('publicationsContent');
    container.innerHTML = '<div class="loading">Loading publications...</div>';

    try {
        const response = await apiRequest('/publications?limit=100');
        const pubs = response.data;

        if (pubs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No publications found.</p>
                </div>
            `;
            return;
        }

        const table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Authors</th>
                        <th>Year</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${pubs.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.authors.slice(0, 2).join(', ')}${item.authors.length > 2 ? '...' : ''}</td>
                            <td>${item.year}</td>
                            <td style="text-transform: capitalize;">${item.type.replace('_', ' ')}</td>
                            <td>
                                <button class="action-btn btn-edit" onclick="editPublication('${item._id}')">Edit</button>
                                <button class="action-btn btn-delete" onclick="deletePublication('${item._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = table;
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading publications</div>';
    }
}

function openPublicationModal(id = null) {
    const modal = document.getElementById('modal');
    const isEdit = id !== null;

    const modalContent = `
        <div class="modal-header">
            <h2>${isEdit ? 'Edit' : 'Add'} Publication</h2>
            <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="pubForm" onsubmit="savePublication(event, '${id}')">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required id="pub-title">
            </div>
            <div class="form-group">
                <label>Authors (one per line) *</label>
                <textarea name="authors" required id="pub-authors" placeholder="Nguyen Van A&#10;Tran Thi B"></textarea>
            </div>
            <div class="form-group">
                <label>Venue *</label>
                <input type="text" name="venue" required id="pub-venue">
            </div>
            <div class="form-group">
                <label>Year *</label>
                <input type="number" name="year" required id="pub-year" min="2000" max="2100" value="${new Date().getFullYear()}">
            </div>
            <div class="form-group">
                <label>Type *</label>
                <select name="type" required id="pub-type">
                    <option value="conference">Conference</option>
                    <option value="journal">Journal</option>
                    <option value="workshop">Workshop</option>
                    <option value="book_chapter">Book Chapter</option>
                    <option value="thesis">Thesis</option>
                </select>
            </div>
            <div class="form-group">
                <label>DOI</label>
                <input type="text" name="doi" id="pub-doi">
            </div>
            <div class="form-group">
                <label>URL</label>
                <input type="url" name="url" id="pub-url">
            </div>
            <div class="form-group">
                <label>PDF File</label>
                <input type="file" name="pdfFile" id="pub-pdf" accept=".pdf">
                <small style="color: var(--gray); font-size: 0.85rem;">File PDF. Max 5MB</small>
            </div>
            <div class="form-group">
                <label>Image (cover/thumbnail)</label>
                <input type="file" name="image" id="pub-image" accept="image/jpeg,image/png,image/gif">
                <small style="color: var(--gray); font-size: 0.85rem;">JPG, PNG, GIF. Max 5MB</small>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('modalContent').innerHTML = modalContent;

    if (isEdit) {
        loadPublicationData(id);
    }

    modal.classList.add('show');
}

async function loadPublicationData(id) {
    try {
        const response = await apiRequest(`/publications/${id}`);
        const pub = response.data;

        document.getElementById('pub-title').value = pub.title;
        document.getElementById('pub-authors').value = pub.authors.join('\n');
        document.getElementById('pub-venue').value = pub.venue;
        document.getElementById('pub-year').value = pub.year;
        document.getElementById('pub-type').value = pub.type;
        document.getElementById('pub-doi').value = pub.doi || '';
        document.getElementById('pub-url').value = pub.url || '';
    } catch (error) {
        alert('Error loading publication data');
        closeModal();
    }
}

async function savePublication(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    if (!formData.get('pdfFile')?.size) formData.delete('pdfFile');
    if (!formData.get('image')?.size) formData.delete('image');

    try {
        if (id && id !== 'null') {
            await apiRequest(`/publications/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiRequest('/publications', {
                method: 'POST',
                body: formData
            });
        }

        closeModal();
        loadPublications();
        alert('Publication saved successfully!');
    } catch (error) {
        alert('Error saving publication');
    }
}

async function deletePublication(id) {
    if (!confirm('Are you sure you want to delete this publication?')) return;

    try {
        await apiRequest(`/publications/${id}`, { method: 'DELETE' });
        loadPublications();
        alert('Publication deleted successfully!');
    } catch (error) {
        alert('Error deleting publication');
    }
}

function editPublication(id) {
    openPublicationModal(id);
}

// ===== PROJECTS MANAGEMENT =====
async function loadProjects() {
    const container = document.getElementById('projectsContent');
    container.innerHTML = '<div class="loading">Loading projects...</div>';

    try {
        const response = await apiRequest('/projects');
        const projects = response.data || [];

        if (projects.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No projects found. Click "Add Project" to create one.</p></div>';
            return;
        }

        const table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${(item.category || '').replace(/_/g, ' ')}</td>
                            <td>${item.status || 'ongoing'}</td>
                            <td>${item.startDate ? new Date(item.startDate).toLocaleDateString() : '-'}</td>
                            <td>
                                <button class="action-btn btn-edit" onclick="editProject('${item._id}')">Edit</button>
                                <button class="action-btn btn-delete" onclick="deleteProject('${item._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = table;
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading projects. Check if Backend is running.</div>';
    }
}

function openProjectModal(id = null) {
    const modal = document.getElementById('modal');
    const isEdit = id !== null;
    const today = new Date().toISOString().split('T')[0];

    const modalContent = `
        <div class="modal-header">
            <h2>${isEdit ? 'Edit' : 'Add'} Project</h2>
            <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="projectForm" onsubmit="saveProject(event, '${id}')">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" name="title" required id="project-title">
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" required id="project-description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select name="category" required id="project-category">
                    <option value="edge_computing">Edge Computing</option>
                    <option value="iot_security">IoT Security</option>
                    <option value="5g_6g">5G/6G</option>
                    <option value="ai_ml">AI/ML</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Status *</label>
                <select name="status" required id="project-status">
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                </select>
            </div>
            <div class="form-group">
                <label>Image</label>
                <input type="file" name="image" id="project-image" accept="image/jpeg,image/png,image/gif">
                <small style="color: var(--gray); font-size: 0.85rem;">JPG, PNG, GIF. Max 5MB</small>
            </div>
            <div class="form-group">
                <label>Start Date *</label>
                <input type="date" name="startDate" required id="project-startDate" value="${today}">
            </div>
            <div class="form-group">
                <label>End Date</label>
                <input type="date" name="endDate" id="project-endDate">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="isPublished" id="project-published" checked> Published
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('modalContent').innerHTML = modalContent;

    if (isEdit) {
        loadProjectData(id);
    }

    modal.classList.add('show');
}

async function loadProjectData(id) {
    try {
        const response = await apiRequest(`/projects/${id}`);
        const p = response.data;

        document.getElementById('project-title').value = p.title || '';
        document.getElementById('project-description').value = p.description || '';
        document.getElementById('project-category').value = p.category || 'other';
        document.getElementById('project-status').value = p.status || 'ongoing';
        document.getElementById('project-startDate').value = p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '';
        document.getElementById('project-endDate').value = p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '';
        document.getElementById('project-published').checked = p.isPublished !== false;
    } catch (error) {
        alert('Error loading project data');
        closeModal();
    }
}

async function saveProject(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    if (!formData.get('image')?.size) formData.delete('image');

    try {
        if (id && id !== 'null') {
            await apiRequest(`/projects/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiRequest('/projects', {
                method: 'POST',
                body: formData
            });
        }

        closeModal();
        loadProjects();
        loadDashboardStats();
        alert('Project saved successfully!');
    } catch (error) {
        alert(error.message || 'Error saving project');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        await apiRequest(`/projects/${id}`, { method: 'DELETE' });
        loadProjects();
        loadDashboardStats();
        alert('Project deleted successfully!');
    } catch (error) {
        alert('Error deleting project');
    }
}

function editProject(id) {
    openProjectModal(id);
}

// ===== MEMBERS MANAGEMENT =====
async function loadMembers() {
    const container = document.getElementById('membersContent');
    container.innerHTML = '<div class="loading">Loading members...</div>';

    try {
        const response = await apiRequest('/members');
        const members = response.data || [];

        if (members.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No members found. Click "Add Member" to create one.</p></div>';
            return;
        }

        const positionLabels = {
            professor: 'Professor', associate_professor: 'Assoc. Prof.',
            assistant_professor: 'Asst. Prof.', postdoc: 'Postdoc',
            phd_student: 'PhD Student', master_student: 'Master Student',
            undergraduate: 'Undergraduate', research_assistant: 'Research Assistant',
            collaborator: 'Collaborator'
        };

        const table = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${members.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.email}</td>
                            <td>${positionLabels[item.position] || item.position}</td>
                            <td>
                                <button class="action-btn btn-edit" onclick="editMember('${item._id}')">Edit</button>
                                <button class="action-btn btn-delete" onclick="deleteMember('${item._id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = table;
    } catch (error) {
        container.innerHTML = '<div class="empty-state">Error loading members. Check if Backend is running.</div>';
    }
}

function openMemberModal(id = null) {
    const modal = document.getElementById('modal');
    const isEdit = id !== null;

    const modalContent = `
        <div class="modal-header">
            <h2>${isEdit ? 'Edit' : 'Add'} Member</h2>
            <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <form id="memberForm" onsubmit="saveMember(event, '${id}')">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" required id="member-name">
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required id="member-email">
            </div>
            <div class="form-group">
                <label>Position *</label>
                <select name="position" required id="member-position">
                    <option value="professor">Professor</option>
                    <option value="associate_professor">Associate Professor</option>
                    <option value="assistant_professor">Assistant Professor</option>
                    <option value="postdoc">Postdoc</option>
                    <option value="phd_student">PhD Student</option>
                    <option value="master_student">Master Student</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="research_assistant">Research Assistant</option>
                    <option value="collaborator">Collaborator</option>
                </select>
            </div>
            <div class="form-group">
                <label>Học vị (Academic Title)</label>
                <select name="academicTitle" id="member-academicTitle">
                    <option value="">— Chọn —</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Assoc. Prof.">Assoc. Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="MSc">MSc</option>
                    <option value="BSc">BSc</option>
                </select>
            </div>
            <div class="form-group">
                <label>Trường / Đơn vị (Affiliation)</label>
                <input type="text" name="affiliation" id="member-affiliation" placeholder="VD: PTIT, Ha Noi">
            </div>
            <div class="form-group">
                <label>Bio</label>
                <textarea name="bio" id="member-bio" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Photo</label>
                <input type="file" name="photo" id="member-photo" accept="image/jpeg,image/png,image/gif">
                <small style="color: var(--gray); font-size: 0.85rem;">JPG, PNG, GIF. Max 5MB</small>
            </div>
            <div class="form-group">
                <label>Research Interests (comma separated)</label>
                <input type="text" name="researchInterests" id="member-interests" placeholder="IoT, 5G, Security">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="isActive" id="member-active" checked> Active
                </label>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" name="isAlumni" id="member-alumni"> Alumni
                </label>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('modalContent').innerHTML = modalContent;

    if (isEdit) {
        loadMemberData(id);
    }

    modal.classList.add('show');
}

async function loadMemberData(id) {
    try {
        const response = await apiRequest(`/members/${id}`);
        const m = response.data;

        document.getElementById('member-name').value = m.name || '';
        document.getElementById('member-email').value = m.email || '';
        document.getElementById('member-position').value = m.position || 'undergraduate';
        document.getElementById('member-academicTitle').value = m.academicTitle || '';
        document.getElementById('member-affiliation').value = m.affiliation || '';
        document.getElementById('member-bio').value = m.bio || '';
        document.getElementById('member-interests').value = (m.researchInterests || []).join(', ');
        document.getElementById('member-active').checked = m.isActive !== false;
        document.getElementById('member-alumni').checked = m.isAlumni === true;
    } catch (error) {
        alert('Error loading member data');
        closeModal();
    }
}

async function saveMember(event, id) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const interests = form.researchInterests.value
        ? form.researchInterests.value.split(',').map(s => s.trim()).filter(Boolean)
        : [];
    formData.set('researchInterests', JSON.stringify(interests));

    if (!formData.get('photo')?.size) formData.delete('photo');

    try {
        if (id && id !== 'null') {
            await apiRequest(`/members/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiRequest('/members', {
                method: 'POST',
                body: formData
            });
        }

        closeModal();
        loadMembers();
        loadDashboardStats();
        alert('Member saved successfully!');
    } catch (error) {
        alert(error.message || 'Error saving member');
    }
}

async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
        await apiRequest(`/members/${id}`, { method: 'DELETE' });
        loadMembers();
        loadDashboardStats();
        alert('Member deleted successfully!');
    } catch (error) {
        alert('Error deleting member');
    }
}

function editMember(id) {
    openMemberModal(id);
}

// Modal functions
function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    loadUserInfo();
    setupNavigation();
    loadDashboardStats();
});

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});
