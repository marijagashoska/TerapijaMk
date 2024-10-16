package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.dto.AppointmentRequest;
import finki.it.terapijamkbackend.spring.entities.APPOINTMENT_STATUS;
import finki.it.terapijamkbackend.spring.entities.Appointment;
import finki.it.terapijamkbackend.spring.entities.Request;
import finki.it.terapijamkbackend.spring.entities.User;
import finki.it.terapijamkbackend.spring.repositories.AppointmentRepository;
import finki.it.terapijamkbackend.spring.repositories.RequestRepository;
import finki.it.terapijamkbackend.spring.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RequestRepository requestRepository;
    public List<Appointment> findFreeAppointmentsByDate(LocalDate date){
        return appointmentRepository.findAppointmentsByDateAndStatus(date);
    }
    public List<Appointment> findRequestsByUsernameAndStatus(String username,APPOINTMENT_STATUS status) {
        User user=userRepository.findByUsername(username).orElse(null);
        return appointmentRepository.findByUserIdAndStatus(user.getId(),status);
    }
    public void createAppointment(String dateTimeStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        LocalDateTime appointmentDateTime = LocalDateTime.parse(dateTimeStr, formatter);
        Appointment appointment=new Appointment(appointmentDateTime);
        appointmentRepository.save(appointment);
    }
    public List<Appointment> findAppointmentsByDate(LocalDate date){
        return appointmentRepository.findAppointmentsByDate(date);
    }
    public void addAppointment(String username,String dateTime){
      LocalDateTime temp=LocalDateTime.parse(dateTime);
       Optional<Appointment> appointmentOpt = appointmentRepository.findByDateTime(temp);
        if(appointmentOpt.isPresent()){
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(APPOINTMENT_STATUS.RESERVED);
            User user = userRepository.findByUsername(username).orElse(null);
            long userId=user.getId();

            Request request=requestRepository.findByUserIdAndTerm(userId,temp);
            appointment.setRequest(request);
            appointmentRepository.save(appointment);
        }
        else {
            throw new IllegalArgumentException("Appointment not found for the provided username and dateTime");
        }
    }
    public boolean isAppointmentReserved(String term) {
       LocalDateTime temp=LocalDateTime.parse(term);
        return appointmentRepository.isAppointmentReserved(temp);
    }
    public Appointment findAppointmentByTerm(String term){
        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime dateTime = LocalDateTime.parse(term, inputFormatter);
        return appointmentRepository.findByTerm(dateTime);
    }
    public long updateAppointment(String term)
    {
        LocalDateTime localDateTime = LocalDateTime.parse(term);
        Appointment temp = appointmentRepository.findByTerm(localDateTime);
        Long userId=temp.getRequest().getUser().getId();
        temp.setRequest(null);
        temp.setStatus(APPOINTMENT_STATUS.FREE);
        appointmentRepository.save(temp);
        return userId;
    }

    public String cancelAppointmentById(String username,String term) {
        try {
            LocalDateTime ldt=LocalDateTime.parse(term);
            User user=userRepository.findByUsername(username).orElse(null);
            Long appointmentId = appointmentRepository.findIdByUserIdAndTerm(user.getId(), ldt);
            appointmentRepository.updateStatusToFree(appointmentId);
            Request request = requestRepository.findByUserIdAndTerm(user.getId(), ldt);
            requestRepository.delete(request);
            return request.getAdditionalInfo()+"&"+user.getId();
        } catch (Exception e) {
            return "False";
        }
    }

    @Transactional
    public void deleteAppointmentByTerm(String term) {
        LocalDateTime temp=LocalDateTime.parse(term);
        if (appointmentRepository.existsByTerm(temp)) {
            appointmentRepository.deleteByTerm(temp);
        } else {
            throw new IllegalArgumentException("Appointment with term " + term + " does not exist");
        }
    }
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAllSortedByDateTime();
    }
    public void createAppointments(List<AppointmentRequest> requests) {
        for (AppointmentRequest request : requests) {
            LocalDateTime appointmentDateTime = LocalDateTime.of(
                    LocalDate.parse(request.getDate()),
                    LocalTime.parse(request.getTime())
            );
            Appointment appointment = new Appointment();
            appointment.setTerm(appointmentDateTime);
            appointment.setStatus(APPOINTMENT_STATUS.FREE);
            appointmentRepository.save(appointment);
        }
    }
    @Transactional
    public void deleteFreeAppointmentsInRange(LocalDate startDate, LocalDate endDate) {
        appointmentRepository.deleteByDateRangeAndStatus(startDate, endDate);
    }

    public int getNumberOfAppointmentsByUserId(String userId){
        return appointmentRepository.countAppointmentsByUserId(Long.parseLong(userId));
    }


}
