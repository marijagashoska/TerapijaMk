package finki.it.terapijamkbackend.spring.entities;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity(name="Coupon")
@Table(name="coupons")
public class Coupon {
    @SequenceGenerator(
            name="coupon_sequence",
            sequenceName = "coupon_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy=GenerationType.SEQUENCE,
            generator = "coupon_sequence"
    )
    private Long id;
    private String code;
    private String title;
    private String description;

    public Coupon(String title,String code,String description) {
        this.title = title;
        this.code = code;
        this.description = description;
    }
}
