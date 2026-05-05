import "../styles/Stats.css";

const TopIncomes = ({ img, category, percentage, total }) => {
  return (
    <div className="stats">
      <div className="imgCategory">
        <div className="imgWrapper">
          <img src={img} />
        </div>

        <div className="categoryPercent">
          <p className="category">{category}</p>
          <p className="percentage">{percentage}%</p>
        </div>
      </div>

      <div className="total">
        <p className="amount">₱ {total}</p>
        <p className="amountLabel">Total</p>
      </div>
    </div>
  );
};

export default TopIncomes;
