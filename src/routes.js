// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
// @mui icons
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Icon from "@mui/material/Icon";
import ArticleIcon from "@mui/icons-material/Article";
import Users from "layouts/tables/Users";
import QuizManagement from "layouts/tables/quiz";
import GroupManagement from "layouts/tables/groups";
import MessagesManagement from "layouts/tables/message";
import GroupMembersManagement from "layouts/tables/member";
import SubscriptionManagement from "layouts/tables/subscription";
import WalletHistory from "layouts/tables/wallethistory";
import SubscriptionOrders from "layouts/tables/orders";
import QuizResults from "layouts/tables/quizresult";
import NewsAPIComponent from "layouts/tables/news";
import CallVerifications from "layouts/tables/callverification";
import AudioNotifications from "layouts/tables/audionotifications";
import TransactionManagement from "layouts/tables/transactions";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Messages from "layouts/tables/message-crud";
import YouTubeLiveStreams from "layouts/tables/live-stream";
import { Feedback } from "@mui/icons-material";
import FeedbackList from "layouts/tables/feedback";
import FeedbackIcon from "@mui/icons-material/Feedback";
import TermsAndConditions from "layouts/tables/termandcondition";
import AboutUs from "layouts/tables/about-us";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoIcon from "@mui/icons-material/Info";
import HelpTopic from "layouts/tables/help-us";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ReportsManagement from "layouts/tables/reports";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FAQsManagement from "layouts/tables/faq";
import Invoices from "layouts/tables/invoice";

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
    name: "Members",
    key: "members",
    icon: <Icon fontSize="small">groups</Icon>,
    route: "/members",
    component: <GroupMembersManagement />,
  },
  {
    type: "collapse",
    name: "Group&message",
    key: "mesGroup&messagesage",
    icon: <Icon fontSize="small">message</Icon>,
    route: "/message",
    component: <MessagesManagement />,
  },
  {
    type: "collapse",
    name: "Message",
    key: "Message",
    icon: <Icon fontSize="small">message</Icon>,
    route: "/messages",
    component: <Messages />,
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
    name: "Transactions",
    key: "Transactions",
    icon: <ReceiptLongIcon fontSize="small" />,
    route: "/transactions",
    component: <TransactionManagement />,
  },
  {
    type: "collapse",
    name: "Invoice",
    key: "Invoice",
    icon: <ReceiptLongIcon fontSize="small" />,
    route: "/invoice",
    component: <Invoices />,
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
    type: "collapse",
    name: "Stream ",
    key: "Stream",
    icon: <Icon fontSize="small">subscriptions</Icon>,
    route: "/stream",
    component: <YouTubeLiveStreams />,
  },
  {
    type: "collapse",
    name: "News",
    key: "news",
    icon: <ArticleIcon fontSize="small" />,
    route: "/news",
    component: <NewsAPIComponent />,
  },
  {
    type: "collapse",
    name: "Audio Notifications",
    key: "audio-notifications",
    icon: <NotificationsActiveIcon fontSize="small" />,
    route: "/audio-notifications",
    component: <AudioNotifications />,
  },
  {
    type: "collapse",
    name: "Call verification",
    key: "Call-verification",
    icon: <PhoneInTalkIcon fontSize="small" />,
    route: "/call-verification",
    component: <CallVerifications />,
  },
  {
    type: "collapse",
    name: "Feedback",
    key: "Feedback",
    icon: <FeedbackIcon fontSize="small" />,
    route: "/feedback",
    component: <FeedbackList />,
  },
  {
    type: "collapse",
    name: "Term & Condition",
    key: "term-condition",
    icon: <GavelIcon fontSize="small" />, // Better suited for legal or T&C
    route: "/tnc",
    component: <TermsAndConditions />,
  },
  {
    type: "collapse",
    name: "About Us",
    key: "about-us",
    icon: <InfoIcon fontSize="small" />, // Ideal for information/about sections
    route: "/about-us",
    component: <AboutUs />,
  },
  {
    type: "collapse",
    name: "Help Topics",
    key: "help-topics",
    icon: <HelpOutlineIcon fontSize="small" />, // Best for help/FAQ sections
    route: "/help-topic",
    component: <HelpTopic />,
  },
  {
    type: "collapse",
    name: "Faq",
    key: "Faq",
    icon: <HelpOutlineIcon fontSize="small" />,
    route: "/faq",
    component: <FAQsManagement />,
  },
  {
    type: "collapse",
    name: "Report",
    key: "Report",
    icon: <AssessmentIcon fontSize="small" />,
    route: "/report",
    component: <ReportsManagement />,
  },
  {
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
