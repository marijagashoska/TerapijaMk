package finki.it.terapijamkbackend.spring.dto;

import finki.it.terapijamkbackend.spring.entities.AppointmentInfoStatus;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Embeddable
public class AppointmentInfo {
    private LocalDateTime dateTime;
    private String note;
    private AppointmentInfoStatus status;

    public AppointmentInfo() {
    }

    public AppointmentInfo(LocalDateTime dateTime, String note,AppointmentInfoStatus appointmentInfoStatus) {
        this.dateTime = dateTime;
        this.note = note;
        status=appointmentInfoStatus;
    }
}
