// Configuration - UPDATE WITH YOUR BACKEND URL
const API_BASE_URL = 'https://backend-1foh.onrender.com/api'; // Replace with your actual backend URL

// Global state
let currentPage = 1;
let currentLimit = 12;
let currentBooks = [];
let currentMembers = [];
let currentLoans = [];

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const themeBtn = document.querySelector('.theme-btn');
const statusDot = document.getElementById('status-dot');
const apiStatusText = document.getElementById('api-status-text');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initEventListeners();
    checkApiStatus();
    loadDashboardData();
    loadBooks();
    loadMembers();
    loadLoans();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        showToast('Theme changed to ' + newTheme, 'success');
    });
}

// Navigation
function initNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            
            // Update active navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show selected section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
            
            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
            
            // Load data if needed
            if (sectionId === 'books') {
                loadBooks();
            } else if (sectionId === 'members') {
                loadMembers();
            } else if (sectionId === 'loans') {
                loadLoans();
            }
        });
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) &&
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

// API Status Check
async function checkApiStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/books?page=1&limit=1`);
        if (response.ok) {
            statusDot.classList.add('connected');
            apiStatusText.textContent = 'Connected';
        } else {
            throw new Error('API responded with non-OK status');
        }
    } catch (error) {
        statusDot.classList.add('disconnected');
        apiStatusText.textContent = 'Disconnected';
        showToast('Could not connect to backend API. Using mock data for demonstration.', 'warning');
        console.error('API Connection Error:', error);
    }
}

// Toast Notification System
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Dashboard Functions
async function loadDashboardData() {
    try {
        const [booksRes, membersRes, loansRes] = await Promise.all([
            fetch(`${API_BASE_URL}/books`),
            fetch(`${API_BASE_URL}/members`),
            fetch(`${API_BASE_URL}/loans`)
        ]);

        const books = await booksRes.json().catch(() => []);
        const members = await membersRes.json().catch(() => []);
        const loans = await loansRes.json().catch(() => []);

        // Update stats
        document.getElementById('total-books').textContent = books.length || 0;
        document.getElementById('total-members').textContent = members.length || 0;
        
        const activeLoans = loans.filter(loan => !loan.returnedAt).length;
        document.getElementById('active-loans').textContent = activeLoans;
        
        // Calculate overdue loans
        const today = new Date();
        const overdueLoans = loans.filter(loan => {
            if (loan.returnedAt) return false;
            const dueDate = new Date(loan.dueAt);
            return dueDate < today;
        });
        document.getElementById('overdue-loans').textContent = overdueLoans.length || 0;

        // Update recent activity
        updateRecentActivity(loans);
        // Update popular books
        updatePopularBooks(books);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Use mock data for demonstration
        showMockDashboardData();
    }
}

function updateRecentActivity(loans) {
    const activityTimeline = document.getElementById('activity-timeline');
    activityTimeline.innerHTML = '';
    
    // Show latest 5 loans as activity
    const recentLoans = loans.slice(0, 5);
    
    if (recentLoans.length === 0) {
        activityTimeline.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    recentLoans.forEach(loan => {
        const memberName = loan.memberId?.name || 'Unknown Member';
        const bookTitle = loan.bookId?.title || 'Unknown Book';
        const loanDate = new Date(loan.loanedAt).toLocaleDateString();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'timeline-item';
        activityItem.innerHTML = `
            <div class="timeline-dot ${loan.returnedAt ? 'success' : 'primary'}"></div>
            <div class="timeline-content">
                <p>${memberName} borrowed "${bookTitle}"</p>
                <span class="timeline-time">${loanDate}</span>
            </div>
        `;
        activityTimeline.appendChild(activityItem);
    });
}

function updatePopularBooks(books) {
    const popularBooksContainer = document.getElementById('popular-books');
    popularBooksContainer.innerHTML = '';
    
    if (books.length === 0) {
        popularBooksContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>No books in library</p>
            </div>
        `;
        return;
    }
    
    // Take top 3 books (in a real app, you'd have loan statistics)
    const popular = books.slice(0, 3);
    
    popular.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'popular-book';
        bookElement.innerHTML = `
            <div class="book-cover-small">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-details">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-copies">${book.copies} copies available</div>
            </div>
        `;
        popularBooksContainer.appendChild(bookElement);
    });
}

function showMockDashboardData() {
    // Mock data for demonstration
    document.getElementById('total-books').textContent = '12';
    document.getElementById('total-members').textContent = '8';
    document.getElementById('active-loans').textContent = '5';
    document.getElementById('overdue-loans').textContent = '1';
}

// Book Functions
async function loadBooks() {
    const booksGrid = document.getElementById('books-grid');
    booksGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Loading books...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/books?page=${currentPage}&limit=${currentLimit}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        
        currentBooks = await response.json();
        booksGrid.innerHTML = '';
        
        if (currentBooks.length === 0) {
            booksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>No Books Found</h3>
                    <p>Add your first book to start the library collection</p>
                    <button class="btn-primary" onclick="document.querySelector('[data-section=\\'add-book\\']').click()">
                        <i class="fas fa-plus"></i> Add First Book
                    </button>
                </div>
            `;
        } else {
            currentBooks.forEach(book => {
                const bookCard = createBookCard(book);
                booksGrid.appendChild(bookCard);
            });
        }
        updatePagination();
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Books</h3>
                <p>Could not connect to the server</p>
                <button class="btn-secondary" onclick="loadBooks()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
        showToast('Error loading books. Please check your connection.', 'error');
    }
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <div class="book-cover">
            <i class="fas fa-book"></i>
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <div class="book-author">by ${book.author}</div>
            <div class="book-meta">
                <div class="book-copies">
                    <i class="fas fa-copy"></i>
                    ${book.copies} ${book.copies === 1 ? 'copy' : 'copies'} available
                </div>
                <div class="book-isbn">ISBN: ${book.isbn}</div>
            </div>
            <div class="book-actions">
                <button class="action-btn btn-edit" onclick="editBook('${book._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn btn-delete" onclick="deleteBook('${book._id}', '${book.title}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    return card;
}

async function editBook(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        
        const book = await response.json();
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'edit-book-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Book: ${book.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="edit-book-form">
                    <div class="form-group">
                        <label for="edit-isbn">
                            <i class="fas fa-barcode"></i>
                            ISBN Number
                        </label>
                        <input type="text" id="edit-isbn" value="${book.isbn}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-title">
                            <i class="fas fa-heading"></i>
                            Book Title
                        </label>
                        <input type="text" id="edit-title" value="${book.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-author">
                            <i class="fas fa-user-pen"></i>
                            Author
                        </label>
                        <input type="text" id="edit-author" value="${book.author}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-copies">
                            <i class="fas fa-copy"></i>
                            Number of Copies
                        </label>
                        <input type="number" id="edit-copies" value="${book.copies}" min="0" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="submit" class="btn-submit">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                        <button type="button" class="btn-cancel modal-close">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('#edit-book-form');
        
        const closeModal = () => modal.remove();
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedBook = {
                isbn: document.getElementById('edit-isbn').value,
                title: document.getElementById('edit-title').value,
                author: document.getElementById('edit-author').value,
                copies: parseInt(document.getElementById('edit-copies').value)
            };
            
            // Validation
            if (!updatedBook.isbn || !updatedBook.title || !updatedBook.author || updatedBook.copies < 0) {
                showToast('Please fill all fields correctly', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedBook)
                });
                
                if (response.ok) {
                    showToast('Book updated successfully', 'success');
                    closeModal();
                    loadBooks();
                    loadDashboardData();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update book');
                }
            } catch (error) {
                showToast('Error updating book: ' + error.message, 'error');
            }
        });
    } catch (error) {
        console.error('Error loading book for edit:', error);
        showToast('Error loading book details', 'error');
    }
}

async function deleteBook(bookId, bookTitle) {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Book deleted successfully', 'success');
            loadBooks();
            loadDashboardData();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete book');
        }
    } catch (error) {
        showToast('Error deleting book: ' + error.message, 'error');
    }
}

// Member Functions
async function loadMembers() {
    const membersTable = document.getElementById('members-table-body');
    membersTable.innerHTML = '<tr><td colspan="5" class="loading"><i class="fas fa-spinner"></i> Loading members...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/members`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        
        currentMembers = await response.json();
        membersTable.innerHTML = '';
        
        if (currentMembers.length === 0) {
            membersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No Members Found</h3>
                        <p>Add your first library member</p>
                        <button class="btn-primary" onclick="document.querySelector('[data-section=\\'add-member\\']').click()">
                            <i class="fas fa-user-plus"></i> Add First Member
                        </button>
                    </td>
                </tr>
            `;
        } else {
            currentMembers.forEach(member => {
                const row = createMemberRow(member);
                membersTable.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading members:', error);
        membersTable.innerHTML = `
            <tr>
                <td colspan="5" class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading Members</h3>
                    <p>Could not connect to the server</p>
                    <button class="btn-secondary" onclick="loadMembers()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </td>
            </tr>
        `;
        showToast('Error loading members', 'error');
    }
}

function createMemberRow(member) {
    const row = document.createElement('tr');
    const joinDate = new Date(member.joinedAt).toLocaleDateString();
    
    // Get active loans count for this member
    const activeLoans = currentLoans.filter(loan => 
        loan.memberId?._id === member._id && !loan.returnedAt
    ).length;
    
    row.innerHTML = `
        <td>
            <div class="member-info">
                <div class="member-name">${member.name}</div>
                <div class="member-email">${member.email}</div>
            </div>
        </td>
        <td>${joinDate}</td>
        <td><span class="status-badge ${activeLoans < 3 ? 'badge-active' : 'badge-inactive'}">${activeLoans < 3 ? 'Active' : 'Max Loans'}</span></td>
        <td>${activeLoans}</td>
        <td>
            <div class="member-actions">
                <button class="action-btn btn-edit" onclick="editMember('${member._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteMember('${member._id}', '${member.name}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

async function editMember(memberId) {
    try {
        const response = await fetch(`${API_BASE_URL}/members/${memberId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch member details');
        }
        
        const member = await response.json();
        
        // Create edit modal
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'edit-member-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Edit Member: ${member.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="edit-member-form">
                    <div class="form-group">
                        <label for="edit-member-name">
                            <i class="fas fa-user"></i>
                            Full Name
                        </label>
                        <input type="text" id="edit-member-name" value="${member.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-member-email">
                            <i class="fas fa-envelope"></i>
                            Email Address
                        </label>
                        <input type="email" id="edit-member-email" value="${member.email}" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="submit" class="btn-submit">
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>
                        <button type="button" class="btn-cancel modal-close">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.btn-cancel');
        const form = modal.querySelector('#edit-member-form');
        
        const closeModal = () => modal.remove();
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedMember = {
                name: document.getElementById('edit-member-name').value,
                email: document.getElementById('edit-member-email').value
            };
            
            // Validation
            if (!updatedMember.name || !updatedMember.email) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(updatedMember.email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedMember)
                });
                
                if (response.ok) {
                    showToast('Member updated successfully', 'success');
                    closeModal();
                    loadMembers();
                    loadDashboardData();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update member');
                }
            } catch (error) {
                showToast('Error updating member: ' + error.message, 'error');
            }
        });
    } catch (error) {
        console.error('Error loading member for edit:', error);
        showToast('Error loading member details', 'error');
    }
}

async function deleteMember(memberId, memberName) {
    if (!confirm(`Are you sure you want to delete member "${memberName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showToast('Member deleted successfully', 'success');
            loadMembers();
            loadDashboardData();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete member');
        }
    } catch (error) {
        showToast('Error deleting member: ' + error.message, 'error');
    }
}

// Loan Functions
async function loadLoans() {
    const loansGrid = document.getElementById('loans-grid');
    loansGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Loading loans...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/loans`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch loans');
        }
        
        currentLoans = await response.json();
        loansGrid.innerHTML = '';
        
        if (currentLoans.length === 0) {
            loansGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <h3>No Loans Found</h3>
                    <p>Create your first book loan</p>
                    <button class="btn-primary" onclick="showLoanModal()">
                        <i class="fas fa-plus"></i> Create First Loan
                    </button>
                </div>
            `;
        } else {
            currentLoans.forEach(loan => {
                const loanCard = createLoanCard(loan);
                loansGrid.appendChild(loanCard);
            });
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        loansGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Loans</h3>
                <p>Could not connect to the server</p>
                <button class="btn-secondary" onclick="loadLoans()">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
        showToast('Error loading loans', 'error');
    }
}

function createLoanCard(loan) {
    const card = document.createElement('div');
    card.className = 'loan-card';
    
    const memberName = loan.memberId?.name || 'Unknown Member';
    const bookTitle = loan.bookId?.title || 'Unknown Book';
    const loanDate = new Date(loan.loanedAt).toLocaleDateString();
    const dueDate = new Date(loan.dueAt).toLocaleDateString();
    const returnedAt = loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : null;
    
    const today = new Date();
    const due = new Date(loan.dueAt);
    let status = 'Active';
    let statusClass = 'badge-active';
    
    if (returnedAt) {
        status = 'Returned';
        statusClass = 'badge-inactive';
    } else if (due < today) {
        status = 'Overdue';
        statusClass = 'badge-overdue';
    }
    
    card.innerHTML = `
        <div class="loan-header">
            <h3 class="loan-title">${bookTitle}</h3>
            <span class="status-badge ${statusClass}">${status}</span>
        </div>
        <div class="loan-info">
            <div class="loan-field">
                <i class="fas fa-user"></i>
                <span>${memberName}</span>
            </div>
            <div class="loan-field">
                <i class="fas fa-calendar-alt"></i>
                <span>Loaned: ${loanDate}</span>
            </div>
            <div class="loan-field">
                <i class="fas fa-clock"></i>
                <span>Due: ${dueDate}</span>
            </div>
            ${returnedAt ? `
                <div class="loan-field">
                    <i class="fas fa-check"></i>
                    <span>Returned: ${returnedAt}</span>
                </div>
            ` : ''}
        </div>
        <div class="loan-actions">
            ${!returnedAt ? `
                <button class="action-btn btn-return" onclick="returnBook('${loan._id}')">
                    <i class="fas fa-check"></i> Mark Returned
                </button>
            ` : ''}
        </div>
    `;
    return card;
}

async function returnBook(loanId) {
    try {
        const response = await fetch(`${API_BASE_URL}/loans/${loanId}/return`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            showToast('Book marked as returned', 'success');
            loadLoans();
            loadDashboardData();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to return book');
        }
    } catch (error) {
        showToast('Error returning book: ' + error.message, 'error');
    }
}

// Form Submissions and Event Listeners
function initEventListeners() {
    // Add Book Form
    const addBookForm = document.getElementById('add-book-form');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const bookData = {
                isbn: document.getElementById('isbn').value,
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                copies: parseInt(document.getElementById('copies').value)
            };
            
            // Validation
            if (!bookData.isbn || !bookData.title || !bookData.author || bookData.copies < 0) {
                showToast('Please fill all required fields correctly', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/books`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookData)
                });
                
                if (response.ok) {
                    const newBook = await response.json();
                    showToast(`"${newBook.title}" added to library!`, 'success');
                    addBookForm.reset();
                    loadBooks();
                    loadDashboardData();
                    
                    // Switch to books section
                    document.querySelector('[data-section="books"]').click();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add book');
                }
            } catch (error) {
                showToast('Error adding book: ' + error.message, 'error');
            }
        });
    }
    
    // Add Member Form
    const addMemberForm = document.getElementById('add-member-form');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const memberData = {
                name: document.getElementById('member-name').value,
                email: document.getElementById('member-email').value
            };
            
            // Validation
            if (!memberData.name || !memberData.email) {
                showToast('Please fill all required fields', 'error');
                return;
            }
            
            if (!isValidEmail(memberData.email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/members`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(memberData)
                });
                
                if (response.ok) {
                    const newMember = await response.json();
                    showToast(`"${newMember.name}" registered as member!`, 'success');
                    addMemberForm.reset();
                    loadMembers();
                    loadDashboardData();
                    
                    // Switch to members section
                    document.querySelector('[data-section="members"]').click();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to add member');
                }
            } catch (error) {
                showToast('Error adding member: ' + error.message, 'error');
            }
        });
    }
    
    // Add Book Button
    const addBookBtn = document.getElementById('add-book-btn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            document.querySelector('[data-section="add-book"]').click();
        });
    }
    
    // Add Member Button
    const addMemberBtn = document.getElementById('add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            document.querySelector('[data-section="add-member"]').click();
        });
    }
    
    // New Loan Button
    const newLoanBtn = document.getElementById('new-loan-btn');
    if (newLoanBtn) {
        newLoanBtn.addEventListener('click', showLoanModal);
    }
    
    // Loan Modal
    const loanModal = document.getElementById('loan-modal');
    if (loanModal) {
        // Close modal buttons
        const closeModalBtns = loanModal.querySelectorAll('.modal-close');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                loanModal.classList.remove('active');
            });
        });
        
        // Close modal on outside click
        loanModal.addEventListener('click', (e) => {
            if (e.target === loanModal) {
                loanModal.classList.remove('active');
            }
        });
        
        // Loan Form Submission
        const loanForm = document.getElementById('loan-form');
        if (loanForm) {
            loanForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const loanData = {
                    memberId: document.getElementById('loan-member').value,
                    bookId: document.getElementById('loan-book').value,
                    dueAt: document.getElementById('due-date').value
                };
                
                try {
                    const response = await fetch(`${API_BASE_URL}/loans`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(loanData)
                    });
                    
                    if (response.ok) {
                        const newLoan = await response.json();
                        showToast('Loan created successfully!', 'success');
                        loanModal.classList.remove('active');
                        loanForm.reset();
                        loadLoans();
                        loadDashboardData();
                    } else {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to create loan');
                    }
                } catch (error) {
                    showToast('Error creating loan: ' + error.message, 'error');
                }
            });
        }
    }
    
    // Pagination
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadBooks();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentBooks.length >= currentLimit) {
                currentPage++;
                loadBooks();
            }
        });
    }
    
    // Filter and Sort
    const categoryFilter = document.getElementById('category-filter');
    const sortBooks = document.getElementById('sort-books');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            // In a real app, you would filter books here
            console.log('Filter by:', categoryFilter.value);
        });
    }
    
    if (sortBooks) {
        sortBooks.addEventListener('change', () => {
            // In a real app, you would sort books here
            console.log('Sort by:', sortBooks.value);
        });
    }
    
    // Global Search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        let searchTimeout;
        globalSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = globalSearch.value.trim();
                if (query) {
                    performSearch(query);
                }
            }, 500);
        });
    }
    
    // Export Button
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showToast('Export feature would download books data as CSV', 'info');
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape closes modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => modal.classList.remove('active'));
        }
        
        // Ctrl/Cmd + F focuses search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('global-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function showLoanModal() {
    try {
        // Load members and books for dropdowns
        const [membersRes, booksRes] = await Promise.all([
            fetch(`${API_BASE_URL}/members`),
            fetch(`${API_BASE_URL}/books`)
        ]);
        
        const members = await membersRes.json().catch(() => []);
        const books = await booksRes.json().catch(() => []);
        
        // Populate member dropdown
        const memberSelect = document.getElementById('loan-member');
        memberSelect.innerHTML = '<option value="">Choose a member...</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member._id;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        });
        
        // Populate book dropdown (only available books)
        const bookSelect = document.getElementById('loan-book');
        bookSelect.innerHTML = '<option value="">Choose a book...</option>';
        books.filter(book => book.copies > 0).forEach(book => {
            const option = document.createElement('option');
            option.value = book._id;
            option.textContent = `${book.title} (${book.copies} available)`;
            bookSelect.appendChild(option);
        });
        
        // Set default due date (14 days from now)
        const dueDateInput = document.getElementById('due-date');
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 14);
        dueDateInput.value = dueDate.toISOString().split('T')[0];
        dueDateInput.min = today.toISOString().split('T')[0];
        
        // Show modal
        document.getElementById('loan-modal').classList.add('active');
    } catch (error) {
        console.error('Error preparing loan modal:', error);
        showToast('Error loading data for new loan', 'error');
    }
}

function updatePagination() {
    const pageNumbers = document.querySelectorAll('.page-number');
    pageNumbers.forEach((page, index) => {
        page.classList.toggle('active', index + 1 === currentPage);
    });
}

function performSearch(query) {
    // This is a basic search implementation
    // In a real app, you would search through all data and display results
    
    // Search in current section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    const sectionId = activeSection.id;
    
    switch (sectionId) {
        case 'books':
            searchBooks(query);
            break;
        case 'members':
            searchMembers(query);
            break;
        case 'loans':
            searchLoans(query);
            break;
        default:
            showToast(`Search for "${query}" in ${sectionId}`, 'info');
    }
}

function searchBooks(query) {
    const lowerQuery = query.toLowerCase();
    const filteredBooks = currentBooks.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.toLowerCase().includes(lowerQuery)
    );
    
    if (filteredBooks.length === 0) {
        showToast(`No books found for "${query}"`, 'warning');
    } else {
        showToast(`Found ${filteredBooks.length} books for "${query}"`, 'success');
    }
}

function searchMembers(query) {
    const lowerQuery = query.toLowerCase();
    const filteredMembers = currentMembers.filter(member => 
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery)
    );
    
    if (filteredMembers.length === 0) {
        showToast(`No members found for "${query}"`, 'warning');
    } else {
        showToast(`Found ${filteredMembers.length} members for "${query}"`, 'success');
    }
}

function searchLoans(query) {
    const lowerQuery = query.toLowerCase();
    const filteredLoans = currentLoans.filter(loan => 
        (loan.memberId?.name || '').toLowerCase().includes(lowerQuery) ||
        (loan.bookId?.title || '').toLowerCase().includes(lowerQuery)
    );
    
    if (filteredLoans.length === 0) {
        showToast(`No loans found for "${query}"`, 'warning');
    } else {
        showToast(`Found ${filteredLoans.length} loans for "${query}"`, 'success');
    }
}

// Make functions globally available
window.editBook = editBook;
window.deleteBook = deleteBook;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.returnBook = returnBook;
window.showLoanModal = showLoanModal;