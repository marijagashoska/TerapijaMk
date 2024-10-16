package finki.it.terapijamkbackend.spring.entities;

import finki.it.terapijamkbackend.spring.dto.AppointmentInfo;
import finki.it.terapijamkbackend.spring.dto.CarriedOutInfo;
import lombok.*;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@Entity(name="User")
@Table(name="users")
public class User {

    @SequenceGenerator(
            name="user_sequence",
            sequenceName = "user_sequence",
            allocationSize = 1
    )
    @Id
    @GeneratedValue(
            strategy=GenerationType.SEQUENCE,
            generator = "user_sequence"
    )
    private Long id;
    private String name;
    private String surname;
    private String username;
    private String password;
    private LocalDate dateBirth;
    private String phone;
    private boolean locked;

    @ElementCollection
    @CollectionTable(name = "user_appointment_dates", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "appointment_date")
    private List<AppointmentInfo> dates;
    @ElementCollection
    @CollectionTable(name = "user_carriedOut_dates", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "carriedOut_date")
    private List<CarriedOutInfo> carriedOut;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;

    public User(String name,String surname,String username,String password,String age,String phone){
        this.name=name;
        this.surname=surname;
        this.username=username;
        this.password=password;
        LocalDate temp=LocalDate.parse(age);
        dateBirth=temp;
        this.phone=phone;
        locked=false;
        userRole=UserRole.USER;
        dates=new ArrayList<>();
        carriedOut=new ArrayList<>();
    }

    @Override
    public String toString() {
        return username+" "+name+" "+surname;
    }

    public void setAppointmentTerms(String term,String additionalInfo,String status){
        LocalDateTime localDateTime=LocalDateTime.parse(term);
        AppointmentInfoStatus temp=AppointmentInfoStatus.valueOf(status);
        AppointmentInfo appointmentInfo=new AppointmentInfo(localDateTime,additionalInfo,temp);
        dates.add(appointmentInfo);
    }
    public void setCarriedOut(String term,String additionalInfo,String adminNote,String status){
        LocalDateTime localDateTime=LocalDateTime.parse(term);
        AppointmentInfoStatus temp=AppointmentInfoStatus.valueOf(status);
        CarriedOutInfo carriedOutInfo=new CarriedOutInfo(localDateTime,additionalInfo,adminNote,temp);
        carriedOut.add(carriedOutInfo);
    }
}
