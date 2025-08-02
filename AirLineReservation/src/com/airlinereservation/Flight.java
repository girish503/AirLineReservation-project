package com.airlinereservation;

public class Flight {
	private int flightnumber;
	private String destination;
	private int availableseats;

	public Flight(int flightnumber, String destination, int availableseats) {
		super();
		this.flightnumber = flightnumber;
		this.destination = destination;
		this.availableseats = availableseats;
	}

	public int getFlightnumber() {
		return flightnumber;
	}

	public void setFlightnumber(int flightnumber) {
		this.flightnumber = flightnumber;
	}

	public String getdestination() {
		return destination;
	}

	public void setdestination(String destination) {
		this.destination = destination;
	}

	public int getAvailableseats() {
		return availableseats;
	}

	public void setAvailableseats(int availableseats) {
		this.availableseats = availableseats;
	}

	@Override
	public String toString() {
		return "Flight [flightnumber=" + flightnumber + ", destination=" + destination + "]";
	}

	public void decreaseAvailableSeats() {

		if (availableseats > 0) {
			availableseats--;
		}
	}
}
