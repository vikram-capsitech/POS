import React from "react";
import { Monitor } from "lucide-react";

export default function POS() {
  return (
    <div className="panel" style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ padding: "3rem", textAlign: "center", maxWidth: "600px", background: "#f8f9fa", borderRadius: "20px", border: "1px solid #e1e4e8" }}>
        <div style={{ 
          width: "80px", 
          height: "80px", 
          borderRadius: "50%", 
          background: "var(--purple)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto 2rem",
          boxShadow: "0 10px 25px rgba(82, 64, 214, 0.3)"
        }}>
          <Monitor size={40} color="white" />
        </div>
        
        <h1 style={{ fontSize: "3.2rem", fontWeight: "700", color: "#1a1f36", marginBottom: "1.5rem" }}>
          Point of Sale
        </h1>
        
        <p style={{ fontSize: "1.8rem", color: "#697386", lineHeight: "1.6", marginBottom: "3rem" }}>
          A powerful POS system is currently under development. This module will allow you to manage orders, tables, and payments seamlessly directly from the admin dashboard.
        </p>
        
        <div style={{ display: "inline-flex", padding: "0.8rem 1.6rem", background: "#e0e7ff", color: "#3730a3", borderRadius: "20px", fontSize: "1.4rem", fontWeight: "600" }}>
          Coming Soon
        </div>
      </div>
    </div>
  );
}
