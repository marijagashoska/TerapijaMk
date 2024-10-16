package finki.it.terapijamkbackend.spring.dto;

import finki.it.terapijamkbackend.spring.entities.AppointmentInfoStatus;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class CarriedOutInfo {
    private LocalDateTime dateTime;
    private String userNote;
    private AppointmentInfoStatus status;
    private String adminNote;

    public CarriedOutInfo() {
    }

    public CarriedOutInfo(LocalDateTime dateTime, String userNote,String adminNote,AppointmentInfoStatus appointmentInfoStatus) {
        this.dateTime = dateTime;
        this.userNote = userNote;
        this.adminNote=adminNote;
        status=appointmentInfoStatus;
    }
}
