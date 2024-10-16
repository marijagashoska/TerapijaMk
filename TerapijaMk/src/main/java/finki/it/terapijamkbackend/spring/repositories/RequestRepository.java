package finki.it.terapijamkbackend.spring.repositories;

import finki.it.terapijamkbackend.spring.entities.Request;
import finki.it.terapijamkbackend.spring.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    @Query("SELECT r FROM Request r JOIN Appointment a ON r.term = a.term WHERE r.user.id = :userId AND a.status = 'FREE'")
    List<Request> findRequestsForFreeAppointments(@Param("userId") Long userId);

    List<Request> findByTerm(LocalDateTime localDateTime);

    @Transactional
    @Modifying
    @Query("DELETE FROM Request r WHERE r.user.id = :userId AND r.term = :term")
    void deleteByIdAndTerm(@Param("userId") Long userId, @Param("term") LocalDateTime term);

    @Query("SELECT r FROM Request r WHERE r.user.id = :userId AND r.term = :term")
    Request findByUserIdAndTerm(@Param("userId") Long userId, @Param("term") LocalDateTime term);

    @Query("SELECT COUNT(r) FROM Request r WHERE r.term = :term")
    long isRequested(@Param("term") LocalDateTime term);

    @Query("SELECT DISTINCT r.user.id FROM Request r WHERE r.term = :term AND r.user.id != :excludedId")
    List<Long> findIdsByTermExcept(@Param("term") LocalDateTime term, @Param("excludedId") Long excludedId);

    @Modifying
    @Query("DELETE FROM Request r WHERE r.term < :date")
     void deleteByTermBefore(LocalDateTime date);

}

