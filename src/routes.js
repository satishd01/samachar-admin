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

// Define routes
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
    icon: <Icon fontSize="small">people</Icon>,
    route: "/users",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Quiz",
    key: "Quiz",
    icon: <Icon fontSize="small">quiz</Icon>,
    route: "/quiz",
    component: <QuizManagement />,
  },
  {
    type: "collapse",
    name: "Quizresult",
    key: "Quizresult",
    icon: <Icon fontSize="small">check_circle</Icon>,
    route: "/quiz-result",
    component: <QuizResults />,
  },
  {
    type: "collapse",
    name: "Group",
    key: "group",
    icon: <Icon fontSize="small">group_work</Icon>,
    route: "/group",
    component: <GroupManagement />,
  },
  {
    type: "collapse",
    name: "Message",
    key: "message",
    icon: <Icon fontSize="small">message</Icon>,
    route: "/message",
    component: <MessagesManagement />,
  },
  {
    type: "collapse",
    name: "Members",
    key: "members",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/members",
    component: <GroupMembersManagement />,
  },
  {
    type: "collapse",
    name: "Subscription",
    key: "subscription",
    icon: <Icon fontSize="small">subscriptions</Icon>,
    route: "/subscription",
    component: <SubscriptionManagement />,
  },
  {
    type: "collapse",
    name: "Order",
    key: "order",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/order",
    component: <SubscriptionOrders />,
  },
  {
    type: "collapse",
    name: "Wallet History",
    key: "wallet-history",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>,
    route: "/wallet-history",
    component: <WalletHistory />,
  },
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
