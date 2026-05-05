// Utility functions for data export

export const exportToCSV = (data, filename, type = "expense") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = type === "expense" 
    ? ["Date", "Category", "Amount", "Description", "Type"]
    : ["Date", "Category", "Amount", "Source", "Type"];

  const rows = data.map(item => {
    const date = new Date(item.date).toLocaleDateString();
    const category = item.category || "N/A";
    const amount = item.amount || 0;
    const description = item.description || item.source || "N/A";
    const transType = item.type || type;
    return [date, category, amount, description, transType];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data, filename, type = "expense") => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Simple text-based PDF export (for MVP)
  let content = `TrackNest ${type === "expense" ? "Expenses" : "Incomes"} Report\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += "=".repeat(50) + "\n\n";

  data.forEach((item, index) => {
    content += `${index + 1}. ${new Date(item.date).toLocaleDateString()}\n`;
    content += `   Category: ${item.category}\n`;
    content += `   Amount: Rs ${item.amount.toLocaleString()}\n`;
    content += `   ${type === "expense" ? "Description" : "Source"}: ${item.description || item.source || "N/A"}\n`;
    content += "-".repeat(30) + "\n";
  });

  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.txt`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateReport = (expenses, incomes) => {
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const balance = totalIncomes - totalExpenses;

  const categoryBreakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

  return {
    totalExpenses,
    totalIncomes,
    balance,
    categoryBreakdown,
    expenseCount: expenses.length,
    incomeCount: incomes.length
  };
};