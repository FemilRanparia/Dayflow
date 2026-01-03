import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Payroll.css';

const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const response = await api.get('/payroll/my-payroll');
      setPayroll(response.data);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!payroll) {
    return (
      <div className="payroll-container">
        <div className="payroll-header">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          <h2>My Payroll</h2>
        </div>
        <div className="no-data">No payroll information available</div>
      </div>
    );
  }

  const totalAllowances =
    (payroll.allowances.hra || 0) +
    (payroll.allowances.transport || 0) +
    (payroll.allowances.medical || 0) +
    (payroll.allowances.other || 0);

  const totalDeductions =
    (payroll.deductions.tax || 0) +
    (payroll.deductions.providentFund || 0) +
    (payroll.deductions.insurance || 0) +
    (payroll.deductions.other || 0);

  return (
    <div className="payroll-container">
      <div className="payroll-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h2>My Payroll</h2>
      </div>

      <div className="payroll-content">
        <div className="payroll-card">
          <h3>Salary Structure</h3>

          <div className="payroll-section">
            <h4>Basic Salary</h4>
            <div className="payroll-item">
              <span>Basic Salary</span>
              <span className="amount">₹{payroll.basicSalary.toLocaleString()}</span>
            </div>
          </div>

          <div className="payroll-section">
            <h4>Allowances</h4>
            {payroll.allowances.hra > 0 && (
              <div className="payroll-item">
                <span>HRA</span>
                <span className="amount">₹{payroll.allowances.hra.toLocaleString()}</span>
              </div>
            )}
            {payroll.allowances.transport > 0 && (
              <div className="payroll-item">
                <span>Transport</span>
                <span className="amount">₹{payroll.allowances.transport.toLocaleString()}</span>
              </div>
            )}
            {payroll.allowances.medical > 0 && (
              <div className="payroll-item">
                <span>Medical</span>
                <span className="amount">₹{payroll.allowances.medical.toLocaleString()}</span>
              </div>
            )}
            {payroll.allowances.other > 0 && (
              <div className="payroll-item">
                <span>Other</span>
                <span className="amount">₹{payroll.allowances.other.toLocaleString()}</span>
              </div>
            )}
            <div className="payroll-item total">
              <span>Total Allowances</span>
              <span className="amount">₹{totalAllowances.toLocaleString()}</span>
            </div>
          </div>

          <div className="payroll-section">
            <h4>Deductions</h4>
            {payroll.deductions.tax > 0 && (
              <div className="payroll-item">
                <span>Tax</span>
                <span className="amount deduction">₹{payroll.deductions.tax.toLocaleString()}</span>
              </div>
            )}
            {payroll.deductions.providentFund > 0 && (
              <div className="payroll-item">
                <span>Provident Fund</span>
                <span className="amount deduction">
                  ₹{payroll.deductions.providentFund.toLocaleString()}
                </span>
              </div>
            )}
            {payroll.deductions.insurance > 0 && (
              <div className="payroll-item">
                <span>Insurance</span>
                <span className="amount deduction">
                  ₹{payroll.deductions.insurance.toLocaleString()}
                </span>
              </div>
            )}
            {payroll.deductions.other > 0 && (
              <div className="payroll-item">
                <span>Other</span>
                <span className="amount deduction">₹{payroll.deductions.other.toLocaleString()}</span>
              </div>
            )}
            <div className="payroll-item total">
              <span>Total Deductions</span>
              <span className="amount deduction">₹{totalDeductions.toLocaleString()}</span>
            </div>
          </div>

          <div className="payroll-section net-salary">
            <div className="payroll-item">
              <span>Net Salary</span>
              <span className="amount">₹{payroll.netSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
