import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: "20px",
        border: "2px dashed #5240d6",
        borderRadius: "10px",
        background: "#f5f3ff",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#5240d6" }}>Jumbo POS Module</h1>
      <p>This is a remote module loaded via Module Federation.</p>
      <div className="card" style={{ marginTop: "20px" }}>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            background: "#5240d6",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          POS Transaction Count: {count}
        </button>
      </div>
      <p style={{ marginTop: "20px", color: "#666" }}>(Work in Progress)</p>
    </div>
  );
}

export default App;
