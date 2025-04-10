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
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0); // Added state for orders
  const [milkPrices, setMilkPrices] = useState({ cowPrice: 0, buffaloPrice: 0 }); // Added state for milk prices
  const [dashboardStats, setDashboardStats] = useState({
    categories_all: 0,
    categories_used: 0,
    users: 0,
    locations_all: 0,
    locations_used: 0,
  });

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");

        if (!token) {
          console.error("No token found in localStorage.");
          return;
        }

        const response = await fetch("http://46.202.166.150:8090/api/activities/dashboard/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Example Response:
        // { "categories_all": 18, "categories_used": 23, "users": 21, "locations_all": 5, "locations_used": 6626 }

        setDashboardStats({
          categories_all: data.categories_all,
          categories_used: data.categories_used,
          users: data.users,
          locations_all: data.locations_all,
          locations_used: data.locations_used,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };

    fetchDashboardStats();
  }, []);

  // Render the dashboard with updated stats
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}></Grid>
        {/* Displaying dashboard stats */}
        <Grid container spacing={3} mt={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="category"
                title="users"
                count={dashboardStats.categories_all}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="subricption"
                title="members"
                count={dashboardStats.categories_used}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="group"
                title="groups"
                count={dashboardStats.users}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="location_on"
                title="orders"
                count={dashboardStats.locations_all}
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
