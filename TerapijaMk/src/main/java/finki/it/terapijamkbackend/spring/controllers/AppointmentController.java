package finki.it.terapijamkbackend.spring.controllers;
import finki.it.terapijamkbackend.spring.dto.ApiResponse;
import finki.it.terapijamkbackend.spring.dto.AppointmentRequest;
import finki.it.terapijamkbackend.spring.dto.AppointmentResponse;
import finki.it.terapijamkbackend.spring.dto.TermsResponse;
import finki.it.terapijamkbackend.spring.entities.APPOINTMENT_STATUS;
import finki.it.terapijamkbackend.spring.entities.Appointment;
import finki.it.terapijamkbackend.spring.services.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/free")
    public List<Appointment> getFreeAppointments(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.findFreeAppointmentsByDate(date);
    }
    @GetMapping("/listAll")
    public List<TermsResponse> getAppointmentsByUser(@RequestParam("username") String username,@RequestParam(required = true) String status) {
        APPOINTMENT_STATUS appointmentStatus = APPOINTMENT_STATUS.valueOf(status);
       List<Appointment>terms=appointmentService.findRequestsByUsernameAndStatus(username,appointmentStatus);
        return terms.stream().map(term->new TermsResponse(
                term.getRequest().getTerm(),
                term.getRequest().getUser().getName(),
                term.getRequest().getUser().getId(),
                term.getRequest().getUser().getSurname(),
                term.getRequest().getCouponCode(),
                term.getRequest().getAdditionalInfo(),
                term.getRequest().getUser().getUsername()
        )).collect(Collectors.toList());
    }

    @GetMapping("/getAllAppointments")
    public List<Appointment> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> addAppointment(@RequestBody AppointmentRequest appointmentRequest) {
        try {

            String dateTimeStr = appointmentRequest.getDate() + " " + appointmentRequest.getTime();
                appointmentService.createAppointment(dateTimeStr);
            return ResponseEntity.ok(new ApiResponse("Appointment added successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Failed to add appointment."));}
    }

    @GetMapping("/listAppointments")
    public List<AppointmentResponse>getAppointmentsByDate(@RequestParam("date") String date){
        LocalDate temp=LocalDate.parse(date);
        List<Appointment>appointments=appointmentService.findAppointmentsByDate(temp);
        return appointments.stream().map(appointment -> {
            LocalDateTime termDate = appointment.getTerm();
            return new AppointmentResponse(termDate);
        }).collect(Collectors.toList());
    }
    @GetMapping("/addAppointments")
    public void addAppointmentStatusAndUser(@RequestParam("username") String username,@RequestParam("dateTime") String dateTime){
    appointmentService.addAppointment(username,dateTime);
    }
    @GetMapping("/isReserved")
    public ResponseEntity<Boolean> isAppointmentReserved(@RequestParam("term") String term) {
        boolean isReserved = appointmentService.isAppointmentReserved(term);
        return ResponseEntity.ok(isReserved);
    }
    @GetMapping("/listApprovedRequest")
    public TermsResponse getAppointmentByTerm(@RequestParam("term") String term) {
        Appointment appointment=appointmentService.findAppointmentByTerm(term);
        TermsResponse temp=new TermsResponse(appointment.getTerm(),
                appointment.getRequest().getUser().getName(),
                appointment.getRequest().getUser().getId(),
                appointment.getRequest().getUser().getSurname(),
                appointment.getRequest().getCouponCode(),
                appointment.getRequest().getAdditionalInfo(),
                appointment.getRequest().getUser().getUsername());
        return temp;
    }

    @PutMapping("/removeUserFromAppointment")
    public ResponseEntity<String> removeUserFromAppointment(@RequestParam("term") String term) {
        try {
            Long userId = appointmentService.updateAppointment(term);
            return ResponseEntity.ok(userId.toString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error getting the username");
        }
    }

    @GetMapping("/cancelAppointment")
    public ResponseEntity<String>cancelAppointment(@RequestParam("username") String username,@RequestParam("term") String term){
        try{
            String success=appointmentService.cancelAppointmentById(username,term);
            if(!success.equals("False")){
                return ResponseEntity.ok("{\"success\": true, \"data\": \"" + success + "\"}");
            }
            else{
                return ResponseEntity.status(400).body("{\"success\": false, \"message\": \"Failed to cancel the reservation.\"}");
            }
        }
        catch(Exception e){
            return ResponseEntity.status(500).body("{\"success\": false, \"message\": \"An error occurred: " + e.getMessage() + "\"}");
        }
    }
    @DeleteMapping("/deleteAppointment")
    public ResponseEntity<Void> deleteAppointment(@RequestParam String term) {
        try {
            appointmentService.deleteAppointmentByTerm(term);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/create")
    public ResponseEntity<String> createAppointments(@RequestBody List<AppointmentRequest> appointmentRequests) {
        try {
            appointmentService.createAppointments(appointmentRequests);
            return ResponseEntity.ok("Appointments created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create appointments");
        }
    }
    @DeleteMapping("/deleteFree")
    public ResponseEntity<Void> deleteFreeAppointmentsInRange(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        appointmentService.deleteFreeAppointmentsInRange(startDate, endDate);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/getNumberOfAppointments")
    public ResponseEntity<ApiResponse>getNumberAppointments(@RequestParam("userId")String userId){
        int total=appointmentService.getNumberOfAppointmentsByUserId(userId);
        String temp=total+"";
        return ResponseEntity.ok(new ApiResponse(temp));
    }

}
