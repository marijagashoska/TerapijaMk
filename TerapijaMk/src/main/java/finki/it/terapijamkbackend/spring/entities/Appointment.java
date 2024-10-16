package finki.it.terapijamkbackend.spring.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity(name = "Appointment")
@Table(name="appointments")
public class Appointment {

    @SequenceGenerator(
            name="appointment_sequence",
            sequenceName = "appointment_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy=GenerationType.SEQUENCE,
            generator = "appointment_sequence"
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="request_id", referencedColumnName = "id")
    @JsonIgnore
    private Request request;

    private LocalDateTime term;

    @Enumerated(EnumType.STRING)
    private APPOINTMENT_STATUS status;

    public Appointment(LocalDateTime term){
        this.term=term;
        this.status=APPOINTMENT_STATUS.FREE;
    }

    public void assignRequest(Request request){
        this.request=request;
        this.status=APPOINTMENT_STATUS.RESERVED;
    }

}
