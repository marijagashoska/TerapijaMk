package finki.it.terapijamkbackend.spring.services;

import finki.it.terapijamkbackend.spring.entities.Coupon;
import finki.it.terapijamkbackend.spring.repositories.CouponRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CouponsService {
    @Autowired
    private CouponRepository couponRepository;

    public Coupon saveCoupon(Coupon newsItem) {
        return couponRepository.save(newsItem);
    }

    public List<Coupon> getAllCoupons(){
        return couponRepository.findAll();
    }
    public void deleteById(String id) {
        Long temp=Long.parseLong(id);
        if (couponRepository.existsById(temp)) {
            couponRepository.deleteById(temp);
        } else {
            throw new EntityNotFoundException("Entity with id " + id + " not found");
        }
    }
    public Optional<Coupon> findByIdentifier(String identifier) {
        return couponRepository.findByTitle(identifier);
    }
    public List<String> getCouponNames() {
        return couponRepository.findAll().stream()
                .map(Coupon::getCode)
                .collect(Collectors.toList());
    }

    public void save(Coupon coupon) {
        couponRepository.save(coupon);
    }
}
