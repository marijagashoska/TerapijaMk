package finki.it.terapijamkbackend.spring.repositories;

import finki.it.terapijamkbackend.spring.entities.Appointment;
import finki.it.terapijamkbackend.spring.entities.APPOINTMENT_STATUS;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a ORDER BY a.term ASC")
    List<Appointment> findAllSortedByDateTime();
    @Query("SELECT a FROM Appointment a WHERE DATE(a.term) = :date AND (a.status = 'FREE')")
    List<Appointment> findAppointmentsByDateAndStatus(
            @Param("date") LocalDate date
    );

    @Transactional
    @Modifying
    @Query("DELETE FROM Appointment a WHERE a.request.user.id = :userId AND a.term = :term")
    void deleteByIdAndTerm(@Param("userId") Long userId, @Param("term") LocalDateTime term);

    Appointment findByTerm(LocalDateTime term);
    @Query("SELECT a FROM Appointment a WHERE a.request.user.id = :userId AND a.status = :status")
    List<Appointment> findByUserIdAndStatus(Long userId,APPOINTMENT_STATUS status);

    @Query("SELECT a FROM Appointment a WHERE DATE(a.term) = :date")
    List<Appointment> findAppointmentsByDate(
            @Param("date") LocalDate date
    );
    @Query("SELECT a FROM Appointment a WHERE a.term = :dateTime")
    Optional<Appointment> findByDateTime(@Param("dateTime") LocalDateTime dateTime);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN TRUE ELSE FALSE END FROM Appointment a WHERE a.term = :term AND (a.status = 'RESERVED')")
    boolean isAppointmentReserved(@Param("term") LocalDateTime term);

    @Transactional
    @Modifying
    @Query("UPDATE Appointment a SET a.status = 'FREE', a.request = null WHERE a.id = :appointmentId")
    void updateStatusToFree(@Param("appointmentId") Long appointmentId);

    @Query("SELECT a.id FROM Appointment a WHERE a.request.user.id = :userId AND a.term = :term")
    Long findIdByUserIdAndTerm(@Param("userId") Long userId, @Param("term") LocalDateTime term);

    void deleteByTerm(LocalDateTime term);
    boolean existsByTerm(LocalDateTime term);
    @Transactional
    @Modifying
    @Query("DELETE FROM Appointment a WHERE FUNCTION('DATE', a.term) BETWEEN :startDate AND :endDate AND a.status = 'FREE'")
    void deleteByDateRangeAndStatus(@Param("startDate") LocalDate startDate,@Param("endDate") LocalDate endDate);


    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.request.user.id = :userId")
    int countAppointmentsByUserId(@Param("userId") Long userId);
    @Modifying
    @Query("DELETE FROM Appointment a WHERE a.term < :date AND a.status='FREE'")
    void deleteByAppointmentDateBefore(LocalDateTime date);
}
