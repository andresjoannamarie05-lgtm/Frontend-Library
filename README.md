# 🌿 Bloom Library - Library Management System

<div align="center">

![Bloom Library Banner](https://img.shields.io/badge/Bloom-Library-4a7c59?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Responsive](https://img.shields.io/badge/Responsive-Yes-4a7c59?style=for-the-badge)


A beautiful, modern library management system with botanical-themed design. Connect to any RESTful API to manage books, members, and book loans.

[Live Demo](#-live-demo) • [Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

## 📸 Screenshots

<div align="center">

| Dashboard | Books Collection | Add Book Form |
|:---:|:---:|:---:|
| ![Dashboard](https://via.placeholder.com/400x250/4a7c59/ffffff?text=Dashboard) | ![Books](https://via.placeholder.com/400x250/8fbc8f/ffffff?text=Books+Collection) | ![Add Book](https://via.placeholder.com/400x250/d4a5a5/ffffff?text=Add+New+Book) |

| Members | Loans | Mobile View |
|:---:|:---:|:---:|
| ![Members](https://via.placeholder.com/400x250/2d5a3d/ffffff?text=Members) | ![Loans](https://via.placeholder.com/400x250/e8c07d/000000?text=Book+Loans) | ![Mobile](https://via.placeholder.com/200x350/4a7c59/ffffff?text=Mobile+View) |

</div>

## ✨ Features

### 📚 Core Management
- **Book Management** - Full CRUD operations for library books
- **Member Management** - Register and manage library members
- **Loan Tracking** - Track book borrowing and returns
- **Real-time Dashboard** - Live statistics and activity monitoring

### 🎨 Beautiful Design
- **Botanical Theme** - Green color palette with leaf motifs
- **Dark/Light Mode** - Toggle between themes
- **Responsive Layout** - Works on all device sizes
- **Modern UI/UX** - Smooth animations and transitions
- **Mobile-First** - Optimized for mobile devices

### 🛠️ User Experience
- **Toast Notifications** - Real-time feedback system
- **Form Validation** - Client-side validation with error messages
- **Search Functionality** - Quick search across all data
- **Pagination** - Handle large datasets efficiently
- **Loading States** - Visual feedback during operations

## 🚀 Live Demo

- **Frontend Demo**: https://andresjoannamarie05-lgtm.github.io/Frontend-Library/
- **Backend API**: https://backend-1foh.onrender.com

##roject Structure

#
bloom-library


├── index.html          # Main HTML file

├── style.css          # All styles with mobile responsiveness


├── script.js          # All JavaScript functionality

├── README.md          # This documentation


## 🎨 Design
**color**

- Primary: #4a7c59 (Sage Green)

- Secondary: #d4a5a5 (Dusty Rose)

- Accent: #e8c07d (Warm Beige)

**Fonts:** 

+ **Headings:** Playfair Display

+ **Body:** PoppinsBody: Poppins


## 🔧 API Requirements

The app needs these endpoints

**Books** 

GET    /api/books

POST   /api/books

GET    /api/books/:id

PUT    /api/books/:id

DELETE /api/books/:id

**Members**

GET    /api/members

POST   /api/members

GET    /api/members/:id

PUT    /api/members/:id

DELETE /api/members/:id

**Loans**

GET    /api/loans

POST   /api/loans

PUT    /api/loans/:id/return



## 📱 Mobile Optimized
- Large buttons for easy tapping

- Readable text (no tiny fonts!)

- Sidebar collapses on mobile

- Forms are easy to fill on phone

## 🎮 Navigation Sections
- Dashboard - Library overview

- Books Collection - All books

- Members - Library members

- Book Loans - Active loans

- Add New Book - Create book

- Add New Member - Register member

## 🛠️ Form Validation
**Book Form:**

- ISBN (required)

- Title (required)

- Author (required)

- Copies (minimum 0)

**Member Form:**

+ Name (required)

+ Email (valid format)

## 🌙 Dark Mode
Click the theme button in sidebar to switch between light/dark modes.


