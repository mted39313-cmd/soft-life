import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

let mockUser = null;

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockUser = null;
  });

  it("redirects to login when there is no signed-in user", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Login Screen")).toBeInTheDocument();
  });

  it("shows the protected page when a user is signed in", () => {
    mockUser = { uid: "1", email: "admin@softlife.co.ke" };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});