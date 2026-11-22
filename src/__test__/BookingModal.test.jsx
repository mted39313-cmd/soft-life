import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingModal from "../components/BookingModal";

const addDocMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: () => "bookings",
  addDoc: (...args) => addDocMock(...args),
  serverTimestamp: () => "now",
}));

vi.mock("../firebase/config", () => ({
  db: {},
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "u1", email: "user@softlife.co.ke" },
  }),
}));

const samplePackage = {
  id: "pkg-1",
  title: "Campus Hostel Movie & Indomie",
  price: 1500,
  venue: "Gate B Hostels",
};

describe("BookingModal", () => {
  beforeEach(() => {
    addDocMock.mockReset();
    addDocMock.mockResolvedValue({ id: "booking-1" });
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("No backend"));
  });

  it("does not render anything when no package is selected", () => {
    const { container } = render(
      <BookingModal pkg={null} onClose={() => {}} onBookingCreated={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("saves a new booking as Held in Escrow and closes the modal", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <BookingModal
        pkg={samplePackage}
        onClose={handleClose}
        onBookingCreated={handleCreated}
      />
    );

    await user.type(screen.getByLabelText(/recipient name/i), "Stacy");
    await user.type(screen.getByLabelText(/m-pesa phone number/i), "0794860835");
    await user.click(screen.getByRole("button", { name: /book & lock m-pesa fare/i }));

    await waitFor(() => {
      expect(addDocMock).toHaveBeenCalledTimes(1);
    });

    expect(addDocMock.mock.calls[0][1].status).toBe("Held in Escrow");
    expect(handleCreated).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it("shows an error message if saving to Firestore fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    addDocMock.mockRejectedValueOnce(new Error("Write failed"));

    render(
      <BookingModal pkg={samplePackage} onClose={() => {}} onBookingCreated={() => {}} />
    );

    await user.type(screen.getByLabelText(/recipient name/i), "Stacy");
    await user.type(screen.getByLabelText(/m-pesa phone number/i), "0794860835");
    await user.click(screen.getByRole("button", { name: /book & lock m-pesa fare/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/imeshindwa kusave booking kwa firestore/i)
      ).toBeInTheDocument();
    });

    consoleError.mockRestore();
  });
});