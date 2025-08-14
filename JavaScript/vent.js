
        document.addEventListener('DOMContentLoaded', function() {
            // Get or generate anonymous user ID
            let userId = localStorage.getItem('anonymousUserId');
            if (!userId) {
                userId = 'User' + Math.floor(Math.random() * 10000);
                localStorage.setItem('anonymousUserId', userId);
            }
            
            // Get DOM elements
            const ventPostsContainer = document.getElementById('vent-posts');
            const emptyState = document.getElementById('empty-state');
            const createVentForm = document.getElementById('create-vent-form');
            const filterTabs = document.querySelectorAll('.filter-tab');
            const sortSelect = document.getElementById('sort-vents');
            
            // Initialize vent data
            let vents = JSON.parse(localStorage.getItem('gardenVents')) || [];
            let currentFilter = 'all';
            let currentSort = 'newest';
            
            // Save vents to localStorage
            function saveVents() {
                localStorage.setItem('gardenVents', JSON.stringify(vents));
            }
            
            // Format date for display
            function formatDate(dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) return 'Just now';
                if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
                if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                
                return date.toLocaleDateString();
            }
            
            // Render vents
            function renderVents() {
                // Filter vents
                let filteredVents = vents;
                if (currentFilter !== 'all') {
                    filteredVents = vents.filter(vent => vent.type === currentFilter);
                }
                
                // Sort vents
                filteredVents.sort((a, b) => {
                    switch (currentSort) {
                        case 'oldest':
                            return new Date(a.createdAt) - new Date(b.createdAt);
                        case 'most-supported':
                            return b.supports - a.supports;
                        case 'newest':
                        default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                    }
                });
                
                // Clear container
                ventPostsContainer.innerHTML = '';
                
                // Check if empty
                if (filteredVents.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                } else {
                    emptyState.style.display = 'none';
                }
                
                // Render each vent
                filteredVents.forEach(vent => {
                    const ventElement = document.createElement('div');
                    ventElement.className = 'vent-post';
                    ventElement.dataset.id = vent.id;
                    
                    const userSupported = vent.supportedBy.includes(userId);
                    
                    ventElement.innerHTML = `
                        <div class="vent-header">
                            <div class="vent-type ${vent.type}">${vent.type === 'vent' ? 'Vent' : 'Celebration'}</div>
                            <div class="vent-meta">${formatDate(vent.createdAt)}</div>
                        </div>
                        <div class="vent-content">
                            <div class="vent-text">${vent.content}</div>
                        </div>
                        <div class="vent-actions">
                            <div class="vent-reactions">
                                <button class="reaction-btn support-btn ${userSupported ? 'active' : ''}" data-id="${vent.id}">
                                    <span>❤️</span>
                                    <span class="support-count">${vent.supports}</span>
                                </button>
                            </div>
                            <button class="report-btn" data-id="${vent.id}">
                                <span>🚩</span>
                                <span>Report</span>
                            </button>
                        </div>
                    `;
                    
                    ventPostsContainer.appendChild(ventElement);
                });
                
                // Add event listeners to support buttons
                document.querySelectorAll('.support-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const ventId = this.dataset.id;
                        const vent = vents.find(v => v.id === ventId);
                        
                        if (!vent) return;
                        
                        const userIndex = vent.supportedBy.indexOf(userId);
                        
                        if (userIndex === -1) {
                            // User hasn't supported yet
                            vent.supports++;
                            vent.supportedBy.push(userId);
                            this.classList.add('active');
                        } else {
                            // User has supported, remove support
                            vent.supports--;
                            vent.supportedBy.splice(userIndex, 1);
                            this.classList.remove('active');
                        }
                        
                        // Update support count
                        this.querySelector('.support-count').textContent = vent.supports;
                        
                        // Save and re-render
                        saveVents();
                    });
                });
                
                // Add event listeners to report buttons
                document.querySelectorAll('.report-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const ventId = this.dataset.id;
                        
                        if (confirm('Are you sure you want to report this post?')) {
                            // In a real app, this would send a report to moderators
                            alert('Thank you for your report. Our moderators will review this post.');
                        }
                    });
                });
            }
            
            // Handle form submission
            createVentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const type = document.getElementById('vent-type').value;
                const content = document.getElementById('vent-content').value.trim();
                
                if (!type || !content) return;
                
                const newVent = {
                    id: Date.now().toString(),
                    type: type,
                    content: content,
                    author: userId,
                    createdAt: new Date().toISOString(),
                    supports: 0,
                    supportedBy: []
                };
                
                vents.unshift(newVent); // Add to beginning of array
                saveVents();
                
                // Reset form
                this.reset();
                
                // Re-render vents
                renderVents();
                
                // Scroll to top to see the new post
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            // Handle filter tabs
            filterTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Update active tab
                    filterTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update filter and re-render
                    currentFilter = this.dataset.filter;
                    renderVents();
                });
            });
            
            // Handle sort select
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                renderVents();
            });
            
            // Initial render
            renderVents();
            
            // Add sample data if empty
            if (vents.length === 0) {
                vents = [
                    {
                        id: 'vent1',
                        type: 'vent',
                        content: "I'm feeling so overwhelmed with all my assignments this week. It feels like there's not enough time in the day to get everything done.",
                        author: 'User1234',
                        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                        supports: 5,
                        supportedBy: ['User5678', 'User9012', 'User3456', 'User7890', 'User1357']
                    },
                    {
                        id: 'celebration1',
                        type: 'celebration',
                        content: "I finally finished my research paper that I've been working on for weeks! So proud of myself for pushing through.",
                        author: 'User5678',
                        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                        supports: 12,
                        supportedBy: ['User1234', 'User9012', 'User3456', 'User7890', 'User1357', 'User2468', 'User3579', 'User4680', 'User5791', 'User6802', 'User7913', 'User8024']
                    },
                    {
                        id: 'vent2',
                        type: 'vent',
                        content: "Sometimes it feels like I'm the only one who doesn't know what they're doing with their life. Everyone else seems to have it all figured out.",
                        author: 'User9012',
                        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
                        supports: 8,
                        supportedBy: ['User1234', 'User5678', 'User3456', 'User7890', 'User1357', 'User2468', 'User3579', 'User4680']
                    },
                    {
                        id: 'celebration2',
                        type: 'celebration',
                        content: "I made a new friend today in my class! It's been so long since I've connected with someone like this.",
                        author: 'User3456',
                        createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
                        supports: 15,
                        supportedBy: ['User1234', 'User5678', 'User9012', 'User7890', 'User1357', 'User2468', 'User3579', 'User4680', 'User5791', 'User6802', 'User7913', 'User8024', 'User9135', 'User0246', 'User1357']
                    }
                ];
                saveVents();
                renderVents();
            }
        });
