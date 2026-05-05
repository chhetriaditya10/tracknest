import "../styles/RecentActs.css";

const RecentActs = ({ icon, amount, type }) => {
  const color = type === "expense" ? "#FF6D70" : "#4CAF50";

  return (
    <div className="recentActWrapper">
      <img src={icon} className="recentActIcon" />
      <div className="recentActs">
        <h2 style={{ color }} className="recentAmount">
          Rs{amount}
        </h2>
        <h5
          style={{
            marginTop: "0px",
            color: "#5C5C5C",
            fontWeight: "600",
            fontSize: "12px",
          }}
        >
          Amount
        </h5>
      </div>
    </div>
  );
};

export default RecentActs;
