import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatusTracker from "../components/StatusTracker";

const getDocMock = vi.fn();
const updateDocMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  doc: (_db, collectionName, id) => ({ collectionName, id }),
  getDoc: (...args) => getDocMock(...args),
  updateDoc: (...args) => updateDocMock(...args),
  onSnapshot: () => () => {},
}));

vi.mock("../firebase/config", () => ({
  db: {},
}));

describe("StatusTracker", () => {
  beforeEach(() => {
    getDocMock.mockReset();
    updateDocMock.mockReset();
    updateDocMock.mockResolvedValue(undefined);
  });

  it("asks for a Booking ID when the lookup form is submitted empty", async () => {
    const user = userEvent.setup();
    render(<StatusTracker />);

    await user.click(screen.getByRole("button", { name: /check status/i }));

    expect(
      screen.getByText(/weka booking id kwanza ndio tu-check status/i)
    ).toBeInTheDocument();
  });

  it("shows booking details when a valid Booking ID is found", async () => {
    const user = userEvent.setup();
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      id: "BK-10",
      data: () => ({
        packageTitle: "Weekend Chill",
        recipientName: "Amina",
        phone: "0712345678",
        amount: 2000,
        status: "Held in Escrow",
      }),
    });

    render(<StatusTracker />);

    await user.type(screen.getByLabelText(/booking id/i), "BK-10");
    await user.click(screen.getByRole("button", { name: /check status/i }));

    await waitFor(() => {
      expect(screen.getByText("Weekend Chill")).toBeInTheDocument();
    });
    expect(screen.getByText("Held in Escrow")).toBeInTheDocument();
  });

  it("marks booking as Arrived - Ready to Release after submitting a GPS pin", async () => {
    const user = userEvent.setup();
    const booking = {
      id: "BK-20",
      packageTitle: "Hostel Movie Night",
      recipientName: "Joy",
      phone: "0722000111",
      amount: 1200,
      status: "Held in Escrow",
    };

    render(<StatusTracker initialBooking={booking} />);

    await user.type(screen.getByLabelText(/location gps pin/i), "-1.2921, 36.8219");
    await user.click(screen.getByRole("button", { name: /confirm arrival/i }));

    await waitFor(() => {
      expect(updateDocMock).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText("Arrived - Ready to Release")).toBeInTheDocument();
  });
});