package finki.it.terapijamkbackend.spring.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
public class AppointmentResponse {
private LocalDateTime localDateTime;

    public AppointmentResponse(LocalDateTime localDateTime) {
        this.localDateTime=localDateTime;
    }
}
