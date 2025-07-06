import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

const Container: React.FC<ContainerProps> = ({ children, title }) => {
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light p-3">
      <div
        className="bg-white w-100"
        style={{
          maxWidth: "28rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
        }}
      >
        {title && (
          <h3
            className="mb-3 text-dark"
            style={{ fontSize: "1.25rem", fontWeight: "600" }}
          >
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export default Container;
