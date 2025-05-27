// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Recharts components
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Data
import { useEffect, useState } from "react";

// Custom colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function Dashboard() {
  const [counts, setCounts] = useState({
    groups: { total: 0, paid: 0, free: 0 },
    users: { total: 0, verified: 0, unverified: 0 },
    subscriptions: { total: 0, active: 0, expired: 0 },
  });

  const [loading, setLoading] = useState(true);

  // Prepare chart data
  const groupsChartData = [
    { name: "Paid", value: counts.groups.paid },
    { name: "Free", value: counts.groups.free },
  ];

  const usersChartData = [
    { name: "Verified", value: counts.users.verified },
    { name: "Unverified", value: counts.users.unverified },
  ];

  const subscriptionsChartData = [
    { name: "Active", value: counts.subscriptions.active },
    { name: "Expired", value: counts.subscriptions.expired },
  ];

  const comparisonData = [
    { name: "Groups", total: counts.groups.total },
    { name: "Users", total: counts.users.total },
    { name: "Subscriptions", total: counts.subscriptions.total },
  ];

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://safety.shellcode.cloud/api/dashboard/counts/detailed",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NDg3ZGY0MC0yNDg3LTRmYTAtOGU5Ny1iOTFjYjJmODQxODkiLCJwaG9uZU51bWJlciI6IjkwMTYzNzEwODgiLCJ0b2tlbklkIjoiODMyMzI2ZmY5ZTRiZmE1ZmM5NjBjNmQ5NTMzZWM0YjciLCJpYXQiOjE3NDc5MTYzOTQsImV4cCI6MTc0ODUyMTE5NH0.cTAmVF8pDcpJFY2k5AuhCIl_TduhLebzYQN8o6UZio0",
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setCounts(data.counts);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center">
          Loading dashboard data...
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="dark"
                icon="groups"
                title="Total Groups"
                count={counts.groups.total}
                percentage={{
                  color: "success",
                  amount: `${Math.round((counts.groups.paid / counts.groups.total) * 100)}%`,
                  label: `Paid Groups`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="info"
                icon="people"
                title="Total Users"
                count={counts.users.total}
                percentage={{
                  color: "success",
                  amount: `${Math.round((counts.users.verified / counts.users.total) * 100)}%`,
                  label: `Verified Users`,
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={4}>
            <MDBox
              mb={1.5}
              sx={{
                "&:hover": {
                  transform: "translateY(-5px)",
                  transition: "transform 0.3s ease-in-out",
                },
              }}
            >
              <ComplexStatisticsCard
                color="success"
                icon="subscriptions"
                title="Total Subscriptions"
                count={counts.subscriptions.total}
                percentage={{
                  color: "success",
                  amount: `${Math.round((counts.subscriptions.active / counts.subscriptions.total) * 100)}%`,
                  label: `Active Subscriptions`,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Groups Pie Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: "100%", p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <h3>Groups Distribution</h3>
              </MDBox>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={groupsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {groupsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Users Pie Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: "100%", p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <h3>Users Verification Status</h3>
              </MDBox>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usersChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {usersChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Subscriptions Pie Chart */}
          <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ height: "100%", p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <h3>Subscriptions Status</h3>
              </MDBox>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {subscriptionsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Comparison Bar Chart */}
          <Grid item xs={12}>
            <Card sx={{ p: 2, "&:hover": { boxShadow: 3 } }}>
              <MDBox mb={2}>
                <h3>Total Counts Comparison</h3>
              </MDBox>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={comparisonData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Total Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
