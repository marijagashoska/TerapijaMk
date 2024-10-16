package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.repositories.AppointmentRepository;
import finki.it.terapijamkbackend.spring.repositories.RequestRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CleanupService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private RequestRepository requestRepository;

    @Scheduled(cron = "0 20 14 * * ?")
    @Transactional
    public void cleanupOldAppointmentsAndRequests() {
        LocalDateTime now = LocalDateTime.now();
        appointmentRepository.deleteByAppointmentDateBefore(now);
        requestRepository.deleteByTermBefore(now.minusDays(1));
        System.out.println("Cleanup completed!");
    }
}
