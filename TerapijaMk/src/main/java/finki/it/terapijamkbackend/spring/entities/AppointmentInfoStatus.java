package finki.it.terapijamkbackend.spring.entities;

public enum AppointmentInfoStatus {
   cancelledAppointmentByUser,//appointmentot go otkazhuva user
    cancelledAppointmentByAdmin,//appointmentot go otkazhuva admin
    cancelledRequest, //requestot e izbrishan od userot
    rejected,//requestot e izbrishan od adminot
    carried_out//sproveden
}
