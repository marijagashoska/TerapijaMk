package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.entities.APPOINTMENT_STATUS;
import finki.it.terapijamkbackend.spring.entities.Appointment;
import finki.it.terapijamkbackend.spring.entities.Request;
import finki.it.terapijamkbackend.spring.entities.User;
import finki.it.terapijamkbackend.spring.repositories.AppointmentRepository;
import finki.it.terapijamkbackend.spring.repositories.RequestRepository;
import finki.it.terapijamkbackend.spring.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RequestService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RequestRepository requestRepository;
    public void bookAppointment(String datetime,String couponCode,String medicalCondition,String username) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime dateTime = LocalDateTime.parse(datetime, formatter);
        Appointment appointment = appointmentRepository.findByTerm(dateTime);
        if (appointment != null && appointment.getStatus().equals(APPOINTMENT_STATUS.FREE)) {
            User user=userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                throw new RuntimeException("User not found.");
            }

            Request request=new Request(user,dateTime,couponCode,medicalCondition);
            requestRepository.save(request);
        } else {
            throw new RuntimeException("Appointment not found or already booked.");
        }
    }
    public List<Request> findRequestsByUsername(String username) {
       User user=userRepository.findByUsername(username).orElse(null);
        return requestRepository.findRequestsForFreeAppointments(user.getId());
    }
    public List<Request> findRequestsByTerm(String term) {
        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime dateTime = LocalDateTime.parse(term, inputFormatter);

        return requestRepository.findByTerm(dateTime);
    }

    public String cancelReservationById(String username,String term) {
        try {
            LocalDateTime ldt=LocalDateTime.parse(term);
            User user=userRepository.findByUsername(username).orElse(null);
            Request temp=requestRepository.findByUserIdAndTerm(user.getId(), ldt);
            String info=temp.getAdditionalInfo();
            requestRepository.deleteByIdAndTerm(user.getId(),ldt);
            return info+"&"+user.getId();
        } catch (Exception e) {
            return "False";
        }
    }

    public boolean isEmpty(String term) {
        LocalDateTime temp=LocalDateTime.parse(term);
        return requestRepository.isRequested(temp) <= 0;
    }
    public String findAdditionalInfoBasedOnUsernameAndTerm(String userId,LocalDateTime term)
    {
        Long idto=Long.parseLong(userId);
        Request temp=requestRepository.findByUserIdAndTerm(idto,term);
        String additionalInfo=temp.getAdditionalInfo();
        requestRepository.delete(temp);
        return additionalInfo;
    }
    public List<Long> getIdsByTermExcept(String term, String excludedUsername) {
        LocalDateTime localDateTime=LocalDateTime.parse(term);
        User excludedUser=userRepository.findByUsername(excludedUsername).orElse(null);
        return requestRepository.findIdsByTermExcept(localDateTime, excludedUser.getId());
    }

}
