import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Employees.css';

const API_URL = process.env.REACT_APP_API_URL;

// Helper function to construct full image URL
const getImageUrl = (imagePath, name = 'User') => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    if (imagePath.startsWith('http')) return imagePath;

    // Remove /api from the base URL for static files
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const Employees = () => {
    const { user, isAdmin, isHR } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        employeeId: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'Employee',
        department: '',
        designation: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        employmentType: 'Full-Time',
        joiningDate: '',
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        filterEmployees();
    }, [searchTerm, departmentFilter, employees]);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users/employees`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployees(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch employees');
            setLoading(false);
        }
    };

    const filterEmployees = () => {
        let filtered = employees;

        if (searchTerm) {
            filtered = filtered.filter(
                (emp) =>
                    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (departmentFilter) {
            filtered = filtered.filter((emp) => emp.department === departmentFilter);
        }

        setFilteredEmployees(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/users/employees`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Employee added successfully!');
            setShowAddModal(false);
            fetchEmployees();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add employee');
        }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                department: formData.department,
                designation: formData.designation,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                employmentType: formData.employmentType,
                joiningDate: formData.joiningDate,
                salary: {
                    basicSalary: Number(formData.basicSalary),
                    allowances: Number(formData.allowances),
                    deductions: Number(formData.deductions),
                },
            };

            await axios.put(`${API_URL}/users/employees/${selectedEmployee._id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Employee updated successfully!');
            setShowModal(false);
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update employee');
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/employees/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Employee deleted successfully!');
            fetchEmployees();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete employee');
        }
    };

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            employeeId: employee.employeeId,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role,
            department: employee.department || '',
            designation: employee.designation || '',
            phone: employee.phone || '',
            dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
            gender: employee.gender || '',
            employmentType: employee.employmentType || 'Full-Time',
            joiningDate: employee.joiningDate ? employee.joiningDate.split('T')[0] : '',
            basicSalary: employee.salary?.basicSalary || 0,
            allowances: employee.salary?.allowances || 0,
            deductions: employee.salary?.deductions || 0,
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'Employee',
            department: '',
            designation: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            employmentType: 'Full-Time',
            joiningDate: '',
            basicSalary: 0,
            allowances: 0,
            deductions: 0,
        });
    };

    const departments = [...new Set(employees.map((emp) => emp.department).filter(Boolean))];

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading employees...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="container">
                        <h1 className="dashboard-welcome">Employee Management </h1>
                        <p className="dashboard-subtitle">Manage your team and employee details</p>
                    </div>
                </div>

                <div className="container">
                    <div className="actions-header">
                        {(isAdmin || isHR) && (
                            <button className="btn-add" onClick={() => setShowAddModal(true)}>
                                ➕ Add Employee
                            </button>
                        )}
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="employees-filters">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="🔍 Search by name, ID, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-box">
                            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="employees-grid">
                        {filteredEmployees.map((employee) => (
                            <div key={employee._id} className="employee-card">
                                <div className="employee-avatar">
                                    <img
                                        src={getImageUrl(employee.profilePicture, `${employee.firstName} ${employee.lastName}`)}
                                        alt={`${employee.firstName} ${employee.lastName}`}
                                    />
                                </div>
                                <div className="employee-info">
                                    <h3>
                                        {employee.firstName} {employee.lastName}
                                    </h3>
                                    <p className="employee-id">ID: {employee.employeeId}</p>
                                    <p className="employee-role">
                                        <span className={`role-badge role-${employee.role.toLowerCase()}`}>
                                            {employee.role}
                                        </span>
                                    </p>
                                    <p className="employee-department">📂 {employee.department || 'N/A'}</p>
                                    <p className="employee-designation">💼 {employee.designation || 'N/A'}</p>
                                    <p className="employee-email">✉️ {employee.email}</p>
                                    <p className="employee-phone">📞 {employee.phone || 'N/A'}</p>
                                </div>
                                {(isAdmin || isHR) && (
                                    <div className="employee-actions">
                                        <button className="btn-edit" onClick={() => openEditModal(employee)}>
                                            ✏️ Edit
                                        </button>
                                        {isAdmin && (
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteEmployee(employee._id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredEmployees.length === 0 && (
                        <div className="no-data">
                            <p>No employees found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Employee Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ Add New Employee</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                ✖️
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Employee ID (Leave blank to auto-generate)</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. EMP-202401-001"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} required>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Employment Type</label>
                                    <select
                                        name="employmentType"
                                        value={formData.employmentType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Basic Salary</label>
                                    <input
                                        type="number"
                                        name="basicSalary"
                                        value={formData.basicSalary}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Allowances</label>
                                    <input
                                        type="number"
                                        name="allowances"
                                        value={formData.allowances}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Deductions</label>
                                    <input
                                        type="number"
                                        name="deductions"
                                        value={formData.deductions}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {showModal && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>✏️ Edit Employee</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                ✖️
                            </button>
                        </div>
                        <form onSubmit={handleUpdateEmployee}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} required>
                                        <option value="Employee">Employee</option>
                                        <option value="HR">HR</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Employment Type</label>
                                    <select
                                        name="employmentType"
                                        value={formData.employmentType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Joining Date</label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Basic Salary</label>
                                    <input
                                        type="number"
                                        name="basicSalary"
                                        value={formData.basicSalary}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Allowances</label>
                                    <input
                                        type="number"
                                        name="allowances"
                                        value={formData.allowances}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Deductions</label>
                                    <input
                                        type="number"
                                        name="deductions"
                                        value={formData.deductions}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Update Employee
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Employees;
