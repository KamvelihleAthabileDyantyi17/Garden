
        document.addEventListener('DOMContentLoaded', function() {
            // Get or generate anonymous user ID
            let userId = localStorage.getItem('anonymousUserId');
            if (!userId) {
                userId = 'User' + Math.floor(Math.random() * 10000);
                localStorage.setItem('anonymousUserId', userId);
            }
            
            // Get DOM elements
            const categoriesView = document.getElementById('categories-view');
            const threadsView = document.getElementById('threads-view');
            const newThreadForm = document.getElementById('new-thread-form');
            const threadDetail = document.getElementById('thread-detail');
            const currentCategoryTitle = document.getElementById('current-category-title');
            const threadList = document.getElementById('thread-list');
            
            // Initialize forum data
            let forumData = JSON.parse(localStorage.getItem('gardenForumData')) || {
                categories: {
                    music: { name: 'Music', threads: [], posts: 0 },
                    gaming: { name: 'Gaming', threads: [], posts: 0 },
                    academics: { name: 'Academics', threads: [], posts: 0 },
                    activism: { name: 'Activism', threads: [], posts: 0 },
                    wellness: { name: 'Wellness', threads: [], posts: 0 },
                    technology: { name: 'Technology', threads: [], posts: 0 }
                }
            };
            
            // Save forum data to localStorage
            function saveForumData() {
                localStorage.setItem('gardenForumData', JSON.stringify(forumData));
            }
            
            // Update category stats
            function updateCategoryStats() {
                for (const categoryKey in forumData.categories) {
                    const category = forumData.categories[categoryKey];
                    const threadsElement = document.getElementById(`${categoryKey}-threads`);
                    const postsElement = document.getElementById(`${categoryKey}-posts`);
                    
                    if (threadsElement) threadsElement.textContent = category.threads.length;
                    if (postsElement) postsElement.textContent = category.posts;
                }
            }
            
            // Show categories view
            function showCategoriesView() {
                categoriesView.style.display = 'block';
                threadsView.style.display = 'none';
                newThreadForm.style.display = 'none';
                threadDetail.style.display = 'none';
                updateCategoryStats();
            }
            
            // Show threads view for a category
            function showThreadsView(categoryKey) {
                categoriesView.style.display = 'none';
                threadsView.style.display = 'block';
                newThreadForm.style.display = 'none';
                threadDetail.style.display = 'none';
                
                const category = forumData.categories[categoryKey];
                currentCategoryTitle.textContent = category.name;
                
                // Clear and populate thread list
                threadList.innerHTML = '';
                
                if (category.threads.length === 0) {
                    threadList.innerHTML = '<div class="thread-item"><div class="thread-info">No threads in this category yet. Be the first to create one!</div></div>';
                    return;
                }
                
                category.threads.forEach(thread => {
                    const threadItem = document.createElement('div');
                    threadItem.className = 'thread-item';
                    threadItem.dataset.threadId = thread.id;
                    
                    const date = new Date(thread.createdAt).toLocaleDateString();
                    
                    threadItem.innerHTML = `
                        <div class="thread-info">
                            <div class="thread-title">${thread.title}</div>
                            <div class="thread-meta">By ${thread.author} on ${date}</div>
                        </div>
                        <div class="thread-stats">
                            <div class="stat">
                                <span class="icon">💬</span>
                                <span>${thread.replies}</span>
                            </div>
                            <div class="stat">
                                <span class="icon">👁️</span>
                                <span>${thread.views}</span>
                            </div>
                        </div>
                    `;
                    
                    threadItem.addEventListener('click', function() {
                        showThreadDetail(categoryKey, thread.id);
                    });
                    
                    threadList.appendChild(threadItem);
                });
            }
            
            // Show thread detail
            function showThreadDetail(categoryKey, threadId) {
                categoriesView.style.display = 'none';
                threadsView.style.display = 'none';
                newThreadForm.style.display = 'none';
                threadDetail.style.display = 'block';
                
                const category = forumData.categories[categoryKey];
                const thread = category.threads.find(t => t.id === threadId);
                
                if (!thread) return;
                
                // Increment view count
                thread.views++;
                saveForumData();
                
                // Populate thread header
                document.getElementById('detail-thread-title').textContent = thread.title;
                document.getElementById('detail-thread-author').textContent = thread.author;
                document.getElementById('detail-thread-date').textContent = new Date(thread.createdAt).toLocaleDateString();
                
                // Populate posts
                const postsContainer = document.getElementById('thread-posts');
                postsContainer.innerHTML = '';
                
                // Add original post
                const originalPost = document.createElement('div');
                originalPost.className = 'post';
                originalPost.innerHTML = `
                    <div class="post-header">
                        <div class="post-author">${thread.author}</div>
                        <div class="post-time">${new Date(thread.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="post-content">${thread.content}</div>
                `;
                postsContainer.appendChild(originalPost);
                
                // Add replies
                thread.repliesData.forEach(reply => {
                    const replyElement = document.createElement('div');
                    replyElement.className = 'post';
                    replyElement.innerHTML = `
                        <div class="post-header">
                            <div class="post-author">${reply.author}</div>
                            <div class="post-time">${new Date(reply.createdAt).toLocaleString()}</div>
                        </div>
                        <div class="post-content">${reply.content}</div>
                    `;
                    postsContainer.appendChild(replyElement);
                });
                
                // Set up reply form
                const replyForm = document.getElementById('create-post-form');
                replyForm.onsubmit = function(e) {
                    e.preventDefault();
                    
                    const content = document.getElementById('post-content').value.trim();
                    if (!content) return;
                    
                    const newReply = {
                        id: Date.now().toString(),
                        author: userId,
                        content: content,
                        createdAt: new Date().toISOString()
                    };
                    
                    thread.repliesData.push(newReply);
                    thread.replies++;
                    category.posts++;
                    saveForumData();
                    
                    document.getElementById('post-content').value = '';
                    showThreadDetail(categoryKey, threadId); // Refresh the view
                };
            }
            
            // Event listeners for category cards
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', function() {
                    const categoryKey = this.dataset.category;
                    showThreadsView(categoryKey);
                });
            });
            
            // Back to categories button
            document.getElementById('back-to-categories').addEventListener('click', showCategoriesView);
            
            // Show new thread form
            document.getElementById('show-new-thread-form').addEventListener('click', function() {
                newThreadForm.style.display = 'block';
                document.getElementById('thread-title').focus();
            });
            
            // Cancel new thread
            document.getElementById('cancel-new-thread').addEventListener('click', function() {
                newThreadForm.style.display = 'none';
                document.getElementById('create-thread-form').reset();
            });
            
            // Create new thread
            document.getElementById('create-thread-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const title = document.getElementById('thread-title').value.trim();
                const content = document.getElementById('thread-content').value.trim();
                
                if (!title || !content) return;
                
                const categoryKey = currentCategoryTitle.textContent.toLowerCase();
                const category = forumData.categories[categoryKey];
                
                const newThread = {
                    id: Date.now().toString(),
                    title: title,
                    content: content,
                    author: userId,
                    createdAt: new Date().toISOString(),
                    replies: 0,
                    views: 0,
                    repliesData: []
                };
                
                category.threads.push(newThread);
                category.posts++; // Original post counts as a post
                saveForumData();
                
                // Reset form and show threads
                this.reset();
                newThreadForm.style.display = 'none';
                showThreadsView(categoryKey);
            });
            
            // Initialize the page
            showCategoriesView();
            
            // Add some sample data if the forum is empty
            if (forumData.categories.music.threads.length === 0) {
                // Add sample thread to music category
                forumData.categories.music.threads.push({
                    id: 'sample1',
                    title: 'What are you listening to right now?',
                    content: 'Share what music you\'re currently enjoying!',
                    author: 'User1234',
                    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                    replies: 3,
                    views: 24,
                    repliesData: [
                        {
                            id: 'reply1',
                            author: 'User5678',
                            content: 'I\'ve been listening to a lot of lo-fi beats while studying. Really helps me focus!',
                            createdAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
                        },
                        {
                            id: 'reply2',
                            author: 'User9012',
                            content: 'Just discovered this new indie artist, their music is amazing!',
                            createdAt: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
                        },
                        {
                            id: 'reply3',
                            author: 'User3456',
                            content: 'Been on a classical music kick lately. Bach\'s cello suites are incredible.',
                            createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
                        }
                    ]
                });
                
                forumData.categories.music.posts = 4; // 1 original + 3 replies
                
                // Add sample thread to gaming category
                forumData.categories.gaming.threads.push({
                    id: 'sample2',
                    title: 'Best co-op games to play with friends?',
                    content: 'Looking for recommendations for fun co-op games!',
                    author: 'User7890',
                    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    replies: 5,
                    views: 42,
                    repliesData: [
                        {
                            id: 'reply4',
                            author: 'User1357',
                            content: 'Stardew Valley is amazing for co-op! So relaxing and fun.',
                            createdAt: new Date(Date.now() - 129600000).toISOString() // 1.5 days ago
                        },
                        {
                            id: 'reply5',
                            author: 'User2468',
                            content: 'If you like action, try Deep Rock Galactic. Great teamwork required!',
                            createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                        }
                    ]
                });
                
                forumData.categories.gaming.posts = 3; // 1 original + 2 replies
                
                saveForumData();
            }
        });
