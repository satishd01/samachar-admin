import { useState, useEffect } from "react";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PlatformSettings() {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    // Simulating fetching admin data from localStorage or API
    const storedAdminData = localStorage.getItem("admin");
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    } else {
      // Example admin data (you can replace it with real data or API call)
      setAdminData({
        name: "John Doe",
        email: "john.doe@example.com",
        role: "Admin",
        avatar: "path_to_avatar.jpg", // Optional, if you want to display avatar
      });
    }
  }, []);

  return (
    <Card sx={{ boxShadow: "none" }}>
      <MDBox p={2}>
        <MDTypography variant="h6" fontWeight="medium" textTransform="capitalize">
          Profile Information
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2} px={2} lineHeight={1.25}>
        {adminData ? (
          <>
            {/* Admin Name */}
            <MDBox display="flex" alignItems="center" mb={1}>
              <MDTypography variant="button" fontWeight="bold" color="text">
                Name:
              </MDTypography>
              <MDTypography variant="button" color="text" sx={{ ml: 2 }}>
                {adminData.name}
              </MDTypography>
            </MDBox>

            {/* Admin Email */}
            <MDBox display="flex" alignItems="center" mb={1}>
              <MDTypography variant="button" fontWeight="bold" color="text">
                Email:
              </MDTypography>
              <MDTypography variant="button" color="text" sx={{ ml: 2 }}>
                {adminData.email}
              </MDTypography>
            </MDBox>

            {/* Admin Role */}
            <MDBox display="flex" alignItems="center" mb={1}>
              <MDTypography variant="button" fontWeight="bold" color="text">
                Phone:
              </MDTypography>
              <MDTypography variant="button" color="text" sx={{ ml: 2 }}>
                {adminData.phone}
              </MDTypography>
            </MDBox>

            {/* Admin Avatar (optional) */}
            {adminData.avatar && (
              <MDBox display="flex" alignItems="center" mb={2}>
                <MDTypography variant="button" fontWeight="bold" color="text">
                  Avatar:
                </MDTypography>
                <img
                  src={adminData.avatar}
                  alt="admin-avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginLeft: "10px",
                  }}
                />
              </MDBox>
            )}
          </>
        ) : (
          <MDTypography variant="body2" color="text">
            Loading admin data...
          </MDTypography>
        )}
      </MDBox>
    </Card>
  );
}

export default PlatformSettings;
