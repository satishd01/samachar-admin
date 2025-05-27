// @mui material components
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import { useEffect, useState } from "react";

function Dashboard() {
  const [counts, setCounts] = useState({
    groups: { total: 0, paid: 0, free: 0 },
    users: { total: 0, verified: 0, unverified: 0 },
    subscriptions: { total: 0, active: 0, expired: 0 },
  });

  const [loading, setLoading] = useState(true);

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
        <Grid container spacing={3}>
          {/* Groups Card */}
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
                  amount: `${counts.groups.paid}`,
                  label: `Paid Groups`,
                }}
              />
            </MDBox>
          </Grid>

          {/* Users Card */}
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
                  amount: `${counts.users.verified}`,
                  label: `Verified Users`,
                }}
              />
            </MDBox>
          </Grid>

          {/* Subscriptions Card */}
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
                  amount: `${counts.subscriptions.active}`,
                  label: `Active Subscriptions`,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
