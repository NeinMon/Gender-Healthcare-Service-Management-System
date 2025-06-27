import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Register from './Register.jsx'
import Login from './Login.jsx'
import PeriodTracking from './PeriodTracking.jsx'
import ConsultationBooking from './ConsultationBooking.jsx'
import AskQuestion from './AskQuestion.jsx'
import TestBooking from './TestBooking.jsx'
import UserAccount from './UserAccount.jsx'
import ConsultantInterface from './ConsultantInterface.jsx'
import UserQuestions from './UserQuestions.jsx'
import MyAppointments from './MyAppointments.jsx'
import StaffTestBookingManager, { RedirectToStaffTestBookings } from './StaffTestBookingManager.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/period-tracking" element={<PeriodTracking />} />
        <Route path="/consultation-booking" element={<ConsultationBooking />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/test-booking" element={<TestBooking />} />
        <Route path="/user-account" element={<UserAccount />} />
        <Route path="/consultant-interface" element={<ConsultantInterface />} />
        <Route path="/user-questions" element={<UserQuestions />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/staff-test-bookings" element={<StaffTestBookingManager />} />
        <Route path="/staff" element={<RedirectToStaffTestBookings />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
