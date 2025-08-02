package com.airlinereservation;

import java.util.ArrayList;
import java.util.Scanner;

public class Passenger {
	static ArrayList<Flight> list = new ArrayList();
	static ArrayList<Reservation> res = new ArrayList();
	static Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		list.add(new Flight(101, "Delhi", 4));
		list.add(new Flight(202, "Mumbai", 1));
		list.add(new Flight(303, "Chennai", 5));
		list.add(new Flight(404, "Bangalore", 2));
		list.add(new Flight(505, "Hyderabad", 3));
		while (true) {
			System.out.println("===== ✈️ Airline Reservation System =====");
			System.out.println("1. Display Available Seats");
			System.out.println("2. Book Flight");
			System.out.println("3. View Reservation");
			System.out.println("4. Cancel Booking");
			System.out.println("5. Exit");
			System.out.print("Enter your choice (1-5): ");
			int choice = getValidIntegerInput();
			switch (choice) {
			case 1: {
				displayAvailableFlights();
				break;
			}
			case 2: {
				bookFlight();
				break;
			}
			case 3: {
				viewReservation();
				break;
			}
			case 4: {
				cancelBooking();
				break;
			}
			case 5: {
				System.out.println(" Exiting the System");
				sc.close();
				return;
			}
			default: {
				System.out.println(" Invalid option, Please try again");
			}
			}
		}
	}

	private static void cancelBooking() {
		System.out.print("🔴 Enter the passenger name to cancel the booking: ");
		String Name = sc.next();

		Reservation reservationToCancel = null;

		for (Reservation r : res) {
			if (r.getName().equalsIgnoreCase(Name)) {
				reservationToCancel = r;
				break;
			}
		}

		if (reservationToCancel != null) {
			Flight flight = reservationToCancel.getFlight();
			flight.setAvailableseats(flight.getAvailableseats() + 1);
			res.remove(reservationToCancel);
			System.out.println("✅ Reservation canceled successfully for passenger: " + Name);
		} else {
			System.out.println("❌ No reservation found under the name: " + Name);
		}

	}

	private static void viewReservation() {
		if (res.isEmpty()) {
			System.out.println("❌ No reservations found.");
		} else {
			System.out.println("📋 Your Reservations:");
			for (Reservation r : res) {
				System.out.println("Passenger Name: " + r.getName());
				System.out.println("Flight Number : " + r.getFlight().getFlightnumber());
				System.out.println("Destination   : " + r.getFlight().getdestination());
				System.out.println("----------------------------");
			}
		}

	}

	private static void bookFlight() {
		displayAvailableFlights();

		System.out.print("Enter the flight number you want to book: ");
		int flightNumber = getValidIntegerInput();

		Flight selectedFlight = null;

		for (Flight flight : list) {
			if (flight.getFlightnumber() == flightNumber) {
				selectedFlight = flight;
				break;
			}
		}

		if (selectedFlight == null) {
			System.out.println("❌ Invalid flight number. Please enter a valid one.");
			return;
		}

		if (selectedFlight.getAvailableseats() > 0) {
			System.out.print("Enter your name: ");
			String passengerName = sc.next();

			Reservation reservation = new Reservation(passengerName, selectedFlight);
			res.add(reservation);

			selectedFlight.decreaseAvailableSeats();

			System.out.println("✅ Booking successful! Thank you, " + passengerName + ".");
		} else {
			System.out.println("⚠️ No seats available on this flight. Please choose another destination.");
		}

	}

	private static void displayAvailableFlights() {
		System.out.println("===== ✈️ Available Flights =====");

		for (Flight flight : list) {
			System.out.println("Flight Number   : " + flight.getFlightnumber());
			System.out.println("Destination     : " + flight.getdestination());
			System.out.println("Available Seats : " + flight.getAvailableseats());
			System.out.println("----------------------------------------");
		}

	}

	private static int getValidIntegerInput() {
		while (!sc.hasNextInt()) {
			System.out.println("❌ Invalid input! Enter a number between 1-5:");
			sc.next();
		}
		return sc.nextInt();
	}

}
