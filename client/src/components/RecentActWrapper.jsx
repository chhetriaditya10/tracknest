import { motion, AnimatePresence } from "framer-motion";
import RecentActs from "./RecentActs";
import Grocery from "../assets/grocery icon.png";
import Clothes from "../assets/clothes icon.png";
import Transport from "../assets/bus icon.png";
import Foods from "../assets/foods icon.png";
import Entertainment from "../assets/entertainment icon.png";
import Education from "../assets/education icon.png";
import Bills from "../assets/bills icon.png";
import Others from "../assets/others icon.png";
import Salary from "../assets/salary icon.png";
import Loan from "../assets/loan icon.png";
import Freelance from "../assets/freelance icon.png";
import Allowance from "../assets/allowance icon.png";
import "../styles/RecentActWrapper.css";

const RecentActWrapper = ({ recentActivities }) => {
  const icons = {
    grocery: Grocery,
    clothes: Clothes,
    transport: Transport,
    foods: Foods,
    entertainment: Entertainment,
    education: Education,
    bills: Bills,
    others: Others,
    salary: Salary,
    loan: Loan,
    allowance: Allowance,
    freelance: Freelance,
  };

  return (
    <div className="recent-wrapper">
      <div className="recent-activity-box">
        {recentActivities.length === 0 ? (
          <p style={{ color: "#bbb", fontSize: "14px", gridColumn: "1 / -1" }}>
            No recent activity
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {recentActivities.map((activity, index) => (
              <motion.div
                key={`${activity.type}_${activity.amount}_${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <RecentActs
                  icon={icons[activity.category?.toLowerCase()] || Others}
                  amount={activity.amount}
                  type={activity.type}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <p className="recent-title">Recent Activities</p>
    </div>
  );
};

export default RecentActWrapper;
