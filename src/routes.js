// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
// @mui icons
import Icon from "@mui/material/Icon";
import Users from "layouts/tables/Users";
import QuizManagement from "layouts/tables/quiz";
import GroupManagement from "layouts/tables/groups";
import MessagesManagement from "layouts/tables/message";
import GroupMembersManagement from "layouts/tables/member";
import SubscriptionManagement from "layouts/tables/subscription";
import WalletHistory from "layouts/tables/wallethistory";
import SubscriptionOrders from "layouts/tables/orders";
import QuizResults from "layouts/tables/quizresult";
// import { Quiz } from "@mui/icons-material";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "User",
    key: "User",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/users",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Quiz",
    key: "Quiz",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/quiz",
    component: <QuizManagement />,
  },
  {
    type: "collapse",
    name: "Quizresult",
    key: "Quizresult",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/quiz-result",
    component: <QuizResults />,
  },
  {
    type: "collapse",
    name: "Group",
    key: "group",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/group",
    component: <GroupManagement />,
  },
  {
    type: "collapse",
    name: "message",
    key: "message",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/message",
    component: <MessagesManagement />,
  },
  {
    type: "collapse",
    name: "members",
    key: "members",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/members",
    component: <GroupMembersManagement />,
  },
  {
    type: "collapse",
    name: "subscription",
    key: "subscription",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/subscription",
    component: <SubscriptionManagement />,
  },
  {
    type: "collapse",
    name: "order",
    key: "order",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/order",
    component: <SubscriptionOrders />,
  },
  {
    type: "collapse",
    name: "Wallet-history",
    key: "wallet-history",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/wallet-history",
    component: <WalletHistory />,
  },
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
