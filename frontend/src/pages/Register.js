import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        employeeId: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        department: '',
        designation: '',
        role: 'Employee',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            setSuccess('Registration successful! Please check your email to verify your account.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">⚡</div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join Dayflow HRMS today</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <span>❌</span> {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span>✅</span> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName" className="form-label">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                className="form-input"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName" className="form-label">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                className="form-input"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="employeeId" className="form-label">
                            Employee ID
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            name="employeeId"
                            className="form-input"
                            placeholder="EMP001"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="john.doe@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="department" className="form-label">
                                Department
                            </label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                className="form-input"
                                placeholder="IT"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="designation" className="form-label">
                                Designation
                            </label>
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                className="form-input"
                                placeholder="Developer"
                                value={formData.designation}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">
                            Role
                        </label>
                        <select
                            id="role"
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Already have an account?
                        <Link to="/login" className="auth-footer-link">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
