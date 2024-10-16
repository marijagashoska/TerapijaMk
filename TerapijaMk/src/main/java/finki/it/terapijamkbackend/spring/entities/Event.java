package finki.it.terapijamkbackend.spring.entities;

import lombok.*;
import jakarta.persistence.*;


@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity(name="Event")
@Table(name="events")
public class Event {
    @SequenceGenerator(
            name="event_sequence",
            sequenceName = "event_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy=GenerationType.SEQUENCE,
            generator = "event_sequence"
    )
    private Long id;

    private String title;
    @Lob
    @Column(name = "text", columnDefinition = "TEXT")
    private String text;
    @Lob
    @Column(name = "img_src", columnDefinition = "TEXT")
    private String imgSrc;


    public Event(String title, String text, String imgSrc) {
        this.title = title;
        this.text = text;
        this.imgSrc = imgSrc;
    }
}
