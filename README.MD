# 🚀 CU Delivery

> A smart campus delivery platform built for Chitkara University students where **Hostellers act as Customers** and **Day Scholars act as Delivery Partners**.

---

# 🌐 Live Links

### Live Link

[🔗 https://cudelivery.onrender.com/](#)



### Frontend Repository

[🔗 https://github.com/mitanshu5911/cudelivery](#)

---

# 📌 Project Overview

CU Delivery is a campus-focused delivery platform specially designed for Chitkara University students. The platform solves the problem of hostel students who need daily essentials, food, parcels, or products delivered within the campus.

In this system:

* 🧑‍🎓 **Hostellers** place delivery requests/orders.
* 🛵 **Day Scholars** work as delivery partners and complete deliveries.
* 💬 Users can communicate in real-time.
* 📦 Orders are updated instantly using sockets.
* 🪪 Student ID cards are verified using OCR technology.

The platform provides a complete ecosystem including authentication, real-time communication, secure order handling, live order updates, and identity verification.

---

# ✨ Core Features

## 🔐 Authentication & Security

### ✅ Google Authentication

* Secure login/signup using Google OAuth.
* Eliminates manual password handling.
* Faster onboarding process for students.
* Verified student identity through Google accounts.

### ✅ JWT Authentication

* Secure user sessions.
* Protected APIs and routes.
* Token-based authentication system.

### ✅ Role-Based Access

* Separate access for:

  * Hostellers
  * Delivery Partners (Day Scholars)
  * Admin

---

# 🪪 OCR-Based Student Verification

### ✅ Tesseract OCR Integration

The platform uses **Tesseract OCR** to scan and verify Chandigarh University Student ID cards.

### Why Demo Credentials Are Provided?

Since the platform uses OCR verification for student ID cards, every new user is required to upload and scan a valid student ID card during registration.

To make project evaluation easier without requiring evaluators to upload real student IDs, we are providing demo credentials.

### OCR Features

* Extracts text from uploaded student ID cards.
* Helps validate student information.
* Reduces fake registrations.
* Automates verification process.

---

# 📦 Order Management System

### ✅ Create Orders

* Hostellers can create delivery requests.
* Add pickup and drop locations.
* Mention product details and delivery instructions.

### ✅ Accept Orders

* Delivery partners can accept available orders.
* Real-time assignment system.

### ✅ Order Tracking

* Users can track order status live.
* Different stages include:

  * Pending
  * Accepted
  * Picked Up
  * Delivered

### ✅ Order History

* Complete delivery history for users.
* Track completed and cancelled orders.

---

# ⚡ Real-Time Features

### ✅ Socket.IO Integration

The application uses **Socket.IO** for real-time communication and updates.

### Real-Time Functionalities

* Instant order updates.
* Live order acceptance.
* Real-time notifications.
* Live chat between users.
* Immediate delivery status changes.

---

# 💬 Real-Time Chat System

### ✅ User-to-User Chat

* Hostellers and delivery partners can chat directly.
* Real-time messaging using Socket.IO.
* Better communication during delivery.

### Chat Features

* Instant messaging.
* Real-time updates.
* Improved delivery coordination.

---

# 🔔 Notification System

### ✅ Live Notifications

* Order accepted notifications.
* Delivery completed notifications.
* New message alerts.
* Real-time activity updates.

---

# 📱 Responsive UI/UX

### ✅ Modern Frontend

* Clean and responsive interface.
* Mobile-friendly design.
* Smooth user experience.
* Optimized layouts for all devices.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Redux Toolkit / Context API
* Axios
* Socket.IO Client

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT Authentication

## APIs & Services

* Google OAuth
* Tesseract OCR
* REST APIs

---

# 🔗 REST API Architecture

The project follows RESTful API architecture for communication between frontend and backend.

### API Functionalities

* Authentication APIs
* User APIs
* Order APIs
* Chat APIs
* Notification APIs
* Admin APIs

### Benefits

* Scalable architecture.
* Modular backend structure.
* Easy frontend-backend integration.
* Secure API handling.

---

# 🧠 System Workflow

## 👨‍🎓 Hosteller Flow

1. Login/Register
2. Verify Student ID using OCR
3. Create Delivery Request
4. Chat with Delivery Partner
5. Track Order Live
6. Receive Delivery

## 🛵 Delivery Partner Flow

1. Login/Register
2. Verify Student ID
3. View Available Orders
4. Accept Orders
5. Deliver Product
6. Update Delivery Status

---

# 👨‍💻 Demo Credentials

## 🎓 Hosteller Demo Account

```bash
Email: manya0569.be23@chitkara.edu.in
Password: #Manya0569
```

## 🛵 DayScholar (Delivery Partner) Demo Account

```bash
Email: ruman1196.be23@chitkara.edu.in
Password: #Ruman1196
```



> ⚠️ Note: These demo credentials are provided because the platform uses OCR-based Student ID verification using Tesseract OCR. This allows evaluators and recruiters to explore the project without uploading actual student ID cards.

---

# 🎯 Key Highlights

* ✅ OCR-Based Student Verification
* ✅ Google Authentication
* ✅ REST API Architecture
* ✅ Real-Time Chat System
* ✅ Live Order Tracking
* ✅ Socket.IO Integration
* ✅ Responsive UI
* ✅ Secure Authentication
* ✅ Campus-Focused Delivery System
* ✅ Role-Based Access Control

---

# 📈 Future Improvements

* Live map tracking.
* Payment gateway integration.
* AI-based delivery matching.
* Push notifications.
* Delivery ratings and reviews.
* In-app wallet system.

---

# 📄 License

This project is developed for educational and learning purposes.

---

# ⭐ Support

If you like this project, give it a ⭐ on GitHub and support the project.
