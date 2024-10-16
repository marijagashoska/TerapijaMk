package finki.it.terapijamkbackend.spring.dto;

import finki.it.terapijamkbackend.spring.entities.Appointment;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentUpdateResponse {
    private Appointment appointment;
    private String username;
    public AppointmentUpdateResponse(Appointment appointment, String username) {
        this.appointment = appointment;
        this.username = username;
    }
}
