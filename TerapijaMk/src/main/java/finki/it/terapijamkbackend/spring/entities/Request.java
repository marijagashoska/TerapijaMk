package finki.it.terapijamkbackend.spring.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity(name = "Request")
@Table(name="requests")
public class Request {

    @SequenceGenerator(
            name="request_sequence",
            sequenceName = "request_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy=GenerationType.SEQUENCE,
            generator = "request_sequence"
    )
    private Long id;

    private String couponCode;
    private String additionalInfo;
    private LocalDateTime term;
    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    public Request(User user,LocalDateTime term,String couponCode,String additionalInfo){
        this.user=user;
        this.term=term;
        this.couponCode=couponCode;
        this.additionalInfo=additionalInfo;
    }

}
