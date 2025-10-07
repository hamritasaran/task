import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000";

export default function App() {
  const [form, setForm] = useState({
    scenario_name: "",
    monthly_invoice_volume: 2000,
    num_ap_staff: 3,
    avg_hours_per_invoice: 0.17,
    hourly_wage: 30,
    error_rate_manual: 0.5,
    error_cost: 100,
    time_horizon_months: 36,
    one_time_implementation_cost: 50000,
    email: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const simulate = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/simulate`, form);
      setResult(res.data.results);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("Simulation failed");
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!form.email) {
      setMessage("Please enter email for report");
      return;
    }
    setMessage("Report generated (mock) and sent to email!");
  };

  return (
    <div className="container">
      <h1>Invoicing ROI Simulator</h1>

      <label>Scenario Name</label>
      <input name="scenario_name" value={form.scenario_name} onChange={handleChange} />

      <label>Monthly Invoice Volume</label>
      <input type="number" name="monthly_invoice_volume" value={form.monthly_invoice_volume} onChange={handleChange} />

      <label>Number of AP Staff</label>
      <input type="number" name="num_ap_staff" value={form.num_ap_staff} onChange={handleChange} />

      <label>Average Hours per Invoice</label>
      <input type="number" step="0.01" name="avg_hours_per_invoice" value={form.avg_hours_per_invoice} onChange={handleChange} />

      <label>Hourly Wage</label>
      <input type="number" name="hourly_wage" value={form.hourly_wage} onChange={handleChange} />

      <label>Manual Error Rate (%)</label>
      <input type="number" step="0.01" name="error_rate_manual" value={form.error_rate_manual} onChange={handleChange} />

      <label>Error Cost</label>
      <input type="number" name="error_cost" value={form.error_cost} onChange={handleChange} />

      <label>Time Horizon (Months)</label>
      <input type="number" name="time_horizon_months" value={form.time_horizon_months} onChange={handleChange} />

      <label>One-Time Implementation Cost</label>
      <input type="number" name="one_time_implementation_cost" value={form.one_time_implementation_cost} onChange={handleChange} />

      <button onClick={simulate} disabled={loading}>{loading ? "Calculating..." : "Run Simulation"}</button>

      {result && (
        <div className="result">
          <p><strong>Monthly Savings:</strong> ${result.monthly_savings}</p>
          <p><strong>Cumulative Savings:</strong> ${result.cumulative_savings}</p>
          <p><strong>Net Savings:</strong> ${result.net_savings}</p>
          <p><strong>Payback (months):</strong> {result.payback_months}</p>
          <p><strong>ROI (%):</strong> {result.roi_percentage}</p>
        </div>
      )}

      <h3>Generate Report</h3>
      <label>Email</label>
      <input name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
      <button onClick={generateReport}>Generate PDF/HTML Report</button>

      {message && <p>{message}</p>}
    </div>
  );
}
